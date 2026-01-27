-- ═══════════════════════════════════════════════════════════════
--  Inicialização MySQL - CRM Alya Verdent
-- ═══════════════════════════════════════════════════════════════
--
--  Este script é executado automaticamente na primeira inicialização
--  do container MySQL. Configurações adicionais e otimizações.
--
-- ═══════════════════════════════════════════════════════════════

-- Configurar timezone
SET GLOBAL time_zone = '-03:00';  -- Brasília
SET time_zone = '-03:00';

-- Configurações de performance
SET GLOBAL max_connections = 200;
SET GLOBAL innodb_buffer_pool_size = 268435456;  -- 256MB

-- Configurar charset padrão
ALTER DATABASE alyacrm CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Log de inicialização
SELECT 'Database alyacrm inicializado com sucesso!' AS status;
