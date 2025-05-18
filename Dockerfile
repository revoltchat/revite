# syntax=docker.io/docker/dockerfile:1.7-labs
FROM --platform=$BUILDPLATFORM node:16-buster AS builder

WORKDIR /usr/src/app
COPY . .
COPY .env.build .env

RUN yarn install --frozen-lockfile
RUN yarn build:deps
# RUN yarn typecheck # lol no
RUN yarn build:highmem
RUN yarn workspaces focus --production --all

FROM node:24-alpine
WORKDIR /usr/src/app
COPY docker/package.json docker/yarn.lock .
RUN yarn install --frozen-lockfile
COPY --from=builder --exclude=package.json --exclude=yarn.lock --exclude=.yarn* --exclude=.git --exclude=external --exclude=node_modules /usr/src/app .

EXPOSE 5000
CMD [ "yarn", "start:inject" ]
