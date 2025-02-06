# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package.json and yarn.lock first (for caching dependencies)
COPY package.json yarn.lock ./

# Install dependencies (production and dev dependencies if needed)
RUN yarn install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the Next.js application for production
RUN yarn build

# Expose the port Next.js runs on (default 3000 unless specified differently)
EXPOSE 4000

# Start the frontend with `yarn start` for production
CMD ["yarn", "start"]

# DEV (optional if needed for development)
# CMD ["yarn", "run", "dev"]
