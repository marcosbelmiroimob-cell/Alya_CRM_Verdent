-- ============================================
-- SQL de Migração: Novas Etapas do Pipeline
-- Para: Corretores Autônomos de Imóveis
-- ============================================

-- Este script atualiza negociações existentes que usam etapas antigas
-- para as novas etapas do funil imobiliário.

-- Mapeamento de etapas antigas → novas:
-- QUALIFICACAO      → PRIMEIRO_CONTATO
-- PRIMEIRO_CONTATO  → PRIMEIRO_CONTATO (mantém)
-- APRESENTACAO      → APRESENTACAO (mantém)
-- VISITA            → VISITA_AGENDADA
-- PROPOSTA          → PROPOSTA_ENVIADA
-- ANALISE_CREDITO   → ANALISE_DOCUMENTACAO
-- FECHAMENTO        → FECHAMENTO (mantém)
-- PERDIDO           → (manter como está ou criar etapa específica)

-- ============================================
-- 1. ATUALIZAR ETAPAS ANTIGAS
-- ============================================

-- Atualizar QUALIFICACAO para PRIMEIRO_CONTATO
UPDATE negociacoes 
SET etapa = 'PRIMEIRO_CONTATO', atualizado_em = NOW()
WHERE etapa = 'QUALIFICACAO';

-- Atualizar VISITA para VISITA_AGENDADA
UPDATE negociacoes 
SET etapa = 'VISITA_AGENDADA', atualizado_em = NOW()
WHERE etapa = 'VISITA';

-- Atualizar PROPOSTA para PROPOSTA_ENVIADA
UPDATE negociacoes 
SET etapa = 'PROPOSTA_ENVIADA', atualizado_em = NOW()
WHERE etapa = 'PROPOSTA';

-- Atualizar ANALISE_CREDITO para ANALISE_DOCUMENTACAO
UPDATE negociacoes 
SET etapa = 'ANALISE_DOCUMENTACAO', atualizado_em = NOW()
WHERE etapa = 'ANALISE_CREDITO';

-- Leads novos sem etapa definida → NOVO_LEAD
UPDATE negociacoes 
SET etapa = 'NOVO_LEAD', atualizado_em = NOW()
WHERE etapa IS NULL OR etapa = '';

-- ============================================
-- 2. VERIFICAR MIGRAÇÃO
-- ============================================

-- Contar negociações por etapa (após migração)
SELECT 
    etapa, 
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM negociacoes), 1) as percentual
FROM negociacoes 
GROUP BY etapa 
ORDER BY 
    CASE etapa
        WHEN 'NOVO_LEAD' THEN 1
        WHEN 'PRIMEIRO_CONTATO' THEN 2
        WHEN 'APRESENTACAO' THEN 3
        WHEN 'VISITA_AGENDADA' THEN 4
        WHEN 'PROPOSTA_ENVIADA' THEN 5
        WHEN 'ANALISE_DOCUMENTACAO' THEN 6
        WHEN 'FECHAMENTO' THEN 7
        ELSE 8
    END;

-- ============================================
-- 3. CONSTRAINT PARA NOVAS ETAPAS (OPCIONAL)
-- ============================================

-- Remover constraint antiga se existir
ALTER TABLE negociacoes DROP CONSTRAINT IF EXISTS negociacoes_etapa_check;

-- Adicionar constraint com etapas válidas
ALTER TABLE negociacoes 
ADD CONSTRAINT negociacoes_etapa_check 
CHECK (etapa IN (
    'NOVO_LEAD',
    'PRIMEIRO_CONTATO',
    'APRESENTACAO',
    'VISITA_AGENDADA',
    'PROPOSTA_ENVIADA',
    'ANALISE_DOCUMENTACAO',
    'FECHAMENTO'
));

-- ============================================
-- 4. ÍNDICE PARA PERFORMANCE
-- ============================================

-- Criar índice na coluna etapa para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_negociacoes_etapa 
ON negociacoes(etapa);

-- Índice composto para filtrar por usuário e etapa
CREATE INDEX IF NOT EXISTS idx_negociacoes_usuario_etapa 
ON negociacoes(usuario_id, etapa);

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
-- 
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script
-- 4. Execute (F5 ou botão Run)
-- 
-- IMPORTANTE: 
-- - Faça backup antes de executar
-- - O script é idempotente (pode executar várias vezes)
-- - A constraint impede inserção de etapas inválidas
-- ============================================
