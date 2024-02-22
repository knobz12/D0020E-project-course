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
COPY ./docker-start.sh .

CMD ["bash", "./docker-start.sh"]
# CMD ["node", "server.js", "-p", "3000"]