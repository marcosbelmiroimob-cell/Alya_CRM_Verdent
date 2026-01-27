-- ============================================
-- SQL: Tabelas para Lançamentos e Imóveis Usados
-- CRM Alya - Corretores de Imóveis
-- ============================================

-- ============================================
-- 1. TABELAS DE LANÇAMENTOS (3 Níveis)
-- ============================================

-- Nível A: Empreendimentos (O Prédio)
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

-- Nível B: Tipologias (A Planta)
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

-- Nível C: Unidades (Estoque)
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

-- ============================================
-- 2. TABELA DE IMÓVEIS USADOS
-- ============================================

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

-- ============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Empreendimentos
CREATE INDEX IF NOT EXISTS idx_empreendimentos_usuario ON empreendimentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_empreendimentos_status ON empreendimentos(status);
CREATE INDEX IF NOT EXISTS idx_empreendimentos_cidade ON empreendimentos(cidade);
CREATE INDEX IF NOT EXISTS idx_empreendimentos_ativo ON empreendimentos(ativo);

-- Tipologias
CREATE INDEX IF NOT EXISTS idx_tipologias_empreendimento ON tipologias(empreendimento_id);

-- Unidades
CREATE INDEX IF NOT EXISTS idx_unidades_tipologia ON unidades(tipologia_id);
CREATE INDEX IF NOT EXISTS idx_unidades_status ON unidades(status);

-- Imóveis Usados
CREATE INDEX IF NOT EXISTS idx_imoveis_usados_usuario ON imoveis_usados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_usados_tipo ON imoveis_usados(tipo);
CREATE INDEX IF NOT EXISTS idx_imoveis_usados_status ON imoveis_usados(status);
CREATE INDEX IF NOT EXISTS idx_imoveis_usados_cidade ON imoveis_usados(cidade);
CREATE INDEX IF NOT EXISTS idx_imoveis_usados_ativo ON imoveis_usados(ativo);
CREATE INDEX IF NOT EXISTS idx_imoveis_usados_destaque ON imoveis_usados(destaque);

-- ============================================
-- 4. TRIGGERS PARA ATUALIZADO_EM
-- ============================================

-- Função genérica para atualizar timestamp
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_empreendimentos_atualizado ON empreendimentos;
CREATE TRIGGER trigger_empreendimentos_atualizado
    BEFORE UPDATE ON empreendimentos
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_tipologias_atualizado ON tipologias;
CREATE TRIGGER trigger_tipologias_atualizado
    BEFORE UPDATE ON tipologias
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_unidades_atualizado ON unidades;
CREATE TRIGGER trigger_unidades_atualizado
    BEFORE UPDATE ON unidades
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

DROP TRIGGER IF EXISTS trigger_imoveis_usados_atualizado ON imoveis_usados;
CREATE TRIGGER trigger_imoveis_usados_atualizado
    BEFORE UPDATE ON imoveis_usados
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

-- ============================================
-- 5. RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE empreendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipologias ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis_usados ENABLE ROW LEVEL SECURITY;

-- Políticas para Empreendimentos
DROP POLICY IF EXISTS "empreendimentos_select" ON empreendimentos;
CREATE POLICY "empreendimentos_select" ON empreendimentos 
    FOR SELECT USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "empreendimentos_insert" ON empreendimentos;
CREATE POLICY "empreendimentos_insert" ON empreendimentos 
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "empreendimentos_update" ON empreendimentos;
CREATE POLICY "empreendimentos_update" ON empreendimentos 
    FOR UPDATE USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "empreendimentos_delete" ON empreendimentos;
CREATE POLICY "empreendimentos_delete" ON empreendimentos 
    FOR DELETE USING (usuario_id = auth.uid());

-- Políticas para Tipologias (via empreendimento)
DROP POLICY IF EXISTS "tipologias_select" ON tipologias;
CREATE POLICY "tipologias_select" ON tipologias 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM empreendimentos e 
            WHERE e.id = tipologias.empreendimento_id 
            AND e.usuario_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "tipologias_insert" ON tipologias;
CREATE POLICY "tipologias_insert" ON tipologias 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM empreendimentos e 
            WHERE e.id = tipologias.empreendimento_id 
            AND e.usuario_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "tipologias_update" ON tipologias;
CREATE POLICY "tipologias_update" ON tipologias 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM empreendimentos e 
            WHERE e.id = tipologias.empreendimento_id 
            AND e.usuario_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "tipologias_delete" ON tipologias;
CREATE POLICY "tipologias_delete" ON tipologias 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM empreendimentos e 
            WHERE e.id = tipologias.empreendimento_id 
            AND e.usuario_id = auth.uid()
        )
    );

-- Políticas para Unidades (via tipologia → empreendimento)
DROP POLICY IF EXISTS "unidades_select" ON unidades;
CREATE POLICY "unidades_select" ON unidades 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tipologias t
            JOIN empreendimentos e ON e.id = t.empreendimento_id
            WHERE t.id = unidades.tipologia_id 
            AND e.usuario_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "unidades_insert" ON unidades;
CREATE POLICY "unidades_insert" ON unidades 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tipologias t
            JOIN empreendimentos e ON e.id = t.empreendimento_id
            WHERE t.id = unidades.tipologia_id 
            AND e.usuario_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "unidades_update" ON unidades;
CREATE POLICY "unidades_update" ON unidades 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tipologias t
            JOIN empreendimentos e ON e.id = t.empreendimento_id
            WHERE t.id = unidades.tipologia_id 
            AND e.usuario_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "unidades_delete" ON unidades;
CREATE POLICY "unidades_delete" ON unidades 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tipologias t
            JOIN empreendimentos e ON e.id = t.empreendimento_id
            WHERE t.id = unidades.tipologia_id 
            AND e.usuario_id = auth.uid()
        )
    );

-- Políticas para Imóveis Usados
DROP POLICY IF EXISTS "imoveis_usados_select" ON imoveis_usados;
CREATE POLICY "imoveis_usados_select" ON imoveis_usados 
    FOR SELECT USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "imoveis_usados_insert" ON imoveis_usados;
CREATE POLICY "imoveis_usados_insert" ON imoveis_usados 
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "imoveis_usados_update" ON imoveis_usados;
CREATE POLICY "imoveis_usados_update" ON imoveis_usados 
    FOR UPDATE USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "imoveis_usados_delete" ON imoveis_usados;
CREATE POLICY "imoveis_usados_delete" ON imoveis_usados 
    FOR DELETE USING (usuario_id = auth.uid());

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
-- 
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script
-- 4. Execute (F5 ou botão Run)
-- 
-- NOTA: Se estiver em desenvolvimento e quiser
-- desabilitar RLS temporariamente, execute:
--
-- ALTER TABLE empreendimentos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE tipologias DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE unidades DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE imoveis_usados DISABLE ROW LEVEL SECURITY;
-- ============================================
