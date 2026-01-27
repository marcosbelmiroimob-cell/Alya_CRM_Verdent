# DEPLOY ALYA CRM - INSTRUÇÕES PASSO A PASSO

## Pré-requisitos
- VPS Hostinger com Ubuntu 24.04
- Acesso ao terminal web via painel Hostinger
- IP: 76.13.81.66

---

## OPÇÃO 1: Script Completo (Recomendado)

1. Acesse o terminal web da VPS no painel Hostinger
2. Copie e cole TODO o conteúdo abaixo:

```bash
cd /tmp && curl -fsSL https://raw.githubusercontent.com/marcosbelmiroimob-cell/Alya_CRM_Verdent/master/alya-crm-new/deploy-hostinger.sh | bash
```

Se o curl não funcionar, siga a OPÇÃO 2.

---

## OPÇÃO 2: Comandos Manuais (um por vez)

### Passo 1: Instalar Docker
```bash
apt-get update && apt-get install -y docker.io docker-compose-v2 && systemctl start docker && systemctl enable docker
```

### Passo 2: Limpar instalação anterior
```bash
docker stop $(docker ps -q --filter "publish=80") 2>/dev/null; docker rm -f alya-crm-app 2>/dev/null; rm -rf /opt/alya-crm
```

### Passo 3: Clonar repositório
```bash
mkdir -p /opt/alya-crm && cd /opt/alya-crm && git clone https://github.com/marcosbelmiroimob-cell/Alya_CRM_Verdent.git . && cd alya-crm-new
```

### Passo 4: Criar arquivo .env
```bash
cat > /opt/alya-crm/alya-crm-new/.env << 'ENVFILE'
VITE_SUPABASE_URL=https://fwuoqtqfchnbstxjjnvn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dW9xdHFmY2huYnN0eGpqbnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODY1NjMsImV4cCI6MjA4MzQ2MjU2M30.a-BYAiYfmrdQ8MJECg7KIZXLGBGgcXyHrLuFF0t1IAw
ENVFILE
```

### Passo 5: Build e deploy
```bash
cd /opt/alya-crm/alya-crm-new && docker compose up -d --build
```

### Passo 6: Verificar
```bash
docker compose ps
```

---

## Verificação Final

Após o deploy, acesse:
- http://76.13.81.66 (deve carregar a tela de login)

Se aparecer erro 502 ou não carregar, verifique os logs:
```bash
docker compose logs -f
```

---

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `docker compose ps` | Ver status dos containers |
| `docker compose logs -f` | Ver logs em tempo real |
| `docker compose restart` | Reiniciar o app |
| `docker compose down` | Parar tudo |
| `docker compose up -d --build` | Reconstruir e iniciar |

---

## Configurar Domínio (alyacrm.com.br)

No painel do seu registrador DNS, adicione:
- Tipo: A
- Nome: @ (ou deixe vazio)
- Valor: 76.13.81.66
- TTL: 3600

Para www:
- Tipo: CNAME
- Nome: www
- Valor: alyacrm.com.br
