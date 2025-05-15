# Use Node.js 20 como base
FROM node:20-alpine

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos
COPY . .

# Instala dependências
RUN yarn install

# Compila o projeto Next.js
RUN yarn build

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Inicia o servidor Next.js
CMD ["yarn", "start"]
