FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (production only)
COPY package*.json ./
# Install Python and build tools so native modules (e.g. sqlite3) can compile,
# run install, then remove build deps to keep image small.
RUN apk add --no-cache python3 build-base \
    && npm ci --omit=dev --prefer-offline --no-audit \
    && apk del build-base python3

# Copy source
COPY . .

EXPOSE 3000

ENV NODE_ENV=production

CMD [ "node", "server.js" ]
