# Usando abordagem de multi-estágios para uma imagem de produção otimizada
# Estágio de construção
FROM node:20-alpine3.19-slim AS builder

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos de configuração primeiro (melhor cache)
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Instala dependências
RUN yarn install --immutable

# Gera Prisma Client
RUN npx prisma generate

# Copia o restante dos arquivos de código-fonte
COPY . .

# Verifica se arquivo .env.production existe
RUN if [ ! -f .env.production ]; then \
    echo "Aviso: Arquivo .env.production não encontrado. Criando arquivo vazio." && \
    touch .env.production; \
    fi

# Verifica a presença de useSearchParams() sem Suspense
RUN grep -r "useSearchParams" --include="*.tsx" --include="*.ts" src/ || echo "Nenhum useSearchParams encontrado"
RUN grep -r "Suspense" --include="*.tsx" --include="*.ts" src/ || echo "Nenhum Suspense encontrado"

# Compila o projeto Next.js
RUN yarn build

# Estágio de produção - imagem mais leve
FROM node:20-alpine3.19-slim AS runner

# Define variáveis de ambiente para produção
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Adiciona um usuário não-root para executar a aplicação
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos necessários da etapa de construção
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json yarn.lock ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env* ./

# Adiciona configurações para melhor desempenho
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_SHARP_PATH="/app/node_modules/sharp"

# Instala apenas dependências de produção
RUN yarn install --immutable --production

# Instala wget para o healthcheck
RUN apk add --no-cache wget

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Configura permissões corretas
RUN chown -R nextjs:nodejs /app

# Muda para o usuário não-root
USER nextjs

# Saúde da aplicação
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Inicia o servidor Next.js
CMD ["yarn", "start"]
