# Use Node Alpine as the base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all files from the current directory to the container
COPY . .

# Build your Vite project for production
RUN npm run build

# Install serve globally to serve the production build
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Set the command to serve the production build
CMD [ "serve", "-s", "dist" ]
