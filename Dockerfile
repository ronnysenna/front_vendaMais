# Usando abordagem de multi-estágios para uma imagem de produção otimizada
# Estágio de construção
FROM node:20.11-alpine3.19 AS builder

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos de configuração primeiro (melhor cache)
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Instala dependências
RUN yarn install --immutable || npm install

# Gera Prisma Client
RUN npx prisma generate

# Copia o restante dos arquivos de código-fonte
COPY . .

# Verifica se arquivo .env existe
RUN if [ ! -f .env ]; then \
    echo "Aviso: Arquivo .env não encontrado. Criando arquivo vazio." && \
    touch .env && \
    echo "NODE_ENV=production" >> .env; \
    fi

# Verifica a presença de useSearchParams() e Suspense - usando find + grep para compatibilidade Alpine
RUN find src -name "*.tsx" -o -name "*.ts" -exec grep -l "useSearchParams" {} \; || echo "Nenhum useSearchParams encontrado"
RUN find src -name "*.tsx" -o -name "*.ts" -exec grep -l "Suspense" {} \; || echo "Nenhum Suspense encontrado"

# Limpa o cache do Next.js antes do build para garantir uma compilação limpa
RUN rm -rf .next
RUN rm -rf node_modules/.cache

# Gera um timestamp do build e o salva como variável de ambiente
# O Docker não permite comandos shell diretamente em ENV, então geramos e usamos em etapas separadas
RUN echo "build-$(date +%s)" > /tmp/build_id

# Adiciona o build ID ao arquivo .env antes de compilar
RUN BUILD_ID=$(cat /tmp/build_id) && \
    echo "NEXT_PUBLIC_BUILD_ID=$BUILD_ID" >> .env && \
    echo "Build ID gerado: $BUILD_ID" && \
    echo "Conteúdo do arquivo .env:" && \
    cat .env

# Compila o projeto Next.js com o timestamp único definido no .env
RUN echo "Build iniciado em $(date)" && \
    yarn build
RUN echo "NEXT_PUBLIC_BUILD_ID=$(cat /tmp/build_id)" >> .env

# Estágio de produção - imagem mais leve
FROM node:20.11-alpine3.19 AS runner

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
COPY --from=builder /app/package.json ./
# Copia o yarn.lock se existir
COPY --from=builder /app/yarn.lock* ./
# Copia o package-lock.json se existir
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env* ./

# Adiciona configurações para melhor desempenho
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_SHARP_PATH="/app/node_modules/sharp"

# Instala apenas dependências de produção
RUN if [ -f yarn.lock ]; then \
    yarn install --immutable --production; \
    else \
    npm ci --production; \
    fi

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

# Inicia o servidor Next.js (sem depender de dotenv-cli)
CMD ["node_modules/.bin/next", "start"]
