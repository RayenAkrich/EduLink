import  express from "express";
import prisma from "../services/prismaClient";
import { Eleve } from "@prisma/client";
export const dashboardRoutes = express.Router();
dashboardRoutes.get('/parent/:id/children',async (req,res,next)=>{
    console.log("GET /parent/:id/children called with id=", req.params.id);
    try{
        const parentId = Number(req.params.id);

        if (isNaN(parentId)) {
            return res.status(400).json({ error: "Invalid parent ID" });
        }
        const eleves =await prisma.eleve.findMany({
            where : {
                id_parent: parentId
            },
            include: {
                eleves_classes: {
                    include: {
                        classe: {
                            select: {
                                nom_classe: true,
                                annee_scolaire: true
                            }
                        }
                    }
                },
                notes: {
                    select: {
                        valeur: true
                    }
                },
                absences: {
                    select: {
                        id_absence: true
                    }
                }
            }
        });

        // Formater les données avec classe et statistiques
        const formattedEleves = eleves.map(eleve => {
            const classe = eleve.eleves_classes[0]?.classe;
            const totalNotes = eleve.notes.length;
            const moyenne = totalNotes > 0 
                ? (eleve.notes.reduce((sum, note) => sum + note.valeur, 0) / totalNotes).toFixed(2)
                : null;
            
            return {
                id_eleve: eleve.id_eleve,
                nom: eleve.nom,
                date_naissance: eleve.date_naissance,
                email: eleve.email,
                id_parent: eleve.id_parent,
                classe: classe?.nom_classe || null,
                annee_scolaire: classe?.annee_scolaire || null,
                moyenne: moyenne,
                totalNotes: totalNotes,
                totalAbsences: eleve.absences.length
            };
        });

        res.status(200).json(formattedEleves)
        }catch(e){
            next(e);
        }
        
    }
)