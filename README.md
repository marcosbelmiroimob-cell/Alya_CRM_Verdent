# CRM Alya - Sistema de Vendas Imobiliárias com IA

Sistema completo de CRM para corretores de imóveis com agentes de IA integrados para maximizar resultados de vendas.

## Funcionalidades

- **Kanban de Vendas**: Gestão visual do funil de vendas com drag-and-drop
- **Alya Coach**: Agente de IA especialista em vendas imobiliárias
- **Gerador de Mensagens**: Cria mensagens personalizadas para WhatsApp
- **Qualificador de Leads**: Análise automática de leads com score
- **Módulo Financeiro**: Controle de receitas, despesas e comissões
- **Dashboard**: Métricas e analytics de performance

## Stack Tecnológica

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Recharts (gráficos)
- @dnd-kit (drag-and-drop)

### Backend
- Node.js + Fastify
- TypeScript
- Prisma ORM
- MySQL
- JWT Authentication

### IA (Sistema Híbrido)
- **Primário**: Google Gemini 2.0 Flash (gratuito)
- **Fallback**: OpenAI GPT-4 Turbo (limite $5/mês)

## Instalação

### Pré-requisitos
- Node.js 18+
- MySQL 8+
- Chave API do Google Gemini (gratuita)
- Chave API da OpenAI (opcional)

### 1. Clone o repositório
```bash
git clone https://github.com/marcosbelmiroimob-cell/Alya_CRM_Verdent.git
cd Alya_CRM_Verdent
```

### 2. Instale as dependências
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure as variáveis de ambiente

Copie `server/env.example` para `server/.env` e preencha:

```env
DATABASE_URL="mysql://usuario:senha@host:3306/banco"
JWT_SECRET="sua-chave-secreta"
GEMINI_API_KEY="sua-chave-gemini"
OPENAI_API_KEY="sua-chave-openai"
OPENAI_MONTHLY_LIMIT_USD="5.00"
```

### 4. Configure o banco de dados
```bash
cd server
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. Execute o projeto
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Acesse: http://localhost:5173

## Usuário Padrão (Owner)

- **Email**: marcosbelmiro.imob@gmail.com
- **Senha**: M@rcos123@
- **Plano**: PREMIUM

## Sistema de IA

O CRM usa um sistema híbrido de IA que prioriza economia:

1. **Gemini (Primário)**: Todas as requisições vão primeiro para o Gemini 2.0 Flash (gratuito)
2. **OpenAI (Fallback)**: Se o Gemini falhar, usa GPT-4 Turbo com limite de $5/mês

### Mapeamento de Modelos

| Função | Modelo Primário | Fallback |
|--------|-----------------|----------|
| Alya Coach | gemini-2.0-flash-exp | gpt-4-turbo |
| Gerador Mensagens | gemini-2.0-flash-exp | gpt-3.5-turbo |
| Qualificador Leads | gemini-2.0-flash-exp | gpt-4-turbo |

## Deploy na Hostinger

1. Crie um banco MySQL no painel Hostinger
2. Configure o domínio (ex: alyacrm.com.br)
3. Vincule o repositório GitHub
4. Configure as variáveis de ambiente no painel
5. Execute os comandos de setup do banco

## Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Chamadas de API
│   │   ├── stores/        # Zustand stores
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/        # Rotas da API
│   │   ├── services/ai/   # Serviços de IA
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilitários
│   ├── prisma/
│   │   ├── schema.prisma  # Schema do banco
│   │   └── seed.ts        # Seed inicial
│   └── package.json
│
└── README.md
```

## Licença

Proprietary - Todos os direitos reservados.
