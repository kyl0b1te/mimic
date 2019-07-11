FROM alpine:3.9

RUN apk add --no-cache bash nodejs npm

WORKDIR /mimic

COPY package*.json /mimic/
RUN npm ci
COPY . .

RUN npm run lint \
  && npm run test \
  && npm run build


FROM node:11.10

RUN npm install pm2 -g
WORKDIR /mimic

COPY --from=0 /mimic/dist dist/
COPY package*.json /mimic/
COPY mimic-pm2.config.js /mimic/

RUN npm ci --production

EXPOSE 8080
CMD ["pm2-runtime", "start", "mimic-pm2.config.js"]
