import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// Get all absences (admin only)
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin" && userRole !== "enseignant") {
      return res.status(403).json({ 
        success: false, 
        message: "Accès refusé" 
      });
    }

    const absences = await prisma.absence.findMany({
      include: {
        eleve: {
          select: {
            nom: true,
            email: true
          }
        },
        activite: {
          select: {
            titre: true,
            date_debut: true,
            date_fin: true,
            classe: {
              select: {
                nom_classe: true
              }
            }
          }
        }
      },
      orderBy: { id_absence: 'desc' }
    });

    res.json({ success: true, data: absences });
  } catch (error) {
    console.error("Error fetching absences:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get absence by ID
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const absenceId = parseInt(req.params.id);

    const absence = await prisma.absence.findUnique({
      where: { id_absence: absenceId },
      include: {
        eleve: {
          select: {
            nom: true,
            email: true
          }
        },
        activite: {
          select: {
            titre: true,
            date_debut: true,
            date_fin: true
          }
        }
      }
    });

    if (!absence) {
      return res.status(404).json({ success: false, message: "Absence non trouvée" });
    }

    res.json({ success: true, data: absence });
  } catch (error) {
    console.error("Error fetching absence:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get absences for a student
router.get("/student/:studentId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.studentId);

    const absences = await prisma.absence.findMany({
      where: { id_eleve: studentId },
      include: {
        activite: {
          select: {
            titre: true,
            date_debut: true,
            date_fin: true,
            classe: {
              select: {
                nom_classe: true
              }
            }
          }
        }
      },
      orderBy: { id_absence: 'desc' }
    });

    res.json({ success: true, data: absences });
  } catch (error) {
    console.error("Error fetching student absences:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Create absence
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin" && userRole !== "enseignant") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins et enseignants peuvent créer des absences" 
      });
    }

    const { id_activite, id_eleve, justifiee, commentaire } = req.body;

    if (!id_activite || !id_eleve) {
      return res.status(400).json({ 
        success: false, 
        message: "Veuillez remplir tous les champs obligatoires" 
      });
    }

    // Validate activity exists
    const activite = await prisma.activite.findUnique({
      where: { id_activite: parseInt(id_activite) }
    });

    if (!activite) {
      return res.status(404).json({ 
        success: false, 
        message: "Activité non trouvée" 
      });
    }

    // Validate student exists
    const eleve = await prisma.eleve.findUnique({
      where: { id_eleve: parseInt(id_eleve) }
    });

    if (!eleve) {
      return res.status(404).json({ 
        success: false, 
        message: "Élève non trouvé" 
      });
    }

    // Check if absence already exists for this student and activity
    const existingAbsence = await prisma.absence.findFirst({
      where: {
        id_activite: parseInt(id_activite),
        id_eleve: parseInt(id_eleve)
      }
    });

    if (existingAbsence) {
      return res.status(400).json({ 
        success: false, 
        message: "Cette absence existe déjà" 
      });
    }

    const absence = await prisma.absence.create({
      data: {
        id_activite: parseInt(id_activite),
        id_eleve: parseInt(id_eleve),
        justifiee: justifiee || false,
        commentaire: commentaire || null
      },
      include: {
        eleve: {
          select: {
            nom: true
          }
        },
        activite: {
          select: {
            titre: true
          }
        }
      }
    });

    res.json({ success: true, data: absence, message: "Absence créée avec succès" });
  } catch (error) {
    console.error("Error creating absence:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Update absence
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    const absenceId = parseInt(req.params.id);

    if (userRole !== "admin" && userRole !== "enseignant") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins et enseignants peuvent modifier des absences" 
      });
    }

    const { justifiee, commentaire } = req.body;

    const absence = await prisma.absence.update({
      where: { id_absence: absenceId },
      data: {
        justifiee: justifiee !== undefined ? justifiee : undefined,
        commentaire: commentaire !== undefined ? commentaire : undefined
      },
      include: {
        eleve: {
          select: {
            nom: true
          }
        },
        activite: {
          select: {
            titre: true
          }
        }
      }
    });

    res.json({ success: true, data: absence, message: "Absence modifiée avec succès" });
  } catch (error) {
    console.error("Error updating absence:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Delete absence
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    const absenceId = parseInt(req.params.id);

    if (userRole !== "admin" && userRole !== "enseignant") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins et enseignants peuvent supprimer des absences" 
      });
    }

    await prisma.absence.delete({
      where: { id_absence: absenceId }
    });

    res.json({ success: true, message: "Absence supprimée avec succès" });
  } catch (error) {
    console.error("Error deleting absence:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export { router as absencesRoutes };
