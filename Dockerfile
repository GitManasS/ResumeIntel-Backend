FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p src/logs

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
