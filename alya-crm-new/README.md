# Alya CRM

Sistema de Gestão para Corretores de Imóveis

## 🚀 Stack Tecnológica

- **Frontend**: React 18 + Vite + TypeScript
- **Estilização**: TailwindCSS
- **Backend**: Supabase (BaaS)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Drag & Drop**: @dnd-kit

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de environment (IMPORTANTE!)
# Renomeie env.example para .env

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🔐 Configuração do Supabase

### IMPORTANTE: Execute os SQLs no painel do Supabase

Acesse: https://supabase.com/dashboard/project/fwuoqtqfchnbstxjjnvn/sql/new

### 1. Criar tabelas

Ver scripts SQL completos no arquivo `supabase-setup.sql`

## ✅ Progresso

- [x] **Fase 1:** Setup do Projeto ✨
- [x] **Fase 2:** Autenticação Supabase (Login/Registro/Recuperar Senha) 🔐
- [x] **Fase 3:** Layout Principal (Sidebar + Header) 🎨
- [x] **Fase 4:** Dashboard com Métricas (Cards + Funil) 📊
- [x] **Fase 5:** Pipeline Visual (Kanban com Drag & Drop) 🎯
- [ ] Fase 6: Gestão de Leads
- [ ] Fase 7: Gestão de Imóveis
- [ ] Fase 8: Integração e Testes
- [ ] Fase 9: Deploy na VPS

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação Completa
- Login com email e senha
- Registro de novos usuários
- Login com Google OAuth
- Recuperação de senha
- Proteção de rotas privadas

### ✅ Layout Profissional
- Sidebar com navegação
- Header dinâmico por página
- Design responsivo
- Tema customizado (Purple gradient)

### ✅ Dashboard Inteligente
- 4 cards de métricas principais
- Funil de vendas visual
- Dados em tempo real do Supabase
- Call-to-action para primeiras ações

### ✅ Pipeline Kanban
- 7 etapas do funil de vendas
- Drag & Drop funcional
- Cards com foto do imóvel
- Badges de prioridade
- Atualização automática no Supabase

## 🔗 Links

- Supabase Project: https://fwuoqtqfchnbstxjjnvn.supabase.co

## 🚀 Próximos Passos

1. Implementar CRUD de Leads
2. Implementar CRUD de Imóveis (com upload de fotos)
3. Conectar tudo no Pipeline
4. Deploy na VPS Hostinger


