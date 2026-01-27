-- ============================================================
-- SCRIPT UNIFICADO: VERIFICAR E CRIAR TODAS AS TABELAS
-- CRM Alya - Execute este script para garantir estrutura completa
-- ============================================================
-- INSTRUÇÕES:
-- 1. Acesse Supabase Dashboard → SQL Editor
-- 2. Cole e execute este script completo
-- 3. Depois execute desabilitar-rls-dev.sql para ambiente de dev
-- ============================================================

-- ============================================================
-- PARTE 1: TABELA PERFIS (Base para todas as outras)
-- ============================================================

CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT,
    avatar_url TEXT,
    creci TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARTE 2: TABELA LEADS (Com todos os campos necessários)
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    cpf VARCHAR(20),
    rg VARCHAR(30),
    data_nascimento DATE,
    profissao VARCHAR(100),
    estado_civil VARCHAR(20),
    renda_mensal DECIMAL(12,2),
    origem TEXT DEFAULT 'MANUAL',
    orcamento_min DECIMAL(15,2),
    orcamento_max DECIMAL(15,2),
    preferencias JSONB DEFAULT '{}',
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas se tabela já existir mas sem os campos
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cpf VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS rg VARCHAR(30);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS profissao VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS renda_mensal DECIMAL(12,2);

-- Índice para CPF
CREATE INDEX IF NOT EXISTS idx_leads_cpf ON leads(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_usuario ON leads(usuario_id);

-- ============================================================
-- PARTE 3: TABELA IMOVEIS (Legado)
-- ============================================================

CREATE TABLE IF NOT EXISTS imoveis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    area_m2 DECIMAL(10,2),
    quartos INTEGER DEFAULT 0,
    banheiros INTEGER DEFAULT 0,
    vagas INTEGER DEFAULT 0,
    endereco TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    descricao TEXT,
    imagens TEXT[] DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_imoveis_usuario ON imoveis(usuario_id);

-- ============================================================
-- PARTE 4: TABELA NEGOCIACOES
-- ============================================================

CREATE TABLE IF NOT EXISTS negociacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    imovel_id UUID REFERENCES imoveis(id) ON DELETE SET NULL,
    etapa TEXT NOT NULL DEFAULT 'NOVO_LEAD',
    prioridade TEXT DEFAULT 'MEDIA',
    valor_proposta DECIMAL(15,2),
    data_proxima_acao DATE,
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_negociacoes_usuario ON negociacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_negociacoes_lead ON negociacoes(lead_id);
CREATE INDEX IF NOT EXISTS idx_negociacoes_etapa ON negociacoes(etapa);

-- ============================================================
-- PARTE 5: TABELA ATIVIDADES
-- ============================================================

CREATE TABLE IF NOT EXISTS atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    negociacao_id UUID REFERENCES negociacoes(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data_realizacao TIMESTAMPTZ DEFAULT NOW(),
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atividades_usuario ON atividades(usuario_id);
CREATE INDEX IF NOT EXISTS idx_atividades_negociacao ON atividades(negociacao_id);

-- ============================================================
-- PARTE 6: TABELAS DE LANÇAMENTOS (3 Níveis)
-- ============================================================

-- Nível A: Empreendimentos
CREATE TABLE IF NOT EXISTS empreendimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    construtora VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'LANCAMENTO' CHECK (status IN ('LANCAMENTO', 'EM_OBRAS', 'PRONTO')),
    previsao_entrega DATE,
    endereco TEXT,
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado CHAR(2),
    cep VARCHAR(10),
    diferenciais JSONB DEFAULT '{
        "iptu_verde": false,
        "coworking": false,
        "lavanderia": false,
        "academia": false,
        "rooftop": false,
        "piscina": false,
        "churrasqueira": false,
        "playground": false,
        "salao_festas": false,
        "portaria_24h": false,
        "bicicletario": false,
        "pet_place": false
    }'::jsonb,
    descricao TEXT,
    imagem_capa TEXT,
    imagens TEXT[] DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empreendimentos_usuario ON empreendimentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_empreendimentos_status ON empreendimentos(status);
CREATE INDEX IF NOT EXISTS idx_empreendimentos_ativo ON empreendimentos(ativo);

-- Nível B: Tipologias
CREATE TABLE IF NOT EXISTS tipologias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empreendimento_id UUID NOT NULL REFERENCES empreendimentos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    area_privativa DECIMAL(10, 2) NOT NULL,
    dormitorios INTEGER DEFAULT 0,
    suites INTEGER DEFAULT 0,
    banheiros INTEGER DEFAULT 0,
    vagas INTEGER DEFAULT 0,
    unidades_finais TEXT,
    destaque TEXT,
    planta_url TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tipologias_empreendimento ON tipologias(empreendimento_id);

-- Nível C: Unidades
CREATE TABLE IF NOT EXISTS unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipologia_id UUID NOT NULL REFERENCES tipologias(id) ON DELETE CASCADE,
    numero VARCHAR(20) NOT NULL,
    andar INTEGER NOT NULL,
    valor_tabela DECIMAL(15, 2) NOT NULL,
    vagas_garagem INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DISPONIVEL' CHECK (status IN ('DISPONIVEL', 'RESERVADA', 'VENDIDA')),
    observacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tipologia_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_unidades_tipologia ON unidades(tipologia_id);
CREATE INDEX IF NOT EXISTS idx_unidades_status ON unidades(status);

-- ============================================================
-- PARTE 7: TABELA IMÓVEIS USADOS
-- ============================================================

CREATE TABLE IF NOT EXISTS imoveis_usados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('APARTAMENTO', 'CASA', 'COBERTURA', 'TERRENO', 'COMERCIAL', 'RURAL')),
    valor_venda DECIMAL(15, 2) NOT NULL,
    condominio DECIMAL(10, 2),
    iptu DECIMAL(10, 2),
    area_m2 DECIMAL(10, 2) NOT NULL,
    andar INTEGER,
    posicao_solar VARCHAR(30) CHECK (posicao_solar IN ('NASCENTE_TOTAL', 'NASCENTE_NORTE', 'NASCENTE_SUL', 'POENTE', 'NORTE', 'SUL')),
    dormitorios INTEGER DEFAULT 0,
    suites INTEGER DEFAULT 0,
    banheiros INTEGER DEFAULT 0,
    vagas INTEGER DEFAULT 0,
    tipo_vaga VARCHAR(20) CHECK (tipo_vaga IN ('SOLTA', 'PRESA', 'COBERTA', 'DESCOBERTA')),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('ORIGINAL', 'REFORMADO', 'SEMIMOBILIADO', 'PORTEIRA_FECHADA')),
    motivo_venda TEXT,
    endereco TEXT,
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado_uf CHAR(2),
    cep VARCHAR(10),
    descricao TEXT,
    caracteristicas TEXT[] DEFAULT '{}',
    fotos TEXT[] DEFAULT '{}',
    video_url TEXT,
    tour_virtual_url TEXT,
    status VARCHAR(20) DEFAULT 'DISPONIVEL' CHECK (status IN ('DISPONIVEL', 'RESERVADO', 'VENDIDO')),
    ativo BOOLEAN DEFAULT true,
    destaque BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_imoveis_usados_usuario ON imoveis_usados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_usados_tipo ON imoveis_usados(tipo);
CREATE INDEX IF NOT EXISTS idx_imoveis_usados_status ON imoveis_usados(status);
CREATE INDEX IF NOT EXISTS idx_imoveis_usados_ativo ON imoveis_usados(ativo);

-- ============================================================
-- PARTE 8: TRIGGER PARA ATUALIZADO_EM
-- ============================================================

CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers (DROP IF EXISTS para evitar duplicatas)
DROP TRIGGER IF EXISTS trigger_perfis_atualizado ON perfis;
CREATE TRIGGER trigger_perfis_atualizado
    BEFORE UPDATE ON perfis
    FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_leads_atualizado ON leads;
CREATE TRIGGER trigger_leads_atualizado
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_imoveis_atualizado ON imoveis;
CREATE TRIGGER trigger_imoveis_atualizado
    BEFORE UPDATE ON imoveis
    FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_negociacoes_atualizado ON negociacoes;
CREATE TRIGGER trigger_negociacoes_atualizado
    BEFORE UPDATE ON negociacoes
    FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_empreendimentos_atualizado ON empreendimentos;
CREATE TRIGGER trigger_empreendimentos_atualizado
    BEFORE UPDATE ON empreendimentos
    FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_tipologias_atualizado ON tipologias;
CREATE TRIGGER trigger_tipologias_atualizado
    BEFORE UPDATE ON tipologias
    FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_unidades_atualizado ON unidades;
CREATE TRIGGER trigger_unidades_atualizado
    BEFORE UPDATE ON unidades
    FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_imoveis_usados_atualizado ON imoveis_usados;
CREATE TRIGGER trigger_imoveis_usados_atualizado
    BEFORE UPDATE ON imoveis_usados
    FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as num_colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================
-- PRÓXIMO PASSO:
-- Execute desabilitar-rls-dev.sql para desabilitar RLS em dev
-- ============================================================
