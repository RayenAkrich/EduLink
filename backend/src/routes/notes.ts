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