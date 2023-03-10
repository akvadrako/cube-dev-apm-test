FROM node:19.7.0-bullseye-slim

RUN corepack enable \
    && corepack prepare yarn@stable --activate \
    && corepack enable yarn

WORKDIR /home

ADD package.json yarn.lock ./

RUN yarn install

ADD src src
ADD public public

CMD ["yarn", "start"]
