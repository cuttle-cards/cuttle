FROM node:18.12.1

WORKDIR /cuttle/

ENV NPM_CONFIG_LOGLEVEL=notice

RUN apt-get update && \
  apt-get clean

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .

# There is definitely a better way to do this -- both cuttle client and server need to use these
# commands. Can probably use staged builds to share some logic and then only pull out the required
# files before building the artifact.

RUN echo "Running 'npm ci', this may take a while..." && \
  npm ci

# Bundle app source
COPY . .
