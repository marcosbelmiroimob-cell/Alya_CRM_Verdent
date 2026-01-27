#!/bin/bash
# =====================================================
# DEPLOY ALYA CRM - HOSTINGER VPS
# Copie e cole este script inteiro no terminal da VPS
# =====================================================

set -e

echo "=================================================="
echo "      DEPLOY ALYA CRM - Iniciando..."
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
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dW9xdHFmY2huYnN0eGpqbnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODY1NjMsImV4cCI6MjA4MzQ2MjU2M30.a-BYAiYfmrdQ8MJECg7KIZXLGBGgcXyHrLuFF0t1IAw"

# ====================
# 1. VERIFICAR/INSTALAR DOCKER
# ====================
echo -e "${YELLOW}[1/5] Verificando Docker...${NC}"

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
echo -e "${YELLOW}[2/5] Parando containers antigos...${NC}"

if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    docker compose down 2>/dev/null || true
fi

# Liberar porta 80
docker stop $(docker ps -q --filter "publish=80") 2>/dev/null || true

# ====================
# 3. CLONAR/ATUALIZAR REPOSITÓRIO
# ====================
echo -e "${YELLOW}[3/5] Baixando código do GitHub...${NC}"

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
echo -e "${YELLOW}[4/5] Configurando variáveis de ambiente...${NC}"

cat > .env << EOF
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_KEY}
EOF

echo -e "${GREEN}Arquivo .env criado!${NC}"

# ====================
# 5. BUILD E DEPLOY
# ====================
echo -e "${YELLOW}[5/5] Construindo e iniciando containers...${NC}"

docker compose up -d --build

# ====================
# VERIFICAÇÃO
# ====================
echo ""
echo -e "${GREEN}=================================================="
echo "      DEPLOY CONCLUÍDO!"
echo "==================================================${NC}"
echo ""

sleep 5

if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}Container rodando com sucesso!${NC}"
    echo ""
    echo "Acesse:"
    echo "  - http://76.13.81.66"
    echo "  - http://alyacrm.com.br (após configurar DNS)"
else
    echo -e "${RED}ERRO: Container não está rodando${NC}"
    docker compose logs --tail=50
fi

echo ""
echo "Comandos úteis:"
echo "  docker compose ps       - Ver status"
echo "  docker compose logs -f  - Ver logs"
echo "  docker compose restart  - Reiniciar"
