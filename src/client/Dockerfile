FROM node:20-buster-slim AS development
ARG VERSION
ARG REVISION
ENV VITE_APP_VERSION=${VERSION}+${REVISION}
RUN apt-get -y update
RUN apt-get -y install git vim curl htop python3 python3-pip
RUN python3 -m pip install mkdocs
RUN mkdir -p /app/src/client
WORKDIR /app/src/client

COPY ./package.json ./package-lock.json ./
RUN npm ci

# Build docs
RUN mkdir -p docs
COPY ./docs ./docs
COPY ./mkdocs.yml ./
RUN mkdocs build -d ./public/help

ENTRYPOINT ["npm", "run", "start", "--", "--host"]

FROM node:20-buster-slim AS deploy
ARG VERSION
ARG REVISION
ENV VITE_APP_VERSION=${VERSION}+${REVISION}
RUN apt-get -y update
RUN apt-get -y install git

RUN mkdir /app
WORKDIR /app

COPY --from=development /app/src/client/node_modules /app/node_modules
COPY --from=development /app/src/client/public/help /app/public/help

COPY . .

RUN npm run build

# Generate license and copyright notice for Node.js packages
RUN npx license-checker --json --production \
  --customPath licenseCustomFormat.json \
  --out /app/dist/license.json

USER node

ENTRYPOINT ["node", "server.cjs"]
