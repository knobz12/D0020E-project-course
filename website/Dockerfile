FROM node:alpine as base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN apk add --no-cache libc6-compat bash
RUN npm i -g pnpm ts-node

#################################

FROM base as builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY ./prisma ./prisma
RUN pnpm prisma generate

ARG NEXT_PUBLIC_API_URL=https://api.aistudybuddy.se
ARG ENABLE_ASSET_PREFIX=false

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV ENABLE_ASSET_PREFIX=$ENABLE_ASSET_PREFIX

COPY public public
COPY src src
COPY env.d.ts next.config.js postcss.config.js tailwind.config.ts tsconfig.json ./
RUN pnpm build --no-lint

#################################

FROM base as runner
WORKDIR /app

COPY --from=builder /app/.next/standalone .
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
RUN mkdir temp
COPY --from=builder /app/prisma ./temp/prisma

# For healthchecks
RUN apk add --no-cache curl

COPY <<"EOT" /app/docker-start.sh
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

npx --yes dotenv-cli -v DATABASE_URL="postgresql://user:pass@aisb-database:5432/db?schema=public" -- pnpm prisma db push --schema ../prisma/schema.prisma --skip-generate --accept-data-loss
npx --yes dotenv-cli -v DATABASE_URL="postgresql://user:pass@aisb-database:5432/db?schema=public" -- pnpm prisma db seed --schema ../prisma/schema.prisma

cd ..
rm -rf temp
#####################

node server.js -p 3000
EOT

CMD ["bash", "./docker-start.sh"]