import  express from "express";
import prisma from "../services/prismaClient";
import { Eleve } from "@prisma/client";
export const notesRoutes = express.Router();

notesRoutes.get('/child/:id',async(req,res,next)=>{
    const id = Number(req.params.id);
    if (!id){
        throw new Error ("erreu d id");
    }
    try{
        const notesMATtyp=await prisma.
    }
})