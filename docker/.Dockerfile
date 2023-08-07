FROM node:18.12.1

WORKDIR /cuttle/

ENV NPM_CONFIG_LOGLEVEL=notice

RUN apt-get update
RUN apt-get clean

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .

# Bundle app source
COPY . .

RUN echo "Running 'npm ci', this may take a while..." && npm ci
