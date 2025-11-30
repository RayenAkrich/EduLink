import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// Get all activities
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const activites = await prisma.activite.findMany({
      include: {
        classe: {
          select: {
            nom_classe: true,
            annee_scolaire: true
          }
        },
        enseignant: {
          select: {
            nom: true,
            email: true
          }
        },
        _count: {
          select: {
            absences: true
          }
        }
      },
      orderBy: { date_debut: 'desc' }
    });

    res.json({ success: true, data: activites });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get activities for parent's children classes - MUST be before /:id route
router.get("/my-children-activities", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id_user;

    if (userRole !== "parent") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les parents peuvent accéder à cette ressource" 
      });
    }

    // Get parent's children
    const children = await prisma.eleve.findMany({
      where: {
        id_parent: userId
      },
      include: {
        eleves_classes: {
          select: {
            id_classe: true
          }
        }
      }
    });

    // Extract class IDs
    const classIds = children.flatMap(child => 
      child.eleves_classes.map(ec => ec.id_classe)
    );

    // Get unique class IDs
    const uniqueClassIds = [...new Set(classIds)];

    if (uniqueClassIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Get activities for these classes
    const activites = await prisma.activite.findMany({
      where: {
        id_classe: {
          in: uniqueClassIds
        }
      },
      include: {
        classe: {
          select: {
            nom_classe: true,
            annee_scolaire: true
          }
        },
        enseignant: {
          select: {
            nom: true,
            email: true
          }
        },
        _count: {
          select: {
            absences: true
          }
        }
      },
      orderBy: { date_debut: 'desc' }
    });

    res.json({ success: true, data: activites });
  } catch (error) {
    console.error("Error fetching children activities:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get activity by ID
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const activiteId = parseInt(req.params.id);

    if (isNaN(activiteId)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID d'activité invalide" 
      });
    }

    const activite = await prisma.activite.findUnique({
      where: { id_activite: activiteId },
      include: {
        classe: {
          select: {
            nom_classe: true,
            annee_scolaire: true
          }
        },
        enseignant: {
          select: {
            nom: true,
            email: true
          }
        },
        absences: {
          include: {
            eleve: {
              select: {
                nom: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!activite) {
      return res.status(404).json({ success: false, message: "Activité non trouvée" });
    }

    res.json({ success: true, data: activite });
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get absences for an activity
router.get("/:id/absences", authMiddleware, async (req: Request, res: Response) => {
  try {
    const activiteId = parseInt(req.params.id);

    if (isNaN(activiteId)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID d'activité invalide" 
      });
    }

    const absences = await prisma.absence.findMany({
      where: { id_activite: activiteId },
      include: {
        eleve: {
          select: {
            nom: true,
            email: true
          }
        },
        activite: {
          select: {
            titre: true
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

// Create activity
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id_user;

    if (userRole !== "admin" && userRole !== "enseignant") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins et enseignants peuvent créer des activités" 
      });
    }

    const { titre, description, date_debut, date_fin, id_classe } = req.body;

    if (!titre || !date_debut || !date_fin || !id_classe) {
      return res.status(400).json({ 
        success: false, 
        message: "Veuillez remplir tous les champs obligatoires" 
      });
    }

    // Validate class exists
    const classe = await prisma.classe.findUnique({
      where: { id_classe: parseInt(id_classe) }
    });

    if (!classe) {
      return res.status(404).json({ 
        success: false, 
        message: "Classe non trouvée" 
      });
    }

    const activite = await prisma.activite.create({
      data: {
        titre,
        description: description || null,
        date_debut: new Date(date_debut),
        date_fin: new Date(date_fin),
        id_classe: parseInt(id_classe),
        cree_par: userId
      },
      include: {
        classe: {
          select: {
            nom_classe: true
          }
        },
        enseignant: {
          select: {
            nom: true
          }
        }
      }
    });

    res.json({ success: true, data: activite, message: "Activité créée avec succès" });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Update activity
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id_user;
    const activiteId = parseInt(req.params.id);

    if (isNaN(activiteId)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID d'activité invalide" 
      });
    }

    if (userRole !== "admin" && userRole !== "enseignant") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins et enseignants peuvent modifier des activités" 
      });
    }

    // Check if activity exists and get owner
    const existingActivite = await prisma.activite.findUnique({
      where: { id_activite: activiteId }
    });

    if (!existingActivite) {
      return res.status(404).json({ 
        success: false, 
        message: "Activité non trouvée" 
      });
    }

    // Teachers can only modify their own activities
    if (userRole === "enseignant" && existingActivite.cree_par !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Vous ne pouvez modifier que vos propres activités" 
      });
    }

    const { titre, description, date_debut, date_fin, id_classe } = req.body;

    const activite = await prisma.activite.update({
      where: { id_activite: activiteId },
      data: {
        titre: titre || undefined,
        description: description !== undefined ? description : undefined,
        date_debut: date_debut ? new Date(date_debut) : undefined,
        date_fin: date_fin ? new Date(date_fin) : undefined,
        id_classe: id_classe ? parseInt(id_classe) : undefined
      },
      include: {
        classe: {
          select: {
            nom_classe: true
          }
        },
        enseignant: {
          select: {
            nom: true
          }
        }
      }
    });

    res.json({ success: true, data: activite, message: "Activité modifiée avec succès" });
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Delete activity
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id_user;
    const activiteId = parseInt(req.params.id);

    if (isNaN(activiteId)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID d'activité invalide" 
      });
    }

    if (userRole !== "admin" && userRole !== "enseignant") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins et enseignants peuvent supprimer des activités" 
      });
    }

    // Check if activity exists and get owner
    const existingActivite = await prisma.activite.findUnique({
      where: { id_activite: activiteId }
    });

    if (!existingActivite) {
      return res.status(404).json({ 
        success: false, 
        message: "Activité non trouvée" 
      });
    }

    // Teachers can only delete their own activities
    if (userRole === "enseignant" && existingActivite.cree_par !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Vous ne pouvez supprimer que vos propres activités" 
      });
    }

    // Delete all related absences first
    await prisma.absence.deleteMany({
      where: { id_activite: activiteId }
    });

    await prisma.activite.delete({
      where: { id_activite: activiteId }
    });

    res.json({ success: true, message: "Activité supprimée avec succès" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export { router as activitesRoutes };
