FROM node:22-bookworm-slim AS development
ARG VERSION
ARG REVISION
ENV VITE_APP_VERSION=${VERSION}+${REVISION}
RUN apt-get -y update && \
    apt-get -y install curl git htop mkdocs vim
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

FROM node:22-bookworm-slim AS deploy
ARG VERSION
ARG REVISION
ENV VITE_APP_VERSION=${VERSION}+${REVISION}

WORKDIR /app

COPY . .
COPY --from=development /app/src/client/node_modules ./node_modules
COPY --from=development /app/src/client/public/help ./public/help

RUN npm run build

# Generate license and copyright notice for Node.js packages
RUN npx license-checker --json --production \
  --customPath licenseCustomFormat.json \
  --out ./dist/license.json

USER 1000 # node base image UID

ENTRYPOINT ["node", "server.cjs"]
