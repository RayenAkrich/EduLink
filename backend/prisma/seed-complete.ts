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
  console.log('🌱 Seeding database with complete data...');

  try {
    // Clear existing data in the correct order (respecting foreign keys)
    await prisma.note.deleteMany();
    await prisma.absence.deleteMany();
    await prisma.activite.deleteMany();
    await prisma.elevesClasse.deleteMany();
    await prisma.enseignement.deleteMany();
    await prisma.eleve.deleteMany();
    await prisma.classe.deleteMany();
    await prisma.typeNote.deleteMany();
    await prisma.coefficientMatiere.deleteMany();
    await prisma.message.deleteMany();
    await prisma.user.deleteMany();

    // 1. Create users
    const johnTeacher = await prisma.user.create({
      data: {
        nom: 'John Teacher',
        email: 'john@example.com',
        mot_de_passe: hashPassword('password123'),
        role: 'enseignant',
      },
    });

    const sarahParent = await prisma.user.create({
      data: {
        nom: 'Sarah Parent',
        email: 'sarah@example.com',
        mot_de_passe: hashPassword('password123'),
        role: 'parent',
      },
    });

    const admin = await prisma.user.create({
      data: {
        nom: 'Admin User',
        email: 'admin@example.com',
        mot_de_passe: hashPassword('admin123'),
        role: 'admin',
      },
    });

    // 2. Create coefficient matière
    const coeff1 = await prisma.coefficientMatiere.create({
      data: {
        coefficient: 1.0,
      },
    });

    const coeff2 = await prisma.coefficientMatiere.create({
      data: {
        coefficient: 2.0,
      },
    });

    // 3. Create classes
    const classe6A = await prisma.classe.create({
      data: {
        nom_classe: '6ème A',
        annee_scolaire: '2024-2025',
      },
    });

    const classe5B = await prisma.classe.create({
      data: {
        nom_classe: '5ème B',
        annee_scolaire: '2024-2025',
      },
    });

    // 4. Create students
    const eleve1 = await prisma.eleve.create({
      data: {
        nom: 'Marie Dupont',
        date_naissance: new Date('2012-03-15'),
        email: 'marie.dupont@example.com',
        id_parent: sarahParent.id_user,
      },
    });

    const eleve2 = await prisma.eleve.create({
      data: {
        nom: 'Pierre Martin',
        date_naissance: new Date('2011-07-22'),
        id_parent: sarahParent.id_user,
      },
    });

    const eleve3 = await prisma.eleve.create({
      data: {
        nom: 'Julie Leblanc',
        date_naissance: new Date('2012-11-08'),
        id_parent: sarahParent.id_user,
      },
    });

    // 5. Assign students to classes
    await prisma.elevesClasse.createMany({
      data: [
        { id_eleve: eleve1.id_eleve, id_classe: classe6A.id_classe },
        { id_eleve: eleve2.id_eleve, id_classe: classe5B.id_classe },
        { id_eleve: eleve3.id_eleve, id_classe: classe6A.id_classe },
      ],
    });

    // 6. Create enseignements (teacher-class-subject relationships)
    const enseignement1 = await prisma.enseignement.create({
      data: {
        id_enseignant: johnTeacher.id_user,
        id_classe: classe6A.id_classe,
        matiere: 'Mathématiques',
        id_coefficient_matiere: coeff2.id,
      },
    });

    const enseignement2 = await prisma.enseignement.create({
      data: {
        id_enseignant: johnTeacher.id_user,
        id_classe: classe6A.id_classe,
        matiere: 'Français',
        id_coefficient_matiere: coeff1.id,
      },
    });

    const enseignement3 = await prisma.enseignement.create({
      data: {
        id_enseignant: johnTeacher.id_user,
        id_classe: classe5B.id_classe,
        matiere: 'Mathématiques',
        id_coefficient_matiere: coeff2.id,
      },
    });

    // 7. Create note types
    const typeOral = await prisma.typeNote.create({
      data: {
        libelle: 'oral',
        coefficient: 1.0,
      },
    });

    const typeControle = await prisma.typeNote.create({
      data: {
        libelle: 'controle',
        coefficient: 2.0,
      },
    });

    const typeSynthese = await prisma.typeNote.create({
      data: {
        libelle: 'synthese',
        coefficient: 3.0,
      },
    });

    // 8. Create sample notes
    await prisma.note.createMany({
      data: [
        {
          id_eleve: eleve1.id_eleve,
          id_enseignement: enseignement1.id_enseignement,
          id_type_note: typeControle.id_type_note,
          valeur: 15.5,
          date_attribution: new Date('2024-11-20'),
        },
        {
          id_eleve: eleve3.id_eleve,
          id_enseignement: enseignement1.id_enseignement,
          id_type_note: typeOral.id_type_note,
          valeur: 12.0,
          date_attribution: new Date('2024-11-25'),
        },
      ],
    });

    console.log('✅ Complete seed completed successfully!');
    console.log('\n📊 Created:');
    console.log(`- John Teacher (ID: ${johnTeacher.id_user}) - Enseignant`);
    console.log(`- Sarah Parent (ID: ${sarahParent.id_user}) - Parent`);
    console.log(`- Admin User (ID: ${admin.id_user}) - Admin`);
    console.log(`- Classes: ${classe6A.nom_classe}, ${classe5B.nom_classe}`);
    console.log(`- Students: Marie Dupont, Pierre Martin, Julie Leblanc`);
    console.log(`- Enseignements: Mathématiques et Français pour les deux classes`);
    console.log('\n🔐 Passwords: password123 (admin123 for admin)');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });