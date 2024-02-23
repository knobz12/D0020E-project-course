

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
%POSTGRES_BIN%/initdb.exe --username=user -D %cd%/post_data 
start "postgres" "%POSTGRES_BIN%/postgres.exe" -D %cd%/post_data
timeout /t 1
%POSTGRES_BIN%/createdb.exe db 

call %cd%/venv_chroma/Scripts/activate.bat
cd chroma/chroma-0.4.22
start "chroma" uvicorn chromadb.app:app 
cd ..
cd ..

call %cd%/venv_backend/Scripts/activate.bat
cd ..
start "py" py %cd%/backend %*


cd website
@rem # If you want to use GitHub OAuth 2.0 login
SET GITHUB_ID=********************
SET GITHUB_SECRET=****************************************

@rem # If you want to use Google OAuth 2.0 login
SET GOOGLE_ID=************************************************************************
SET GOOGLE_SECRET=************************************

@rem # Should work as is but you may change
SET DATABASE_URL=postgresql://user:pass@localhost:5432/db?schema=public
SET NEXT_PUBLIC_API_URL=http://localhost:3030
SET COOKIE_DOMAIN=localhost
SET CHROMA_URL=http://localhost:8000
SET NEXTAUTH_URL=http://localhost:3000
SET NEXTAUTH_URL_INTERNAL=http://localhost:3000
SET TRPC_URL=http://localhost:3000
SET JWE_SECRET=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
SET JWE_PEPPER=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
SET NEXTAUTH_SECRET=123

timeout /t 1
%PNPM% prisma migrate reset -f --skip-seed && %PNPM% prisma db push && %PNPM% prisma db seed
start "node" "%NODE%" server.js -p 3000