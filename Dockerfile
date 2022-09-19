FROM node:16-buster AS builder

WORKDIR /usr/src/app
COPY . .
COPY .env.build .env

RUN pnpm install --frozen-lockfile
RUN pnpm typecheck
RUN pnpm build:highmem
# wipe node_modules for all packages
RUN pnpm install --prod

FROM node:16-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .

EXPOSE 5000
CMD [ "yarn", "start:inject" ]
