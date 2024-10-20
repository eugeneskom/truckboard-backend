FROM node:20.9.0

WORKDIR /app

COPY package*.json ./

RUN npm install

ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]