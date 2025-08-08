# Usando abordagem de multi-estágios para uma imagem de produção otimizada
# Estágio de construção
FROM node:20.11-alpine3.19 AS builder

# Configura variáveis de ambiente para ignorar verificações de versão do Node
ENV NODE_OPTIONS=--dns-result-order=ipv4first
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV YARN_IGNORE_NODE=1
ENV NPM_CONFIG_ENGINE_STRICT=false

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos de configuração primeiro (melhor cache)
COPY package.json yarn.lock .npmrc ./
COPY prisma ./prisma/

# Instala dependências com estratégia resiliente
RUN yarn install --immutable --ignore-engines || npm install --legacy-peer-deps --no-fund --no-audit
# Caso falhe, tenta com abordagem alternativa
RUN if [ $? -ne 0 ]; then \
    echo "Primeira tentativa falhou, tentando abordagem alternativa..." && \
    rm -rf node_modules && \
    npm install --legacy-peer-deps --force; \
    fi

# Garante que as dependências do SWC estejam instaladas (necessário para o Next.js)
RUN npm install --no-save @next/swc-linux-x64-musl @next/swc-linux-x64-gnu || true

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
    # Substituir a URL do app para produção se estivermos em produção
    if [ "$NODE_ENV" = "production" ]; then \
    sed -i 's|NEXT_PUBLIC_APP_URL=http://localhost:3000|NEXT_PUBLIC_APP_URL=https://agenda-ai.ronnysenna.com.br|g' .env; \
    fi && \
    echo "Build ID gerado: $BUILD_ID" && \
    echo "Conteúdo do arquivo .env:" && \
    cat .env

# Compila o projeto Next.js com o timestamp único definido no .env
RUN echo "Build iniciado em $(date)" && \
    NODE_ENV=production yarn build
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
COPY --from=builder /app/.npmrc ./
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

# Instala apenas dependências de produção com estratégia resiliente
RUN if [ -f yarn.lock ]; then \
    yarn install --immutable --production --ignore-engines || npm install --production --legacy-peer-deps --no-fund --no-audit; \
    else \
    npm ci --production --legacy-peer-deps --no-fund --no-audit || npm install --production --legacy-peer-deps --force; \
    fi

# Instala wget para o healthcheck
RUN apk add --no-cache wget

# Expõe tanto a porta 3000 quanto a 80 para compatibilidade
EXPOSE 3000 80

# Configura permissões corretas
RUN chown -R nextjs:nodejs /app

# Muda para o usuário não-root
USER nextjs

# Saúde da aplicação - verifica a porta definida na variável PORT ou a 3000 por padrão
HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=2 --spider http://localhost:${PORT:-3000}/ || exit 1

# Inicia o servidor Next.js com configuração de porta
CMD ["sh", "-c", "node_modules/.bin/next start -p ${PORT:-3000}"]
