# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock first (for caching dependencies)
COPY package.json yarn.lock ./

# Install dependencies (production only)
RUN yarn install --production

# Copy the rest of the application files
COPY . .

# Build the Next.js application for production
RUN yarn build

# Expose the port Next.js runs on
EXPOSE 4000

# Start the frontend with `yarn start` for production
CMD ["yarn", "start"]

#DEV 
#CMD ["yarn", "run", "dev"]