# ===========================================
# DEPLOY CRM ALYA - INSTRUÇÕES PASSO A PASSO
# ===========================================

## PARTE 1: Upload dos Arquivos (No seu computador Windows)

### Passo 1.1: Abra o PowerShell e execute:

```powershell
cd "F:\Projetos IA\CRM_Alya_Verdent\alya-crm-new"
scp alya-crm.zip root@76.13.81.66:/root/
```

Quando pedir a senha, digite: Crm@lya270823

---

## PARTE 2: Configuração na VPS (Via Terminal Hostinger)

### Passo 2.1: Acesse o Terminal
- No painel Hostinger, clique no botão "Terminal"
- Ou conecte via SSH: ssh root@76.13.81.66

### Passo 2.2: Preparar diretórios
```bash
mkdir -p /opt/alya-crm
cd /root
unzip alya-crm.zip -d /opt/alya-crm/
cd /opt/alya-crm
```

### Passo 2.3: Criar arquivo .env
```bash
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://fwuoqtqfchnbstxjjnvn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dW9xdHFmY2huYnN0eGpqbnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODY1NjMsImV4cCI6MjA4MzQ2MjU2M30.a-BYAiYfmrdQ8MJECg7KIZXLGBGgcXyHrLuFF0t1IAw
EOF
```

### Passo 2.4: Instalar Docker (se necessário)
```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

### Passo 2.5: Configurar Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### Passo 2.6: Build e Deploy
```bash
cd /opt/alya-crm
docker compose up -d --build
```

### Passo 2.7: Verificar
```bash
docker compose ps
docker compose logs -f
```

---

## PARTE 3: Configurar DNS

No painel onde registrou o domínio alyacrm.com.br, adicione:

| Tipo | Nome | Valor |
|------|------|-------|
| A | @ | 76.13.81.66 |
| A | www | 76.13.81.66 |

---

## PARTE 4: Configurar SSL (Opcional - após DNS propagar)

```bash
cd /opt/alya-crm
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```

---

## VERIFICAÇÃO FINAL

Acesse:
- http://76.13.81.66 (IP direto)
- http://alyacrm.com.br (após DNS propagar)
- https://alyacrm.com.br (após SSL configurado)

---

## COMANDOS ÚTEIS

```bash
# Ver logs em tempo real
docker compose logs -f

# Reiniciar aplicação
docker compose restart

# Parar aplicação
docker compose down

# Atualizar aplicação
docker compose down
docker compose up -d --build

# Ver uso de recursos
docker stats
```

---

## TROUBLESHOOTING

### Se o build falhar:
```bash
docker compose logs app
```

### Se a página não carregar:
```bash
docker compose ps
curl http://localhost
```

### Se precisar reinstalar:
```bash
docker compose down -v
docker system prune -af
docker compose up -d --build
```
