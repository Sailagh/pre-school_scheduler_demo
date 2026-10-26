@echo off
rem Double-click to measure how long this computer takes to make a good schedule (about 1-2 hours).
rem Run Start-Windows.bat once first, so OR-Tools is installed. Leave the computer alone while it runs.
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Starta demon en gang med Start-Windows.bat forst, sa att OR-Tools installeras.
  echo ^(Start the demo once with Start-Windows.bat first, so OR-Tools is installed.^)
  pause
  goto :eof
)
echo Matningen tar 1-2 timmar. Anvand inte datorn under tiden. ^(The test takes 1-2 hours. Do not use the computer meanwhile.^)
".venv\Scripts\python.exe" bench\bench.py --name "%COMPUTERNAME%" %*
".venv\Scripts\python.exe" bench\report.py
start "" "bench\results\report.html"
echo Klart. Skicka mappen bench\results. ^(Done. Send the folder bench\results.^)
pause
