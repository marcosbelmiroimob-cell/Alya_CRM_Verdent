-- ================================================
-- CONFIGURAÇÃO RLS PARA ALYA CRM
-- ================================================
-- Execute no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/fwuoqtqfchnbstxjjnvn/sql/new
-- ================================================

-- 1. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negociacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Usuarios veem proprio perfil" ON public.perfis;
DROP POLICY IF EXISTS "Usuarios podem criar proprio perfil" ON public.perfis;
DROP POLICY IF EXISTS "Usuarios podem atualizar proprio perfil" ON public.perfis;
DROP POLICY IF EXISTS "Admin acesso total perfis" ON public.perfis;

DROP POLICY IF EXISTS "Usuarios veem proprios leads" ON public.leads;
DROP POLICY IF EXISTS "Usuarios podem criar leads" ON public.leads;
DROP POLICY IF EXISTS "Usuarios podem atualizar leads" ON public.leads;
DROP POLICY IF EXISTS "Usuarios podem deletar leads" ON public.leads;
DROP POLICY IF EXISTS "Admin acesso total leads" ON public.leads;

DROP POLICY IF EXISTS "Usuarios veem proprios imoveis" ON public.imoveis;
DROP POLICY IF EXISTS "Usuarios podem criar imoveis" ON public.imoveis;
DROP POLICY IF EXISTS "Usuarios podem atualizar imoveis" ON public.imoveis;
DROP POLICY IF EXISTS "Usuarios podem deletar imoveis" ON public.imoveis;
DROP POLICY IF EXISTS "Admin acesso total imoveis" ON public.imoveis;

DROP POLICY IF EXISTS "Usuarios veem proprias negociacoes" ON public.negociacoes;
DROP POLICY IF EXISTS "Usuarios podem criar negociacoes" ON public.negociacoes;
DROP POLICY IF EXISTS "Usuarios podem atualizar negociacoes" ON public.negociacoes;
DROP POLICY IF EXISTS "Usuarios podem deletar negociacoes" ON public.negociacoes;
DROP POLICY IF EXISTS "Admin acesso total negociacoes" ON public.negociacoes;

DROP POLICY IF EXISTS "Usuarios veem proprias atividades" ON public.atividades;
DROP POLICY IF EXISTS "Usuarios podem criar atividades" ON public.atividades;
DROP POLICY IF EXISTS "Usuarios podem atualizar atividades" ON public.atividades;
DROP POLICY IF EXISTS "Usuarios podem deletar atividades" ON public.atividades;

-- ================================================
-- 3. POLÍTICAS PARA PERFIS
-- ================================================

-- Usuário pode ver seu próprio perfil
CREATE POLICY "Usuarios veem proprio perfil" ON public.perfis
  FOR SELECT USING (auth.uid() = id);

-- Usuário pode criar seu próprio perfil (necessário após signup)
CREATE POLICY "Usuarios podem criar proprio perfil" ON public.perfis
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuário pode atualizar seu próprio perfil
CREATE POLICY "Usuarios podem atualizar proprio perfil" ON public.perfis
  FOR UPDATE USING (auth.uid() = id);

-- ================================================
-- 4. POLÍTICAS PARA LEADS
-- ================================================

-- Usuário vê apenas seus próprios leads
CREATE POLICY "Usuarios veem proprios leads" ON public.leads
  FOR SELECT USING (auth.uid() = usuario_id);

-- Usuário pode criar leads associados a si mesmo
CREATE POLICY "Usuarios podem criar leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Usuário pode atualizar seus próprios leads
CREATE POLICY "Usuarios podem atualizar leads" ON public.leads
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Usuário pode deletar seus próprios leads
CREATE POLICY "Usuarios podem deletar leads" ON public.leads
  FOR DELETE USING (auth.uid() = usuario_id);

-- ================================================
-- 5. POLÍTICAS PARA IMÓVEIS
-- ================================================

-- Usuário vê apenas seus próprios imóveis
CREATE POLICY "Usuarios veem proprios imoveis" ON public.imoveis
  FOR SELECT USING (auth.uid() = usuario_id);

-- Usuário pode criar imóveis associados a si mesmo
CREATE POLICY "Usuarios podem criar imoveis" ON public.imoveis
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Usuário pode atualizar seus próprios imóveis
CREATE POLICY "Usuarios podem atualizar imoveis" ON public.imoveis
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Usuário pode deletar seus próprios imóveis
CREATE POLICY "Usuarios podem deletar imoveis" ON public.imoveis
  FOR DELETE USING (auth.uid() = usuario_id);

-- ================================================
-- 6. POLÍTICAS PARA NEGOCIAÇÕES
-- ================================================

-- Usuário vê apenas suas próprias negociações
CREATE POLICY "Usuarios veem proprias negociacoes" ON public.negociacoes
  FOR SELECT USING (auth.uid() = usuario_id);

-- Usuário pode criar negociações associadas a si mesmo
CREATE POLICY "Usuarios podem criar negociacoes" ON public.negociacoes
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Usuário pode atualizar suas próprias negociações
CREATE POLICY "Usuarios podem atualizar negociacoes" ON public.negociacoes
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Usuário pode deletar suas próprias negociações
CREATE POLICY "Usuarios podem deletar negociacoes" ON public.negociacoes
  FOR DELETE USING (auth.uid() = usuario_id);

-- ================================================
-- 7. POLÍTICAS PARA ATIVIDADES
-- ================================================

-- Usuário vê apenas atividades de suas negociações
CREATE POLICY "Usuarios veem proprias atividades" ON public.atividades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.negociacoes 
      WHERE negociacoes.id = atividades.negociacao_id 
      AND negociacoes.usuario_id = auth.uid()
    )
  );

-- Usuário pode criar atividades em suas negociações
CREATE POLICY "Usuarios podem criar atividades" ON public.atividades
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.negociacoes 
      WHERE negociacoes.id = negociacao_id 
      AND negociacoes.usuario_id = auth.uid()
    )
  );

-- Usuário pode atualizar atividades de suas negociações
CREATE POLICY "Usuarios podem atualizar atividades" ON public.atividades
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.negociacoes 
      WHERE negociacoes.id = atividades.negociacao_id 
      AND negociacoes.usuario_id = auth.uid()
    )
  );

-- Usuário pode deletar atividades de suas negociações
CREATE POLICY "Usuarios podem deletar atividades" ON public.atividades
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.negociacoes 
      WHERE negociacoes.id = atividades.negociacao_id 
      AND negociacoes.usuario_id = auth.uid()
    )
  );

-- ================================================
-- 8. VERIFICAR CONFIGURAÇÃO
-- ================================================
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Listar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
