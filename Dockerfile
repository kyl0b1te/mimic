FROM alpine:3.9

RUN apk add --no-cache bash nodejs npm
RUN npm i -g typescript@3.4.5 eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

WORKDIR /app

COPY package*.json /app/
RUN npm ci
COPY . .

RUN npm run lint && npm run build



FROM node:11.10

WORKDIR /mimic

COPY --from=0 /app/dist dist/
COPY package*.json /mimic/

RUN npm ci --production

EXPOSE 8080
CMD ["npm", "run", "start"]
