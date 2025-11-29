import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification des notes...');
  
  // Récupérer toutes les notes
  const allNotes = await prisma.note.findMany({
    include: {
      eleve: true,
      enseignement: {
        include: {
          classe: true
        }
      },
      type_note: true
    }
  });

  console.log(`📊 Total notes trouvées: ${allNotes.length}`);
  
  // Afficher quelques exemples
  console.log('\n📝 Exemples de notes:');
  allNotes.slice(0, 3).forEach(note => {
    console.log({
      id: note.id_note,
      eleve: note.eleve.nom,
      classe: note.enseignement.classe.nom_classe,
      type: note.type_note.libelle,
      valeur: note.valeur,
      trimestre: note.trimestre
    });
  });

  // Vérifier s'il y a des doublons potentiels
  const groupedNotes = new Map<string, any[]>();
  allNotes.forEach(note => {
    const key = `${note.id_eleve}-${note.id_enseignement}-${note.id_type_note}-${note.trimestre}`;
    if (!groupedNotes.has(key)) {
      groupedNotes.set(key, []);
    }
    groupedNotes.get(key)!.push(note);
  });

  console.log('\n🔍 Recherche de doublons...');
  let duplicatesFound = 0;
  for (const [key, notes] of groupedNotes) {
    if (notes.length > 1) {
      duplicatesFound++;
      console.log(`⚠️ Doublon trouvé (${notes.length} notes):`, {
        eleve: notes[0].eleve.nom,
        type: notes[0].type_note.libelle,
        trimestre: notes[0].trimestre,
        valeurs: notes.map(n => n.valeur)
      });
      
      // Garder seulement la dernière note (la plus récente)
      const toKeep = notes.sort((a, b) => 
        b.date_attribution.getTime() - a.date_attribution.getTime()
      )[0];
      
      const toDelete = notes.filter(n => n.id_note !== toKeep.id_note);
      
      console.log(`  → Suppression de ${toDelete.length} doublon(s)...`);
      for (const note of toDelete) {
        await prisma.note.delete({
          where: { id_note: note.id_note }
        });
      }
    }
  }

  if (duplicatesFound === 0) {
    console.log('✅ Aucun doublon trouvé');
  } else {
    console.log(`\n✅ ${duplicatesFound} doublon(s) supprimé(s)`);
  }

  console.log('\n✨ Vérification terminée !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
