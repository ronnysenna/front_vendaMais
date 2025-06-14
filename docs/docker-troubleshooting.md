# Docker: Solução de Problemas

Este guia apresenta soluções para problemas comuns encontrados ao usar Docker com o projeto VendaMais.

## Erros comuns de build

### 1. `useSearchParams()` deve estar dentro de um limite de suspense

**Problema**: Erro de construção do Next.js relacionado ao uso de `useSearchParams()` sem estar dentro de um componente `Suspense`.

**Solução**:

- Certifique-se de que todos os componentes que usam `useSearchParams()` estão envolvidos por um componente `Suspense`.
- Exemplo:

```tsx
import { Suspense } from "react";

// ...

<Suspense fallback={<div>Carregando...</div>}>
  <ComponenteQueUsaSearchParams />
</Suspense>;
```

### 2. Problemas de permissão

**Problema**: Erros de permissão durante a execução do container.

**Solução**:

- Verifique se o usuário `nextjs` tem permissões adequadas nos diretórios do container:

```bash
docker exec -it vendamais sh -c "ls -la /app"
```

- Se necessário, ajuste as permissões no Dockerfile:

```dockerfile
RUN chown -R nextjs:nodejs /app
```

### 3. Problemas de conexão com banco de dados

**Problema**: O aplicativo não consegue conectar-se ao banco de dados Postgres.

**Solução**:

- Verifique se a variável de ambiente `DATABASE_URL` está corretamente configurada.
- Verifique se o host do banco de dados está acessível a partir do container Docker.
- Para bancos de dados externos, certifique-se de que as credenciais estão corretas e o IP do servidor está na lista de permissões.

```bash
docker exec -it vendamais sh -c "nc -zv [host] [porta]"
```

### 4. Container encerra inesperadamente

**Problema**: O container Docker encerra logo após ser iniciado.

**Solução**:

- Verifique os logs para entender o problema:

```bash
docker logs vendamais
```

- Verifique se todas as variáveis de ambiente necessárias estão definidas.
- Tente iniciar o container em modo interativo para ver os erros em tempo real:

```bash
docker-compose run --rm vendamais sh
```

### 5. Out of Memory

**Problema**: O Node.js encerra com erro "JavaScript heap out of memory".

**Solução**:

- Aumente o limite de memória para o Node.js no Dockerfile:

```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=8192"
```

- Ou limite os recursos do container no docker-compose.yml:

```yaml
services:
  vendamais:
    # ...
    deploy:
      resources:
        limits:
          memory: 4G
```

## Comandos úteis para diagnóstico

```bash
# Ver logs
docker logs -f vendamais

# Entrar no container
docker exec -it vendamais sh

# Verificar uso de recursos
docker stats vendamais

# Reiniciar o container
docker-compose restart vendamais

# Reconstruir a imagem sem cache
docker-compose build --no-cache vendamais
```

## Otimizações de performance

1. **Utilizar multi-estágio para imagens menores**
2. **Instalar apenas dependências de produção**
3. **Utilizar alpine como imagem base para reduzir o tamanho**
4. **Configurar corretamente o NODE_ENV para produção**
5. **Utilizar volumes para persistir dados como cache entre builds**

## Segurança

1. **Nunca executar como root** - sempre use um usuário não-privilegiado
2. **Não armazenar segredos no Dockerfile ou imagem** - use variáveis de ambiente
3. **Escanear imagens para vulnerabilidades** - use ferramentas como Trivy ou Clair
4. **Manter as imagens base atualizadas** - não use versões obsoletas
5. **Utilizar HEALTHCHECK para monitorar a saúde do container**

## Links úteis

- [Documentação do Docker](https://docs.docker.com/)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Melhores práticas para Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
