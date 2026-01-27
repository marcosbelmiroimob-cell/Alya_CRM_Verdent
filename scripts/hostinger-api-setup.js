#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 *  Hostinger API - Setup e Configuração MySQL
 * ═══════════════════════════════════════════════════════════════
 *
 *  IMPORTANTE: A API da Hostinger não tem endpoints diretos para MySQL.
 *  Este script usa a API do Docker Manager para:
 *  1. Verificar status do MariaDB existente
 *  2. Gerenciar containers Docker
 *  3. Deploy de novos projetos Docker
 *
 *  Uso:
 *    node scripts/hostinger-api-setup.js
 *
 * ═══════════════════════════════════════════════════════════════
 */

import https from 'https'
import * as dotenv from 'dotenv'

dotenv.config()

// ═══════════════════════════════════════════════════════════════
//  Configuração
// ═══════════════════════════════════════════════════════════════

const HOSTINGER_API_TOKEN = process.env.HOSTINGER_API_TOKEN || 'WnSI8X0iL5R8DYAS4mtrELWWHsVXlPagvVxJqEy777835a1c'
const API_BASE_URL = 'developers.hostinger.com'
const VPS_ID = process.env.VPS_ID // ID da máquina virtual (precisa ser descoberto)

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
//  Funções HTTP
// ═══════════════════════════════════════════════════════════════

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE_URL,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${HOSTINGER_API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || data}`))
          }
        } catch (err) {
          reject(new Error(`Parse error: ${err.message}\nData: ${data}`))
        }
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    if (body) {
      req.write(JSON.stringify(body))
    }

    req.end()
  })
}

// ═══════════════════════════════════════════════════════════════
//  API Endpoints
// ═══════════════════════════════════════════════════════════════

async function getDataCenters() {
  log('cyan', '\n📍 Obtendo data centers disponíveis...')
  try {
    const response = await makeRequest('GET', '/api/vps/v1/data-centers')
    return response
  } catch (err) {
    log('red', `❌ Erro: ${err.message}`)
    throw err
  }
}

async function listDockerProjects(vpsId) {
  log('cyan', `\n🐳 Listando projetos Docker na VPS ${vpsId}...`)
  try {
    const response = await makeRequest('GET', `/api/vps/v1/virtual-machines/${vpsId}/docker`)
    return response
  } catch (err) {
    log('red', `❌ Erro: ${err.message}`)
    throw err
  }
}

async function getDockerProject(vpsId, projectName) {
  log('cyan', `\n📦 Obtendo detalhes do projeto ${projectName}...`)
  try {
    const response = await makeRequest('GET', `/api/vps/v1/virtual-machines/${vpsId}/docker/${projectName}`)
    return response
  } catch (err) {
    log('red', `❌ Erro: ${err.message}`)
    throw err
  }
}

async function getDockerContainers(vpsId, projectName) {
  log('cyan', `\n📋 Listando containers do projeto ${projectName}...`)
  try {
    const response = await makeRequest('GET', `/api/vps/v1/virtual-machines/${vpsId}/docker/${projectName}/containers`)
    return response
  } catch (err) {
    log('red', `❌ Erro: ${err.message}`)
    throw err
  }
}

async function getDockerLogs(vpsId, projectName) {
  log('cyan', `\n📄 Obtendo logs do projeto ${projectName}...`)
  try {
    const response = await makeRequest('GET', `/api/vps/v1/virtual-machines/${vpsId}/docker/${projectName}/logs`)
    return response
  } catch (err) {
    log('red', `❌ Erro: ${err.message}`)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════════
//  Descobrir VPS ID
// ═══════════════════════════════════════════════════════════════

async function discoverVPSId() {
  log('yellow', '\n⚠️  VPS_ID não configurado. Tentando descobrir...')
  log('yellow', '   Nota: A API da Hostinger não expõe endpoint para listar VMs.')
  log('yellow', '   Você precisa obter o VPS_ID do painel: https://hpanel.hostinger.com')

  // Tentar alguns IDs comuns (UUIDs ou números)
  const possibleIds = [
    'srv1284180', // Formato comum Hostinger
    '76.13.81.66', // IP como ID
  ]

  for (const id of possibleIds) {
    try {
      log('blue', `\n   Testando ID: ${id}`)
      await listDockerProjects(id)
      log('green', `   ✅ VPS_ID encontrado: ${id}`)
      return id
    } catch (err) {
      log('yellow', `   ✗ ID ${id} não funcionou`)
    }
  }

  throw new Error('VPS_ID não encontrado automaticamente')
}

// ═══════════════════════════════════════════════════════════════
//  Execução Principal
// ═══════════════════════════════════════════════════════════════

async function main() {
  log('blue', '\n═══════════════════════════════════════════════════════════════')
  log('blue', '  HOSTINGER API - Setup MySQL via Docker')
  log('blue', '═══════════════════════════════════════════════════════════════\n')

  try {
    // 1. Testar autenticação
    log('cyan', '🔑 Testando autenticação...')
    const dataCenters = await getDataCenters()
    log('green', `✅ Autenticação OK! Data centers: ${dataCenters.length || 0}`)

    // 2. Obter ou descobrir VPS_ID
    let vpsId = VPS_ID
    if (!vpsId) {
      vpsId = await discoverVPSId()
    }

    // 3. Listar projetos Docker
    const projects = await listDockerProjects(vpsId)
    log('green', `✅ Projetos Docker encontrados: ${projects.length || 0}`)

    if (projects && projects.length > 0) {
      for (const project of projects) {
        log('blue', `\n📦 Projeto: ${project.name || project}`)

        try {
          // 4. Obter detalhes do projeto
          const details = await getDockerProject(vpsId, project.name || project)
          log('cyan', `   Status: ${details.status || 'unknown'}`)

          // 5. Listar containers
          const containers = await getDockerContainers(vpsId, project.name || project)
          if (containers && containers.length > 0) {
            log('cyan', `   Containers:`)
            containers.forEach(c => {
              log('blue', `     - ${c.name || c}: ${c.status || 'unknown'}`)
            })
          }
        } catch (err) {
          log('yellow', `   ⚠️  Erro ao obter detalhes: ${err.message}`)
        }
      }
    }

    // Resumo
    log('green', '\n═══════════════════════════════════════════════════════════════')
    log('green', '  ✅ DIAGNÓSTICO CONCLUÍDO')
    log('green', '═══════════════════════════════════════════════════════════════\n')

    log('yellow', '📋 Próximos passos manuais:')
    log('yellow', '   1. Obtenha o VPS_ID correto do painel Hostinger')
    log('yellow', '   2. Configure DATABASE_URL no .env do backend')
    log('yellow', '   3. O MariaDB já está rodando (mariadb-gwz7-mariadb-1)')
    log('yellow', '   4. Use SSH para configurações avançadas\n')

  } catch (error) {
    log('red', '\n❌ ERRO FATAL:')
    log('red', error.message)
    log('red', '\n📚 Documentação:')
    log('red', '   API: https://developers.hostinger.com/')
    log('red', '   Painel: https://hpanel.hostinger.com\n')
    process.exit(1)
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
