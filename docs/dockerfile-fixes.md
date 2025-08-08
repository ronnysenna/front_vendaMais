# Correções para Problemas de Deploy no Dockerfile

Este documento descreve as alterações feitas para resolver problemas de compatibilidade de dependências durante o deploy da aplicação AgendaAI.

## Problemas Identificados

1. **Conflito de nodemailer**: 
   - A aplicação usava nodemailer@7.0.3
   - next-auth@4.24.11 esperava nodemailer@^6.6.5

2. **Incompatibilidade do Vite com Node.js**:
   - Vite 7.1.1 requer Node.js versão ^20.19.0 || >=22.12.0
   - O contêiner Docker usa Node.js 20.11.1

3. **Conflitos de versão do React e Next.js**:
   - Versões muito recentes causando incompatibilidades

## Alterações Realizadas

### 1. Ajustes no package.json

- Downgrade da versão do React para 18.2.0 (mais estável)
- Downgrade da versão do Next.js para 14.2.6
- Ajuste da versão do nodemailer para 6.9.9 (compatível com next-auth)
- Downgrade do vitest para ~3.0.0
- Adição de configuração de engines para Node.js >=20.11.0 <21.0.0

### 2. Configurações de npm/yarn

- Criado arquivo `.npmrc` com:
  ```
  engine-strict=false
  legacy-peer-deps=true
  ```

### 3. Melhorias no Dockerfile

- Adicionadas variáveis de ambiente para ignorar verificações de versão
- Modificada estratégia de instalação para ser mais resiliente
- Adicionado fallback para instalação com --force quando necessário
- Configuração para copiar o arquivo .npmrc para os contêineres

### 4. Scripts Auxiliares

- Criado `scripts/check-deps.sh` para verificar as versões das dependências
- Criado `scripts/clean-install.sh` para limpeza e reinstalação das dependências

## Como Usar

Para verificar as dependências:
```bash
npm run check:deps
```

Para limpar a instalação e reinstalar com flags de compatibilidade:
```bash
npm run clean:install
```

## Notas Adicionais

Se ocorrerem problemas durante a instalação local, tente:

```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e reinstalar
rm -rf node_modules .next
npm install --legacy-peer-deps
```
