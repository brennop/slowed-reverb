FROM node:12

RUN apt update && apt install --no-install-recommends -y \
  ffmpeg swh-plugins

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run dev