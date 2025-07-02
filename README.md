# 🍕 Pizza AI Menu Bot – Nodejs

Este é o **backend** de uma aplicação de chatbot em tempo real que simula o atendimento de uma pizzaria. Desenvolvido com **Node.js**, **TypeScript**, **Express**, **Socket.IO**, **Prisma ORM** e **Google Gemini AI**, este servidor gerencia a comunicação em tempo real e armazena o histórico das conversas em um banco de dados MySQL.

---

> 📌 Repositório do frontend: [pizza-ai-menu-bot-reactjs](https://github.com/Paulo-Pacheco-Junior/pizza-ai-menu-bot-reactjs)

---

## ✨ Funcionalidades

- 🔌 Comunicação em tempo real via **WebSocket** com **Socket.IO**
- 🤖 Respostas inteligentes usando **Google Gemini AI**
- 🗃️ Armazenamento de histórico de conversa com **Prisma ORM + MySQL**
- ♻️ API REST para acessar mensagens anteriores
- 🛠️ Código escrito em **TypeScript**
- 🐳 Pronto para rodar com **Docker**

---

## 🚀 Tecnologias Utilizadas

- **Nodejs**
- **TypeScript**
- **Express**
- **Socket.IO**
- **Prisma ORM**
- **MySQL**
- **Google Generative AI SDK**
- **Docker**

---

## 🤖 Sobre o Bot

O bot utiliza a API Gemini AI da Google para interpretar as mensagens do usuário e responder de forma dinâmica, simulando um atendente de pizzaria. Ele é capaz de sugerir sabores, registrar pedidos e manter um histórico da conversa.

---

## 📡 Endpoints da API

```bash
| Método | Rota        | Descrição                               |
| ------ | ----------- | --------------------------------------- |
| GET    | `/messages` | Retorna o histórico de conversas        |
```

---

## 📂 Estrutura do Projeto

```bash
pizza-ai-menu-bot-nodejs/
├── prisma/             # Schema, migrations e seed do Prisma
│   └── migrations/
├── src/
│   ├── config/         # Configurações gerais
│   ├── middlewares/    # Middlewares de tratamento de erros e outros
│   ├── prisma/         # Instância do PrismaClient (client.ts)
│   ├── routes/         # Rotas da API REST
│   ├── services/       # Lógica de negócio e integração com Gemini AI
│   ├── socket/         # Configuração e eventos do Socket.IO
│   ├── app.ts          # Configuração do Express
│   └── server.ts       # Inicialização do servidor HTTP e WebSocket
├── Dockerfile          # Imagem Docker da aplicação
├── docker-compose.yml  # Orquestração com Docker e MySQL
├── tsconfig.json       # Configurações do TypeScript
└── .env                # Variáveis de ambiente
```

---

## 📦 Instalação Manual (sem Docker)

### 1. Clone o repositório

```bash
git clone https://github.com/Paulo-Pacheco-Junior/pizza-ai-menu-bot-nodejs.git
cd pizza-ai-menu-bot-nodejs
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn
```

### 3. Configure as variáveis de ambiente:

Crie um arquivo .env com o seguinte conteúdo:

```env
PORT=3333
DATABASE_URL="mysql://usuario:senha@host:porta/banco"
GEMINI_API_KEY="sua_chave_da_api_google"
```

### 4. Rode as migrations do Prisma:

```bash
npx prisma migrate dev --name init
```

### 5. Inicie o servidor em modo desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

---

## 🐳 Instalação com Docker

### 1. Crie o arquivo .env conforme acima

### 2. Suba a aplicação com Docker Compose:

```bash
docker-compose up --build
```

### 3. O backend estará disponível em `http://localhost:3333`

Obs: O `docker-compose.yml` inclui os serviços de aplicação e banco de dados MySQL já configurados com Prisma.
