import { cpSync, existsSync, mkdirSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const clientDist = join(__dirname, '..', 'client', 'dist')
const publicDir = join(__dirname, '..', 'public')

console.log('Copiando arquivos do frontend para o backend...')
console.log(`De: ${clientDist}`)
console.log(`Para: ${publicDir}`)

if (!existsSync(clientDist)) {
  console.error('Erro: Pasta client/dist não encontrada. Execute npm run build no client primeiro.')
  process.exit(1)
}

if (existsSync(publicDir)) {
  rmSync(publicDir, { recursive: true })
}

mkdirSync(publicDir, { recursive: true })

cpSync(clientDist, publicDir, { recursive: true })

console.log('Arquivos copiados com sucesso!')
