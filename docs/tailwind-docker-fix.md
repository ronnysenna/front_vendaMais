# Solução para o Erro do Tailwind no Docker

## Problema
O build Docker estava falhando com o erro `Cannot find module 'tailwindcss'`. O Node não conseguia localizar o módulo tailwindcss durante o processo de build do Next.js.

## Causas Identificadas
1. Conflito entre arquivos de configuração (`postcss.config.js` e `postcss.config.mjs`)
2. Versões incompatíveis do Tailwind, PostCSS e Autoprefixer
3. Instalação incorreta das dependências do Tailwind dentro do container Docker

## Soluções Implementadas

### 1. Padronização das Configurações
- Removido `postcss.config.mjs` para evitar conflitos
- Criado `postcss.config.js` com a configuração correta
- Atualizado `tailwind.config.js` para garantir compatibilidade

### 2. Versionamento Específico de Dependências
- Fixadas versões específicas no `package.json`:
  - `tailwindcss`: 3.3.5
  - `postcss`: 8.4.31
  - `autoprefixer`: 10.4.16

### 3. Modificações no Dockerfile
- Adicionado script de verificação e correção (`fix-tailwind-docker.sh`)
- Instalação explícita das dependências com versões específicas
- Adicionadas etapas de verificação antes do build

### 4. Scripts de Manutenção
- `fix-tailwind-docker.sh`: Script executado durante o build para garantir que todas as dependências estejam instaladas
- `verify-docker-build.sh`: Script para validar a configuração antes de fazer commit

## Como usar os scripts de manutenção

### Verificando a configuração
```bash
./scripts/verify-docker-build.sh
```
Este script verifica se todas as dependências e arquivos de configuração estão corretos.

### Corrigindo manualmente as dependências
```bash
./scripts/fix-tailwind.sh
```
Este script limpa caches e reinstala as dependências do Tailwind localmente.

## Notas importantes
1. Sempre use versões específicas das dependências para evitar incompatibilidades
2. Evite ter múltiplos arquivos de configuração para a mesma ferramenta
3. Considere adicionar `fix-tailwind-docker.sh` em um pre-commit hook para garantir que tudo está correto antes de fazer commit
