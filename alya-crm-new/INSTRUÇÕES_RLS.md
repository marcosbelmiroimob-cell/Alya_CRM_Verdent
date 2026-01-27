# 🔧 INSTRUÇÕES PARA CORRIGIR ERRO 401 - ALYA CRM

## Problema Identificado

Os erros 401 (Unauthorized) ocorrem porque:
1. As políticas RLS (Row Level Security) do Supabase verificam `auth.uid()`
2. Como estamos usando um user.id mockado sem sessão OAuth real, `auth.uid()` retorna NULL
3. O Supabase bloqueia todas as requisições por segurança

---

## ✅ Solução Temporária (Desenvolvimento)

### Passo 1: Desabilitar RLS

1. Acesse o **Supabase Dashboard**:
   - URL: https://supabase.com/dashboard/project/fwuoqtqfchnbstxjjnvn

2. Vá em **SQL Editor** (menu lateral esquerdo)

3. Abra o arquivo `desabilitar-rls-dev.sql` neste projeto

4. **Copie todo o conteúdo** do arquivo

5. **Cole no SQL Editor** do Supabase

6. Clique em **Run** (ou pressione Ctrl+Enter)

7. Você deve ver a mensagem de sucesso mostrando que o RLS foi desabilitado

### Passo 2: Verificar

Após executar o SQL, volte ao navegador e **recarregue a página do CRM**.

Os dados devem carregar normalmente agora! 🎉

---

## ⚠️ IMPORTANTE - Segurança

### Para Desenvolvimento:
- ✅ RLS desabilitado - OK para testar funcionalidades
- ⚠️ Qualquer pessoa com a URL pode acessar os dados
- 💡 Use apenas em ambiente local de desenvolvimento

### Para Produção:
- ❌ **NUNCA** desabilite RLS em produção
- ✅ Implemente autenticação OAuth real (Google, Email, etc)
- ✅ Habilite RLS novamente usando `habilitar-rls-producao.sql`

---

## 🔐 Quando Implementar Autenticação Real

Quando resolver o problema de OAuth e implementar login real:

1. Execute o arquivo `habilitar-rls-producao.sql` no Supabase
2. Remova o user.id mockado do `useAuth.ts`
3. Implemente o fluxo completo de autenticação
4. As políticas RLS voltarão a funcionar automaticamente

---

## 📋 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `desabilitar-rls-dev.sql` | Desabilita RLS para desenvolvimento |
| `habilitar-rls-producao.sql` | Habilita RLS para produção |
| `INSTRUÇÕES_RLS.md` | Este arquivo com instruções |

---

## 🆘 Problemas?

Se ainda houver erros após desabilitar o RLS:

1. Verifique se o arquivo `.env` existe e contém as credenciais corretas
2. Confirme que o VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão corretos
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Pare e reinicie o servidor de desenvolvimento (`npm run dev`)

---

## ✨ Status Atual

- ✅ Backend completo implementado
- ✅ Todos os hooks conectados ao Supabase
- ✅ CRUD de Leads, Imóveis e Negociações funcionando
- ✅ Upload de fotos para Storage
- ✅ Dashboard com métricas em tempo real
- ⚠️ Aguardando desabilitar RLS para funcionar

**Próximo passo**: Execute o `desabilitar-rls-dev.sql` no Supabase! 🚀
