#!/bin/bash
# =====================================================
# DEPLOY ALYA CRM - VERSÃO COMPACTA (1 linha por comando)
# Execute linha por linha no terminal Hostinger
# =====================================================

# 1. Instalar Docker (se necessário)
apt-get update && apt-get install -y docker.io docker-compose-v2 && systemctl start docker && systemctl enable docker

# 2. Parar e limpar containers antigos
docker stop $(docker ps -q --filter "publish=80") 2>/dev/null; docker rm -f alya-crm-app 2>/dev/null; rm -rf /opt/alya-crm

# 3. Clonar repositório
mkdir -p /opt/alya-crm && cd /opt/alya-crm && git clone https://github.com/marcosbelmiroimob-cell/Alya_CRM_Verdent.git . && cd alya-crm-new

# 4. Criar arquivo .env (EXECUTE ESTE BLOCO COMPLETO)
cat > /opt/alya-crm/alya-crm-new/.env << 'ENVFILE'
VITE_SUPABASE_URL=https://fwuoqtqfchnbstxjjnvn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dW9xdHFmY2huYnN0eGpqbnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODY1NjMsImV4cCI6MjA4MzQ2MjU2M30.a-BYAiYfmrdQ8MJECg7KIZXLGBGgcXyHrLuFF0t1IAw
ENVFILE

# 5. Build e iniciar
cd /opt/alya-crm/alya-crm-new && docker compose up -d --build

# 6. Verificar status
docker compose ps && echo "Acesse: http://76.13.81.66"
