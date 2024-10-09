FROM node:20.18

WORKDIR /cuttle/

ENV NPM_CONFIG_LOGLEVEL=notice

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .

# There is definitely a better way to do this -- both cuttle client and server need to use these
# commands. Can probably use staged builds to share some logic and then only pull out the required
# files before building the artifact.

RUN echo "Running 'npm ci', this may take a while..." && \
  npm ci --legacy-peer-deps

# Bundle app source
COPY . .
