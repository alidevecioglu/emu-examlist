
@echo off
SETLOCAL

REM Read the .env file and extract the values
for /f "delims=" %%a in ('type .env') do (
    set "line=%%a"
    if "!line:~0,10!"=="CAPROVER_APP_TOKEN=" set "appToken=!line:~10!"
    if "!line:~0,13!"=="CAPROVER_URL=" set "caproverUrl=!line:~13!"
    if "!line:~0,13!"=="CAPROVER_APP=" set "caproverApp=!line:~13!"
)

REM Get the name of the current directory to use as the tar file name
FOR %%I IN (.) DO SET CurrentDirName=%%~nxI

CD SRC

REM Create a tar file excluding node_modules and .vscode directories
tar --exclude=node_modules --exclude=.vscode --exclude=%CurrentDirName%.tar --exclude=deploy.bat -cvf %CurrentDirName%.tar *

REM Move the tar file to the parent folder
move %CurrentDirName%.tar ..

CD ..

REM Deploy using the extracted values
caprover deploy --tarFile %CurrentDirName%.tar --appToken %appToken% --caproverUrl %caproverUrl% --caproverApp %caproverApp%

PAUSE

