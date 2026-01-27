#!/bin/bash
# ===========================================
# Script de Deploy - CRM Alya
# ===========================================
# Execute este script na VPS para fazer o deploy

set -e

echo "=========================================="
echo "  Deploy CRM Alya - alyacrm.com.br"
echo "=========================================="

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker compose &> /dev/null; then
    echo "Instalando Docker Compose..."
    apt install -y docker-compose-plugin
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo ""
    echo "ERRO: Arquivo .env não encontrado!"
    echo ""
    echo "Crie o arquivo .env com as seguintes variáveis:"
    echo "  VITE_SUPABASE_URL=sua-url-supabase"
    echo "  VITE_SUPABASE_ANON_KEY=sua-anon-key"
    echo ""
    exit 1
fi

# Verificar certificados SSL
if [ ! -f "ssl/alyacrm.crt" ] || [ ! -f "ssl/alyacrm.key" ]; then
    echo ""
    echo "AVISO: Certificados SSL não encontrados em ./ssl/"
    echo "Por favor, coloque os arquivos:"
    echo "  - ssl/alyacrm.crt"
    echo "  - ssl/alyacrm.key"
    echo ""
    read -p "Deseja continuar sem SSL? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Parar containers existentes
echo ""
echo "Parando containers existentes..."
docker compose down 2>/dev/null || true

# Build e start
echo ""
echo "Fazendo build e iniciando containers..."
docker compose up -d --build

# Aguardar containers iniciarem
echo ""
echo "Aguardando containers iniciarem..."
sleep 5

# Verificar status
echo ""
echo "Status dos containers:"
docker compose ps

echo ""
echo "=========================================="
echo "  Deploy concluído!"
echo "=========================================="
echo ""
echo "Acesse: https://alyacrm.com.br"
echo ""
echo "Comandos úteis:"
echo "  docker compose logs -f    # Ver logs"
echo "  docker compose restart    # Reiniciar"
echo "  docker compose down       # Parar"
echo ""
