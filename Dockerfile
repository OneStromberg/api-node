FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/api
WORKDIR /usr/src/api

# Install app dependencies
COPY package.json /usr/src/api/
RUN npm install

# Bundle app source
COPY . /usr/src/api

EXPOSE 8090
CMD [ "node", "index.js" ]