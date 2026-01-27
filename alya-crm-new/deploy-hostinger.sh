#!/bin/bash
# =====================================================
# DEPLOY ALYA CRM + API - HOSTINGER VPS
# Copie e cole este script inteiro no terminal da VPS
# =====================================================

set -e

echo "=================================================="
echo "      DEPLOY ALYA CRM + API n8n - Iniciando..."
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configurações
APP_DIR="/opt/alya-crm"
REPO_URL="https://github.com/marcosbelmiroimob-cell/Alya_CRM_Verdent.git"
SUPABASE_URL="https://fwuoqtqfchnbstxjjnvn.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dW9xdHFmY2huYnN0eGpqbnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODY1NjMsImV4cCI6MjA4MzQ2MjU2M30.a-BYAiYfmrdQ8MJECg7KIZXLGBGgcXyHrLuFF0t1IAw"

# Service Role Key do Supabase (para bypass RLS na API)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dW9xdHFmY2huYnN0eGpqbnZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg4NjU2MywiZXhwIjoyMDgzNDYyNTYzfQ.5z-FoMhjL8qhk5G5EKBoJmRM3PLLHjZ3nYjNPoo8MtI"

# Chave de autenticação para webhooks do n8n
WEBHOOK_API_KEY="alya_wh_n8n_2024_secure_key_abc123xyz"

# ====================
# 1. VERIFICAR/INSTALAR DOCKER
# ====================
echo -e "${YELLOW}[1/6] Verificando Docker...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Instalando Docker...${NC}"
    apt-get update
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}Docker instalado com sucesso!${NC}"
else
    echo -e "${GREEN}Docker já está instalado${NC}"
fi

# ====================
# 2. PARAR CONTAINERS ANTIGOS
# ====================
echo -e "${YELLOW}[2/6] Parando containers antigos...${NC}"

if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR/alya-crm-new" 2>/dev/null || cd "$APP_DIR"
    docker compose down 2>/dev/null || true
fi

# Liberar portas
docker stop $(docker ps -q --filter "publish=80") 2>/dev/null || true
docker stop $(docker ps -q --filter "publish=3001") 2>/dev/null || true

# ====================
# 3. CLONAR/ATUALIZAR REPOSITÓRIO
# ====================
echo -e "${YELLOW}[3/6] Baixando código do GitHub...${NC}"

if [ -d "$APP_DIR" ]; then
    echo "Removendo instalação anterior..."
    rm -rf "$APP_DIR"
fi

mkdir -p "$APP_DIR"
cd "$APP_DIR"

git clone "$REPO_URL" .
cd alya-crm-new

echo -e "${GREEN}Código baixado com sucesso!${NC}"

# ====================
# 4. CONFIGURAR AMBIENTE
# ====================
echo -e "${YELLOW}[4/6] Configurando variáveis de ambiente...${NC}"

cat > .env << EOF
# Frontend
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# API Backend - Integração n8n
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
WEBHOOK_API_KEY=${WEBHOOK_API_KEY}
EOF

echo -e "${GREEN}Arquivo .env criado!${NC}"

# ====================
# 5. BUILD E DEPLOY
# ====================
echo -e "${YELLOW}[5/6] Construindo e iniciando containers...${NC}"

docker compose up -d --build

# ====================
# 6. VERIFICAÇÃO
# ====================
echo -e "${YELLOW}[6/6] Verificando deploy...${NC}"

sleep 10

echo ""
echo -e "${GREEN}=================================================="
echo "      DEPLOY CONCLUÍDO!"
echo "==================================================${NC}"
echo ""

if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}Containers rodando com sucesso!${NC}"
    docker compose ps
    echo ""
    echo "=============================================="
    echo "ENDPOINTS DISPONÍVEIS:"
    echo "=============================================="
    echo "  CRM Frontend:   http://76.13.81.66"
    echo "  API Health:     http://76.13.81.66/health"
    echo "  API Webhook:    POST http://76.13.81.66/api/v1/leads/webhook"
    echo ""
    echo "=============================================="
    echo "CREDENCIAIS n8n (ANOTE ESTAS INFORMAÇÕES!):"
    echo "=============================================="
    echo "  Header:    X-API-Key"
    echo "  API Key:   ${WEBHOOK_API_KEY}"
    echo ""
else
    echo -e "${RED}ERRO: Containers não estão rodando${NC}"
    docker compose logs --tail=50
fi

echo ""
echo "Comandos úteis:"
echo "  docker compose ps           - Ver status"
echo "  docker compose logs -f      - Ver logs (todos)"
echo "  docker compose logs -f api  - Ver logs da API"
echo "  docker compose restart      - Reiniciar"
