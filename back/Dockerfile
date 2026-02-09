FROM node:20-alpine
WORKDIR /app

# Copy shared and install its deps first (zod must stay in shared/node_modules)
COPY shared/ ./shared/
WORKDIR /app/shared
RUN npm install

# Copy back and install its deps (workspaces resolve @avenir/* packages)
COPY back/ /app/back/
WORKDIR /app/back
RUN npm install

# Re-ensure shared has zod (workspace hoisting may have removed it)
WORKDIR /app/shared
RUN npm install

ENV NODE_ENV=production
WORKDIR /app/back

EXPOSE 3001

CMD ["npx", "tsx", "infrastructure/adapters/fastify/server.ts"]
