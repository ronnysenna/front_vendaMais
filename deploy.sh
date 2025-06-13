#!/bin/bash

# Script de implantação para o projeto VendaMais

echo "Iniciando implantação do VendaMais..."

# Definindo variáveis
DEPLOY_DIR="/Users/ronnysenna/Projetos/VendaMais"
PRODUCTION_URL="https://vendamais.ronnysenna.com.br"

# Navegando para o diretório do projeto
echo "Navegando para o diretório do projeto..."
cd $DEPLOY_DIR

# Atualizando dependências
echo "Atualizando dependências..."
npm install

# Executando o build para produção
echo "Gerando build de produção..."
npm run build

# Verificando se o build foi bem-sucedido
if [ $? -ne 0 ]; then
  echo "Erro durante o build. Verifique os logs acima."
  exit 1
fi

echo "Build concluído com sucesso!"

# Copiando para servidor de produção ou executando ações de implantação
# Substitua este trecho por sua estratégia de implantação específica
# Por exemplo, se estiver usando rsync, Docker, ou qualquer outro método

# Exemplo de comando para iniciar em produção (ajuste conforme necessário)
echo "Iniciando aplicação em produção..."
npm run start

echo "Implantação concluída! O VendaMais está disponível em: $PRODUCTION_URL"
echo "Lembre-se de verificar os logs para garantir que está funcionando corretamente."
