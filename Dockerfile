FROM node:16-buster AS builder

WORKDIR /usr/src/app
COPY . .
COPY .env.build .env

RUN corepack prepare pnpm@7.12.0 --activate
RUN pnpm install --frozen-lockfile
RUN pnpm build:deps
RUN pnpm typecheck
RUN NODE_OPTIONS='--max-old-space-size=4096' pnpm build
RUN find . -name "node_modules" -type d -prune
RUN pnpm install --prod

FROM node:16-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

EXPOSE 5000
CMD [ "npm", "run", "start:inject" ]
