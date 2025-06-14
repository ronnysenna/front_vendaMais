# Guia de Prevenção de Problemas de Cache - VendaMais

Esta documentação descreve as melhorias implementadas para resolver problemas de layout desatualizado e persistência de cache no projeto VendaMais.

## Problema Identificado

- **Layouts antigos persistindo após deploys** - Usuários continuavam vendo versões antigas da interface mesmo após novos deploys, devido a problemas de cache agressivo no navegador e CDN.

## Soluções Implementadas

### 1. Unificação de Arquivos de Ambiente

- Foi implementada a unificação de todos os arquivos .env.\* em um único arquivo `.env`
- Este arquivo contém uma variável `NEXT_PUBLIC_BUILD_ID` que é única para cada deploy

### 2. Sistema de Detecção de Nova Versão

- Componente `VersionChecker` que verifica periodicamente se há uma nova versão
- Quando uma nova versão é detectada, um banner é exibido ao usuário oferecendo atualizar
- Endpoint `/api/version` para fornecer o build ID atual do servidor

### 3. Metadados Anti-Cache

- Headers HTTP para evitar caching de recursos
- Meta tags no layout principal para forçar o navegador a recarregar recursos
- Middleware que adiciona headers anti-cache a todas as rotas exceto estáticas

### 4. Build ID Dinâmico

- Cada deploy gera um ID de build único baseado em timestamp
- Next.js configurado para usar este ID único para gerar nomes de arquivos diferentes a cada build
- Docker configurado para criar e usar este ID durante o processo de build

### 5. Testes Automatizados

- Testes que verificam a presença e funcionamento do mecanismo anti-cache
- Validação de headers HTTP e meta tags nos testes

## Como Usar

### Quando Fazer Deploy

Sempre execute o comando abaixo antes de fazer deploy para garantir um novo build ID:

```bash
npm run update:buildid
```

Ou, se estiver usando o script de deploy:

```bash
npm run docker:deploy
```

### Quando Houver Problemas de Cache

Se ainda persistirem problemas com layouts antigos, execute:

```bash
npm run rebuild:full
```

Este comando limpará todos os caches e fará uma reconstrução completa com um novo build ID.

### Testes de Versão

Para verificar se os mecanismos anti-cache estão funcionando:

```bash
npm run test:layout
```

## Verificações Manuais Recomendadas Após Deploy

1. Depois do deploy, abra o site em uma janela anônima/privada
2. Verifique se o layout está atualizado de acordo com as mudanças feitas
3. Verifique a meta tag "build-id" no código fonte da página para confirmar que está usando a versão nova
4. Se necessário, faça uma requisição manual para `/api/version` para ver o ID atual

## Troubleshooting

### Layouts ainda desatualizados após deploy

1. Verifique se está usando o script correto de deploy que atualiza o build ID
2. Force um recarregamento completo (Ctrl+Shift+R ou Cmd+Shift+R)
3. Limpe o cache do navegador ou teste em navegador anônimo
4. Execute `npm run cache:clear` seguido de `npm run rebuild:full`

### O sistema de detecção de nova versão não funciona

1. Verifique se o componente `VersionChecker` está sendo carregado na página
2. Verifique o console do navegador por erros
3. Confirme que a API `/api/version` está retornando o build ID correto
