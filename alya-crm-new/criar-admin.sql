-- ================================================
-- CRIAR USUÁRIO ADMINISTRADOR - ALYA CRM
-- ================================================
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/fwuoqtqfchnbstxjjnvn/sql/new
-- ================================================

-- PASSO 1: Criar usuário na tabela auth.users via Supabase Auth
-- IMPORTANTE: Isso deve ser feito via Dashboard > Authentication > Users > Add User
-- Email: marcosbelmiro.imob@gmail.com
-- Password: M@rcos123@
-- Marque "Auto Confirm User" para não precisar confirmar email

-- PASSO 2: Após criar o usuário no Auth, copie o UUID gerado e execute:
-- (Substitua 'SEU_USER_ID_AQUI' pelo UUID real do usuário criado)

-- Inserir perfil do admin
INSERT INTO public.perfis (id, nome, email, telefone, creci, plano, criado_em, atualizado_em)
VALUES (
  'SEU_USER_ID_AQUI',  -- Substituir pelo UUID do usuário criado
  'Marcos Belmiro',
  'marcosbelmiro.imob@gmail.com',
  NULL,
  NULL,
  'ADMIN_MASTER',  -- Plano especial de admin
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  plano = 'ADMIN_MASTER',
  atualizado_em = NOW();

-- PASSO 3: Criar política de admin que permite acesso total
-- (Executar apenas uma vez)

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

-- Política para atividades - Admin vê tudo  
DROP POLICY IF EXISTS "Admin acesso total atividades" ON public.atividades;
CREATE POLICY "Admin acesso total atividades" ON public.atividades
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.negociacoes n
      WHERE n.id = negociacao_id AND (
        n.usuario_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.perfis 
          WHERE id = auth.uid() AND plano = 'ADMIN_MASTER'
        )
      )
    )
  );

-- ================================================
-- VERIFICAÇÃO
-- ================================================
-- Após executar, verifique se o usuário foi criado:
-- SELECT * FROM public.perfis WHERE email = 'marcosbelmiro.imob@gmail.com';
