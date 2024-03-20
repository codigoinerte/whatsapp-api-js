FROM node:18.12.1

RUN apt-get update && \
  apt-get install -y \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  npm \
  yarn \
  libatk-bridge2.0-0 \
  libxkbcommon0 \
  libwayland-client0 \
  libgtk-3-0 && \
  rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_CACHE_DIR=/home/web/.cache

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
