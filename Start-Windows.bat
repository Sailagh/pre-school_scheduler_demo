@echo off
rem Double-click to start the schedule demo (Windows). Keep the window open while you use it.
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 start.py %*
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  python start.py %*
  goto :eof
)
echo Python behovs. Hamta det fran https://www.python.org/downloads/ och kryssa i "Add python.exe to PATH".
echo (Python is needed. Get it from https://www.python.org/downloads/ and tick "Add python.exe to PATH".)
pause
