import { PrismaClient } from '../generated/prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      nom: 'Demo User',
      email: 'demo@example.com',
      mot_de_passe: 'password123', // In production, this should be hashed
      role: 'parent',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      nom: 'John Teacher',
      email: 'john@example.com',
      mot_de_passe: 'password123',
      role: 'enseignant',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      nom: 'Sarah Parent',
      email: 'sarah@example.com',
      mot_de_passe: 'password123',
      role: 'parent',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      nom: 'Admin User',
      email: 'admin@example.com',
      mot_de_passe: 'password123',
      role: 'admin',
    },
  });

  // Create sample messages
  await prisma.message.create({
    data: {
      expediteur_id: user2.id_user,
      destinataire_id: user1.id_user,
      contenu: 'Hello! This is a test message from the teacher.',
      lu: false,
    },
  });

  await prisma.message.create({
    data: {
      expediteur_id: user1.id_user,
      destinataire_id: user2.id_user,
      contenu: 'Hi! Thanks for your message.',
      lu: true,
    },
  });

  await prisma.message.create({
    data: {
      expediteur_id: user3.id_user,
      destinataire_id: user1.id_user,
      contenu: 'Hey, how are you doing?',
      lu: false,
    },
  });

  await prisma.message.create({
    data: {
      expediteur_id: user1.id_user,
      destinataire_id: user3.id_user,
      contenu: 'I am doing great, thanks!',
      lu: true,
    },
  });

  await prisma.message.create({
    data: {
      expediteur_id: user4.id_user,
      destinataire_id: user1.id_user,
      contenu: 'Important admin message for you.',
      lu: false,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Test Users Created:');
  console.log(`- User 1 (Demo User): ID ${user1.id_user} - Role: ${user1.role}`);
  console.log(`- User 2 (John Teacher): ID ${user2.id_user} - Role: ${user2.role}`);
  console.log(`- User 3 (Sarah Parent): ID ${user3.id_user} - Role: ${user3.role}`);
  console.log(`- User 4 (Admin User): ID ${user4.id_user} - Role: ${user4.role}`);
  console.log('\n💬 Sample messages have been created between users.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
