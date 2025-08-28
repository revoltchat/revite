FROM node:16-buster AS builder
ENV NODE_OPTIONS="--max_old_space_size=32768"
WORKDIR /usr/src/app
COPY . .
COPY .env.build ./.env

RUN yarn install --frozen-lockfile
RUN yarn build:deps
# RUN yarn typecheck # lol no
RUN yarn build:highmem
RUN yarn workspaces focus --production --all

FROM node:16-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .

EXPOSE 5000
CMD [ "yarn", "start:inject" ]
