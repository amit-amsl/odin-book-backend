
# package.json caching stage

FROM node:20-bullseye-slim as deps

WORKDIR /tmp

COPY package.json ./

# Build stage

FROM node:20-bullseye-slim as build

WORKDIR /app/tmp

COPY --from=deps /tmp ./
COPY package-lock.json ./
COPY tsconfig.json ./

RUN npm install

COPY . /app/tmp/

RUN npx prisma generate
RUN npm run build:prod

RUN npm prune --omit=dev --omit=peer

# Production stage (Final image)

FROM node:20-bullseye-slim

WORKDIR /app

USER node

COPY --from=build --chown=node:node /app/tmp /app

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
