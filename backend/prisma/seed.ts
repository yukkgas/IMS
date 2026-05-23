import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('seeding...');

  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {
      password_hash: hashedPassword,
    },
    create: {
      email: 'admin@test.com',
      password_hash: hashedPassword,
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@test.com' },
    update: {
      password_hash: hashedPassword,
    },
    create: {
      email: 'manager@test.com',
      password_hash: hashedPassword,
      role: 'MANAGER',
    },
  });

  const storekeeper = await prisma.user.upsert({
    where: { email: 'storekeeper@test.com' },
    update: {
      password_hash: hashedPassword,
    },
    create: {
      email: 'storekeeper@test.com',
      password_hash: hashedPassword,
      role: 'STOREKEEPER',
    },
  });

  console.log(`Users has been successfully created:`, {
    admin: { id: admin.id, email: admin.email, role: admin.role },
    manager: { id: manager.id, email: manager.email, role: manager.role },
    storekeeper: { id: storekeeper.id, email: storekeeper.email, role: storekeeper.role },
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

