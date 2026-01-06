FROM node:21.6.2 AS production

WORKDIR /var/www/html

COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build

EXPOSE 8081

CMD ["node", "build/index.js"]