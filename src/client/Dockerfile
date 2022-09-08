FROM cypress/base:16 AS development
ENV NODE_ENV=development
RUN apt-get -y update
RUN apt-get -y install git
RUN mkdir -p /app/src/client
WORKDIR /app/src/client
COPY ./package.json ./yarn.lock ./
RUN yarn install
ENTRYPOINT npm run start

FROM node:16-alpine AS deploy
ENV NODE_ENV=production
RUN mkdir /app
WORKDIR /app
COPY . .
RUN yarn install && yarn build
ENTRYPOINT npm run start
