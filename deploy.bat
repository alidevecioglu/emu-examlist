@echo off
SETLOCAL EnableDelayedExpansion

CALL env.bat

REM Get the name of the current directory to use as the tar file name
FOR %%I IN (.) DO SET CurrentDirName=%%~nxI

REM Change into the SRC directory to create the tar file
CD SRC || exit /b

REM Create a tar file excluding node_modules and .vscode directories
tar --exclude=node_modules --exclude=.vscode --exclude=..\\%CurrentDirName%.tar --exclude=deploy.bat -cvf ..\\%CurrentDirName%.tar *

CD ..

REM Deploy using the extracted values
caprover deploy --tarFile %CurrentDirName%.tar --appToken %CAPROVER_APP_TOKEN% --caproverUrl %CAPROVER_URL% --caproverApp %CAPROVER_APP%

PAUSE