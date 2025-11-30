import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// Get all students
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const students = await prisma.eleve.findMany({
      include: {
        parent: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        },
        eleves_classes: {
          include: {
            classe: {
              select: {
                id_classe: true,
                nom_classe: true,
                annee_scolaire: true
              }
            }
          }
        }
      },
      orderBy: {
        nom: 'asc'
      }
    });

    res.json({ success: true, data: students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get my children (for parents) - MUST be before /:id route
router.get("/my-children", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id_user;

    if (userRole !== "parent") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les parents peuvent accéder à cette ressource" 
      });
    }

    const children = await prisma.eleve.findMany({
      where: {
        id_parent: userId
      },
      include: {
        eleves_classes: {
          include: {
            classe: {
              select: {
                id_classe: true,
                nom_classe: true,
                annee_scolaire: true
              }
            }
          }
        }
      },
      orderBy: {
        nom: 'asc'
      }
    });

    res.json({ success: true, data: children });
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get single student
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.id);

    if (isNaN(studentId)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID d'étudiant invalide" 
      });
    }

    const student = await prisma.eleve.findUnique({
      where: { id_eleve: studentId },
      include: {
        parent: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        },
        eleves_classes: {
          include: {
            classe: {
              select: {
                id_classe: true,
                nom_classe: true,
                annee_scolaire: true
              }
            }
          }
        },
        notes: {
          include: {
            enseignement: {
              select: {
                matiere: true
              }
            },
            type_note: {
              select: {
                libelle: true,
                coefficient: true
              }
            }
          }
        },
        absences: true
      }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Élève non trouvé" });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Create new student
router.post("/create", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    // Only admin can create students
    if (userRole !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins peuvent créer des élèves" 
      });
    }

    const { nom, date_naissance, email, id_parent } = req.body;

    if (!nom || !date_naissance || !id_parent) {
      return res.status(400).json({ 
        success: false, 
        message: "Nom, date de naissance et parent requis" 
      });
    }

    const student = await prisma.eleve.create({
      data: {
        nom,
        date_naissance: new Date(date_naissance),
        email: email || null,
        id_parent: parseInt(id_parent)
      },
      include: {
        parent: {
          select: {
            nom: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ 
      success: true, 
      data: student,
      message: "Élève créé avec succès"
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Update student
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins peuvent modifier des élèves" 
      });
    }

    const studentId = parseInt(req.params.id);
    const { nom, date_naissance, email } = req.body;

    if (!nom || !date_naissance) {
      return res.status(400).json({ 
        success: false, 
        message: "Nom et date de naissance requis" 
      });
    }

    const student = await prisma.eleve.update({
      where: { id_eleve: studentId },
      data: {
        nom,
        date_naissance: new Date(date_naissance),
        email: email || null
      }
    });

    res.json({ 
      success: true, 
      data: student,
      message: "Élève mis à jour avec succès"
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Delete student
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins peuvent supprimer des élèves" 
      });
    }

    const studentId = parseInt(req.params.id);

    // Check if student has notes or absences
    const student = await prisma.eleve.findUnique({
      where: { id_eleve: studentId },
      include: {
        _count: {
          select: {
            notes: true,
            absences: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Élève non trouvé" 
      });
    }

    if (student._count.notes > 0 || student._count.absences > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Impossible de supprimer un élève avec des notes ou absences" 
      });
    }

    await prisma.eleve.delete({
      where: { id_eleve: studentId }
    });

    res.json({ 
      success: true, 
      message: "Élève supprimé avec succès"
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export { router as studentsRoutes };
