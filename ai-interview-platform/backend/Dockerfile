FROM node:22-slim

# Prisma needs OpenSSL at runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

COPY src ./src

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "src/server.js"]
