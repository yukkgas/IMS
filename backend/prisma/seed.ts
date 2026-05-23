import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('seeding...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password_hash: '123456',
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@test.com' },
    update: {},
    create: {
      email: 'manager@test.com',
      password_hash: '123456',
      role: 'MANAGER',
    },
  });

  const storekeeper = await prisma.user.upsert({
    where: { email: 'storekeeper@test.com' },
    update: {},
    create: {
      email: 'storekeeper@test.com',
      password_hash: '123456',
      role: 'STOREKEEPER',
    },
  });

  console.log(`Users has been succesfully created:`, {
    admin,
    manager,
    storekeeper,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
