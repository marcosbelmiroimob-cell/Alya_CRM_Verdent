# 🔄 Guia de Migração: Supabase → MySQL

Este guia detalha o processo completo de migração do Supabase para MySQL local.

---

## 📋 Visão Geral

### Situação Atual
- **Backend**: Usa Prisma + MySQL (MariaDB no VPS)
- **Frontend**: Usa Supabase client diretamente (auth + queries)
- **API Webhooks**: Usa Supabase para inserir leads via n8n

### Situação Desejada
- **Backend**: Prisma + MySQL em Docker
- **Frontend**: Usa API backend (sem Supabase)
- **Webhooks**: Removido (não está em uso)

### Benefícios da Migração
✅ Um único banco de dados (MySQL)
✅ Menos complexidade arquitetural
✅ Sem dependência de serviço externo pago
✅ Controle total dos dados
✅ Backup/restore simplificado

---

## 🚀 Passo a Passo de Migração

### FASE 1: Backup e Preparação (15 minutos)

#### 1.1 Backup do Supabase

```bash
# Via Painel Supabase
# 1. Acesse: https://app.supabase.com/project/_/settings/general
# 2. Clique em "Database" > "Backups"
# 3. Baixe último backup (.sql)

# Salve também via script:
cd scripts
node migrate-supabase-to-mysql.js --dry-run  # Preview dos dados
```

#### 1.2 Backup do MySQL/MariaDB Produção

```bash
# SSH no VPS
ssh root@76.13.81.66

# Backup completo
docker exec mariadb-gwz7-mariadb-1 mysqldump \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp \
  > backup-pre-migration-$(date +%Y%m%d).sql

# Download para local
scp root@76.13.81.66:~/backup-pre-migration-*.sql ./backups/
```

---

### FASE 2: Configurar Docker Local (10 minutos)

#### 2.1 Configurar Variáveis de Ambiente

```bash
cd alya-crm-new

# Copiar template
cp .env.docker .env

# Editar
nano .env
```

**Configuração Mínima**:

```env
# MySQL
MYSQL_ROOT_PASSWORD=root_secure_2026
MYSQL_DATABASE=alyacrm
MYSQL_USER=alyacrm_user
MYSQL_PASSWORD=alyacrm_secure_2026

# JWT (gere novo)
JWT_SECRET=COLE_64_CHARS_AQUI

# IA (copie do .env da raiz)
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-proj...

# Config
NODE_ENV=development
FRONTEND_URL=http://localhost:80
```

#### 2.2 Iniciar Stack Docker

```bash
# Build e start
docker-compose -f docker-compose.full.yml up -d

# Aguardar inicialização (~2 min)
docker-compose -f docker-compose.full.yml logs -f

# Verificar status
docker-compose -f docker-compose.full.yml ps

# Resultado esperado:
# alya-crm-mysql     Up (healthy)
# alya-crm-backend   Up (healthy)
# alya-crm-frontend  Up (healthy)
```

#### 2.3 Testar Conexão

```bash
# Health check backend
curl http://localhost:3001/api/health
# Esperado: {"status":"ok","timestamp":"..."}

# Frontend
curl http://localhost
# Esperado: HTML da aplicação
```

---

### FASE 3: Migração de Dados (20 minutos)

#### 3.1 Instalar Dependência Temporária

```bash
# Na raiz do projeto
npm install @supabase/supabase-js@^2.91.1 --save-dev
```

#### 3.2 Executar Migração

```bash
# Configurar variáveis
export VITE_SUPABASE_URL="https://fwuoqtqfchnbstxjjnvn.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGc...SUA_KEY"
export DATABASE_URL="mysql://alyacrm_user:alyacrm_secure_2026@localhost:3306/alyacrm"

# Executar migração
npm run db:migrate:supabase

# Ou diretamente:
node scripts/migrate-supabase-to-mysql.js
```

**Output Esperado**:

```
═══════════════════════════════════════════════════════════════
  MIGRAÇÃO: Supabase → MySQL
═══════════════════════════════════════════════════════════════

📦 Migrando tabela: Usuarios
   Encontrados 3 registros
   ✅ 3 registros migrados

📦 Migrando tabela: Leads
   Encontrados 15 registros
   ✅ 15 registros migrados

📦 Migrando tabela: Negociacoes
   Encontrados 8 registros
   ✅ 8 registros migrados

═══════════════════════════════════════════════════════════════
  ✅ MIGRAÇÃO CONCLUÍDA
═══════════════════════════════════════════════════════════════

📊 Estatísticas:
   - usuarios: 3 registros
   - leads: 15 registros
   - negociacoes: 8 registros

   TOTAL: 26 registros migrados
```

#### 3.3 Verificar Dados Migrados

```bash
# Via Prisma Studio
npx prisma studio
# Acesse: http://localhost:5555

# Ou via CLI:
docker exec -it alya-crm-mysql mysql -u alyacrm_user -p alyacrm

# Comandos SQL:
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM leads;
SELECT COUNT(*) FROM negociacoes;
SELECT * FROM usuarios LIMIT 5;
```

---

### FASE 4: Atualizar Frontend (30 minutos)

#### 4.1 Identificar Dependências Supabase

```bash
# Buscar imports
cd alya-crm-new
grep -r "@supabase/supabase-js" src/

# Arquivos afetados:
# - src/contexts/AuthContext.tsx (auth)
# - src/hooks/useDashboard.ts (queries)
# - src/hooks/useImoveis.ts (queries + storage)
# - src/lib/supabase.ts (client)
```

#### 4.2 Criar Cliente API (Substituir Supabase)

**OPÇÃO A: Usar Backend Existente**

O backend já tem todas as rotas necessárias:
- `/api/auth/registro`
- `/api/auth/login`
- `/api/leads`
- `/api/negociacoes`
- `/api/dashboard`
- etc.

**OPÇÃO B: Aguardar Deploy e Testar Gradualmente**

Recomendado: Migrar frontend **DEPOIS** que o backend Docker estiver estável.

#### 4.3 Remover Supabase do Frontend (Quando Pronto)

```bash
# 1. Remover dependência
cd alya-crm-new
npm uninstall @supabase/supabase-js

# 2. Deletar cliente
rm src/lib/supabase.ts

# 3. Atualizar AuthContext para usar backend API
# (Código de exemplo fornecido separadamente)

# 4. Atualizar hooks para usar backend API
# - useDashboard: fetch /api/dashboard
# - useImoveis: fetch /api/imoveis
# etc.

# 5. Remover variáveis de ambiente
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

---

### FASE 5: Deploy em Produção (45 minutos)

#### 5.1 Preparar VPS

```bash
# SSH no servidor
ssh root@76.13.81.66

# Atualizar código
cd /var/www/alyacrm
git pull origin master

# Parar PM2 temporariamente
pm2 stop alyacrm
```

#### 5.2 Migrar Dados Produção

```bash
# Backup atual
docker exec mariadb-gwz7-mariadb-1 mysqldump \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp \
  > backup-before-docker-$(date +%Y%m%d).sql

# OPÇÃO A: Manter MariaDB Atual
# Apenas atualize backend e frontend
npm install
npm run build
pm2 restart alyacrm

# OPÇÃO B: Migrar para Docker MySQL
# (Requer mais planejamento - ver seção abaixo)
```

#### 5.3 Testar Produção

```bash
# Health check
curl http://localhost:3001/api/health

# Teste login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marcosbelmiro.imob@gmail.com",
    "password": "M@rcos123@"
  }'

# Se retornar token → Sucesso!
```

---

## 🐳 Migração para Docker em Produção (Opcional)

### Quando Migrar?

✅ **Migre para Docker SE**:
- Quer isolamento completo
- Planeja escalar horizontalmente
- Quer facilitar deploy/rollback

❌ **Mantenha PM2 + MariaDB SE**:
- Sistema está estável
- Não tem experiência com Docker em produção
- VPS tem recursos limitados (<2GB RAM)

### Como Migrar (Se Decidir)

```bash
# 1. Parar PM2 e MariaDB atuais
pm2 stop alyacrm
docker stop mariadb-gwz7-mariadb-1

# 2. Configurar .env para produção
cd /var/www/alyacrm/alya-crm-new
cp .env.docker .env
nano .env  # Configure com valores de produção

# 3. Iniciar Docker Compose
docker-compose -f docker-compose.full.yml up -d

# 4. Migrar dados
docker exec -i alya-crm-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} alyacrm < /caminho/backup.sql

# 5. Configurar Nginx para proxy
# Atualizar /etc/nginx/sites-available/alyacrm.conf
# proxy_pass http://localhost:80;  # Docker frontend
```

---

## 📊 Checklist de Migração

### Pré-Migração
- [ ] Backup Supabase baixado
- [ ] Backup MySQL/MariaDB local
- [ ] Docker instalado e funcionando
- [ ] Variáveis .env configuradas
- [ ] Credenciais de IA atualizadas

### Durante Migração
- [ ] Docker MySQL iniciado
- [ ] Backend conectou no MySQL
- [ ] Migrations Prisma aplicadas
- [ ] Dados migrados do Supabase
- [ ] Contagens de registros batem
- [ ] Teste login funcionando

### Pós-Migração
- [ ] Frontend atualizado (sem Supabase)
- [ ] Testes E2E passando
- [ ] Deploy em produção bem-sucedido
- [ ] Monitoramento configurado
- [ ] Backups automatizados ativos
- [ ] Documentação atualizada

---

## 🔧 Troubleshooting

### Erro: "Cannot connect to MySQL"

```bash
# Verificar se MySQL está rodando
docker ps | grep mysql

# Ver logs
docker logs alya-crm-mysql

# Testar conexão direta
docker exec -it alya-crm-mysql mysql -u root -p
```

### Erro: "Prisma migration failed"

```bash
# Resetar migrations (⚠️ perde dados!)
docker exec alya-crm-backend npx prisma migrate reset

# Ou aplicar manualmente
docker exec alya-crm-backend npx prisma migrate deploy
```

### Erro: "Duplicate entry" durante migração

```bash
# Limpar tabela específica antes de migrar
docker exec -it alya-crm-mysql mysql -u root -p alyacrm -e "TRUNCATE TABLE leads;"

# Re-executar migração
npm run db:migrate:supabase
```

### Dados não aparecem no frontend

```bash
# 1. Verificar backend logs
docker logs alya-crm-backend

# 2. Testar API diretamente
curl http://localhost:3001/api/leads \
  -H "Authorization: Bearer SEU_TOKEN"

# 3. Verificar CORS
# Deve permitir http://localhost:80 (frontend Docker)
```

---

## 📚 Recursos Adicionais

- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Guia completo Docker
- [SECURITY.md](SECURITY.md) - Segurança e rotação de keys
- [SETUP_SEGURO.md](SETUP_SEGURO.md) - Setup inicial

---

## 🆘 Rollback (Se Necessário)

Se algo der errado, você pode voltar para Supabase:

```bash
# 1. Parar Docker
docker-compose -f docker-compose.full.yml down

# 2. Restaurar backup Supabase (via painel)
# Dashboard > Database > Backups > Restore

# 3. Restaurar frontend (reverter commit)
git revert HEAD
npm install
npm run build

# 4. Iniciar PM2 novamente
pm2 restart alyacrm
```

---

**Tempo Total Estimado**: 2-3 horas
**Última atualização**: 2026-01-27
