FROM node:16-buster AS builder

WORKDIR /usr/src/app
COPY . .
COPY .env.build .env

RUN corepack pnpm install --frozen-lockfile
RUN corepack pnpm build:deps
RUN corepack pnpm typecheck
RUN NODE_OPTIONS='--max-old-space-size=4096' corepack pnpm build
RUN find . -name "node_modules" -type d -prune
RUN corepack pnpm install --prod

FROM node:16-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .

EXPOSE 5000
CMD [ "pnpm", "start:inject" ]
