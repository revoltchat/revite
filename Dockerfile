FROM node:15-buster AS builder

WORKDIR /usr/src/app
COPY package*.json ./

RUN yarn --no-cache

COPY . .
COPY .env.build .env
RUN yarn add --dev @babel/plugin-proposal-decorators
RUN yarn typecheck
RUN yarn build
RUN npm prune --production

FROM node:16-buster
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .

EXPOSE 5000
CMD [ "yarn", "start:inject" ]