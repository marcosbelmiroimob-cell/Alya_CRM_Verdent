#!/bin/bash

# ═══════════════════════════════════════════════════════════════
#  Script de Rotação de Secrets - CRM Alya Verdent
# ═══════════════════════════════════════════════════════════════
#
#  ATENÇÃO: Este script ajuda na rotação, mas você PRECISA:
#  1. Gerar novas keys manualmente nos painéis (Google, OpenAI, Supabase)
#  2. Atualizar n8n com nova API_KEY do webhook
#  3. Planejar janela de manutenção (tokens JWT serão invalidados)
#
# ═══════════════════════════════════════════════════════════════

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════════"
echo "  🔄 ROTAÇÃO DE SECRETS - CRM Alya Verdent"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ ERRO: Execute este script na raiz do projeto CRM${NC}"
  exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ ERRO: Arquivo .env não encontrado${NC}"
  exit 1
fi

# Função para gerar secret aleatório
generate_secret() {
  if command -v openssl &> /dev/null; then
    openssl rand -hex 32
  else
    # Fallback usando /dev/urandom
    cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 64 | head -n 1
  fi
}

# ───────────────────────────────────────────────────────────────
#  BACKUP
# ───────────────────────────────────────────────────────────────

echo -e "${YELLOW}📦 Criando backup do .env atual...${NC}"
BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
cp .env "$BACKUP_FILE"
echo -e "${GREEN}✓ Backup salvo em: $BACKUP_FILE${NC}"
echo ""

# ───────────────────────────────────────────────────────────────
#  JWT_SECRET
# ───────────────────────────────────────────────────────────────

echo -e "${BLUE}🔑 Rotacionando JWT_SECRET...${NC}"
echo -e "${YELLOW}   ATENÇÃO: Todos os tokens de usuários serão invalidados!${NC}"
read -p "   Continuar? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  NEW_JWT_SECRET=$(generate_secret)

  # Extrair valor antigo para backup temporário
  OLD_JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d '"' -f 2)

  # Atualizar .env
  sed -i.tmp "s|^JWT_SECRET=.*|JWT_SECRET=\"$NEW_JWT_SECRET\"|" .env
  rm -f .env.tmp

  echo -e "${GREEN}✓ JWT_SECRET rotacionado${NC}"
  echo -e "   ${YELLOW}Valor antigo salvo em: $BACKUP_FILE${NC}"
  echo ""
else
  echo -e "   ⏭️  Pulando JWT_SECRET"
  echo ""
fi

# ───────────────────────────────────────────────────────────────
#  WEBHOOK API_KEY
# ───────────────────────────────────────────────────────────────

echo -e "${BLUE}🔑 Rotacionando API_KEY (webhook n8n)...${NC}"
read -p "   Continuar? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  NEW_API_KEY=$(generate_secret)

  # Atualizar backend principal (se existir)
  if grep -q "^WEBHOOK_API_KEY=" .env 2>/dev/null; then
    sed -i.tmp "s|^WEBHOOK_API_KEY=.*|WEBHOOK_API_KEY=\"$NEW_API_KEY\"|" .env
    rm -f .env.tmp
  fi

  # Atualizar API de webhooks
  if [ -f "alya-crm-new/api/.env" ]; then
    sed -i.tmp "s|^API_KEY=.*|API_KEY=\"$NEW_API_KEY\"|" alya-crm-new/api/.env
    rm -f alya-crm-new/api/.env.tmp
    echo -e "${GREEN}✓ API_KEY rotacionado em alya-crm-new/api/.env${NC}"
  fi

  echo -e "   ${YELLOW}IMPORTANTE: Atualize o n8n com a nova key:${NC}"
  echo -e "   ${NEW_API_KEY}"
  echo -e "   ${YELLOW}(HTTP Request Node > Headers > X-API-Key)${NC}"
  echo ""
else
  echo -e "   ⏭️  Pulando API_KEY"
  echo ""
fi

# ───────────────────────────────────────────────────────────────
#  API KEYS EXTERNAS (Manual)
# ───────────────────────────────────────────────────────────────

echo -e "${BLUE}🌐 API Keys Externas (Rotação Manual)${NC}"
echo ""

echo -e "${YELLOW}📍 GEMINI_API_KEY:${NC}"
echo "   1. Acesse: https://makersuite.google.com/app/apikey"
echo "   2. Delete a key antiga"
echo "   3. Clique em 'Create API Key'"
echo "   4. Copie a nova key"
read -p "   Já obteve a nova key? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo -n "   Cole a nova GEMINI_API_KEY: "
  read NEW_GEMINI_KEY
  sed -i.tmp "s|^GEMINI_API_KEY=.*|GEMINI_API_KEY=\"$NEW_GEMINI_KEY\"|" .env
  rm -f .env.tmp
  echo -e "${GREEN}✓ GEMINI_API_KEY atualizado${NC}"
else
  echo -e "   ⏭️  Pulando GEMINI_API_KEY (lembre de rotacionar depois)"
fi
echo ""

echo -e "${YELLOW}📍 OPENAI_API_KEY:${NC}"
echo "   1. Acesse: https://platform.openai.com/api-keys"
echo "   2. Clique em 'Create new secret key'"
echo "   3. Nomeie: alya-crm-prod-$(date +%Y-%m)"
echo "   4. Copie a key (aparece uma vez só!)"
read -p "   Já obteve a nova key? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo -n "   Cole a nova OPENAI_API_KEY: "
  read NEW_OPENAI_KEY
  sed -i.tmp "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=\"$NEW_OPENAI_KEY\"|" .env
  rm -f .env.tmp
  echo -e "${GREEN}✓ OPENAI_API_KEY atualizado${NC}"
  echo -e "   ${YELLOW}Não esqueça de deletar a key antiga no painel OpenAI${NC}"
else
  echo -e "   ⏭️  Pulando OPENAI_API_KEY (lembre de rotacionar depois)"
fi
echo ""

# ───────────────────────────────────────────────────────────────
#  VALIDAÇÃO
# ───────────────────────────────────────────────────────────────

echo -e "${BLUE}🔍 Validando novo .env...${NC}"

if grep -q "COLOQUE_AQUI" .env; then
  echo -e "${RED}❌ ERRO: Ainda existem placeholders no .env!${NC}"
  echo -e "   Revise o arquivo antes de reiniciar o servidor."
  exit 1
fi

# Verificar comprimento do JWT_SECRET
JWT_LENGTH=$(grep "^JWT_SECRET=" .env | cut -d '"' -f 2 | wc -c)
if [ "$JWT_LENGTH" -lt 32 ]; then
  echo -e "${RED}❌ ERRO: JWT_SECRET muito curto (mínimo 32 caracteres)${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Validação concluída${NC}"
echo ""

# ───────────────────────────────────────────────────────────────
#  REINICIAR SERVIDOR
# ───────────────────────────────────────────────────────────────

echo -e "${BLUE}🔄 Reiniciar servidor agora?${NC}"
echo -e "${YELLOW}   ATENÇÃO: Usuários logados serão desconectados (novo JWT_SECRET)${NC}"
read -p "   Reiniciar? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}⏳ Parando PM2...${NC}"
  pm2 stop alyacrm || true

  echo -e "${YELLOW}⏳ Iniciando PM2...${NC}"
  pm2 start alyacrm

  sleep 3

  echo -e "${YELLOW}⏳ Verificando status...${NC}"
  pm2 status alyacrm

  echo ""
  echo -e "${GREEN}✓ Servidor reiniciado${NC}"
else
  echo -e "${YELLOW}⚠️  Lembre de reiniciar manualmente: pm2 restart alyacrm${NC}"
fi

# ───────────────────────────────────────────────────────────────
#  RESUMO
# ───────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ ROTAÇÃO CONCLUÍDA${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📋 ${BLUE}Próximos passos:${NC}"
echo ""
echo "   1. Teste o login: curl -X POST http://localhost:3001/api/auth/login"
echo "   2. Verifique logs: pm2 logs alyacrm --lines 50"
echo "   3. Teste webhook n8n com nova API_KEY"
echo "   4. Delete keys antigas nos painéis (Google, OpenAI)"
echo "   5. Documente data da rotação em SECURITY.md"
echo ""
echo -e "📦 ${BLUE}Backup do .env anterior:${NC} $BACKUP_FILE"
echo -e "   ${YELLOW}(Mantenha este backup por 30 dias, depois delete)${NC}"
echo ""
echo -e "📅 ${BLUE}Próxima rotação agendada:${NC} $(date -d '+90 days' +%Y-%m-%d)"
echo ""

exit 0
