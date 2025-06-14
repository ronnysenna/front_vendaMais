#!/bin/bash

# Script para iniciar o aplicativo em ambiente Docker
# Uso: ./docker-entrypoint.sh

# Definir variáveis de ambiente
export NODE_ENV=production

# Definir porta padrão se não estiver configurada
export PORT=${PORT:-3000}

# Carregar variáveis de ambiente do arquivo .env se existir
if [ -f ".env" ]; then
  set -a
  source .env
  set +a
fi

echo "========================================"
echo "  INICIANDO SERVIÇO VENDAMAIS - DOCKER"
echo "========================================"
echo "Porta: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "BUILD_ID: $NEXT_PUBLIC_BUILD_ID"
echo "========================================"

# Iniciar o Next.js
exec node_modules/.bin/next start -p $PORT
