# Sistema Anti-Cache do VendaMais

Este documento descreve a implementação técnica do sistema anti-cache usado no VendaMais para garantir que os usuários sempre vejam a versão mais recente da aplicação.

## Componentes do Sistema

### 1. Build ID Dinâmico

Cada build da aplicação recebe um identificador único baseado em timestamp:

```typescript
// Gerado durante o build (Dockerfile ou scripts/update-build-id.sh)
NEXT_PUBLIC_BUILD_ID=build-${timestamp}
```

### 2. Middleware Anti-Cache

Adiciona headers HTTP para prevenir cache em todas as páginas:

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");
  return response;
}
```

### 3. API de Versão

Endpoint para verificar a versão atual:

```typescript
// src/app/api/version/route.ts
export async function GET() {
  return NextResponse.json(
    {
      buildId: process.env.NEXT_PUBLIC_BUILD_ID || `build-${Date.now()}`,
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
```

### 4. Detector de Versão (Client-Side)

Componente React que verifica periodicamente se há uma nova versão:

```typescript
// src/components/version-checker.tsx
const BUILD_ID =
  process.env.NEXT_PUBLIC_BUILD_ID || `build-${Date.now()}-${Math.random()}`;

// Verifica a cada 5 minutos se há nova versão
fetch("/api/version?v=" + Date.now())
  .then((response) => response.json())
  .then((data) => {
    if (data?.buildId !== BUILD_ID) {
      // Mostrar notificação para atualizar
    }
  });
```

### 5. Meta Tags Anti-Cache

```html
<!-- src/app/layout.tsx -->
<head>
  <meta
    httpEquiv="Cache-Control"
    content="no-cache, no-store, must-revalidate"
  />
  <meta httpEquiv="Pragma" content="no-cache" />
  <meta httpEquiv="Expires" content="0" />
  <meta name="build-id" content="{process.env.NEXT_PUBLIC_BUILD_ID}" />
</head>
```

## Fluxo de Funcionamento

1. Durante o build, um timestamp único é gerado e salvo como `NEXT_PUBLIC_BUILD_ID`
2. O Next.js usa este ID para gerar nomes de arquivos de assets únicos
3. Meta tags e headers HTTP são configurados para prevenir cache
4. O cliente carrega a página com o ID de build atual
5. Periodicamente, o cliente verifica se há uma nova versão disponível
6. Se uma nova versão for detectada, o usuário é notificado para atualizar

## Scripts Disponíveis

- `npm run update:buildid` - Gera um novo build ID
- `npm run rebuild:full` - Limpa o cache e reconstrói com novo ID
- `npm run cache:clear` - Limpa apenas o cache do Next.js
- `npm run test:layout` - Testa os mecanismos anti-cache

## Testes Automatizados

Os testes verificam se os mecanismos anti-cache estão funcionando corretamente:

```typescript
// src/tests/layout-cache.test.ts
it("deve ter cabeçalhos anti-cache nas respostas", async () => {
  const response = await page.goto("http://localhost:3000");
  const headers = response?.headers();

  if (headers) {
    expect(headers["cache-control"]).toContain("no-store");
    expect(headers["pragma"]).toBe("no-cache");
    expect(headers["expires"]).toBe("0");
  }
});
```
