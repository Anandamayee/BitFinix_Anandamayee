@echo off

:: Step 1: Install necessary global dependencies
echo Installing global dependencies...
npm i -g grenache-grape

:: Step 2: Boot two Grape servers
echo Booting Grape servers...
start cmd /k "grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'"
start cmd /k "grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'"

:: Step 3: Set up Grenache in your project
echo Setting up Grenache in your project...
npm install --save grenache-nodejs-http
npm install --save grenache-nodejs-link

:: Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install it first.
    pause
    exit /b 1
)

:: Check for npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo npm is not installed. Please install it first.
    pause
    exit /b 1
)

:: Configuration for the instances
setlocal EnableDelayedExpansion
set instances[1]=http://127.0.0.1:30001
set instances[2]=http://127.0.0.1:40001

:: Function to start server
:start_server
set grape_url=%1
set instance_name=%2
echo Starting server for instance %instance_name%...
start cmd /k "set GRAPE_URL=%grape_url% && set INSTANCE_NAME=%instance_name% && node server.js"
goto :eof

:: Function to run client
:run_client
set grape_url=%1
set instance_name=%2
echo Starting client for instance %instance_name%...
start cmd /k "set GRAPE_URL=%grape_url% && set INSTANCE_NAME=%instance_name% && node client.js"
goto :eof

:: Start server and client instances concurrently
for %%i in (1 2) do (
    set grape_url=!instances[%%i]!
    echo Instance %%i Grape URL: !grape_url!
    call :start_server !grape_url! %%i
    call :run_client !grape_url! %%i
)

pause
