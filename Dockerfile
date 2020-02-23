# Use the latest one as this is for CI purpose.
FROM node:latest

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends graphicsmagick \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY package.json .
COPY package-lock.json .

RUN npm install
