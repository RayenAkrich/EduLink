// src/routes/message.ts
import { Router } from "express";
import { PrismaClient } from "../../generated/prisma/client";
import {authMiddleware} from "../middleware/authMiddleware";



const prisma = new PrismaClient();
const router = Router();

// ==========================================
//   THIS FUNCTION ATTACHES SOCKET.IO EVENTS
// ==========================================
export function registerMessageSocket(io: any) {
  io.on("connection", (socket: any) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} connected to socket`);
    }
  });
}

// ==========================================
//               SEND MESSAGE
// ==========================================
router.post("/send", authMiddleware, async (req: any, res) => {
  try {
    const { destinataire_id, contenu } = req.body;
    const expediteur_id = req.user.id_user;

    const newMsg = await prisma.message.create({
      data: {
        expediteur_id,
        destinataire_id,
        contenu,
      },
    });

    // emit to receiver
    req.io.to(`user:${destinataire_id}`).emit("message:new", newMsg);

    return res.json(newMsg);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error sending message" });
  }
});

// ==========================================
//           GET CONVERSATION
// ==========================================
router.get("/conversation/:id", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id_user;
    const otherId = Number(req.params.id);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { expediteur_id: userId, destinataire_id: otherId },
          { expediteur_id: otherId, destinataire_id: userId },
        ],
      },
      orderBy: { date_envoi: "asc" },
    });

    return res.json(messages);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error loading conversation" });
  }
});

// ==========================================
//        GET CONVERSATION LIST
// ==========================================
router.get("/list", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id_user;

    const list: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        u.id_user,
        u.nom,
        (
          SELECT contenu FROM "Message"
          WHERE 
            (expediteur_id = u.id_user AND destinataire_id = ${userId}) OR
            (expediteur_id = ${userId} AND destinataire_id = u.id_user)
          ORDER BY date_envoi DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT COUNT(*) FROM "Message"
          WHERE destinataire_id = ${userId} AND expediteur_id = u.id_user AND lu = false
        ) AS unread
      FROM "User" u
      WHERE u.id_user != ${userId}
    `);

    // Convert BigInt to Number for JSON serialization
    const serializedList = list.map(item => ({
      id_user: Number(item.id_user),
      nom: item.nom,
      last_message: item.last_message,
      unread: Number(item.unread)
    }));

    return res.json(serializedList);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error loading conversations" });
  }
});

// ==========================================
//            MARK AS READ
// ==========================================
router.patch("/read", authMiddleware, async (req: any, res) => {
  try {
    const otherId = Number(req.body.otherId);
    const userId = req.user.id_user;

    await prisma.message.updateMany({
      where: {
        destinataire_id: userId,
        expediteur_id: otherId,
        lu: false,
      },
      data: { lu: true },
    });

    return res.json({ message: "Marked as read" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Could not update messages" });
  }
});

// ==========================================
//               EXPORT ROUTER
// ==========================================
export default router;
