# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock first (for caching dependencies)
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Expose the port Next.js runs on
EXPOSE 4000

# Start the frontend with `yarn run dev`
CMD ["yarn", "run", "dev"]
