import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const prisma = new PrismaClient();

// Helper function to sanitize filename
const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9À-ÿ\-_]/g, '_');
};

// Helper function to generate schedule filename pattern
const getSchedulePattern = (nomClasse: string, anneeScolaire: string): string => {
  const sanitizedName = sanitizeFilename(nomClasse);
  const sanitizedYear = sanitizeFilename(anneeScolaire);
  return `Emploi-${sanitizedName}-${sanitizedYear}`;
};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "..", "storage");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Filename will be set after fetching class details
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|xlsx|csv|png|jpg|jpeg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers PDF, Excel (xlsx/csv) et images (png/jpg) sont autorisés"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Get all classes
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const classes = await prisma.classe.findMany({
      include: {
        _count: {
          select: {
            eleves_classes: true,
            enseignements: true
          }
        }
      },
      orderBy: {
        annee_scolaire: 'desc'
      }
    });

    res.json({ success: true, data: classes });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get single class with details
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.id);

    const classe = await prisma.classe.findUnique({
      where: { id_classe: classId },
      include: {
        eleves_classes: {
          include: {
            eleve: {
              select: {
                id_eleve: true,
                nom: true,
                date_naissance: true,
                email: true,
                parent: {
                  select: {
                    id_user: true,
                    nom: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        enseignements: {
          include: {
            enseignant: {
              select: {
                id_user: true,
                nom: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!classe) {
      return res.status(404).json({ success: false, message: "Classe non trouvée" });
    }

    res.json({ success: true, data: classe });
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Create new class
router.post("/create", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    // Only admin can create classes
    if (userRole !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins peuvent créer des classes" 
      });
    }

    const { nom_classe, annee_scolaire } = req.body;

    if (!nom_classe || !annee_scolaire) {
      return res.status(400).json({ 
        success: false, 
        message: "Nom de classe et année scolaire requis" 
      });
    }

    // Check if class already exists
    const existingClass = await prisma.classe.findFirst({
      where: {
        nom_classe,
        annee_scolaire
      }
    });

    if (existingClass) {
      return res.status(400).json({ 
        success: false, 
        message: "Cette classe existe déjà pour cette année scolaire" 
      });
    }

    const classe = await prisma.classe.create({
      data: {
        nom_classe,
        annee_scolaire
      }
    });

    res.status(201).json({ 
      success: true, 
      data: classe,
      message: "Classe créée avec succès"
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Update class
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins peuvent modifier des classes" 
      });
    }

    const classId = parseInt(req.params.id);
    const { nom_classe, annee_scolaire } = req.body;

    if (!nom_classe || !annee_scolaire) {
      return res.status(400).json({ 
        success: false, 
        message: "Nom de classe et année scolaire requis" 
      });
    }

    const classe = await prisma.classe.update({
      where: { id_classe: classId },
      data: {
        nom_classe,
        annee_scolaire
      }
    });

    res.json({ 
      success: true, 
      data: classe,
      message: "Classe mise à jour avec succès"
    });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Delete class
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins peuvent supprimer des classes" 
      });
    }

    const classId = parseInt(req.params.id);

    // Check if class has students or teachings
    const classe = await prisma.classe.findUnique({
      where: { id_classe: classId },
      include: {
        _count: {
          select: {
            eleves_classes: true,
            enseignements: true
          }
        }
      }
    });

    if (!classe) {
      return res.status(404).json({ 
        success: false, 
        message: "Classe non trouvée" 
      });
    }

    if (classe._count.eleves_classes > 0 || classe._count.enseignements > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Impossible de supprimer une classe avec des élèves ou enseignements" 
      });
    }

    await prisma.classe.delete({
      where: { id_classe: classId }
    });

    res.json({ 
      success: true, 
      message: "Classe supprimée avec succès"
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Add student to class
router.post("/:id/students", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins peuvent ajouter des élèves" 
      });
    }

    const classId = parseInt(req.params.id);
    const { id_eleve } = req.body;

    if (!id_eleve) {
      return res.status(400).json({ 
        success: false, 
        message: "ID de l'élève requis" 
      });
    }

    // Check if student is already in class
    const existing = await prisma.elevesClasse.findFirst({
      where: {
        id_classe: classId,
        id_eleve: parseInt(id_eleve)
      }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Cet élève est déjà dans cette classe" 
      });
    }

    const eleveClasse = await prisma.elevesClasse.create({
      data: {
        id_classe: classId,
        id_eleve: parseInt(id_eleve)
      },
      include: {
        eleve: {
          select: {
            id_eleve: true,
            nom: true,
            date_naissance: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ 
      success: true, 
      data: eleveClasse,
      message: "Élève ajouté à la classe"
    });
  } catch (error) {
    console.error("Error adding student to class:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Remove student from class
router.delete("/:id/students/:studentId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins peuvent retirer des élèves" 
      });
    }

    const classId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    const eleveClasse = await prisma.elevesClasse.findFirst({
      where: {
        id_classe: classId,
        id_eleve: studentId
      }
    });

    if (!eleveClasse) {
      return res.status(404).json({ 
        success: false, 
        message: "Élève non trouvé dans cette classe" 
      });
    }

    await prisma.elevesClasse.delete({
      where: {
        id_eleve_classe: eleveClasse.id_eleve_classe
      }
    });

    res.json({ 
      success: true, 
      message: "Élève retiré de la classe"
    });
  } catch (error) {
    console.error("Error removing student from class:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Add teaching (enseignement) to class
router.post("/:id/enseignements", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins peuvent ajouter des enseignements" 
      });
    }

    const classId = parseInt(req.params.id);
    const { id_enseignant, matiere, id_coefficient_matiere } = req.body;

    if (!id_enseignant || !matiere) {
      return res.status(400).json({ 
        success: false, 
        message: "Enseignant et matière requis" 
      });
    }

    // Validate class exists
    const classeExist = await prisma.classe.findUnique({ where: { id_classe: classId } });
    if (!classeExist) {
      return res.status(404).json({ success: false, message: "Classe non trouvée" });
    }

    // Validate teacher exists and is enseignant
    const enseignantExist = await prisma.user.findUnique({ where: { id_user: parseInt(id_enseignant) } });
    if (!enseignantExist || enseignantExist.role !== "enseignant") {
      return res.status(400).json({ success: false, message: "Enseignant invalide" });
    }

    // Resolve coefficient: if provided, ensure it exists; otherwise pick first available or create default
    let coefId: number;
    if (id_coefficient_matiere) {
      const parsedCoef = parseInt(id_coefficient_matiere);
      const coefExist = await prisma.coefficientMatiere.findUnique({ where: { id: parsedCoef } });
      if (!coefExist) {
        return res.status(400).json({ success: false, message: "Coefficient introuvable" });
      }
      coefId = parsedCoef;
    } else {
      const firstCoef = await prisma.coefficientMatiere.findFirst({ orderBy: { coefficient: 'asc' } });
      if (firstCoef) {
        coefId = firstCoef.id;
      } else {
        const createdCoef = await prisma.coefficientMatiere.create({ data: { coefficient: 1 } });
        coefId = createdCoef.id;
      }
    }

    // Check if this teacher already teaches this subject in this class
    const existing = await prisma.enseignement.findFirst({
      where: {
        id_classe: classId,
        id_enseignant: parseInt(id_enseignant),
        matiere: matiere
      }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Cet enseignant enseigne déjà cette matière dans cette classe" 
      });
    }

    const enseignement = await prisma.enseignement.create({
      data: {
        id_classe: classId,
        id_enseignant: parseInt(id_enseignant),
        matiere: matiere,
        id_coefficient_matiere: coefId
      },
      include: {
        enseignant: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        },
        coefficient_matiere: {
          select: {
            id: true,
            coefficient: true
          }
        }
      }
    });

    res.status(201).json({ 
      success: true, 
      data: enseignement,
      message: "Enseignement ajouté avec succès"
    });
  } catch (error) {
    console.error("Error adding enseignement to class:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Delete teaching (enseignement) from class
router.delete("/:id/enseignements/:enseignementId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins peuvent supprimer des enseignements" 
      });
    }

    const enseignementId = parseInt(req.params.enseignementId);

    // Check if teaching has notes
    const enseignement = await prisma.enseignement.findUnique({
      where: { id_enseignement: enseignementId },
      include: {
        _count: {
          select: {
            notes: true
          }
        }
      }
    });

    if (!enseignement) {
      return res.status(404).json({ 
        success: false, 
        message: "Enseignement non trouvé" 
      });
    }

    if (enseignement._count.notes > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Impossible de supprimer un enseignement avec des notes existantes" 
      });
    }

    await prisma.enseignement.delete({
      where: { id_enseignement: enseignementId }
    });

    res.json({ 
      success: true, 
      message: "Enseignement supprimé avec succès"
    });
  } catch (error) {
    console.error("Error deleting enseignement:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get all teachers
router.get("/teachers/list", authMiddleware, async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: "enseignant" },
      select: {
        id_user: true,
        nom: true,
        email: true
      },
      orderBy: { nom: 'asc' }
    });

    res.json({ success: true, data: teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get all coefficient options
router.get("/coefficients/list", authMiddleware, async (req: Request, res: Response) => {
  try {
    const coefficients = await prisma.coefficientMatiere.findMany({
      orderBy: { coefficient: 'asc' }
    });

    res.json({ success: true, data: coefficients });
  } catch (error) {
    console.error("Error fetching coefficients:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Check if schedule exists for a class
router.get("/:id/schedule/check", authMiddleware, async (req: Request, res: Response) => {
  try {
    const classId = req.params.id;
    
    // Get class details
    const classe = await prisma.classe.findUnique({
      where: { id_classe: parseInt(classId) }
    });
    
    if (!classe) {
      return res.status(404).json({ success: false, message: "Classe non trouvée" });
    }
    
    const storageDir = path.join(process.cwd(), "..", "storage");
    const filePattern = getSchedulePattern(classe.nom_classe, classe.annee_scolaire);
    const possibleExtensions = ['.pdf', '.xlsx', '.csv', '.png', '.jpg', '.jpeg'];
    let scheduleFile = null;
    
    for (const ext of possibleExtensions) {
      const filePath = path.join(storageDir, `${filePattern}${ext}`);
      if (fs.existsSync(filePath)) {
        scheduleFile = {
          filename: `${filePattern}${ext}`,
          extension: ext.substring(1)
        };
        break;
      }
    }
    
    res.json({ success: true, exists: !!scheduleFile, data: scheduleFile });
  } catch (error) {
    console.error("Error checking schedule:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Upload schedule for a class
router.post("/:id/schedule/upload", authMiddleware, upload.single('schedule'), async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    
    if (userRole !== "admin" && userRole !== "enseignant") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins et enseignants peuvent uploader un emploi" 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Aucun fichier fourni" 
      });
    }
    
    const classId = req.params.id;
    
    // Get class details
    const classe = await prisma.classe.findUnique({
      where: { id_classe: parseInt(classId) }
    });
    
    if (!classe) {
      return res.status(404).json({ success: false, message: "Classe non trouvée" });
    }
    
    const storageDir = path.join(process.cwd(), "..", "storage");
    const filePattern = getSchedulePattern(classe.nom_classe, classe.annee_scolaire);
    const ext = path.extname(req.file.originalname);
    const newFilename = `${filePattern}${ext}`;
    const newFilePath = path.join(storageDir, newFilename);
    
    // Delete old schedule files with different extensions
    const possibleExtensions = ['.pdf', '.xlsx', '.csv', '.png', '.jpg', '.jpeg'];
    for (const oldExt of possibleExtensions) {
      const oldFilePath = path.join(storageDir, `${filePattern}${oldExt}`);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    // Rename uploaded file to proper name
    fs.renameSync(req.file.path, newFilePath);
    
    res.json({ 
      success: true, 
      message: "Emploi du temps uploadé avec succès",
      data: {
        filename: newFilename,
        extension: ext.substring(1)
      }
    });
  } catch (error) {
    console.error("Error uploading schedule:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Download schedule for a class
router.get("/:id/schedule/download", authMiddleware, async (req: Request, res: Response) => {
  try {
    const classId = req.params.id;
    
    // Get class details
    const classe = await prisma.classe.findUnique({
      where: { id_classe: parseInt(classId) }
    });
    
    if (!classe) {
      return res.status(404).json({ success: false, message: "Classe non trouvée" });
    }
    
    const storageDir = path.join(process.cwd(), "..", "storage");
    const filePattern = getSchedulePattern(classe.nom_classe, classe.annee_scolaire);
    const possibleExtensions = ['.pdf', '.xlsx', '.csv', '.png', '.jpg', '.jpeg'];
    
    let scheduleFile = null;
    for (const ext of possibleExtensions) {
      const filePath = path.join(storageDir, `${filePattern}${ext}`);
      if (fs.existsSync(filePath)) {
        scheduleFile = filePath;
        break;
      }
    }
    
    if (!scheduleFile) {
      return res.status(404).json({ 
        success: false, 
        message: "Aucun emploi du temps trouvé pour cette classe" 
      });
    }
    
    res.download(scheduleFile);
  } catch (error) {
    console.error("Error downloading schedule:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Delete schedule for a class
router.delete("/:id/schedule", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    
    if (userRole !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Seuls les admins peuvent supprimer un emploi" 
      });
    }
    
    const classId = req.params.id;
    
    // Get class details
    const classe = await prisma.classe.findUnique({
      where: { id_classe: parseInt(classId) }
    });
    
    if (!classe) {
      return res.status(404).json({ success: false, message: "Classe non trouvée" });
    }
    
    const storageDir = path.join(process.cwd(), "..", "storage");
    const filePattern = getSchedulePattern(classe.nom_classe, classe.annee_scolaire);
    const possibleExtensions = ['.pdf', '.xlsx', '.csv', '.png', '.jpg', '.jpeg'];
    
    let deleted = false;
    for (const ext of possibleExtensions) {
      const filePath = path.join(storageDir, `${filePattern}${ext}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted = true;
      }
    }
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Aucun emploi du temps trouvé" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Emploi du temps supprimé avec succès"
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export { router as classesRoutes };
