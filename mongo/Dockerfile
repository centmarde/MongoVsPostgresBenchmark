FROM node:18
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY mongo/. .
COPY shared ./shared

CMD ["node", "index.js"]

