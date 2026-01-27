# Deploy CRM Alya - Guia Completo

## Pré-requisitos

1. **Credenciais Supabase**
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

2. **Certificados SSL**
   - Certificado: `alyacrm.crt`
   - Chave privada: `alyacrm.key`

3. **Acesso SSH à VPS**
   - IP: 76.13.81.66
   - Usuário: root

---

## Passo 1: Configurar Variáveis de Ambiente

Crie o arquivo `.env` na pasta `alya-crm-new`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

---

## Passo 2: Configurar DNS

No painel do seu provedor de domínio, adicione:

| Tipo | Nome | Valor |
|------|------|-------|
| A | @ | 76.13.81.66 |
| A | www | 76.13.81.66 |

---

## Passo 3: Upload para VPS

### Windows (PowerShell):

```powershell
# Navegar para o projeto
cd "F:\Projetos IA\CRM_Alya_Verdent\alya-crm-new"

# Comprimir (excluindo node_modules)
tar -czvf alya-crm.tar.gz --exclude=node_modules --exclude=.git .

# Enviar para VPS
scp alya-crm.tar.gz root@76.13.81.66:/opt/alya-crm/
```

### Enviar certificados SSL:

```powershell
scp seu_certificado.crt root@76.13.81.66:/opt/alya-crm/ssl/alyacrm.crt
scp sua_chave_privada.key root@76.13.81.66:/opt/alya-crm/ssl/alyacrm.key
```

---

## Passo 4: Deploy na VPS

### Conectar via SSH:

```bash
ssh root@76.13.81.66
```

### Preparar diretórios:

```bash
mkdir -p /opt/alya-crm/ssl
cd /opt/alya-crm
tar -xzvf alya-crm.tar.gz
rm alya-crm.tar.gz
chmod +x deploy.sh
```

### Criar arquivo .env:

```bash
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
EOF
```

### Executar deploy:

```bash
./deploy.sh
```

---

## Passo 5: Verificação

1. Acesse https://alyacrm.com.br
2. Verifique se o login funciona
3. Teste as funcionalidades principais

### Comandos úteis:

```bash
# Ver logs
docker compose logs -f

# Ver status
docker compose ps

# Reiniciar
docker compose restart

# Parar tudo
docker compose down

# Atualizar (após novo upload)
docker compose up -d --build
```

---

## Troubleshooting

### Container não inicia:
```bash
docker compose logs app
docker compose logs nginx
```

### Erro de SSL:
- Verifique se os arquivos estão em `/opt/alya-crm/ssl/`
- Verifique permissões: `chmod 644 ssl/*.crt && chmod 600 ssl/*.key`

### Erro de DNS:
```bash
nslookup alyacrm.com.br
# Deve retornar 76.13.81.66
```

### Firewall:
```bash
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
```
