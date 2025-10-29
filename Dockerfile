# Stage 1: Build the application
FROM node:24-alpine AS build

# Install bun
RUN npm install -g bun

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./package*.json ./

# Install dependencies using bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun x nuxi prepare
RUN bun x nuxi build

# Stage 2: Run the application
FROM node:24-alpine

# Set the working directory
RUN mkdir -p /home/node/app && chown -R node:node /home/node
WORKDIR /home/node/app

# Copy the built application from the build stage
COPY --from=build --chown=node:node /app/.output/ ./

# Expose the port the app runs on
EXPOSE 3000

# Run as non-root user for security
USER node

# Start the application
ENTRYPOINT ["node", "./server/index.mjs"]
