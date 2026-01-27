# Integração n8n - Alya CRM API

## Endpoint de Webhook

**URL:** `POST /api/v1/leads/webhook`

### Headers Obrigatórios

| Header | Valor |
|--------|-------|
| `Content-Type` | `application/json` |
| `X-API-Key` | `sua_api_key` |

### Payload (Body)

```json
{
  "name": "Nome do Lead",
  "email": "email@exemplo.com",
  "phone": "(11) 99999-9999",
  "source": "Website Form",
  "campaign": "Campanha Janeiro 2024",
  "message": "Mensagem ou observação",
  "budget_min": 500000,
  "budget_max": 800000,
  "user_id": "uuid-do-usuario (opcional)"
}
```

### Campos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | Nome completo do lead |
| `email` | string | Não | Email do lead |
| `phone` | string | Não | Telefone do lead |
| `source` | string | Sim | Origem do lead (ver mapeamento abaixo) |
| `campaign` | string | Não | Nome da campanha de marketing |
| `message` | string | Não | Mensagem ou observação adicional |
| `budget_min` | number | Não | Orçamento mínimo em reais |
| `budget_max` | number | Não | Orçamento máximo em reais |
| `user_id` | string | Não | UUID do usuário dono do lead |

### Mapeamento de Origens (source → origem)

| source (n8n) | origem (CRM) |
|--------------|--------------|
| `website`, `website form`, `site` | SITE |
| `google ads`, `google` | GOOGLE_ADS |
| `instagram`, `instagram ads` | INSTAGRAM |
| `facebook`, `facebook ads` | FACEBOOK |
| `whatsapp`, `whatsapp button` | WHATSAPP |
| `indicacao`, `referral` | INDICACAO |
| outros valores | MANUAL |

### Resposta de Sucesso (201)

```json
{
  "success": true,
  "lead_id": "uuid-do-lead",
  "deal_id": "uuid-da-negociacao",
  "message": "Lead criado com sucesso"
}
```

### Erros Comuns

| Código | Erro | Solução |
|--------|------|---------|
| 401 | API key required | Adicione header `X-API-Key` |
| 401 | Invalid API key | Verifique a chave no .env |
| 400 | Validation error | Verifique campos obrigatórios |
| 429 | Rate limit exceeded | Aguarde 1 minuto |
| 500 | Server error | Verifique logs da API |

---

## Configuração no n8n

### 1. Criar Credencial HTTP

1. Acesse **Credentials** no n8n
2. Clique em **New Credential** > **HTTP Request**
3. Configure:
   - **Authentication:** Header Auth
   - **Header Name:** `X-API-Key`
   - **Header Value:** sua chave do WEBHOOK_API_KEY
   - **Name:** `Alya CRM Webhook`

### 2. Workflow: Formulário Website

```
[Webhook Trigger] → [Set Node] → [HTTP Request]
```

**Set Node:**
```json
{
  "name": "={{ $json.form_nome }}",
  "email": "={{ $json.form_email }}",
  "phone": "={{ $json.form_telefone }}",
  "source": "Website Form"
}
```

**HTTP Request:**
- Method: `POST`
- URL: `http://76.13.81.66/api/v1/leads/webhook`
- Credentials: `Alya CRM Webhook`
- Body: `JSON`

### 3. Workflow: Google/Meta Ads

```
[Google Sheets Trigger] → [Split In Batches] → [Set Node] → [HTTP Request]
```

**Set Node:**
```json
{
  "name": "={{ $json.nome }}",
  "email": "={{ $json.email }}",
  "phone": "={{ $json.telefone }}",
  "source": "Google Ads",
  "campaign": "={{ $json.campanha }}"
}
```

### 4. Workflow: WhatsApp Button

```
[Webhook Trigger] → [Set Node] → [HTTP Request] → [Respond to Webhook]
```

**Respond to Webhook:**
- Response Mode: `Redirect`
- Redirect URL: `https://wa.me/5511999999999?text=Olá`

---

## Variáveis de Ambiente (API)

```env
# Obtenha no Dashboard Supabase > Settings > API
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Chave de autenticação para n8n
WEBHOOK_API_KEY=alya_wh_n8n_2024_secure_key
```

---

## Teste via cURL

```bash
curl -X POST http://76.13.81.66/api/v1/leads/webhook \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key" \
  -d '{
    "name": "Lead Teste n8n",
    "email": "teste@n8n.com",
    "phone": "(11) 99999-0000",
    "source": "Website Form"
  }'
```

---

## Verificação

1. **Health Check:** `GET http://76.13.81.66/api/v1/leads/webhook/test`
2. **API Status:** `GET http://76.13.81.66/health`
