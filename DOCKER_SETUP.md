# 🐳 Setup Docker - CRM Alya Verdent

Guia completo para executar o CRM em Docker com MySQL.

---

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 1.29+
- 2GB RAM livre
- 5GB espaço em disco

### Verificar instalação:

```bash
docker --version
docker-compose --version
```

---

## 🚀 Inicialização Rápida (5 minutos)

### 1️⃣ Configurar Variáveis de Ambiente

```bash
# Entre no diretório
cd alya-crm-new

# Copie o template
cp .env.docker .env

# Edite o arquivo
nano .env  # ou code .env no VS Code
```

**Variáveis OBRIGATÓRIAS**:

```env
# JWT_SECRET: Gere com comando abaixo
JWT_SECRET="COLE_AQUI_64_CARACTERES"

# GEMINI_API_KEY: Obtenha em https://makersuite.google.com/app/apikey
GEMINI_API_KEY="AIza_SUA_KEY"

# (Opcional) OpenAI
OPENAI_API_KEY="sk-proj-SUA_KEY"
```

**Gerar JWT_SECRET**:

```bash
# No terminal:
openssl rand -hex 32

# Ou com Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou com Python:
python3 -c "import os; print(os.urandom(32).hex())"
```

### 2️⃣ Iniciar Stack Completo

```bash
# Build e iniciar containers
docker-compose -f docker-compose.full.yml up -d

# Ver logs em tempo real
docker-compose -f docker-compose.full.yml logs -f

# Aguarde ~2-3 minutos para build inicial
```

### 3️⃣ Verificar Status

```bash
# Ver containers rodando
docker-compose -f docker-compose.full.yml ps

# Resultado esperado:
# NAME                  STATUS
# alya-crm-mysql        Up (healthy)
# alya-crm-backend      Up (healthy)
# alya-crm-frontend     Up (healthy)
```

### 4️⃣ Acessar Aplicação

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### 5️⃣ Criar Primeiro Usuário

```bash
# Método 1: Via Frontend
# Acesse http://localhost e clique em "Registrar"

# Método 2: Via API
curl -X POST http://localhost:3001/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Admin",
    "email": "admin@alyacrm.com",
    "senha": "Admin123!",
    "plano": "PREMIUM"
  }'
```

---

## 🔧 Comandos Úteis

### Gerenciamento de Containers

```bash
# Ver logs de um serviço específico
docker-compose -f docker-compose.full.yml logs -f backend
docker-compose -f docker-compose.full.yml logs -f mysql

# Parar containers (mantém dados)
docker-compose -f docker-compose.full.yml stop

# Iniciar containers parados
docker-compose -f docker-compose.full.yml start

# Reiniciar um serviço
docker-compose -f docker-compose.full.yml restart backend

# Parar e remover containers
docker-compose -f docker-compose.full.yml down

# Parar e REMOVER DADOS (⚠️ cuidado!)
docker-compose -f docker-compose.full.yml down -v
```

### Acesso Direto aos Containers

```bash
# Shell no backend
docker exec -it alya-crm-backend sh

# Shell no MySQL
docker exec -it alya-crm-mysql mysql -u root -p
# Senha: valor de MYSQL_ROOT_PASSWORD no .env

# Ver tabelas
docker exec -it alya-crm-mysql mysql -u alyacrm_user -p alyacrm -e "SHOW TABLES;"
```

### Migrations e Banco de Dados

```bash
# Executar migration manualmente
docker exec alya-crm-backend npx prisma migrate deploy

# Ver status das migrations
docker exec alya-crm-backend npx prisma migrate status

# Abrir Prisma Studio (GUI para banco)
docker exec alya-crm-backend npx prisma studio
# Acesse: http://localhost:5555
```

### Build e Rebuild

```bash
# Rebuild um serviço específico
docker-compose -f docker-compose.full.yml build backend

# Rebuild todos os serviços
docker-compose -f docker-compose.full.yml build

# Forçar rebuild (sem cache)
docker-compose -f docker-compose.full.yml build --no-cache

# Rebuild e restart
docker-compose -f docker-compose.full.yml up -d --build
```

---

## 🗄️ Backup e Restore

### Backup do MySQL

```bash
# Backup completo
docker exec alya-crm-mysql mysqldump \
  -u root \
  -p${MYSQL_ROOT_PASSWORD} \
  --all-databases \
  > backup-$(date +%Y%m%d-%H%M%S).sql

# Backup apenas database alyacrm
docker exec alya-crm-mysql mysqldump \
  -u alyacrm_user \
  -p${MYSQL_PASSWORD} \
  alyacrm \
  > backup-alyacrm-$(date +%Y%m%d).sql
```

### Restore do MySQL

```bash
# Restore database completo
cat backup.sql | docker exec -i alya-crm-mysql mysql \
  -u root \
  -p${MYSQL_ROOT_PASSWORD}

# Restore apenas alyacrm
cat backup-alyacrm.sql | docker exec -i alya-crm-mysql mysql \
  -u alyacrm_user \
  -p${MYSQL_PASSWORD} \
  alyacrm
```

### Backup Automatizado (Cronjob)

```bash
# Adicione ao crontab (crontab -e):
0 2 * * * cd /caminho/alya-crm-new && docker exec alya-crm-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} alyacrm > backups/backup-$(date +\%Y\%m\%d).sql

# Manter apenas últimos 7 dias:
0 3 * * * find /caminho/alya-crm-new/backups -name "backup-*.sql" -mtime +7 -delete
```

---

## 🔍 Troubleshooting

### ❌ Problema: Container não inicia

```bash
# Ver logs completos
docker-compose -f docker-compose.full.yml logs

# Ver apenas erros
docker-compose -f docker-compose.full.yml logs | grep -i error

# Ver motivo do crash
docker ps -a
docker logs alya-crm-backend
```

### ❌ Problema: "JWT_SECRET não configurado"

```bash
# Verifique se o .env foi copiado
ls -la .env

# Verifique conteúdo
cat .env | grep JWT_SECRET

# Gere novo JWT_SECRET
echo "JWT_SECRET=\"$(openssl rand -hex 32)\"" >> .env

# Reinicie
docker-compose -f docker-compose.full.yml restart backend
```

### ❌ Problema: "Cannot connect to MySQL"

```bash
# Verifique se MySQL está rodando
docker ps | grep mysql

# Ver logs do MySQL
docker logs alya-crm-mysql

# Teste conexão direta
docker exec alya-crm-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SELECT 1;"

# Se falhar, remova volume e recrie:
docker-compose -f docker-compose.full.yml down -v
docker-compose -f docker-compose.full.yml up -d
```

### ❌ Problema: "Prisma migration failed"

```bash
# Ver status
docker exec alya-crm-backend npx prisma migrate status

# Resetar database (⚠️ perde dados!)
docker exec alya-crm-backend npx prisma migrate reset

# Ou aplicar manualmente
docker exec alya-crm-backend npx prisma migrate deploy
```

### ❌ Problema: "Port already in use"

```bash
# Ver o que está usando a porta 3001
lsof -i :3001  # Linux/Mac
netstat -ano | findstr :3001  # Windows

# Matar processo
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows

# Ou mude a porta no docker-compose.yml:
ports:
  - "3002:3001"  # Usa 3002 externamente
```

### ❌ Problema: "CORS error"

```bash
# Verifique FRONTEND_URL no .env
cat .env | grep FRONTEND_URL

# Deve ser:
FRONTEND_URL=http://localhost:80

# Se acessar via IP:
FRONTEND_URL=http://192.168.x.x:80
```

---

## 🚀 Deploy em Produção (VPS)

### Preparação do Servidor

```bash
# SSH no servidor
ssh root@seu-servidor.com

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verificar
docker --version
docker-compose --version
```

### Deploy

```bash
# Clone repositório
cd /var/www
git clone https://github.com/marcosbelmiroimob-cell/Alya_CRM_Verdent.git alyacrm
cd alyacrm/alya-crm-new

# Configure .env de PRODUÇÃO
cp .env.docker .env
nano .env

# IMPORTANTE: Configure:
NODE_ENV=production
FRONTEND_URL=https://alyacrm.com.br
MYSQL_PASSWORD=<senha-forte-gerada>
JWT_SECRET=<64-caracteres-gerados>

# Inicie
docker-compose -f docker-compose.full.yml up -d

# Configure Nginx reverseproxy (no host):
# Proxy localhost:80 → https://alyacrm.com.br
```

### Monitoramento em Produção

```bash
# Ver recursos usados
docker stats

# Health checks
curl http://localhost:3001/api/health

# Logs em produção (últimas 100 linhas)
docker-compose -f docker-compose.full.yml logs --tail=100

# Alertas por email (configure mailutils)
docker-compose -f docker-compose.full.yml logs -f | \
  grep -i error | \
  mail -s "Erro Alya CRM" admin@example.com
```

---

## 📊 Volumes e Dados

### Localização dos Dados

```bash
# Ver volumes
docker volume ls

# Inspecionar volume MySQL
docker volume inspect alya-crm-new_mysql_data

# Localização física (Linux):
/var/lib/docker/volumes/alya-crm-new_mysql_data/_data
```

### Mover Dados para Outro Servidor

```bash
# Servidor A: Backup
docker exec alya-crm-mysql mysqldump -u root -p<senha> alyacrm > backup.sql

# Copiar para Servidor B
scp backup.sql user@servidor-b:/tmp/

# Servidor B: Restore
cat /tmp/backup.sql | docker exec -i alya-crm-mysql mysql -u root -p<senha> alyacrm
```

---

## 🔐 Segurança

### Checklist de Segurança Docker

- [ ] Nunca commite .env no Git
- [ ] Use senhas fortes (min 20 caracteres)
- [ ] Configure firewall (apenas portas 80, 443, 22)
- [ ] Ative logs de auditoria Docker
- [ ] Escaneie imagens: `docker scan alya-crm-backend`
- [ ] Limite recursos (CPU, RAM) no compose
- [ ] Rotacione secrets a cada 90 dias
- [ ] Backups automatizados diários

### Limitar Recursos

```yaml
# Adicione ao docker-compose.full.yml:
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          memory: 256M
```

---

## 📚 Arquivos Criados

- [docker-compose.full.yml](docker-compose.full.yml) - Compose completo (MySQL + Backend + Frontend)
- [Dockerfile](../Dockerfile) - Build backend
- [docker-entrypoint.sh](../docker-entrypoint.sh) - Script de inicialização
- [.env.docker](.env.docker) - Template de variáveis

---

## 🆘 Suporte

**Problemas?**
- Documentação: [README.md](../README.md)
- Docker Docs: https://docs.docker.com
- Issues: https://github.com/marcosbelmiroimob-cell/Alya_CRM_Verdent/issues

---

**Última atualização**: 2026-01-27
