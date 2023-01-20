FROM cypress/base:16 AS development
ARG VERSION
ARG REVISION
ENV REACT_APP_VERSION ${VERSION}+${REVISION}
RUN apt-get -y update
RUN apt-get -y install git vim curl htop
RUN mkdir -p /app/src/client
WORKDIR /app/src/client
COPY ./package.json ./package-lock.json ./
USER node
RUN npm install
ENTRYPOINT npm run start

FROM node:16-buster-slim AS deploy
ARG VERSION
ARG REVISION
ENV REACT_APP_VERSION ${VERSION}+${REVISION}
RUN apt-get -y update
RUN apt-get -y install git
RUN npm install -g serve
RUN mkdir /app
WORKDIR /app
COPY --from=development /app/src/client/node_modules /app/node_modules
COPY . .
RUN npm run build

# Generate license and copyright notice for Node.js packages
RUN npx license-checker --json --production \
  --customPath licenseCustomFormat.json \
  --out /app/build/license.json

ENTRYPOINT serve -s build --listen 3000
