# Dockerfile simplificado para Next.js com Tailwind e Prisma
FROM node:20.11-alpine AS base

# Configurações gerais
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Instalação de dependências
FROM base AS deps
WORKDIR /app

# Copia arquivos de configuração para instalação eficiente das dependências
COPY package.json yarn.lock* package-lock.json* ./
COPY prisma ./prisma/

# Instala as dependências de produção
RUN yarn install --frozen-lockfile --production || \
    npm ci --only=production

# Gera o Prisma Client
RUN npx prisma generate

# Etapa de build
FROM base AS builder
WORKDIR /app

# Copia as dependências da etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated

# Copia todo o código fonte
COPY . .

# Cria os arquivos de configuração para o Tailwind
RUN echo 'module.exports = { plugins: { "tailwindcss": {}, autoprefixer: {} } }' > postcss.config.js

# Cria o build ID
RUN echo "build-$(date +%s)" > /tmp/build_id

# Configura URL de produção se necessário
RUN if [ "$NODE_ENV" = "production" ]; then \
    sed -i 's|NEXT_PUBLIC_APP_URL=http://localhost:3000|NEXT_PUBLIC_APP_URL=https://agenda-ai.ronnysenna.com.br|g' .env || echo "No .env file found"; \
    fi

# Adiciona o build ID ao arquivo .env
RUN if [ -f .env ]; then \
    echo "NEXT_PUBLIC_BUILD_ID=$(cat /tmp/build_id)" >> .env; \
    else \
    echo "NODE_ENV=production" > .env && \
    echo "NEXT_PUBLIC_BUILD_ID=$(cat /tmp/build_id)" >> .env; \
    fi

# Build do Next.js
RUN yarn build || npm run build

# Etapa de execução
FROM base AS runner
WORKDIR /app

# Adiciona usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Define diretório para armazenamento
VOLUME /app/.next/cache

# Copia os arquivos necessários para execução
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env* ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

# Instala apenas as dependências de produção
RUN yarn install --frozen-lockfile --production || \
    npm ci --only=production

# Configura o ambiente para produção
ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Define usuário não-root
USER nextjs

# Expõe a porta do servidor
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:3000/ || exit 1

# Inicia o servidor Next.js
CMD ["npm", "run", "start"]
