import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNotes() {
  console.log('🔍 Vérification des notes en base de données\n');

  try {
    // Vérifier toutes les notes
    const allNotes = await prisma.note.findMany({
      include: {
        eleve: { select: { nom: true } },
        enseignement: { 
          select: { 
            matiere: true,
            classe: { select: { nom_classe: true } }
          } 
        },
        type_note: { select: { libelle: true } }
      }
    });

    console.log(`📊 Total notes trouvées: ${allNotes.length}\n`);

    allNotes.forEach(note => {
      console.log(`✅ ${note.eleve.nom} - ${note.enseignement.classe.nom_classe} - ${note.enseignement.matiere}`);
      console.log(`   Type: ${note.type_note.libelle}, Note: ${note.valeur}/20, Date: ${note.date_attribution.toLocaleDateString()}`);
    });

    // Vérifier enseignements
    console.log('\n📚 Enseignements disponibles:');
    const enseignements = await prisma.enseignement.findMany({
      include: {
        classe: { select: { nom_classe: true } },
        enseignant: { select: { nom: true } }
      }
    });

    enseignements.forEach(ens => {
      console.log(`   ${ens.enseignant.nom} - ${ens.classe.nom_classe} - ${ens.matiere}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotes();
