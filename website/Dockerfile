FROM node:alpine as base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN npm i -g pnpm

#################################

FROM base as builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=https://api.aistudybuddy.se

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY ./prisma ./prisma
RUN pnpm prisma generate

COPY . .
RUN pnpm build

#################################

FROM base as runner
WORKDIR /app

COPY --from=builder /app/.next/standalone .
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js", "-p", "3000"]