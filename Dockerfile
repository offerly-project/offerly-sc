FROM node:lts

WORKDIR /app


COPY *.json ./


RUN npm i


COPY . .


RUN npm run build

EXPOSE 8001

CMD ["npm", "run", "start"]