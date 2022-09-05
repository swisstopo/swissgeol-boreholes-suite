FROM cypress/base:16
RUN mkdir /app
WORKDIR /app
COPY ./package.json /app/
COPY ./yarn.lock /app/
RUN npm install
ENTRYPOINT npm run start