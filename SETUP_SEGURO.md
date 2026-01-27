# 🔐 Setup Seguro - Guia Rápido

Este guia te leva do zero a um ambiente seguro em **5 minutos**.

---

## 🚀 Configuração Inicial (Primeira vez)

### 1️⃣ Clone e Configure Ambiente

```bash
# Clone o repositório
git clone https://github.com/marcosbelmiroimob-cell/Alya_CRM_Verdent.git
cd Alya_CRM_Verdent

# Copie os templates de ambiente
cp .env.example .env
cp alya-crm-new/api/.env.example alya-crm-new/api/.env
```

### 2️⃣ Gere Credenciais Seguras

```bash
# Gere JWT_SECRET (backend principal)
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET=\"$JWT_SECRET\"" >> .env

# Gere API_KEY (webhook API)
API_KEY=$(openssl rand -hex 32)
echo "API_KEY=\"$API_KEY\"" >> alya-crm-new/api/.env

echo "✅ Secrets gerados:"
echo "   JWT_SECRET: $JWT_SECRET"
echo "   API_KEY: $API_KEY"
echo ""
echo "⚠️  SALVE essas credenciais em local seguro (1Password, Bitwarden, etc)"
```

### 3️⃣ Configure Banco de Dados

```bash
# Edite .env e configure DATABASE_URL
nano .env

# Formato:
# DATABASE_URL="mysql://usuario:senha@host:porta/database"

# Exemplo desenvolvimento:
# DATABASE_URL="mysql://root:password@localhost:3306/alyacrm"

# Exemplo produção:
# DATABASE_URL="mysql://myapp_user:SUA_SENHA@76.13.81.66:3306/myapp"
```

### 4️⃣ Configure API Keys de IA

#### Google Gemini (Primário - Gratuito)

```bash
# 1. Acesse: https://makersuite.google.com/app/apikey
# 2. Clique em "Create API Key"
# 3. Copie a key (formato: AIza...)
# 4. Cole no .env:

nano .env
# Adicione: GEMINI_API_KEY="AIza_SUA_KEY_AQUI"
```

#### OpenAI (Fallback - Opcional)

```bash
# 1. Acesse: https://platform.openai.com/api-keys
# 2. Crie nova key: "alya-crm-dev-2026-01"
# 3. Copie a key (formato: sk-proj-...)
# 4. Cole no .env:

nano .env
# Adicione: OPENAI_API_KEY="sk-proj-SUA_KEY_AQUI"
# Adicione: OPENAI_MONTHLY_LIMIT_USD="5.00"
```

### 5️⃣ Configure Supabase (Webhook API)

```bash
# 1. Acesse seu projeto: https://app.supabase.com
# 2. Settings > API
# 3. Copie:
#    - URL: https://SEU_PROJETO.supabase.co
#    - service_role key (não a anon key!)
# 4. Cole no arquivo:

nano alya-crm-new/api/.env
# SUPABASE_URL="https://SEU_PROJETO.supabase.co"
# SUPABASE_SERVICE_ROLE_KEY="eyJhbGc...SUA_KEY"
```

### 6️⃣ Instale Dependências

```bash
# Backend
npm install

# Frontend (alya-crm-new)
cd alya-crm-new
npm install
cd ..

# API Webhooks
cd alya-crm-new/api
npm install
cd ../..
```

### 7️⃣ Configure Banco de Dados

```bash
# Execute migrations Prisma
npx prisma migrate dev

# (Opcional) Seed inicial
npx prisma db seed
```

### 8️⃣ Inicie o Desenvolvimento

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd alya-crm-new
npm run dev

# Terminal 3: API Webhooks (se usar n8n)
cd alya-crm-new/api
npm run dev
```

### 9️⃣ Teste Funcionamento

```bash
# Teste health check
curl http://localhost:3001/api/health

# Teste registro de usuário
curl -X POST http://localhost:3001/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste",
    "email": "teste@example.com",
    "senha": "Senha123!"
  }'

# Se retornar token JWT, está funcionando! ✅
```

---

## 🔄 Setup em Nova Máquina (Já tem credenciais)

Se você já tem as credenciais salvas:

```bash
# Clone
git clone https://github.com/marcosbelmiroimob-cell/Alya_CRM_Verdent.git
cd Alya_CRM_Verdent

# Copie seus arquivos .env salvos (de 1Password, backup, etc)
# OU copie os templates e preencha manualmente:
cp .env.example .env
cp alya-crm-new/api/.env.example alya-crm-new/api/.env
nano .env  # Cole suas credenciais
nano alya-crm-new/api/.env  # Cole suas credenciais

# Instale
npm install
cd alya-crm-new && npm install && cd ..
cd alya-crm-new/api && npm install && cd ../..

# Migrations
npx prisma generate
npx prisma migrate deploy

# Inicie
npm run dev
```

---

## 🏭 Deploy em Produção

### Pré-requisitos

- [ ] VPS configurado (Ubuntu 20.04+, Node.js 20+)
- [ ] MariaDB/MySQL instalado
- [ ] Domínio configurado (alyacrm.com.br)
- [ ] SSL/HTTPS ativo (Let's Encrypt)

### Deploy VPS Hostinger

```bash
# SSH no servidor
ssh root@76.13.81.66

# Clone na pasta correta
cd /var/www
git clone https://github.com/marcosbelmiroimob-cell/Alya_CRM_Verdent.git alyacrm
cd alyacrm

# Configure .env de PRODUÇÃO (NUNCA use credenciais de dev!)
cp .env.example .env
nano .env

# IMPORTANTE: Configure NODE_ENV="production"
# IMPORTANTE: Configure FRONTEND_URL="https://alyacrm.com.br"

# Instale
npm ci --production
cd alya-crm-new && npm ci --production && cd ..

# Build
npm run build
cd alya-crm-new && npm run build && cd ..

# Copie frontend buildado
cp -r alya-crm-new/dist/* public/

# Migrations
npx prisma migrate deploy

# PM2
pm2 start dist/index.js --name alyacrm
pm2 save
pm2 startup

# Verifique
pm2 logs alyacrm --lines 50
curl http://localhost:3001/api/health
```

### Deploy com Docker (Alternativo)

```bash
# Na raiz do projeto
cd alya-crm-new

# Configure variáveis de ambiente no docker-compose.yml
nano docker-compose.yml

# Build e inicie
docker-compose up -d

# Logs
docker-compose logs -f

# Verifique
curl http://localhost:3001/api/health
```

---

## ❓ Troubleshooting

### Erro: "JWT_SECRET não configurado"

```bash
# Gere novo secret
openssl rand -hex 32

# Adicione ao .env
echo 'JWT_SECRET="<secret-gerado>"' >> .env
```

### Erro: "Cannot connect to database"

```bash
# Teste conexão manual
mysql -h HOST -u USUARIO -p DATABASE

# Verifique formato DATABASE_URL no .env:
# mysql://usuario:senha@host:porta/database
#
# Certifique que:
# - Host está acessível (ping, telnet)
# - Porta 3306 aberta no firewall
# - Usuário tem permissões corretas
# - Database existe
```

### Erro: "GEMINI_API_KEY invalid"

```bash
# Verifique se a key está ativa:
# https://makersuite.google.com/app/apikey

# Se necessário, gere nova key

# Teste manualmente:
curl https://generativelanguage.googleapis.com/v1/models?key=SUA_KEY
```

### Erro: "CORS blocked"

```bash
# Verifique FRONTEND_URL no .env
# Em desenvolvimento:
FRONTEND_URL="http://localhost:5173"

# Em produção:
FRONTEND_URL="https://alyacrm.com.br"

# Múltiplas origens (separar por vírgula, sem espaços):
FRONTEND_URL="https://alyacrm.com.br,https://www.alyacrm.com.br"
```

---

## 📚 Próximos Passos

Após configuração inicial:

1. ✅ Leia o guia completo: [SECURITY.md](SECURITY.md)
2. ✅ Configure rotação de secrets (a cada 90 dias): `./scripts/rotate-secrets.sh`
3. ✅ Configure monitoramento (UptimeRobot, logs)
4. ✅ Configure backups automáticos do banco
5. ✅ Ative 2FA em todas contas de serviço (Google, OpenAI, GitHub)

---

## 🆘 Suporte

**Problemas?**
- Documentação: [README.md](README.md)
- Segurança: [SECURITY.md](SECURITY.md)
- Issues: https://github.com/marcosbelmiroimob-cell/Alya_CRM_Verdent/issues

**Contato**:
- Email: marcosbelmiro.imob@gmail.com
- GitHub: @marcosbelmiroimob-cell

---

**Última atualização**: 2026-01-27
