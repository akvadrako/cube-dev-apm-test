FROM node:19.7.0-bullseye-slim

RUN corepack enable \
    && corepack prepare yarn@stable --activate \
    && corepack enable yarn

WORKDIR /home

ADD package.json .

RUN yarn install

ADD main.js .

CMD ["yarn", "start"]
