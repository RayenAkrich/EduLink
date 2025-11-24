import express from "express";
import prisma from "../services/prismaClient";
export const activitiesRoutes = express.Router();
activitiesRoutes.get('/',(req,res)=>{
    res.json('')
})
activitiesRoutes.post('/',async(req,res,next)=>{
    try{
        const{
            titre,
            description,
            date_debut,
            date_fin,
            id_classe,
            cree_par
        }=req.body;
        const activity=await prisma.activite.create({
        data : {
            titre,
            description,
            date_debut,
            date_fin,
            id_classe,
            cree_par
        }
    })
    } catch (error: any) {
        next(error);
    }

})