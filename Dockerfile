# Use an official Node.js runtime as the base image (Alpine version)
FROM node:14-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install build dependencies
RUN apk add --no-cache python3 g++ make

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Remove build dependencies to keep the image small
RUN apk del python3 g++ make

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["node", "dist/index.js"]
