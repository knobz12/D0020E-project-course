FROM node:alpine as base

ARG MODEL_PATH

ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILDING=1
ENV MODEL_PATH=${MODEL_PATH}

WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN npm i -g pnpm

#################################

FROM base as builder

COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

COPY . .
RUN pnpm build

#################################

FROM base as runner

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

COPY --from=builder /app/node_modules ./node_modules

ENV PORT=3000
ENV HOSTNAME=127.0.0.1
EXPOSE 3000
CMD ["node", "server.js"]