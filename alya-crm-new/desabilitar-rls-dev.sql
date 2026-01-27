-- ================================================
-- DESABILITAR RLS TEMPORARIAMENTE (APENAS DESENVOLVIMENTO)
-- ================================================
-- ATENÇÃO: Execute isso APENAS em ambiente de desenvolvimento
-- Em produção, use autenticação real com auth.uid()
-- ================================================

-- Desabilitar RLS em todas as tabelas
ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.imoveis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.negociacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades DISABLE ROW LEVEL SECURITY;

-- Tabelas de Lançamentos
ALTER TABLE public.empreendimentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipologias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades DISABLE ROW LEVEL SECURITY;

-- Tabela de Imóveis Usados
ALTER TABLE public.imoveis_usados DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
