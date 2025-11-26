import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// Create announcement
router.post("/create", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { titre, contenu, id_classe, targetRole, targetUserIds } = req.body;
    const auteurId = req.user!.id_user;
    const userRole = req.user!.role;

    // Validation: teachers can only announce to parents
    if (userRole === "enseignant" && targetRole && targetRole !== "parent") {
      return res.status(403).json({ 
        success: false, 
        message: "Les enseignants ne peuvent créer des annonces que pour les parents" 
      });
    }

    // Create announcement
    const announcement = await prisma.annonce.create({
      data: {
        titre,
        contenu,
        id_auteur: auteurId,
        id_classe: id_classe ? parseInt(id_classe) : null
      },
      include: {
        auteur: { select: { nom: true, role: true } },
        classe: { select: { nom_classe: true } }
      }
    });

    // Determine recipients
    let recipients: any[] = [];

    if (targetUserIds && targetUserIds.length > 0) {
      // Specific users
      recipients = await prisma.user.findMany({
        where: { id_user: { in: targetUserIds.map((id: string) => parseInt(id)) } },
        select: { id_user: true }
      });
    } else if (targetRole) {
      // All users of a role
      let whereClause: any = { role: targetRole };
      
      // If teacher creating announcement, only get parents of their students
      if (userRole === "enseignant" && id_classe) {
        const studentsInClass = await prisma.elevesClasse.findMany({
          where: { id_classe: parseInt(id_classe) },
          include: { eleve: true }
        });
        
        const parentIds = studentsInClass.map(ec => ec.eleve.id_parent);
        whereClause = { 
          role: "parent",
          id_user: { in: parentIds }
        };
      }
      
      recipients = await prisma.user.findMany({
        where: whereClause,
        select: { id_user: true }
      });
    } else if (id_classe) {
      // All parents in a class
      const studentsInClass = await prisma.elevesClasse.findMany({
        where: { id_classe: parseInt(id_classe) },
        include: { eleve: true }
      });
      
      const parentIds = studentsInClass.map(ec => ec.eleve.id_parent);
      recipients = await prisma.user.findMany({
        where: { 
          id_user: { in: parentIds },
          role: "parent"
        },
        select: { id_user: true }
      });
    }

    // Create notifications for all recipients
    const notifications = await Promise.all(
      recipients.map(recipient =>
        prisma.notification.create({
          data: {
            id_user: recipient.id_user,
            type: "announcement",
            titre: `Nouvelle annonce de ${announcement.auteur.nom}`,
            contenu: `${announcement.auteur.nom} : ${titre}`,
            reference_id: announcement.id_annonce,
            reference_type: "announcement"
          }
        })
      )
    );

    // Emit socket events to online recipients
    const io = req.app.get("io");
    const activeUsers = req.app.get("activeUsers");

    recipients.forEach((recipient, index) => {
      const socketId = activeUsers.get(recipient.id_user);
      if (socketId) {
        io.to(socketId).emit("new_announcement", announcement);
        io.to(socketId).emit("new_notification", notifications[index]);
      }
    });

    res.json({ 
      success: true, 
      data: announcement,
      message: `Annonce créée et envoyée à ${recipients.length} utilisateur(s)`
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get announcements for current user
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id_user;
    const userRole = req.user!.role;

    let announcements;

    if (userRole === "parent") {
      // Parents see announcements targeted to them
      const student = await prisma.eleve.findFirst({
        where: { id_parent: userId },
        include: { eleves_classes: true }
      });

      const classIds = student?.eleves_classes.map(ec => ec.id_classe) || [];

      announcements = await prisma.annonce.findMany({
        where: {
          OR: [
            { id_classe: { in: classIds } },
            { id_classe: null } // General announcements
          ]
        },
        include: {
          auteur: { select: { nom: true, role: true } },
          classe: { select: { nom_classe: true } }
        },
        orderBy: { date_publication: 'desc' }
      });
    } else {
      // Admin and teachers see all announcements
      announcements = await prisma.annonce.findMany({
        include: {
          auteur: { select: { nom: true, role: true } },
          classe: { select: { nom_classe: true } }
        },
        orderBy: { date_publication: 'desc' }
      });
    }

    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get filter options (users, classes)
router.get("/filter-options", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id_user;

    type UserOption = {
      id_user: number;
      nom: string | null;
      email?: string | null;
      role: string;
      studentName?: string | null;
    };

    type ClassOption = {
      id_classe: number;
      nom_classe: string | null;
      annee_scolaire?: string | null;
    };

    let users: UserOption[] = [];
    let classes: ClassOption[] = [];

    if (userRole === "admin") {
      // Admin can select teachers or parents
      users = await prisma.user.findMany({
        where: {
          role: { in: ["enseignant", "parent"] },
          id_user: { not: userId }
        },
        select: { id_user: true, nom: true, email: true, role: true }
      });

      classes = await prisma.classe.findMany({
        select: { id_classe: true, nom_classe: true, annee_scolaire: true }
      });
    } else if (userRole === "enseignant") {
      // Teachers can select parents from their classes
      const teacherClasses = await prisma.enseignement.findMany({
        where: { id_enseignant: userId },
        include: {
          classe: {
            include: {
              eleves_classes: {
                include: {
                  eleve: {
                    include: {
                      parent: { select: { id_user: true, nom: true, email: true, role: true } }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Get unique parents
      const parentsSet = new Set();
      const parentsArray: any[] = [];

      teacherClasses.forEach(tc => {
        tc.classe.eleves_classes.forEach(ec => {
          if (!parentsSet.has(ec.eleve.parent.id_user)) {
            parentsSet.add(ec.eleve.parent.id_user);
            parentsArray.push({
              ...ec.eleve.parent,
              studentName: ec.eleve.nom
            });
          }
        });
      });

      users = parentsArray;
      classes = teacherClasses.map(tc => tc.classe);
    }

    res.json({ success: true, data: { users, classes } });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Delete announcement (author only)
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const announcementId = parseInt(req.params.id);
    const userId = req.user!.id_user;

    const announcement = await prisma.annonce.findUnique({
      where: { id_annonce: announcementId }
    });

    if (!announcement || announcement.id_auteur !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Vous ne pouvez supprimer que vos propres annonces" 
      });
    }

    await prisma.annonce.delete({
      where: { id_annonce: announcementId }
    });

    res.json({ success: true, message: "Annonce supprimée" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export { router as announcementsRoutes };