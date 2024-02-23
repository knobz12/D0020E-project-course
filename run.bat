@echo on


SET NODE_URL="https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip"
SET PYTHON_URL="https://www.python.org/ftp/python/3.11.8/python-3.11.8-embed-amd64.zip"
SET CHROMA_DB_URL="https://github.com/chroma-core/chroma/archive/refs/tags/0.4.22.zip"
SET POSTGRES_URL="https://sbp.enterprisedb.com/getfile.jsp?fileid=1258892"


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


tar -xf "./node.zip" -C "./node"
tar -xf "./python.zip" -C "./python"
tar -xf "./chroma.zip" -C "./chroma"
tar -xf "./postgres.zip" -C "./postgres"


SET PYTHON=%cd%/python/python.exe
SET NODE=%cd%/node/node-v20.11.1-win-x64/node.exe
SET NPM=%NODE% %cd%/node/node-v20.11.1-win-x64/node_modules/npm/bin/npm-cli.js
SET POSTGRES_BIN=%cd%/postgres/pgsql/bin


echo %PYTHON%
echo %NODE%
echo %NPM%
echo %POSTGRES_BIN%

@REM PYTHON

PYTHON -m venv ./.venv
call .venv/scripts/activate.bat

py -m ensurepip --upgrade
pip install -r ../backend/requirements.win.txt

cd ..

@REM NODE
cd website
@REM %NPM% install -g pnpm
@REM start "pnpm" "pnpm" install
cd ..
@REM CHROMA
cd build

echo "Creating venv for Chroma"
PYTHON -m venv ./.venv_chroma
call .venv_chroma/scripts/activate.bat

echo "Installing chroma requirements"
pip install -r ./chroma/chroma-0.4.22/requirements.txt
pip install uvicorn


cd ..
cd build
mkdir post_data
%POSTGRES_BIN%/initdb.exe -D %cd%/post_data
start "postgres" "%POSTGRES_BIN%/postgres.exe" -D %cd%/post_data
%POSTGRES_BIN%/createuser.exe -s user

@rem assiming we are in chroma venv
cd chroma/chroma-0.4.22
start "chroma" uvicorn chromadb.app:app 
cd ../..
