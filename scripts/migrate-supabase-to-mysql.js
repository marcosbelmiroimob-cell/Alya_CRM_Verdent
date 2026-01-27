#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 *  Script de Migração: Supabase PostgreSQL → MySQL
 * ═══════════════════════════════════════════════════════════════
 *
 *  ATENÇÃO: Execute este script APENAS UMA VEZ para migrar dados
 *
 *  Pré-requisitos:
 *  1. Supabase com dados existentes
 *  2. MySQL vazio com Prisma migrations aplicadas
 *  3. Variáveis de ambiente configuradas
 *
 *  Uso:
 *    node scripts/migrate-supabase-to-mysql.js
 *
 * ═══════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(color, ...args) {
  console.log(colors[color], ...args, colors.reset)
}

// ═══════════════════════════════════════════════════════════════
//  Configuração
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DATABASE_URL = process.env.DATABASE_URL

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  log('red', '❌ ERRO: Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!DATABASE_URL) {
  log('red', '❌ ERRO: Configure DATABASE_URL (MySQL)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const prisma = new PrismaClient()

// ═══════════════════════════════════════════════════════════════
//  Funções de Migração
// ═══════════════════════════════════════════════════════════════

async function migrateTable(tableName, supabaseTable, prismaModel, transform = null) {
  log('cyan', `\n📦 Migrando tabela: ${tableName}`)

  try {
    // 1. Buscar dados do Supabase
    const { data, error } = await supabase
      .from(supabaseTable)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Erro ao buscar dados: ${error.message}`)
    }

    if (!data || data.length === 0) {
      log('yellow', `   ⚠️  Tabela ${tableName} está vazia, pulando...`)
      return 0
    }

    log('blue', `   Encontrados ${data.length} registros`)

    // 2. Transformar dados (se necessário)
    const records = transform ? data.map(transform) : data

    // 3. Inserir no MySQL
    let inserted = 0
    let failed = 0

    for (const record of records) {
      try {
        await prismaModel.create({
          data: record
        })
        inserted++
      } catch (err) {
        failed++
        log('red', `   ✗ Erro ao inserir registro: ${err.message}`)
      }
    }

    log('green', `   ✅ ${inserted} registros migrados`)
    if (failed > 0) {
      log('yellow', `   ⚠️  ${failed} registros falharam`)
    }

    return inserted

  } catch (error) {
    log('red', `   ❌ Erro na migração: ${error.message}`)
    return 0
  }
}

// ═══════════════════════════════════════════════════════════════
//  Transformadores de Dados
// ═══════════════════════════════════════════════════════════════

function transformUser(user) {
  return {
    id: user.id,
    nome: user.nome || user.name,
    email: user.email,
    senhaHash: user.senha_hash || user.password_hash,
    telefone: user.telefone || user.phone,
    creci: user.creci,
    plano: user.plano || 'BASICO',
    avatar: user.avatar,
    criadoEm: new Date(user.created_at || user.criado_em),
    atualizadoEm: new Date(user.updated_at || user.atualizado_em || Date.now())
  }
}

function transformLead(lead) {
  return {
    id: lead.id,
    usuarioId: lead.usuario_id || lead.user_id,
    nome: lead.nome || lead.name,
    telefone: lead.telefone || lead.phone,
    email: lead.email,
    origem: lead.origem || lead.source || 'MANUAL',
    perfilComprador: lead.perfil_comprador || lead.buyer_profile || null,
    scoreQualificacao: lead.score_qualificacao || lead.score || 0,
    observacoes: lead.observacoes || lead.notes,
    criadoEm: new Date(lead.created_at || lead.criado_em),
    atualizadoEm: new Date(lead.updated_at || lead.atualizado_em || Date.now())
  }
}

function transformNegociacao(negociacao) {
  return {
    id: negociacao.id,
    usuarioId: negociacao.usuario_id || negociacao.user_id,
    leadId: negociacao.lead_id,
    imovelId: negociacao.imovel_id,
    unidadeId: negociacao.unidade_id,
    imovelUsadoId: negociacao.imovel_usado_id,
    etapaKanban: negociacao.etapa_kanban || negociacao.stage || 'NOVO_LEAD',
    valorProposta: negociacao.valor_proposta || negociacao.proposal_value,
    observacoes: negociacao.observacoes || negociacao.notes,
    proximoContato: negociacao.proximo_contato || negociacao.next_contact
      ? new Date(negociacao.proximo_contato || negociacao.next_contact)
      : null,
    ordem: negociacao.ordem || negociacao.order || 0,
    criadoEm: new Date(negociacao.created_at || negociacao.criado_em),
    atualizadoEm: new Date(negociacao.updated_at || negociacao.atualizado_em || Date.now())
  }
}

// ═══════════════════════════════════════════════════════════════
//  Execução Principal
// ═══════════════════════════════════════════════════════════════

async function main() {
  log('blue', '\n═══════════════════════════════════════════════════════════════')
  log('blue', '  MIGRAÇÃO: Supabase → MySQL')
  log('blue', '═══════════════════════════════════════════════════════════════\n')

  log('yellow', '⚠️  ATENÇÃO: Este processo é IRREVERSÍVEL!')
  log('yellow', '   Certifique-se de ter backup do Supabase antes de continuar.\n')

  // Estatísticas
  const stats = {
    usuarios: 0,
    leads: 0,
    negociacoes: 0,
    empreendimentos: 0,
    torres: 0,
    unidades: 0,
  }

  try {
    // 1. Usuarios
    stats.usuarios = await migrateTable(
      'Usuarios',
      'usuarios',
      prisma.usuario,
      transformUser
    )

    // 2. Leads
    stats.leads = await migrateTable(
      'Leads',
      'leads',
      prisma.lead,
      transformLead
    )

    // 3. Negociacoes
    stats.negociacoes = await migrateTable(
      'Negociacoes',
      'negociacoes',
      prisma.negociacao,
      transformNegociacao
    )

    // 4. Empreendimentos (se existir)
    try {
      stats.empreendimentos = await migrateTable(
        'Empreendimentos',
        'empreendimentos',
        prisma.empreendimento
      )
    } catch (err) {
      log('yellow', '   ⚠️  Tabela empreendimentos não existe no Supabase, pulando...')
    }

    // 5. Torres (se existir)
    try {
      stats.torres = await migrateTable(
        'Torres',
        'torres',
        prisma.torre
      )
    } catch (err) {
      log('yellow', '   ⚠️  Tabela torres não existe no Supabase, pulando...')
    }

    // 6. Unidades (se existir)
    try {
      stats.unidades = await migrateTable(
        'Unidades',
        'unidades',
        prisma.unidade
      )
    } catch (err) {
      log('yellow', '   ⚠️  Tabela unidades não existe no Supabase, pulando...')
    }

    // Resumo
    log('green', '\n═══════════════════════════════════════════════════════════════')
    log('green', '  ✅ MIGRAÇÃO CONCLUÍDA')
    log('green', '═══════════════════════════════════════════════════════════════\n')

    log('cyan', '📊 Estatísticas:')
    Object.entries(stats).forEach(([table, count]) => {
      if (count > 0) {
        log('blue', `   - ${table}: ${count} registros`)
      }
    })

    const total = Object.values(stats).reduce((a, b) => a + b, 0)
    log('green', `\n   TOTAL: ${total} registros migrados\n`)

    log('yellow', '📋 Próximos passos:')
    log('yellow', '   1. Verifique os dados no MySQL')
    log('yellow', '   2. Teste o login e funcionalidades')
    log('yellow', '   3. Se OK, remova código Supabase do frontend')
    log('yellow', '   4. Cancele assinatura Supabase (se não usar mais)\n')

  } catch (error) {
    log('red', '\n❌ ERRO FATAL:')
    log('red', error.message)
    log('red', error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar
main()
  .then(() => {
    log('green', '✅ Script finalizado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    log('red', '❌ Erro inesperado:')
    log('red', error.message)
    process.exit(1)
  })
