This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, install the package manager:

```bash
npm i -g pnpm
```

## Install dependencies

From the website folder, install dependencies by running:

```bash
pnpm install
```

## To run local development server

When running local development server, for next.config.js hide the following:

```javascript
// output: "export",
// assetPrefix: "/static",
```

Run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/pages/index.tsx`. The page auto-updates as you edit the file.

## Production

### HTML files

For building static html, css, javascript files to the "out" folder, in next.config.js set:

```javascript
output: "export",
assetPrefix: "/static",
```

Then run:

```bash
pnpm build
```

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
