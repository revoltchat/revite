FROM node:16-buster AS builder

WORKDIR /usr/src/app
COPY . .
COPY .env.build .env

RUN pnpm install --frozen-lockfile
RUN pnpm typecheck
RUN NODE_OPTIONS='--max-old-space-size=4096' pnpm build:all
RUN find . -name "node_modules" -type d -prune
RUN pnpm install --prod

FROM node:16-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .

EXPOSE 5000
CMD [ "pnpm", "start:inject" ]
