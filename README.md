# VendaMais

Sistema de gestão de vendas e catálogo digital para pequenos e médios negócios.

## Visão Geral

O VendaMais é uma plataforma web para gerenciar vendas, produtos, clientes e facilitar a criação de catálogos digitais com QR Codes para compartilhamento fácil.

## Tecnologias

- **Frontend**: Next.js, React, Bootstrap
- **Backend**: Node.js com API Routes do Next.js
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: Better Auth
- **Armazenamento de Imagens**: Cloudinary
- **Outros**: TypeScript, Zod (validação)

## Pré-requisitos

- Node.js (v18+)
- PostgreSQL
- Yarn ou npm

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/vendamais.git
   cd vendamais
   ```

2. Instale as dependências:

   ```bash
   npm install
   # ou
   yarn
   ```

3. Configure as variáveis de ambiente:

   ```bash
   cp .env.example .env.development
   # Edite o arquivo .env.development com suas configurações
   ```

4. Execute as migrações do Prisma:

   ```bash
   npx prisma migrate dev
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

## Ambiente de Produção

1. Configure as variáveis de ambiente para produção:

   ```bash
   cp .env.example .env.production
   # Edite o arquivo .env.production com suas configurações de produção
   ```

2. Gere o build:

   ```bash
   npm run build
   # ou
   yarn build
   ```

3. Inicie o servidor:
   ```bash
   npm run start
   # ou
   yarn start
   ```

## Estrutura do Projeto

- `/src/app`: Componentes e páginas Next.js (App Router)
- `/src/components`: Componentes React reutilizáveis
- `/src/lib`: Bibliotecas e utilidades
- `/prisma`: Schema e migrações do Prisma

## Funcionalidades

- Autenticação (login, cadastro, recuperação de senha)
- Gerenciamento de produtos
- Geração de QR Codes para catálogos
- Dashboard com métricas de vendas
- Gerenciamento de clientes

## Contribuição

1. Faça o fork do projeto
2. Crie sua branch para a nova feature (`git checkout -b feature/amazing-feature`)
3. Faça commit das suas alterações (`git commit -m 'Add some amazing feature'`)
4. Envie para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT.
