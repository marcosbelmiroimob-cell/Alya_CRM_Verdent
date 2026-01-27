-- ================================================
-- CRIAR PERFIL ADMIN - ALYA CRM
-- ================================================
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/fwuoqtqfchnbstxjjnvn/sql/new
-- ================================================

-- 1. Inserir perfil do admin
INSERT INTO public.perfis (id, nome, email, telefone, creci, plano, criado_em, atualizado_em)
VALUES (
  '6b09f96c-17d8-4647-b524-04117e220e9',
  'Marcos Belmiro',
  'marcosbelmiro.imob@gmail.com',
  NULL,
  NULL,
  'ADMIN_MASTER',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  plano = 'ADMIN_MASTER',
  nome = 'Marcos Belmiro',
  atualizado_em = NOW();

-- 2. Políticas de Admin (acesso total)

-- Política para perfis - Admin vê tudo
DROP POLICY IF EXISTS "Admin acesso total perfis" ON public.perfis;
CREATE POLICY "Admin acesso total perfis" ON public.perfis
  FOR ALL
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.perfis 
      WHERE id = auth.uid() AND plano = 'ADMIN_MASTER'
    )
  );

-- Política para leads - Admin vê tudo
DROP POLICY IF EXISTS "Admin acesso total leads" ON public.leads;
CREATE POLICY "Admin acesso total leads" ON public.leads
  FOR ALL
  USING (
    auth.uid() = usuario_id 
    OR EXISTS (
      SELECT 1 FROM public.perfis 
      WHERE id = auth.uid() AND plano = 'ADMIN_MASTER'
    )
  );

-- Política para imoveis - Admin vê tudo
DROP POLICY IF EXISTS "Admin acesso total imoveis" ON public.imoveis;
CREATE POLICY "Admin acesso total imoveis" ON public.imoveis
  FOR ALL
  USING (
    auth.uid() = usuario_id 
    OR EXISTS (
      SELECT 1 FROM public.perfis 
      WHERE id = auth.uid() AND plano = 'ADMIN_MASTER'
    )
  );

-- Política para negociacoes - Admin vê tudo
DROP POLICY IF EXISTS "Admin acesso total negociacoes" ON public.negociacoes;
CREATE POLICY "Admin acesso total negociacoes" ON public.negociacoes
  FOR ALL
  USING (
    auth.uid() = usuario_id 
    OR EXISTS (
      SELECT 1 FROM public.perfis 
      WHERE id = auth.uid() AND plano = 'ADMIN_MASTER'
    )
  );

-- 3. Verificar se foi criado
SELECT * FROM public.perfis WHERE email = 'marcosbelmiro.imob@gmail.com';
