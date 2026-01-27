#!/bin/bash
# ===========================================
# Script Completo de Setup - CRM Alya
# Execute na VPS Hostinger
# ===========================================

set -e

echo ""
echo "=========================================="
echo "  SETUP CRM ALYA - alyacrm.com.br"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Execute como root: sudo ./setup-vps.sh${NC}"
    exit 1
fi

# 2. Atualizar sistema
echo -e "${YELLOW}[1/6] Atualizando sistema...${NC}"
apt update && apt upgrade -y

# 3. Instalar Docker (se necessário)
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}[2/6] Instalando Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo -e "${GREEN}[2/6] Docker já instalado${NC}"
fi

# 4. Instalar Docker Compose (se necessário)
if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}[3/6] Instalando Docker Compose...${NC}"
    apt install -y docker-compose-plugin
else
    echo -e "${GREEN}[3/6] Docker Compose já instalado${NC}"
fi

# 5. Configurar Firewall
echo -e "${YELLOW}[4/6] Configurando firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 6. Verificar arquivo .env
if [ ! -f ".env" ]; then
    echo ""
    echo -e "${RED}ERRO: Arquivo .env não encontrado!${NC}"
    echo ""
    echo "Crie o arquivo .env com:"
    echo "  VITE_SUPABASE_URL=https://fwuoqtqfchnbstxjjnvn.supabase.co"
    echo "  VITE_SUPABASE_ANON_KEY=sua-key-aqui"
    echo ""
    
    # Criar arquivo .env automaticamente
    echo -e "${YELLOW}Criando arquivo .env...${NC}"
    cat > .env << 'EOF'
VITE_SUPABASE_URL=https://fwuoqtqfchnbstxjjnvn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dW9xdHFmY2huYnN0eGpqbnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODY1NjMsImV4cCI6MjA4MzQ2MjU2M30.a-BYAiYfmrdQ8MJECg7KIZXLGBGgcXyHrLuFF0t1IAw
EOF
    echo -e "${GREEN}Arquivo .env criado!${NC}"
fi

# 7. Parar containers existentes
echo -e "${YELLOW}[5/6] Parando containers existentes...${NC}"
docker compose down 2>/dev/null || true

# 8. Build e Start (versão HTTP primeiro)
echo -e "${YELLOW}[6/6] Fazendo build e iniciando...${NC}"
docker compose up -d --build

# Aguardar
echo ""
echo "Aguardando containers iniciarem..."
sleep 10

# Status
echo ""
echo -e "${GREEN}=========================================="
echo "  DEPLOY CONCLUÍDO!"
echo "==========================================${NC}"
echo ""
docker compose ps
echo ""
echo -e "Acesse: ${GREEN}http://76.13.81.66${NC}"
echo ""
echo "Para configurar SSL (HTTPS):"
echo "  chmod +x init-letsencrypt.sh"
echo "  ./init-letsencrypt.sh"
echo ""
echo "Comandos úteis:"
echo "  docker compose logs -f    # Ver logs"
echo "  docker compose restart    # Reiniciar"
echo "  docker compose down       # Parar"
echo ""
