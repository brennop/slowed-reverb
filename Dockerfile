FROM node:12

RUN apt update && apt install --no-install-recommends -y \
  ffmpeg swh-plugins

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install ytdl-core@latest

COPY . .

EXPOSE 8080
CMD ["node", "index.js"]