FROM node:18
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY postgres/. .
COPY shared ./shared

CMD ["node", "index.js"]

