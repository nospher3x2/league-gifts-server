FROM node:18-alpine3.17 AS development

WORKDIR /usr/src/app

RUN apk update \
  && apk add openssl1.1-compat

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN npx prisma generate

EXPOSE 4000

CMD [ "yarn", "start:dev" ]