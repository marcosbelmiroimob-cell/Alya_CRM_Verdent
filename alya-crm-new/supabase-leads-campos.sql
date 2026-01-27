-- =====================================================
-- SQL para adicionar novos campos na tabela leads
-- Campos para contrato: CPF, RG, data_nascimento, etc.
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Adicionar novos campos à tabela leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cpf VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS rg VARCHAR(30);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS profissao VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS renda_mensal DECIMAL(12,2);

-- Criar índice para CPF (buscas frequentes)
CREATE INDEX IF NOT EXISTS idx_leads_cpf ON leads(cpf) WHERE cpf IS NOT NULL;

-- Comentários nas colunas para documentação
COMMENT ON COLUMN leads.cpf IS 'CPF do lead para documentação de contrato';
COMMENT ON COLUMN leads.rg IS 'RG do lead para documentação de contrato';
COMMENT ON COLUMN leads.data_nascimento IS 'Data de nascimento do lead';
COMMENT ON COLUMN leads.profissao IS 'Profissão do lead para análise de crédito';
COMMENT ON COLUMN leads.estado_civil IS 'Estado civil: SOLTEIRO, CASADO, DIVORCIADO, VIUVO, UNIAO_ESTAVEL';
COMMENT ON COLUMN leads.renda_mensal IS 'Renda mensal informada para análise de crédito';

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name IN ('cpf', 'rg', 'data_nascimento', 'profissao', 'estado_civil', 'renda_mensal');
