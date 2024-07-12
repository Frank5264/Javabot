# Use the official Node.js image as the base image
FROM node:14

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container image
COPY . .

# Set the timezone
RUN apt-get update && apt-get install -y tzdata
ENV TZ=Africa/Cairo

# Run the web service on container startup
CMD [ "npm", "start" ]
