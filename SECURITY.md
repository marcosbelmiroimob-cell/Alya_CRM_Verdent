# 🔐 Guia de Segurança - CRM Alya Verdent

## Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Rotação de Credenciais](#rotação-de-credenciais)
3. [Boas Práticas](#boas-práticas)
4. [Checklist de Deploy](#checklist-de-deploy)
5. [Auditoria de Segurança](#auditoria-de-segurança)
6. [Resposta a Incidentes](#resposta-a-incidentes)

---

## 📋 Configuração Inicial

### 1. Arquivo `.env` (Backend Principal)

```bash
# Copie o template
cp .env.example .env

# Edite com suas credenciais
nano .env
```

**Variáveis Obrigatórias**:

| Variável | Onde Obter | Rotação |
|----------|-----------|---------|
| `DATABASE_URL` | Admin do banco MariaDB | Anual |
| `JWT_SECRET` | Gerar: `openssl rand -hex 32` | Semestral |
| `GEMINI_API_KEY` | https://makersuite.google.com/app/apikey | Trimestral |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | Trimestral |

### 2. Arquivo `.env` (API Webhooks)

```bash
# Entre no diretório da API
cd alya-crm-new/api

# Copie o template
cp .env.example .env

# Edite com suas credenciais
nano .env
```

**Variáveis Obrigatórias**:

| Variável | Onde Obter | Rotação |
|----------|-----------|---------|
| `SUPABASE_URL` | Painel Supabase > Settings > API | Nunca (URL público) |
| `SUPABASE_SERVICE_ROLE_KEY` | Painel Supabase > Settings > API | Trimestral |
| `API_KEY` | Gerar: `openssl rand -hex 32` | Trimestral |

---

## 🔄 Rotação de Credenciais

### Por que rotacionar?

- **Prevenção**: Limita janela de exposição em caso de vazamento
- **Conformidade**: LGPD recomenda rotação periódica
- **Auditoria**: Facilita rastreamento de acessos

### Quando rotacionar?

| Cenário | Ação |
|---------|------|
| ✅ **Rotação Agendada** | A cada 90 dias (API keys), 180 dias (JWT) |
| 🚨 **Vazamento Confirmado** | IMEDIATAMENTE |
| ⚠️ **Funcionário Saiu** | Em até 24h |
| 📊 **Uso Suspeito** | Investigar + rotacionar se confirmado |

### Como rotacionar cada credencial:

#### 1. JWT_SECRET (Semestral)

```bash
# Gere nova secret
NEW_JWT_SECRET=$(openssl rand -hex 32)

# Backup da antiga (IMPORTANTE para tokens ativos)
OLD_JWT_SECRET=$(grep JWT_SECRET .env | cut -d '=' -f2)

# Atualize .env
sed -i "s/JWT_SECRET=.*/JWT_SECRET=\"$NEW_JWT_SECRET\"/" .env

# Reinicie o servidor
pm2 restart alyacrm

# ATENÇÃO: Tokens antigos serão invalidados
# Usuários precisarão fazer login novamente
```

**Plano de Migração Suave (opcional)**:
```typescript
// Em src/index.ts, suportar 2 secrets temporariamente:
fastify.register(jwt, {
  secret: [process.env.JWT_SECRET, process.env.OLD_JWT_SECRET].filter(Boolean)
})

// Após 7 dias (tempo de expiração do token), remova OLD_JWT_SECRET
```

#### 2. GEMINI_API_KEY (Trimestral)

```bash
# 1. Acesse: https://makersuite.google.com/app/apikey
# 2. Clique em "Create API Key"
# 3. Copie a nova key
# 4. Atualize .env:
nano .env
# Substitua GEMINI_API_KEY="nova-key"

# 5. Reinicie
pm2 restart alyacrm

# 6. Teste
curl http://localhost:3001/api/health

# 7. DEPOIS de confirmar funcionamento, delete a key antiga no painel Google
```

#### 3. OPENAI_API_KEY (Trimestral)

```bash
# 1. Acesse: https://platform.openai.com/api-keys
# 2. Clique em "Create new secret key"
# 3. Nomeie: "alya-crm-prod-2026-04" (data para rastrear)
# 4. Copie a key (só aparece uma vez!)
# 5. Atualize .env:
nano .env
# Substitua OPENAI_API_KEY="sk-proj-nova-key"

# 6. Reinicie
pm2 restart alyacrm

# 7. Teste chamada de IA
curl -X POST http://localhost:3001/api/ia/qualificar -H "Content-Type: application/json" -d '{"lead":"teste"}'

# 8. Delete a key antiga no painel OpenAI
```

#### 4. SUPABASE_SERVICE_ROLE_KEY (Trimestral)

⚠️ **CUIDADO**: Esta key não pode ser rotacionada diretamente no Supabase.

**Opções**:
1. **RLS Policies**: Use Row Level Security com policies específicas (recomendado)
2. **Novo Projeto**: Migre para novo projeto Supabase (complexo)
3. **Auditoria**: Ative logs de acesso para monitorar uso

**Configuração RLS**:
```sql
-- No Supabase SQL Editor:
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "API key can insert leads"
ON leads FOR INSERT
TO service_role
USING (true);
```

#### 5. API_KEY (Webhook n8n) (Trimestral)

```bash
# Gere nova key
NEW_API_KEY=$(openssl rand -hex 32)

# Atualize .env da API
cd alya-crm-new/api
sed -i "s/API_KEY=.*/API_KEY=\"$NEW_API_KEY\"/" .env

# Reinicie container
docker-compose restart api

# IMPORTANTE: Atualize n8n ANTES de testar
# No n8n: HTTP Request Node > Headers > X-API-Key: [nova key]

# Teste webhook
curl -X POST http://localhost:3001/api/v1/leads/webhook \
  -H "X-API-Key: $NEW_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","source":"manual"}'
```

---

## ✅ Boas Práticas

### ❌ Nunca Faça

- Commitar arquivo `.env` no Git
- Compartilhar keys em Slack/WhatsApp/Email
- Usar mesma `JWT_SECRET` em dev e produção
- Hardcodear credenciais no código
- Reutilizar passwords entre serviços
- Logar credenciais completas (mascare: `AIza****nQn8`)

### ✅ Sempre Faça

- Use `.env.example` como template (sem valores reais)
- Ative autenticação de 2 fatores (Google, OpenAI, GitHub)
- Monitore uso das API keys (Google Console, OpenAI Dashboard)
- Configure alertas de custo (OpenAI: $4.50 de $5.00)
- Audite logs de acesso regularmente
- Documente data da última rotação

### 🔒 Proteção do `.env`

```bash
# Permissões restritivas (somente dono pode ler/escrever)
chmod 600 .env
chmod 600 alya-crm-new/api/.env

# Verifique que está no .gitignore
grep -q "^.env$" .gitignore || echo ".env" >> .gitignore
git status  # .env NÃO deve aparecer em "Changes"
```

---

## 🚀 Checklist de Deploy em Produção

### Antes do Deploy

- [ ] Copie `.env.example` para `.env`
- [ ] Gere novas credenciais (não reutilize de dev)
- [ ] Configure `NODE_ENV="production"`
- [ ] Configure `FRONTEND_URL="https://alyacrm.com.br"` (sem trailing slash)
- [ ] Use `DATABASE_URL` com IP/domínio de produção
- [ ] Verifique que JWT_SECRET tem 64+ caracteres
- [ ] Configure OPENAI_MONTHLY_LIMIT_USD apropriado
- [ ] Teste conexão com banco: `npm run prisma:studio`
- [ ] Execute migrations: `npm run prisma:migrate`

### Durante o Deploy

- [ ] Use variáveis de ambiente do sistema (não .env em produção ideal)
- [ ] Configure secrets no Docker: `docker secret create jwt_secret -`
- [ ] Ative HTTPS (certbot/Let's Encrypt)
- [ ] Configure firewall (apenas portas 80, 443, 22)
- [ ] Desative listagem de diretórios no Nginx

### Após o Deploy

- [ ] Teste login: `curl -X POST https://alyacrm.com.br/api/auth/login -d '...'`
- [ ] Verifique logs: `pm2 logs alyacrm --lines 50`
- [ ] Confirme CORS funcionando: teste de diferentes origens
- [ ] Configure monitoramento (UptimeRobot, Pingdom)
- [ ] Configure backups automáticos do banco
- [ ] Documente credenciais em gerenciador seguro (1Password, Bitwarden)

---

## 🔍 Auditoria de Segurança

### Mensal

```bash
# 1. Verifique exposição de .env
find . -name ".env" -type f ! -path "*/node_modules/*"
# Resultado esperado: ./.env, ./alya-crm-new/api/.env

# 2. Confirme que .env está no .gitignore
git check-ignore .env
# Resultado esperado: .env

# 3. Verifique uso de API OpenAI
# Acesse: https://platform.openai.com/usage
# Compare com OPENAI_MONTHLY_LIMIT_USD

# 4. Verifique logs de erro
pm2 logs alyacrm --err --lines 100 | grep -i "unauthorized\|forbidden\|invalid"
```

### Trimestral (Rotação de Keys)

```bash
# Execute o script de rotação
./scripts/rotate-secrets.sh
```

### Anual

- [ ] Revisão completa do código (security code review)
- [ ] Teste de penetração (pentest) básico
- [ ] Auditoria de dependências: `npm audit`
- [ ] Atualização de stack (Node.js, frameworks)
- [ ] Revisão de permissões de banco de dados

---

## 🚨 Resposta a Incidentes

### Se uma Key Vazar

#### Passo 1: CONTENÇÃO IMEDIATA (primeiros 5 minutos)

```bash
# 1. REVOGUE a key vazada IMEDIATAMENTE
# - Gemini: https://makersuite.google.com/app/apikey > Delete
# - OpenAI: https://platform.openai.com/api-keys > Revoke
# - GitHub: https://github.com/settings/tokens > Delete

# 2. PARE o servidor
pm2 stop alyacrm

# 3. GERE nova key
openssl rand -hex 32

# 4. ATUALIZE .env
nano .env

# 5. REINICIE servidor
pm2 start alyacrm
pm2 logs alyacrm --lines 20
```

#### Passo 2: INVESTIGAÇÃO (primeiros 30 minutos)

```bash
# 1. Identifique escopo do vazamento
# - Onde vazou? (GitHub, Slack, logs públicos)
# - Quando? (minutos, horas, dias)
# - Quem teve acesso?

# 2. Verifique uso não autorizado
# - OpenAI: https://platform.openai.com/usage (últimas 24h)
# - Gemini: https://console.cloud.google.com/apis/dashboard
# - Database: SELECT * FROM usuarios ORDER BY criado_em DESC LIMIT 50;

# 3. Colete evidências
pm2 logs alyacrm --lines 1000 > incident-log-$(date +%Y%m%d-%H%M%S).txt
```

#### Passo 3: RECUPERAÇÃO (próximas 24 horas)

1. **Rotacione TODAS as credenciais** (não só a vazada)
2. **Force logout de todos usuários** (invalidar tokens JWT)
3. **Notifique stakeholders** (se dados de usuários expostos)
4. **Implemente prevenção**:
   - Adicione pre-commit hook para detectar secrets
   - Configure alertas de custo anormais (OpenAI)
   - Ative 2FA em todas contas de serviço

#### Passo 4: PÓS-MORTEM (próxima semana)

Documente:
- **O que aconteceu?** Cronologia detalhada
- **Por que aconteceu?** Causa raiz
- **Impacto real?** Custos, dados expostos
- **Como prevenir?** Ações implementadas

---

## 🛠️ Ferramentas Recomendadas

### Gerenciadores de Secrets

- **Desenvolvimento**: [Doppler](https://doppler.com) (gratuito até 5 usuários)
- **Produção**: [Vault by HashiCorp](https://www.vaultproject.io)
- **Simples**: [1Password CLI](https://developer.1password.com/docs/cli)

### Detecção de Secrets

```bash
# Instale gitleaks (detector de secrets)
# macOS
brew install gitleaks

# Linux
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz
tar -xzf gitleaks_8.18.1_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/

# Escaneie repositório
gitleaks detect --source . --verbose

# Configure pre-commit hook
echo "gitleaks protect --staged" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Monitoramento

- **Uptime**: [UptimeRobot](https://uptimerobot.com) (gratuito até 50 monitores)
- **Logs**: [Papertrail](https://papertrailapp.com) (gratuito até 50MB/mês)
- **Custo OpenAI**: Dashboard nativo + alertas por email

---

## 📞 Contatos de Emergência

| Serviço | Suporte | Link |
|---------|---------|------|
| OpenAI | help@openai.com | https://help.openai.com |
| Google Cloud | Console > Suporte | https://console.cloud.google.com/support |
| Supabase | Painel > Support | https://supabase.com/support |
| Hostinger | Painel > Chat | https://hpanel.hostinger.com |

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [Secrets Management Best Practices](https://www.doppler.com/blog/secrets-management-best-practices)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Última atualização**: 2026-01-27
**Próxima revisão agendada**: 2026-04-27
**Responsável**: Marcos Belmiro
