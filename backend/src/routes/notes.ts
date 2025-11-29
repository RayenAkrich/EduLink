import  express from "express";
import prisma from "../services/prismaClient";
import { Eleve } from "@prisma/client";
export const notesRoutes = express.Router();

notesRoutes.get('/child/:id',async(req,res,next)=>{
    const id = Number(req.params.id);
    if (!id){
        throw new Error ("erreur d id");
    }
    try{
        const notesMATtyp=await prisma.note.findMany({
            where:{
                id_eleve: id
            },
            include:{
                type_note:{
                    select:{
                        libelle:true,
                        coefficient:true
                    }
                },
                enseignement: {
            select: {
                matiere: true,
                enseignant: { select: { nom: true } },
                coefficient_matiere: {
                    select: { coefficient: true }
                }
            }
        },
                eleve:{
                    include:{
                        eleves_classes:{
                            include:{
                                classe:{
                                    select:{
                                        nom_classe:true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
        })
        const formatted=notesMATtyp.map((noteMATtyp)=>({
            idchild:noteMATtyp.id_eleve,
            subject:noteMATtyp.enseignement.matiere,
            enseignant:noteMATtyp.enseignement.enseignant.nom,
            typedev:noteMATtyp.type_note.libelle,
            coefficientNote:noteMATtyp.type_note.coefficient,
            coefficientMatiere:noteMATtyp.enseignement.coefficient_matiere?.coefficient || 1,
            date:noteMATtyp.date_attribution,
            score:noteMATtyp.valeur,
            nomclass:noteMATtyp.eleve.eleves_classes[0]?.classe.nom_classe || "Classe inconnue",
        }))
        res.status(200).json(formatted);
    }catch(e){
        next(e);
    }
})
notesRoutes.get('/ClassMatiere/:id',async(req,res,next)=>{
    try{
        const idEns=Number(req.params.id)
        if(isNaN(idEns)){
            throw new Error ("id enseignant invalide");
        }
        const classes_matieres_elev=await prisma.enseignement.findMany({
            where:{
                id_enseignant:idEns
            },
            select:{
                classe:{
                    select:{
                        id_classe:true,
                        nom_classe:true,
                        eleves_classes:{
                            select:{
                                eleve:{
                                    select:{
                                        id_eleve:true,
                                        nom:true
                                    }
                                }
                            }
                        }
                    }
                },
                matiere:true
            },
            
        })
        const filteredresult=classes_matieres_elev.map((classe_matiere_elev)=>({
            classeId:classe_matiere_elev.classe.id_classe,
            classe:classe_matiere_elev.classe.nom_classe,
            subject:classe_matiere_elev.matiere,
            nomEleves:classe_matiere_elev.classe.eleves_classes.map((elev)=>({
                nom:elev.eleve.nom,
                id:elev.eleve.id_eleve,
            }))
        }))
        res.status(200).json(filteredresult);
    }catch(e){
        next(e);
    }
})

// Route pour récupérer les notes existantes pour une classe/matière (date ignorée - on prend toutes les notes)
notesRoutes.get('/existing/:classeId/:matiere/:date', async (req, res, next) => {
    try {
        const { classeId, matiere } = req.params;
        // La date est ignorée - on retourne TOUTES les notes de la matière
        
        console.log(`Récupération notes pour classe ${classeId}, matière ${matiere} (toutes dates)`);
        
        // Trouver l'enseignement
        const enseignement = await prisma.enseignement.findFirst({
            where: {
                id_classe: parseInt(classeId),
                matiere: decodeURIComponent(matiere)
            }
        });

        if (!enseignement) {
            return res.json([]); // Retourner tableau vide si pas d'enseignement
        }

        // Récupérer TOUTES les notes pour cette classe/matière (SANS filtre de date)
        const notes = await prisma.note.findMany({
            where: {
                id_enseignement: enseignement.id_enseignement
            },
            include: {
                type_note: {
                    select: {
                        libelle: true
                    }
                },
                eleve: {
                    select: {
                        id_eleve: true
                    }
                }
            }
        });

        // Organiser les notes par élève et type
        const notesParEleve: Record<string, any> = {};
        
        notes.forEach(note => {
            const eleveId = note.eleve.id_eleve.toString();
            const typeNote = note.type_note.libelle;
            
            if (!notesParEleve[eleveId]) {
                notesParEleve[eleveId] = {
                    studentId: eleveId,
                    oral: null,
                    controle: null,
                    synthese: null
                };
            }
            
            notesParEleve[eleveId][typeNote] = note.valeur;
        });

        res.json(Object.values(notesParEleve));
        
    } catch (e) {
        console.error('Erreur récupération notes:', e);
        next(e);
    }
});

// ...existing code...
notesRoutes.post('/save', async (req, res, next) => {
    try {
        const { classe, matiere, date, assessmentType, notes } = req.body;
        
        // Validation des données reçues
        if (!classe || !matiere || !date || !assessmentType || !Array.isArray(notes)) {
            return res.status(400).json({
                success: false,
                message: "Données manquantes ou invalides"
            });
        }

        const savedNotes = [];
        
        console.log('=== DEBUT SAUVEGARDE ===');
        console.log('Données reçues:', { classe, matiere, date, assessmentType, notes });
        
        // Boucler sur chaque note à sauvegarder
        for (const noteData of notes) {
            const { studentId, oral, controle, synthese } = noteData;
            
            console.log(`\nTraitement élève ${studentId}:`, { oral, controle, synthese });
            
            if (!studentId) continue; // Ignorer si pas d'ID étudiant
            
            // Préparer les notes à sauvegarder (oral, contrôle, synthèse)
            const notesToSave = [
                { type: 'oral', value: oral },
                { type: 'controle', value: controle },
                { type: 'synthese', value: synthese }
            ];
            
            // Traiter chaque type de note
            for (const noteInfo of notesToSave) {
                // Ne sauvegarder que si une valeur est présente
                if (noteInfo.value === null || noteInfo.value === undefined) {
                    continue;
                }
                
                const noteValue = noteInfo.value;
                const noteType = noteInfo.type;
                
                console.log(`Type: ${noteType}, Valeur: ${noteValue}`);
            
            // 1. Trouver l'enseignement correspondant (prof + classe + matière)
            console.log(`Recherche enseignement pour classe ${classe} et matière ${matiere}`);
            
            // Debug: Afficher tous les enseignements disponibles
            const tousEnseignements = await prisma.enseignement.findMany({
                select: {
                    id_enseignement: true,
                    id_classe: true,
                    matiere: true,
                    id_enseignant: true
                }
            });
            console.log('Tous les enseignements disponibles:', tousEnseignements);
            
            const enseignement = await prisma.enseignement.findFirst({
                where: {
                    id_classe: parseInt(classe),
                    matiere: matiere
                }
            });
            
            console.log('Enseignement trouvé:', enseignement);
            
            if (!enseignement) {
                console.warn(`Enseignement non trouvé pour classe ${classe} et matière ${matiere}`);
                continue;
            }
            
            // 2. Trouver ou créer le type de note
            console.log(`Recherche type de note pour libellé: ${noteType}`);
            let typeNote = await prisma.typeNote.findFirst({
                where: {
                    libelle: noteType as any // Cast nécessaire pour l'enum
                }
            });
            
            console.log('Type de note trouvé:', typeNote);
            
            // Si le type de note n'existe pas, le créer
            if (!typeNote) {
                const coefficients = {
                    'oral': 1,
                    'controle': 2,
                    'synthese': 3
                };
                
                typeNote = await prisma.typeNote.create({
                    data: {
                        libelle: noteType as any,
                        coefficient: coefficients[noteType as keyof typeof coefficients] || 1
                    }
                });
            }
            
            // 3. Vérifier si une note existe déjà pour cet élève, cette matière et ce type (SANS date)
            // Un élève ne peut avoir qu'UNE SEULE note de chaque type par matière
            const existingNote = await prisma.note.findFirst({
                where: {
                    id_eleve: parseInt(studentId),
                    id_enseignement: enseignement.id_enseignement,
                    id_type_note: typeNote.id_type_note
                }
            });
            
            // 4. Créer ou mettre à jour la note (valeur ET date)
            console.log('Note existante trouvée:', existingNote);
            
            if (existingNote) {
                console.log('Mise à jour de la note existante (valeur + date)');
                // Mettre à jour la note existante avec la nouvelle valeur ET la nouvelle date
                const updatedNote = await prisma.note.update({
                    where: {
                        id_note: existingNote.id_note
                    },
                    data: {
                        valeur: noteValue,
                        date_attribution: new Date(date)
                    }
                });
                console.log('Note mise à jour:', updatedNote);
                savedNotes.push(updatedNote);
            } else {
                console.log('Création d\'une nouvelle note avec:', {
                    valeur: noteValue,
                    date_attribution: new Date(date),
                    id_eleve: parseInt(studentId),
                    id_enseignement: enseignement.id_enseignement,
                    id_type_note: typeNote.id_type_note
                });
                // Créer une nouvelle note
                const newNote = await prisma.note.create({
                    data: {
                        valeur: noteValue,
                        date_attribution: new Date(date),
                        id_eleve: parseInt(studentId),
                        id_enseignement: enseignement.id_enseignement,
                        id_type_note: typeNote.id_type_note
                    }
                });
                console.log('Nouvelle note créée:', newNote);
                savedNotes.push(newNote);
            }
            } // Fin de la boucle des types de notes
        }
        
        res.status(200).json({
            success: true,
            message: `${savedNotes.length} note(s) sauvegardée(s) avec succès`,
            count: savedNotes.length
        });
        
    } catch (e) {
        console.error("Erreur lors de la sauvegarde des notes:", e);
        next(e);
    }
});