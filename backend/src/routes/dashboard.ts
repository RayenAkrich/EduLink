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
        const eleves : Eleve[] =await prisma.eleve.findMany({
            where : {
                id_parent: parentId
            }})
        res.status(200).json(eleves)
        }catch(e){
            next(e);
        }
        
    }
)