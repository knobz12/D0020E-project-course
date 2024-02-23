

cd ..
cd build

SET PYTHON=%cd%/python/python.exe
SET NODE=%cd%/node/node-v20.11.1-win-x64/node.exe
SET NPM=%NODE% %cd%/node/node-v20.11.1-win-x64/node_modules/npm/bin/npm-cli.js
SET NPX=%NODE% %cd%/node/node-v20.11.1-win-x64/node_modules/npm/bin/npx-cli.js
SET PNPM=%cd%/pnpm.exe
SET POSTGRES_BIN=%cd%/postgres/pgsql/bin
SET CHROMA_DIR=%cd%/chroma/chroma-0.4.22

mkdir post_data
%POSTGRES_BIN%/initdb.exe -D %cd%/post_data
start "postgres" "%POSTGRES_BIN%/postgres.exe" -D %cd%/post_data
timeout /t 1
%POSTGRES_BIN%/createuser.exe -s user

call %cd%/venv_chroma/Scripts/activate.bat
cd chroma/chroma-0.4.22
start "chroma" uvicorn chromadb.app:app 
cd ..
cd ..

call %cd%/venv_backend/Scripts/activate.bat
cd ..
start "py" py %cd%/backend %*


cd website
start "node" "%NODE%" server.js -p 3000
cd ../build