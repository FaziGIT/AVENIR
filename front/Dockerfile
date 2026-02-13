FROM node:20-alpine AS base

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app

# Install shared deps first (zod must be in shared/node_modules)
COPY shared/ ./shared/
WORKDIR /app/shared
RUN npm install

# Install front deps
COPY front/package.json front/package-lock.json* /app/front/
WORKDIR /app/front
RUN npm install

# --- Build ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app ./
COPY front/ ./front/
COPY shared/ ./shared/

WORKDIR /app/front

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN npm run build

# --- Production ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/front/public ./front/public
COPY --from=builder --chown=nextjs:nodejs /app/front/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/front/.next/static ./front/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "front/server.js"]
