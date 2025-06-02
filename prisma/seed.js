import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
  });

  console.log(`Created admin user: ${admin.email}`);

  // Create regular users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'USER',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
      role: 'USER',
    },
  });

  console.log(`Created users: ${user1.email}, ${user2.email}`);

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with Express.js',
      content: 'Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.',
      published: true,
      authorId: user1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Introduction to Prisma',
      content: 'Prisma is a next-generation ORM that helps app developers build faster and make fewer errors with an auto-generated query builder.',
      published: true,
      authorId: user2.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Draft Post',
      content: 'This is a draft post that is not yet published.',
      published: false,
      authorId: user1.id,
    },
  });

  console.log(`Created posts: ${post1.title}, ${post2.title}, ${post3.title}`);

  console.log('Seeding finished.');
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