import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const prisma = new PrismaClient();

// Helper pour hacher les mots de passe
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();

  // Create test users with proper password hashing
  const user1 = await prisma.user.create({
    data: {
      nom: 'Demo User',
      email: 'demo@example.com',
      mot_de_passe: hashPassword('password123'),
      role: 'parent',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      nom: 'John Teacher',
      email: 'john@example.com',
      mot_de_passe: hashPassword('password123'),
      role: 'enseignant',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      nom: 'Sarah Parent',
      email: 'sarah@example.com',
      mot_de_passe: hashPassword('password123'),
      role: 'parent',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      nom: 'Admin User',
      email: 'admin@example.com',
      mot_de_passe: hashPassword('admin123'),
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
  console.log(`- User 1 (Demo User): ID ${user1.id_user} - Email: ${user1.email} - Role: ${user1.role}`);
  console.log(`- User 2 (John Teacher): ID ${user2.id_user} - Email: ${user2.email} - Role: ${user2.role}`);
  console.log(`- User 3 (Sarah Parent): ID ${user3.id_user} - Email: ${user3.email} - Role: ${user3.role}`);
  console.log(`- User 4 (Admin User): ID ${user4.id_user} - Email: ${user4.email} - Role: ${user4.role}`);
  console.log('\n🔐 Default password for all users (except admin): password123');
  console.log('🔐 Default password for admin: admin123');
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
