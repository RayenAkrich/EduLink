import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// Get all conversations for current user
router.get("/conversations", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id_user;

    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { expediteur_id: userId },
          { destinataire_id: userId }
        ]
      },
      include: {
        expediteur: { select: { id_user: true, nom: true, email: true, role: true } },
        destinataire: { select: { id_user: true, nom: true, email: true, role: true } }
      },
      orderBy: { date_envoi: 'desc' }
    });

    // Group by conversation partner
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const partnerId = msg.expediteur_id === userId ? msg.destinataire_id : msg.expediteur_id;
      const partner = msg.expediteur_id === userId ? msg.destinataire : msg.expediteur;
      
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      // Count unread messages from this partner
      if (msg.destinataire_id === userId && !msg.lu) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get messages with specific user
router.get("/conversation/:userId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.id_user;
    const otherUserId = parseInt(req.params.userId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { expediteur_id: currentUserId, destinataire_id: otherUserId },
          { expediteur_id: otherUserId, destinataire_id: currentUserId }
        ]
      },
      include: {
        expediteur: { select: { id_user: true, nom: true, role: true } },
        destinataire: { select: { id_user: true, nom: true, role: true } }
      },
      orderBy: { date_envoi: 'asc' }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        expediteur_id: otherUserId,
        destinataire_id: currentUserId,
        lu: false
      },
      data: { lu: true }
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Send message
router.post("/send", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { destinataire_id, contenu } = req.body;
    const expediteur_id = req.user!.id_user;

    if (!destinataire_id || !contenu) {
      return res.status(400).json({ success: false, message: "Données manquantes" });
    }

    const message = await prisma.message.create({
      data: {
        expediteur_id,
        destinataire_id: parseInt(destinataire_id),
        contenu
      },
      include: {
        expediteur: { select: { id_user: true, nom: true, role: true } },
        destinataire: { select: { id_user: true, nom: true, role: true } }
      }
    });

    // Create notification for recipient
    const notification = await prisma.notification.create({
      data: {
        id_user: parseInt(destinataire_id),
        type: "message",
        titre: `Nouveau message de ${message.expediteur.nom}`,
        contenu: `${message.expediteur.nom} vous a envoyé un message`,
        reference_id: message.id_message,
        reference_type: "message"
      }
    });

    // Emit socket event to recipient
    const io = req.app.get("io");
    const activeUsers = req.app.get("activeUsers");
    const recipientSocketId = activeUsers.get(parseInt(destinataire_id));

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("new_message", message);
      io.to(recipientSocketId).emit("new_notification", notification);
    }

    res.json({ success: true, data: message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Get users to message (admin/teacher only)
router.get("/users", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.id_user;

    let whereClause: any = { id_user: { not: userId } };

    // Admin can message teachers
    if (userRole === "admin") {
      whereClause.role = "enseignant";
    }
    // Teachers can message admins
    else if (userRole === "enseignant") {
      whereClause.role = "admin";
    } else {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id_user: true,
        nom: true,
        email: true,
        role: true
      }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

export { router as messagesRoutes };