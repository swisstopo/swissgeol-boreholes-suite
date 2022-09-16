FROM cypress/base:16 AS development
RUN apt-get -y update
RUN apt-get -y install git vim curl htop
RUN mkdir -p /app/src/client
WORKDIR /app/src/client
COPY ./package.json ./yarn.lock ./
RUN yarn install
ENTRYPOINT npm run start

FROM node:16-buster-slim AS deploy
RUN apt-get -y update
RUN apt-get -y install git
RUN npm install -g serve
RUN mkdir /app
WORKDIR /app
COPY --from=development /app/src/client/node_modules /app/node_modules
COPY . .
RUN npm run build
ENTRYPOINT serve -s build --listen 3000
