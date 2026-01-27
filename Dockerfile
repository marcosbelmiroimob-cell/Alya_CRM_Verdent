# ═══════════════════════════════════════════════════════════════
#  Dockerfile - Backend API (Node.js + Fastify)
# ═══════════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────────
#  Stage 1: Build
# ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código fonte
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# ───────────────────────────────────────────────────────────────
#  Stage 2: Production
# ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Instalar apenas ferramentas essenciais
RUN apk add --no-cache wget

# Copiar dependências e código buildado
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Script de inicialização com migrations
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
