FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app

RUN addgroup -g 1001 nodejs && adduser -S -u 1001 nextjs

COPY --from=builder /app ./

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
