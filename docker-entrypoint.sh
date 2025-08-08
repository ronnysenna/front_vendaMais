#!/bin/sh

# Script otimizado para iniciar o aplicativo em ambiente Docker
# Uso: ./docker-entrypoint.sh

set -e

# Função para log com timestamp
log() {
  echo "[$(date -Iseconds)] $*"
}

# Definir variáveis de ambiente
export NODE_ENV=production
export PORT=${PORT:-3000}
export HOSTNAME="0.0.0.0"

# Carregar variáveis de ambiente do arquivo .env se existir
if [ -f ".env" ]; then
  log "Carregando variáveis de ambiente do arquivo .env"
  set -a
  . .env
  set +a
fi

# Verificar variáveis de ambiente críticas
check_env() {
  log "Verificando variáveis de ambiente críticas"
  for VAR in DATABASE_URL BETTER_AUTH_SECRET
  do
    if [ -z "$(eval echo \$$VAR)" ]; then
      log "AVISO: A variável $VAR não está definida!"
    fi
  done
  
  # Verificar e configurar a URL do app
  if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    export NEXT_PUBLIC_APP_URL="https://agenda-ai.ronnysenna.com.br"
    log "AVISO: NEXT_PUBLIC_APP_URL não definida, usando valor padrão: $NEXT_PUBLIC_APP_URL"
  fi
}

# Gerar ID de build se não existir
if [ -z "$NEXT_PUBLIC_BUILD_ID" ]; then
  export NEXT_PUBLIC_BUILD_ID="build-$(date +%s)"
  log "AVISO: NEXT_PUBLIC_BUILD_ID não definido, gerando novo: $NEXT_PUBLIC_BUILD_ID"
fi

# Banner de inicialização
log "========================================"
log "  INICIANDO SERVIÇO AGENDA AI - DOCKER"
log "========================================"
log "Porta: $PORT"
log "NODE_ENV: $NODE_ENV"
log "BUILD_ID: $NEXT_PUBLIC_BUILD_ID"
log "APP_URL: $NEXT_PUBLIC_APP_URL"
log "========================================"

# Executar verificações
check_env

# Iniciar o Next.js
log "Iniciando servidor Next.js na porta $PORT"
exec node_modules/.bin/next start -p $PORT
