FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy only package files first (better for Docker caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose the app port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
