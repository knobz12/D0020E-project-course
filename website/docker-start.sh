#!/bin/bash

# For pushing the PostgreSQL schema and seeding the database with courses
mkdir temp
cd temp
echo "{
    \"name\": \"temp\",
    \"prisma\": {
        \"seed\": \"ts-node --compiler-options {\\\"module\\\":\\\"CommonJS\\\"} ./prisma/seed.ts\"
    },
    \"dependencies\": {
        \"@prisma/client\": \"^5.8.1\"
    },
    \"devDependencies\": {
        \"prisma\": \"^5.8.1\"
    }
}" > package.json
cat package.json
pnpm install

npx --yes dotenv-cli -v DATABASE_URL="postgresql://user:pass@aisb-database:5432/db?schema=public" -- pnpm prisma db push --schema ../prisma/schema.prisma --skip-generate
npx --yes dotenv-cli -v DATABASE_URL="postgresql://user:pass@aisb-database:5432/db?schema=public" -- pnpm prisma db seed --schema ../prisma/schema.prisma

cd ..
rm -rf temp
#####################

node server.js -p 3000