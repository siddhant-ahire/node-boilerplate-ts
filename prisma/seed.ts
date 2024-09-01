import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

  const admin_user = await prisma.user.upsert({
    where: { user_email: 'admin@example.com' },
    update: {},
    create: {
      user_name: 'Admin',
      user_email: 'admin@example.com',
      user_password: hashedPassword,
    },
  });
  console.log(admin_user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
