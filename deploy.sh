#!/usr/bin/env zsh

# Script de implantação para o projeto VendaMais
# Atualizado em: 13 de junho de 2025

# Definindo cores para melhorar a legibilidade
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}===========================================${NC}"
echo "${BLUE}   IMPLANTAÇÃO DO PROJETO VENDAMAIS   ${NC}"
echo "${BLUE}===========================================${NC}"

# Definindo variáveis
DEPLOY_DIR="/Users/ronnysenna/Projetos/VendaMais"
PRODUCTION_URL="https://vendamais.ronnysenna.com.br"
DATE_TIME=$(date "+%d/%m/%Y %H:%M:%S")

# Navegando para o diretório do projeto
echo ""
echo "${YELLOW}Navegando para o diretório do projeto...${NC}"
cd $DEPLOY_DIR

# Verificando por possíveis erros comuns antes do deploy
echo ""
echo "${YELLOW}Verificando possíveis erros antes do deploy...${NC}"

# 1. Verificar uso de useSearchParams() sem Suspense
echo "- Verificando uso de useSearchParams() sem Suspense..."
COUNT_SEARCH_PARAMS=$(grep -r "useSearchParams" --include="*.tsx" --include="*.ts" src/ | wc -l)
COUNT_SUSPENSE=$(grep -r "Suspense" --include="*.tsx" --include="*.ts" src/ | wc -l)

if [ $COUNT_SEARCH_PARAMS -gt 0 ] && [ $COUNT_SUSPENSE -eq 0 ]; then
  echo "${RED}ERRO: Detectado uso de useSearchParams() sem Suspense. Corrija antes de prosseguir.${NC}"
  echo "Verifique: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout"
  exit 1
fi

# 2. Executar verificação de tipos TypeScript
echo "- Verificando tipos TypeScript..."
tsc --noEmit
if [ $? -ne 0 ]; then
  echo "${RED}ERRO: Verificação de tipos TypeScript falhou. Corrija os erros antes de prosseguir.${NC}"
  exit 1
fi

# 3. Verificar vulnerabilidades nas dependências
echo "- Verificando vulnerabilidades nas dependências..."
npm audit --production
if [ $? -ne 0 ]; then
  echo "${YELLOW}AVISO: Algumas dependências possuem vulnerabilidades. Considere atualizá-las.${NC}"
  read -r -p "Deseja continuar mesmo assim? (s/n): " CONT
  if [[ "$CONT" != "s" && "$CONT" != "S" ]]; then
    echo "${RED}Deploy cancelado pelo usuário.${NC}"
    exit 1
  fi
fi

# Atualizando dependências
echo ""
echo "${YELLOW}Atualizando dependências...${NC}"
yarn install

# Limpando cache do Next.js para garantir build limpo
echo ""
echo "${YELLOW}Limpando cache...${NC}"
rm -rf .next

# Executando o build para produção
echo ""
echo "${YELLOW}Gerando build de produção...${NC}"
yarn build

# Verificando se o build foi bem-sucedido
if [ $? -ne 0 ]; then
  echo "${RED}Erro durante o build. Verifique os logs acima.${NC}"
  exit 1
fi

echo "${GREEN}Build concluído com sucesso!${NC}"

# Executando testes antes do deploy
echo ""
echo "${YELLOW}Executando testes finais...${NC}"

# Você pode adicionar comandos de teste aqui
# Por exemplo: yarn test

# Log da implantação
echo ""
echo "${YELLOW}Registrando informações do deploy...${NC}"
echo "Deploy iniciado em: $DATE_TIME" > deploy-log.txt
echo "Commit: $(git log -1 --pretty=%B)" >> deploy-log.txt
echo "Branch: $(git branch --show-current)" >> deploy-log.txt

# Copiando para servidor de produção ou executando ações de implantação
# Substitua este trecho por sua estratégia de implantação específica
echo ""
echo "${YELLOW}Enviando para o servidor de produção...${NC}"
# Exemplo (descomente e adapte conforme sua necessidade):
# rsync -avz --delete .next node_modules package.json user@servidor:/caminho/para/producao/

# Exemplo de comando para iniciar em produção
echo ""
echo "${GREEN}Implantação concluída!${NC}"
echo "${BLUE}O VendaMais está disponível em: ${NC}${PRODUCTION_URL}"
echo "${YELLOW}Implantação finalizada em: $(date "+%d/%m/%Y %H:%M:%S")${NC}"
echo ""
echo "${BLUE}Lembre-se de verificar os logs para garantir que está funcionando corretamente.${NC}"
