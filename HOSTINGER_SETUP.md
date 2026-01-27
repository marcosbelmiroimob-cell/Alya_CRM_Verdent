# 🚀 Setup Completo - Hostinger VPS + MySQL

Guia definitivo para configurar MySQL na VPS Hostinger e integrar com a aplicação.

---

## 📋 Informações da VPS

**Obtidas da imagem fornecida**:
- **IP**: 76.13.81.66
- **OS**: Ubuntu 24.04 LTS
- **Localização**: Brasil - São Paulo
- **Recursos**: 1 CPU | 4GB RAM | 50GB SSD
- **MariaDB**: Container `mariadb-gwz7-mariadb-1` rodando
- **Database**: `myapp`
- **Usuário**: `myapp_user`
- **Senha**: `k0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz`

---

## 🎯 Objetivo

Configurar perfeitamente o MySQL da VPS e integrar com a aplicação local e em produção.

---

## 🚀 Setup Automático (Recomendado)

### Pré-requisitos

1. **SSH configurado**:
   ```bash
   # Gerar chave SSH (se não tiver)
   ssh-keygen -t rsa -b 4096

   # Copiar para VPS
   ssh-copy-id root@76.13.81.66

   # Testar conexão
   ssh root@76.13.81.66
   ```

2. **Dependências locais**:
   ```bash
   npm install
   ```

### Execução

```bash
# Executar script automatizado
bash scripts/setup-vps-mysql.sh
```

**O script vai**:
- ✅ Verificar conexão SSH
- ✅ Verificar MariaDB rodando
- ✅ Testar conexão com banco
- ✅ Criar usuário padrão
- ✅ Otimizar banco de dados
- ✅ Fazer backup
- ✅ Gerar arquivo `.env.vps.generated`

---

## 🔧 Setup Manual (Passo a Passo)

### 1. Verificar MariaDB Rodando

```bash
# SSH na VPS
ssh root@76.13.81.66

# Ver containers Docker
docker ps

# Resultado esperado:
# mariadb-gwz7-mariadb-1   Up (healthy)
```

### 2. Testar Conexão MySQL

```bash
# Dentro da VPS
docker exec mariadb-gwz7-mariadb-1 mysql \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp \
  -e "SELECT VERSION();"

# Resultado esperado:
# +-----------+
# | VERSION() |
# +-----------+
# | 11.x.x    |
# +-----------+
```

### 3. Verificar Tabelas Existentes

```bash
docker exec mariadb-gwz7-mariadb-1 mysql \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp \
  -e "SHOW TABLES;"

# Tabelas esperadas (se já tem migrations):
# +-------------------+
# | Tables_in_myapp   |
# +-------------------+
# | usuarios          |
# | leads             |
# | negociacoes       |
# | ...               |
# +-------------------+
```

### 4. Criar Usuário Padrão (Se Não Existir)

```bash
docker exec mariadb-gwz7-mariadb-1 mysql \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp <<'EOSQL'

-- Verificar se usuário existe
SELECT COUNT(*) AS existe FROM usuarios WHERE email='marcosbelmiro.imob@gmail.com';

-- Se NÃO existir, inserir:
INSERT INTO usuarios (nome, email, senha_hash, plano, criado_em, atualizado_em)
VALUES (
  'Marcos Belmiro',
  'marcosbelmiro.imob@gmail.com',
  '$2a$12$/fkV3tsjJmDeQ/bDvHW9x.4WpKLK.VN2JP83gf62HtB668zoRhQ5y',
  'PREMIUM',
  NOW(),
  NOW()
);

-- Verificar criação
SELECT id, nome, email, plano FROM usuarios WHERE email='marcosbelmiro.imob@gmail.com';

EOSQL
```

**Credenciais**:
- Email: `marcosbelmiro.imob@gmail.com`
- Senha: `M@rcos123@`

### 5. Configurar .env Local

```bash
# Na raiz do projeto local
cp .env.example .env
nano .env
```

**Configuração**:

```env
# Database (MariaDB na VPS Hostinger)
DATABASE_URL="mysql://myapp_user:k0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz@76.13.81.66:3306/myapp"

# JWT Secret (gere novo)
JWT_SECRET="COLE_AQUI_64_CARACTERES_HEXADECIMAIS"

# Google Gemini (Primário)
GEMINI_API_KEY="AIza_SUA_KEY_ROTACIONADA"

# OpenAI (Fallback)
OPENAI_API_KEY="sk-proj-SUA_KEY_ROTACIONADA"
OPENAI_MONTHLY_LIMIT_USD="5.00"

# Ambiente
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:5173"
```

**Gerar JWT_SECRET**:

```bash
# Método 1: OpenSSL
openssl rand -hex 32

# Método 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Método 3: Python
python3 -c "import os; print(os.urandom(32).hex())"
```

### 6. Testar Conexão Local → VPS

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Testar conexão
npx prisma db execute --stdin <<'EOF'
SELECT 1 AS status;
EOF

# Resultado esperado:
# Running prisma db execute...
# 1
```

### 7. Executar Migrations (Se Necessário)

```bash
# Ver status das migrations
npx prisma migrate status

# Se precisar aplicar migrations
npx prisma migrate deploy

# Ou resetar (⚠️ CUIDADO: perde dados!)
npx prisma migrate reset
```

### 8. Iniciar Backend Local

```bash
# Desenvolvimento
npm run dev

# Logs esperados:
# ✅ Variáveis de ambiente validadas
# CORS configurado - Origens: Todas (desenvolvimento)
# Servidor Alya rodando na porta 3001
```

### 9. Testar API

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marcosbelmiro.imob@gmail.com",
    "password": "M@rcos123@"
  }'

# Resultado esperado:
# {
#   "token": "eyJhbGc...",
#   "usuario": {
#     "id": "...",
#     "nome": "Marcos Belmiro",
#     "email": "marcosbelmiro.imob@gmail.com",
#     "plano": "PREMIUM"
#   }
# }
```

---

## 🔐 Segurança: Acesso Externo ao MySQL

Por padrão, o MariaDB na VPS **permite conexões externas** (porta 3306 exposta).

### Opção A: Manter Acesso Externo (Atual)

✅ **Vantagens**:
- Desenvolvimento local conecta diretamente
- Prisma Studio funciona
- Ferramentas GUI (DBeaver, MySQL Workbench)

⚠️ **Segurança**:
- Configure firewall para permitir apenas seu IP
- Use senhas fortes (já tem)
- Considere SSL/TLS

### Opção B: Túnel SSH (Mais Seguro)

```bash
# Criar túnel SSH
ssh -L 3307:localhost:3306 root@76.13.81.66 -N -f

# Agora use:
DATABASE_URL="mysql://myapp_user:senha@localhost:3307/myapp"

# Vantagens:
# - Conexão criptografada
# - Não expõe porta 3306 publicamente
```

### Opção C: Firewall Restritivo

```bash
# SSH na VPS
ssh root@76.13.81.66

# Permitir apenas seu IP
ufw allow from SEU_IP to any port 3306
ufw enable

# Verificar
ufw status
```

---

## 🐳 API da Hostinger (Limitações)

### O que a API NÃO faz

❌ Criar/gerenciar databases MySQL diretamente
❌ Configurar usuários MySQL
❌ Executar queries SQL

### O que a API FAZ

✅ Gerenciar containers Docker (via Docker Manager API)
✅ Listar projetos Docker na VPS
✅ Ver logs de containers
✅ Restart containers

### Usando Docker Manager API

```bash
# Script Node.js disponível
node scripts/hostinger-api-setup.js

# Ou manualmente:
curl -X GET "https://developers.hostinger.com/api/vps/v1/data-centers" \
  -H "Authorization: Bearer WnSI8X0iL5R8DYAS4mtrELWWHsVXlPagvVxJqEy777835a1c"
```

**Nota**: Para gerenciar MySQL, use **SSH** (é a forma recomendada).

---

## 📊 Backup e Restore

### Backup Completo

```bash
# Local (via SSH)
ssh root@76.13.81.66 "docker exec mariadb-gwz7-mariadb-1 mysqldump \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp" > backup-$(date +%Y%m%d).sql

# Direto na VPS
ssh root@76.13.81.66
docker exec mariadb-gwz7-mariadb-1 mysqldump \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp > ~/backup.sql
```

### Restore

```bash
# Local → VPS
cat backup.sql | ssh root@76.13.81.66 \
  "docker exec -i mariadb-gwz7-mariadb-1 mysql \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp"

# Direto na VPS
ssh root@76.13.81.66
docker exec -i mariadb-gwz7-mariadb-1 mysql \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp < ~/backup.sql
```

### Backup Automatizado (Cron)

```bash
# SSH na VPS
ssh root@76.13.81.66

# Adicionar ao crontab
crontab -e

# Backup diário às 2h
0 2 * * * docker exec mariadb-gwz7-mariadb-1 mysqldump -u myapp_user -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz myapp > /root/backups/backup-$(date +\%Y\%m\%d).sql

# Limpar backups >7 dias
0 3 * * * find /root/backups -name "backup-*.sql" -mtime +7 -delete
```

---

## 🔧 Troubleshooting

### Erro: "Can't connect to MySQL server"

```bash
# 1. Verificar se MariaDB está rodando
ssh root@76.13.81.66
docker ps | grep mariadb

# 2. Verificar porta 3306 aberta
telnet 76.13.81.66 3306

# 3. Ver logs do container
docker logs mariadb-gwz7-mariadb-1 --tail 50

# 4. Restart container (se necessário)
docker restart mariadb-gwz7-mariadb-1
```

### Erro: "Access denied for user"

```bash
# Verificar credenciais
ssh root@76.13.81.66
docker exec -it mariadb-gwz7-mariadb-1 mysql -u root -p

# Dentro do MySQL, verificar usuário:
SELECT User, Host FROM mysql.user WHERE User='myapp_user';
SHOW GRANTS FOR 'myapp_user'@'%';
```

### Erro: "Table doesn't exist"

```bash
# Aplicar migrations
npx prisma migrate deploy

# Ou ver status
npx prisma migrate status
```

### Prisma Studio Não Conecta

```bash
# Verificar DATABASE_URL no .env
cat .env | grep DATABASE_URL

# Testar conexão direta
npx prisma db execute --stdin <<'EOF'
SELECT 1;
EOF

# Iniciar Studio com debug
DEBUG="*" npx prisma studio
```

---

## 📚 Comandos Úteis

### MySQL Via Docker

```bash
# Shell MySQL interativo
ssh root@76.13.81.66
docker exec -it mariadb-gwz7-mariadb-1 mysql \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp

# Query única
docker exec mariadb-gwz7-mariadb-1 mysql \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp \
  -e "SELECT COUNT(*) FROM usuarios;"

# Importar SQL
docker exec -i mariadb-gwz7-mariadb-1 mysql \
  -u myapp_user \
  -pk0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz \
  myapp < script.sql
```

### Prisma

```bash
# Gerar client
npx prisma generate

# Studio (GUI)
npx prisma studio

# Migrations
npx prisma migrate dev        # Desenvolvimento
npx prisma migrate deploy     # Produção
npx prisma migrate status     # Status
npx prisma migrate reset      # Reset (⚠️ perde dados)

# Database
npx prisma db push            # Sync schema (sem migration)
npx prisma db seed            # Seed inicial
```

---

## ✅ Checklist de Setup

### Pré-deployment
- [ ] SSH configurado e testado
- [ ] MariaDB rodando na VPS
- [ ] Conexão MySQL testada
- [ ] Usuário padrão criado
- [ ] .env local configurado
- [ ] API keys rotacionadas
- [ ] Backup do banco feito

### Desenvolvimento Local
- [ ] DATABASE_URL aponta para VPS
- [ ] Backend conecta no MySQL
- [ ] Login funcionando
- [ ] Prisma Studio acessível
- [ ] Migrations aplicadas

### Produção
- [ ] Firewall configurado (opcional)
- [ ] Backups automatizados
- [ ] Monitoramento ativo
- [ ] SSL/TLS configurado
- [ ] Logs centralizados

---

## 📞 Suporte

**Documentação**:
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Setup Docker
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migração Supabase
- [SECURITY.md](SECURITY.md) - Segurança

**Scripts**:
- `setup-vps-mysql.sh` - Setup automatizado
- `hostinger-api-setup.js` - API Hostinger

**Hostinger**:
- Painel: https://hpanel.hostinger.com
- API: https://developers.hostinger.com
- Suporte: Chat no painel

---

**Última atualização**: 2026-01-27
**VPS**: 76.13.81.66 (Brasil - São Paulo)
**MariaDB**: Container `mariadb-gwz7-mariadb-1`
