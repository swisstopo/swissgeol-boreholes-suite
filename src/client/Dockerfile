FROM node:16-alpine3.15
RUN mkdir /app
WORKDIR /app
COPY ./package.json /app/
COPY ./yarn.lock /app/
RUN npm install
ENTRYPOINT npm run start