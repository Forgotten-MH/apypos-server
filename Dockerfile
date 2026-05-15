# Stage 1: Build
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Stage 2: Runtime
FROM node:22-slim
WORKDIR /app

RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/csv ./dist/csv
COPY --from=builder /app/src/json ./dist/json

COPY --from=builder /app/package.json /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile && yarn cache clean

# ✅ create logs dir + fix ownership
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

ENV PORT=80
ENV DB_PORT=27017
ENV DB_NAME=apypos

USER appuser

EXPOSE 80 3000
CMD ["node", "dist/server.js"]