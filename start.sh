#!/bin/bash

# Step 1: Install necessary global dependencies
echo "Installing global dependencies..."
npm i -g grenache-grape

# Step 2: Boot two grape servers (keeping as is)
echo "Booting Grape servers..."
gnome-terminal -- bash -c "grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'; exec bash"
gnome-terminal -- bash -c "grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'; exec bash"

# Step 3: Set up Grenache in your project
echo "Setting up Grenache in your project..."
npm install --save grenache-nodejs-http
npm install --save grenache-nodejs-link

# Check for Node.js and install dependencies if necessary
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install it first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install it first."
    exit 1
fi

# Configuration for the instances
declare -A instances=(
    ["1"]="http://127.0.0.1:30001"
    ["2"]="http://127.0.0.1:40001"
)

# Function to start server
start_server() {
    local grape_url=$1
    local instance_name=$2
    echo "Starting server for instance $instance_name "
    gnome-terminal -- bash -c "GRAPE_URL=$grape_url  INSTANCE_NAME=$instance_name node server.js; exec bash"
}


# Function to run client
run_client() {
    local grape_url=$1
    local instance_name=$2
    echo "Starting client for instance $instance_name "
    gnome-terminal -- bash -c "GRAPE_URL=$grape_url  INSTANCE_NAME=$instance_name node client.js; exec bash"

}

# Start server and client instances concurrently in separate terminals
for instance in "${!instances[@]}"; do
    grape_url=${instances[$instance]}
    echo "instance $instance grape_url $grape_url"
    # Start server in a new terminal with the correct port
    start_server $grape_url  $instance

    # Run client in a new terminal with the correct port
    run_client $grape_url  $instance
done
