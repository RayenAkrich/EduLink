const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Vérification de la table CoefficientMatiere...');
    
    // Compter les coefficients existants
    const count = await prisma.coefficientMatiere.count();
    console.log(`Coefficients existants: ${count}`);

    if (count === 0) {
      console.log('Insertion des coefficients de matière...');
      
      // Créer les coefficients standards
      await prisma.coefficientMatiere.createMany({
        data: [
          { coefficient: 1.0 },
          { coefficient: 2.0 },
          { coefficient: 3.0 },
          { coefficient: 4.0 },
          { coefficient: 5.0 },
        ],
      });

      console.log('✓ Coefficients insérés avec succès!');
    } else {
      console.log('✓ Coefficients déjà présents.');
    }

    // Vérifier les enseignements
    const enseignements = await prisma.enseignement.findMany({
      include: {
        coefficient_matiere: true,
      },
    });

    console.log(`\nTotal enseignements: ${enseignements.length}`);
    
    // Afficher quelques exemples
    if (enseignements.length > 0) {
      console.log('\nExemples d\'enseignements:');
      enseignements.slice(0, 3).forEach(e => {
        console.log(`  - ${e.matiere}: coefficient_matiere = ${e.coefficient_matiere?.coefficient || 'NULL'}`);
      });
    }

  } catch (error) {
    console.error('Erreur:', error.message);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Erreur fatale:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
