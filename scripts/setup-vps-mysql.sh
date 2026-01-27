#!/bin/bash

# ═══════════════════════════════════════════════════════════════
#  Setup MySQL Completo - Hostinger VPS
# ═══════════════════════════════════════════════════════════════
#
#  Este script configura o MySQL/MariaDB completamente na VPS
#  Executar VIA SSH na VPS ou localmente com conexão SSH
#
#  Uso:
#    bash setup-vps-mysql.sh
#
# ═══════════════════════════════════════════════════════════════

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ═══════════════════════════════════════════════════════════════
#  Configuração
# ═══════════════════════════════════════════════════════════════

VPS_IP="76.13.81.66"
VPS_USER="root"
MARIADB_CONTAINER="mariadb-gwz7-mariadb-1"
DB_NAME="myapp"
DB_USER="myapp_user"
DB_PASSWORD="k0lOqeqMPloJTuX5KQFkoSJvktvEfmVfaz"

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════════"
echo "  SETUP MYSQL - HOSTINGER VPS"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${NC}"

# ═══════════════════════════════════════════════════════════════
#  Funções
# ═══════════════════════════════════════════════════════════════

function check_ssh() {
  echo -e "${CYAN}🔌 Verificando conexão SSH...${NC}"

  if ssh -q "$VPS_USER@$VPS_IP" exit; then
    echo -e "${GREEN}✅ Conexão SSH OK${NC}"
    return 0
  else
    echo -e "${RED}❌ Erro: Não foi possível conectar via SSH${NC}"
    echo -e "${YELLOW}   Configure SSH primeiro:${NC}"
    echo -e "${YELLOW}   ssh-keygen -t rsa${NC}"
    echo -e "${YELLOW}   ssh-copy-id $VPS_USER@$VPS_IP${NC}"
    return 1
  fi
}

function check_mariadb() {
  echo -e "\n${CYAN}🐬 Verificando MariaDB...${NC}"

  local status=$(ssh "$VPS_USER@$VPS_IP" "docker ps --filter name=$MARIADB_CONTAINER --format '{{.Status}}'")

  if [ -z "$status" ]; then
    echo -e "${RED}❌ Container MariaDB não encontrado${NC}"
    echo -e "${YELLOW}   Containers rodando:${NC}"
    ssh "$VPS_USER@$VPS_IP" "docker ps --format 'table {{.Names}}\t{{.Status}}'"
    return 1
  else
    echo -e "${GREEN}✅ MariaDB rodando: $status${NC}"
    return 0
  fi
}

function test_connection() {
  echo -e "\n${CYAN}🔐 Testando conexão MariaDB...${NC}"

  local result=$(ssh "$VPS_USER@$VPS_IP" "docker exec $MARIADB_CONTAINER mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e 'SELECT 1 AS status;' -s -N" 2>&1)

  if [[ $result == "1" ]]; then
    echo -e "${GREEN}✅ Conexão MySQL OK${NC}"
    return 0
  else
    echo -e "${RED}❌ Erro na conexão: $result${NC}"
    return 1
  fi
}

function get_database_info() {
  echo -e "\n${CYAN}📊 Informações do Banco de Dados${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  # Versão
  local version=$(ssh "$VPS_USER@$VPS_IP" "docker exec $MARIADB_CONTAINER mysql -V | cut -d' ' -f6")
  echo -e "${CYAN}Versão:${NC} $version"

  # Tabelas
  echo -e "\n${CYAN}Tabelas existentes:${NC}"
  ssh "$VPS_USER@$VPS_IP" "docker exec $MARIADB_CONTAINER mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e 'SHOW TABLES;'"

  # Usuários
  echo -e "\n${CYAN}Total de usuários:${NC}"
  local user_count=$(ssh "$VPS_USER@$VPS_IP" "docker exec $MARIADB_CONTAINER mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e 'SELECT COUNT(*) FROM usuarios;' -s -N" 2>/dev/null || echo "0")
  echo -e "${GREEN}$user_count usuários${NC}"

  # Leads
  echo -e "\n${CYAN}Total de leads:${NC}"
  local lead_count=$(ssh "$VPS_USER@$VPS_IP" "docker exec $MARIADB_CONTAINER mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e 'SELECT COUNT(*) FROM leads;' -s -N" 2>/dev/null || echo "0")
  echo -e "${GREEN}$lead_count leads${NC}"
}

function create_user_if_not_exists() {
  echo -e "\n${CYAN}👤 Verificando usuário padrão...${NC}"

  local user_exists=$(ssh "$VPS_USER@$VPS_IP" "docker exec $MARIADB_CONTAINER mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e \"SELECT COUNT(*) FROM usuarios WHERE email='marcosbelmiro.imob@gmail.com';\" -s -N" 2>/dev/null || echo "0")

  if [[ $user_exists == "0" ]]; then
    echo -e "${YELLOW}   Criando usuário padrão...${NC}"

    ssh "$VPS_USER@$VPS_IP" "docker exec $MARIADB_CONTAINER mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME" <<'EOSQL'
INSERT INTO usuarios (nome, email, senha_hash, plano, criado_em, atualizado_em)
VALUES (
  'Marcos Belmiro',
  'marcosbelmiro.imob@gmail.com',
  '$2a$12$/fkV3tsjJmDeQ/bDvHW9x.4WpKLK.VN2JP83gf62HtB668zoRhQ5y',
  'PREMIUM',
  NOW(),
  NOW()
);
EOSQL

    echo -e "${GREEN}✅ Usuário criado${NC}"
  else
    echo -e "${GREEN}✅ Usuário já existe${NC}"
  fi

  # Mostrar usuário
  echo -e "\n${CYAN}Usuário configurado:${NC}"
  ssh "$VPS_USER@$VPS_IP" "docker exec $MARIADB_CONTAINER mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e 'SELECT id, nome, email, plano FROM usuarios WHERE email=\"marcosbelmiro.imob@gmail.com\";'"
}

function optimize_database() {
  echo -e "\n${CYAN}⚡ Otimizando banco de dados...${NC}"

  ssh "$VPS_USER@$VPS_IP" "docker exec $MARIADB_CONTAINER mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME" <<'EOSQL'
-- Analisar tabelas
ANALYZE TABLE usuarios, leads, negociacoes, empreendimentos;

-- Otimizar tabelas
OPTIMIZE TABLE usuarios, leads, negociacoes;

-- Verificar integridade
CHECK TABLE usuarios, leads, negociacoes;
EOSQL

  echo -e "${GREEN}✅ Otimização concluída${NC}"
}

function backup_database() {
  echo -e "\n${CYAN}💾 Criando backup do banco...${NC}"

  local backup_file="backup-$(date +%Y%m%d-%H%M%S).sql"

  ssh "$VPS_USER@$VPS_IP" "docker exec $MARIADB_CONTAINER mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > /tmp/$backup_file"

  echo -e "${GREEN}✅ Backup criado: /tmp/$backup_file${NC}"
  echo -e "${YELLOW}   Baixando para máquina local...${NC}"

  scp "$VPS_USER@$VPS_IP:/tmp/$backup_file" "./backups/$backup_file"

  echo -e "${GREEN}✅ Backup salvo em: ./backups/$backup_file${NC}"
}

function generate_env_config() {
  echo -e "\n${CYAN}📝 Gerando configuração .env...${NC}"

  cat > .env.vps.generated <<EOF
# ═══════════════════════════════════════════════════════════════
#  Configuração Gerada Automaticamente - Hostinger VPS
# ═══════════════════════════════════════════════════════════════
#  Gerado em: $(date)
# ═══════════════════════════════════════════════════════════════

# Database (MariaDB na VPS)
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@$VPS_IP:3306/$DB_NAME"

# JWT Secret (GERE UM NOVO!)
JWT_SECRET="$(openssl rand -hex 32)"

# IA APIs (CONFIGURE COM SUAS KEYS!)
GEMINI_API_KEY="AIza_SUA_KEY_AQUI"
OPENAI_API_KEY="sk-proj_SUA_KEY_AQUI"
OPENAI_MONTHLY_LIMIT_USD="5.00"

# Aplicação
NODE_ENV="production"
PORT="3001"
FRONTEND_URL="https://alyacrm.com.br"
EOF

  echo -e "${GREEN}✅ Configuração salva em: .env.vps.generated${NC}"
  echo -e "${YELLOW}   Copie para .env e atualize as API keys!${NC}"
}

# ═══════════════════════════════════════════════════════════════
#  Execução Principal
# ═══════════════════════════════════════════════════════════════

echo -e "${YELLOW}Este script vai:${NC}"
echo -e "  ✓ Verificar conexão SSH"
echo -e "  ✓ Verificar MariaDB rodando"
echo -e "  ✓ Testar conexão com banco"
echo -e "  ✓ Criar usuário padrão (se não existir)"
echo -e "  ✓ Otimizar banco de dados"
echo -e "  ✓ Fazer backup"
echo -e "  ✓ Gerar configuração .env"
echo ""
read -p "Continuar? (s/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}Cancelado${NC}"
  exit 0
fi

# Executar verificações
if ! check_ssh; then
  exit 1
fi

if ! check_mariadb; then
  exit 1
fi

if ! test_connection; then
  exit 1
fi

# Executar configurações
get_database_info
create_user_if_not_exists
optimize_database

# Backup (opcional)
echo ""
read -p "Fazer backup do banco? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  mkdir -p ./backups
  backup_database
fi

# Gerar configuração
generate_env_config

# Resumo final
echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ SETUP CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"

echo -e "${CYAN}📋 Informações de Conexão:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Host:${NC}     $VPS_IP"
echo -e "${CYAN}Porta:${NC}    3306"
echo -e "${CYAN}Banco:${NC}    $DB_NAME"
echo -e "${CYAN}Usuário:${NC}  $DB_USER"
echo -e "${CYAN}Senha:${NC}    $DB_PASSWORD"
echo ""
echo -e "${CYAN}DATABASE_URL:${NC}"
echo -e "${YELLOW}mysql://$DB_USER:$DB_PASSWORD@$VPS_IP:3306/$DB_NAME${NC}"
echo ""

echo -e "${CYAN}🔐 Credenciais de Login:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Email:${NC}    marcosbelmiro.imob@gmail.com"
echo -e "${CYAN}Senha:${NC}    M@rcos123@"
echo ""

echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo -e "  1. Copie .env.vps.generated para .env"
echo -e "  2. Configure suas API keys (GEMINI, OPENAI)"
echo -e "  3. Teste a aplicação localmente"
echo -e "  4. Deploy no VPS quando pronto"
echo ""

exit 0
