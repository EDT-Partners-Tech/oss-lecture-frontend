# 
# Copyright 2025 EDT&Partners
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# 
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
