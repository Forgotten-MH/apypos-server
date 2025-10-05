# Stage 1: Build
FROM node:21 AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Stage 2: Runtime
FROM node:21
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/csv ./dist/csv
COPY --from=builder /app/src/json ./dist/json

COPY --from=builder /app/package.json ./
RUN yarn install --production
EXPOSE 80 443 3000
CMD ["node", "--openssl-legacy-provider","dist/server.js"]
