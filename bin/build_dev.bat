@echo on


SET NODE_URL="https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip"
SET PYTHON_URL="https://www.python.org/ftp/python/3.11.8/python-3.11.8-embed-amd64.zip"
SET CHROMA_DB_URL="https://github.com/chroma-core/chroma/archive/refs/tags/0.4.22.zip"
SET POSTGRES_URL="https://sbp.enterprisedb.com/getfile.jsp?fileid=1258892"

SET PNPM_URL="https://github.com/pnpm/pnpm/releases/download/v9.0.0-alpha.5/pnpm-win-x64.exe"

SET GET_PIP_URL="https://bootstrap.pypa.io/get-pip.py"

cd ..
mkdir build
cd build
mkdir node
mkdir python
mkdir chroma
mkdir postgres

bitsadmin /transfer mydownloadjob /download /priority FOREGROUND %NODE_URL% "%cd%/node.zip"
bitsadmin /transfer mydownloadjob /download /priority FOREGROUND %PYTHON_URL% "%cd%/python.zip"
timeout /t 2
bitsadmin /transfer mydownloadjob /download /priority FOREGROUND %CHROMA_DB_URL% "%cd%/chroma.zip"
bitsadmin /transfer mydownloadjob /download /priority FOREGROUND %POSTGRES_URL% "%cd%/postgres.zip"
bitsadmin /transfer mydownloadjob /download /priority FOREGROUND %PNPM_URL% "%cd%/pnpm.exe"



tar -xf "./node.zip" -C "./node"
tar -xf "./python.zip" -C "./python"
bitsadmin /transfer mydownloadjob /download /priority FOREGROUND %GET_PIP_URL% "%cd%/python/get-pip.py"
tar -xf "./chroma.zip" -C "./chroma"
tar -xf "./postgres.zip" -C "./postgres"


SET PYTHON=%cd%/python/python.exe
SET NODE=%cd%/node/node-v20.11.1-win-x64/node.exe
SET NPM=%NODE% %cd%/node/node-v20.11.1-win-x64/node_modules/npm/bin/npm-cli.js
SET PNPM=%cd%/pnpm.exe
SET POSTGRES_BIN=%cd%/postgres/pgsql/bin


echo %PYTHON%
echo %NODE%
echo %NPM%
echo %PNPM%
echo %POSTGRES_BIN%

@REM PYTHON
cd python
echo python311.zip > python311._pth
echo ./Lib/site-packages >> python311._pth
echo ./Scripts >> python311._pth
echo . >> python311._pth
echo # Uncomment to run site.main() automatically >> python311._pth
echo #import site >> python311._pth

echo import sys > sitecustomize.py
cd ..

%PYTHON% %cd%/python/get-pip.py


%PYTHON% -m pip install virtualenv
%PYTHON% -m virtualenv ./venv_backend
call %cd%/venv_backend/Scripts/activate.bat

cd venv_backend/Scripts
pip.exe install -r ../../../backend/requirements.win.txt
cd ../../

echo "Creating venv for Chroma"
%PYTHON% -m virtualenv ./venv_chroma
call %cd%/venv_chroma/Scripts/activate.bat

echo "Installing chroma requirements"
cd venv_chroma/Scripts
pip.exe install -r ../../chroma/chroma-0.4.22/requirements.txt
pip.exe install uvicorn
cd ../../

cd ..
@REM NODE

cd website
%PNPM% install
cd ..