FROM node:15

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .


EXPOSE 8080
CMD ["node", "./src/server/index.js"]