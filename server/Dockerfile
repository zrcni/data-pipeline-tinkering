FROM node:12.4.0

COPY package*.json /tmp/
WORKDIR /tmp

RUN npm install \
  && mkdir /app/ \
  && cd /app \
  && ln -s /tmp/node_modules

WORKDIR /app
COPY . /app

ENTRYPOINT ["npm"]
