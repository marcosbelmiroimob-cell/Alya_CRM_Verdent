-- ================================
-- ALYA CRM - SETUP SUPABASE
-- ================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/fwuoqtqfchnbstxjjnvn/sql/new

-- 1. FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. TABELA PERFIS
CREATE TABLE public.perfis (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  creci TEXT,
  avatar_url TEXT,
  plano TEXT DEFAULT 'CORRETOR_SOLO',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem proprio perfil" ON public.perfis
  FOR ALL USING (auth.uid() = id);

CREATE TRIGGER perfis_updated_at
  BEFORE UPDATE ON public.perfis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 3. TABELA LEADS
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.perfis(id) NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  origem TEXT DEFAULT 'MANUAL',
  orcamento_min DECIMAL(15,2),
  orcamento_max DECIMAL(15,2),
  preferencias JSONB DEFAULT '{}',
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem proprios leads" ON public.leads
  FOR ALL USING (auth.uid() = usuario_id);

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. TABELA IMOVEIS
CREATE TABLE public.imoveis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.perfis(id) NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  valor DECIMAL(15,2) NOT NULL,
  area_m2 DECIMAL(10,2),
  quartos INTEGER DEFAULT 0,
  banheiros INTEGER DEFAULT 0,
  vagas INTEGER DEFAULT 0,
  condominio DECIMAL(10,2),
  iptu DECIMAL(10,2),
  descricao TEXT,
  caracteristicas JSONB DEFAULT '[]',
  fotos JSONB DEFAULT '[]',
  status TEXT DEFAULT 'DISPONIVEL',
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem proprios imoveis" ON public.imoveis
  FOR ALL USING (auth.uid() = usuario_id);

CREATE TRIGGER imoveis_updated_at
  BEFORE UPDATE ON public.imoveis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5. TABELA NEGOCIACOES
CREATE TABLE public.negociacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.perfis(id) NOT NULL,
  lead_id UUID REFERENCES public.leads(id) NOT NULL,
  imovel_id UUID REFERENCES public.imoveis(id),
  etapa TEXT DEFAULT 'PRIMEIRO_CONTATO',
  prioridade TEXT DEFAULT 'MEDIA',
  valor_proposta DECIMAL(15,2),
  data_proxima_acao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.negociacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem proprias negociacoes" ON public.negociacoes
  FOR ALL USING (auth.uid() = usuario_id);

CREATE TRIGGER negociacoes_updated_at
  BEFORE UPDATE ON public.negociacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 6. TABELA ATIVIDADES
CREATE TABLE public.atividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  negociacao_id UUID REFERENCES public.negociacoes(id) NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT,
  data_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  concluida BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem proprias atividades" ON public.atividades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.negociacoes n 
      WHERE n.id = negociacao_id AND n.usuario_id = auth.uid()
    )
  );

-- ================================
-- STORAGE: BUCKET PARA FOTOS
-- ================================
-- Execute separadamente no painel Storage
-- Nome do bucket: imoveis-fotos
-- Public: Yes

-- Depois execute estas políticas:
/*
CREATE POLICY "Public read access" ON storage.objects FOR SELECT
  USING (bucket_id = 'imoveis-fotos');

CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'imoveis-fotos' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users delete own files" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'imoveis-fotos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
*/
