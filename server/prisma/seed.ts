import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do banco de dados...')

  const ownerEmail = 'marcosbelmiro.imob@gmail.com'
  const ownerPassword = 'M@rcos123@'

  const existingOwner = await prisma.usuario.findUnique({
    where: { email: ownerEmail },
  })

  if (existingOwner) {
    console.log('Usuário Owner já existe. Atualizando para PREMIUM...')
    await prisma.usuario.update({
      where: { email: ownerEmail },
      data: { plano: 'PREMIUM' },
    })
  } else {
    console.log('Criando usuário Owner...')
    const senhaHash = await bcrypt.hash(ownerPassword, 12)
    
    await prisma.usuario.create({
      data: {
        nome: 'Marcos Belmiro',
        email: ownerEmail,
        senhaHash,
        telefone: null,
        creci: null,
        plano: 'PREMIUM',
      },
    })
  }

  console.log('Seed concluído com sucesso!')
  console.log(`Owner: ${ownerEmail}`)
  console.log('Plano: PREMIUM')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
