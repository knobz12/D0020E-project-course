This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, install the package manager:

```bash
npm i -g pnpm
```

## Environment variables

OAuth 2.0 is used for authentication. Create kk
A .env.local file is needed in the root of the website folder with the following variables:

```bash
COOKIE_DOMAIN=localhost
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=123
# GitHub OAuth keys created in GitHub profile settings
GITHUB_ID=********************
GITHUB_SECRET=****************************************
```

## Install dependencies

From the website folder, install dependencies by running:

```bash
pnpm install
```

## Before running

Start database container by from root running:

```bash
docker compose up -d database
# or
docker compose up -d # to start all services
```

Create postgres database schema and generate node.js database client and types:

```bash
pnpm prisma db push
```

Seed database with some basic data:

```bash
pnpm prisma db seed
```

## To run local development server

Run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/pages/index.tsx`. The page auto-updates as you edit the file.

## Production server

To build run:

```bash
pnpm build
```

Then to start the production server:

```bash
pnpm start
```

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
