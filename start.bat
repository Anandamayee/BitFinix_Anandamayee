@echo off

REM Step 1: Install necessary global dependencies
echo Installing global dependencies...
npm i -g grenache-grape

REM Step 2: Boot two grape servers
echo Booting Grape servers...
start cmd /k "grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'"
start cmd /k "grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'"

REM Step 3: Set up Grenache in your project
echo Setting up Grenache in your project...
npm install --save grenache-nodejs-http
npm install --save grenache-nodejs-link

REM Configuration for the instances
set instance1=http://127.0.0.1:30001
set instance2=http://127.0.0.1:40001

REM Check for Node.js and install dependencies if necessary
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install it first.
    exit /b
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is not installed. Please install it first.
    exit /b
)

REM Start multiple server instances and clients, each in its own terminal window
call :start_server %instance1% instance1
call :start_server %instance2% instance2

call :run_client %instance1%
call :run_client %instance2%

goto :eof

:start_server
    REM Starting the server for the given grape URL
    echo Starting server for %~2 with grape URL: %~1
    start cmd /k "GRAPE_URL=%~1 node server.js"
    goto :eof

:run_client
    REM Starting the client for the given grape URL
    echo Starting client with grape URL: %~1
    start cmd /k "GRAPE_URL=%~1 node client.js"
    goto :eof
