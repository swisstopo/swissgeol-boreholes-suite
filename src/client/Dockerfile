FROM cypress/base:16
RUN mkdir /app
WORKDIR /app
COPY ./package.json /app/
COPY ./yarn.lock /app/
RUN yarn install
ENTRYPOINT npm run start