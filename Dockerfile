FROM node:15

WORKDIR /app

COPY . .

RUN npm install

ENV NODE_ENV=production
RUN npm run build


# EXPOSE 8080
CMD ["node", "./src/server/index.js"]