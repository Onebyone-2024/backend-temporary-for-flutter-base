import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const plannerPassword = await bcrypt.hash('planner123', 10);
  const driverPassword = await bcrypt.hash('driver123', 10);

  // Create Planner user
  const planner = await prisma.user.upsert({
    where: { email: 'planner@example.com' },
    update: {},
    create: {
      fullName: 'Planner',
      email: 'planner@example.com',
      password: plannerPassword,
      status: 'active',
    },
  });

  console.log('✓ Planner user created:', planner);

  // Create Driver user
  const driver = await prisma.user.upsert({
    where: { email: 'driver@example.com' },
    update: {},
    create: {
      fullName: 'Driver',
      email: 'driver@example.com',
      password: driverPassword,
      status: 'active',
    },
  });

  console.log('✓ Driver user created:', driver);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
