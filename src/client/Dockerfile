FROM cypress/base:16
RUN apt-get -y update
RUN apt-get -y install git
RUN mkdir /app
WORKDIR /app
COPY ./package.json /app/
COPY ./yarn.lock /app/
RUN yarn install
ENTRYPOINT npm run start