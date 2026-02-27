
# Use an official Node runtime as a parent image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY frontend-react/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY frontend-react/ .

# Expose the port Vite runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
