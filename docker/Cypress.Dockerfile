# Sync this up with the Cypress version in package.json
FROM node:18.12.1

# by setting CI environment variable we switch the Cypress install messages
# to small "started / finished" and avoid 1000s of lines of progress messages
# https://github.com/cypress-io/cypress/issues/1243
ENV CI=1

RUN apt-get update && \
  apt-get -y install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 \
    libnss3 libxss1 libasound2 libxtst6 xauth xvfb && \
  apt-get clean

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .

# There is definitely a better way to do this -- both cuttle client and server need to use these
# commands. Can probably use staged builds to share some logic and then only pull out the required
# files before building the artifact.

RUN echo "Running 'npm ci', this may take a while..." && \
  npm ci --legacy-peer-deps

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .

# verify that Cypress has been installed correctly.
# running this command separately from "cypress run" will also cache its result
# to avoid verifying again when running the tests
RUN npx cypress verify
