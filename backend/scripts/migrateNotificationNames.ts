import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function migrate() {
  console.log("Starting notification migration...");

  // Migrate message notifications
  const messageNotifications = await prisma.notification.findMany({ where: { type: "message" } });
  let messageUpdated = 0;
  for (const notif of messageNotifications) {
    if (!notif.reference_id) continue;
    const message = await prisma.message.findUnique({ where: { id_message: notif.reference_id }, include: { expediteur: true } });
    if (!message || !message.expediteur) continue;
    const name = message.expediteur.nom || message.expediteur.email || "Utilisateur";
    await prisma.notification.update({ where: { id_notification: notif.id_notification }, data: { titre: `Nouveau message de ${name}`, contenu: `${name} vous a envoyé un message` } });
    messageUpdated++;
  }

  // Migrate announcement notifications
  const announceNotifications = await prisma.notification.findMany({ where: { type: "announcement" } });
  let announceUpdated = 0;
  for (const notif of announceNotifications) {
    if (!notif.reference_id) continue;
    const announcement = await prisma.annonce.findUnique({ where: { id_annonce: notif.reference_id }, include: { auteur: true } });
    if (!announcement || !announcement.auteur) continue;
    const name = announcement.auteur.nom || announcement.auteur.email || "Utilisateur";
    await prisma.notification.update({ where: { id_notification: notif.id_notification }, data: { titre: `Nouvelle annonce de ${name}`, contenu: `${name} : ${announcement.titre}` } });
    announceUpdated++;
  }

  console.log(`Migration completed: ${messageUpdated} message notifications updated, ${announceUpdated} announcement notifications updated.`);
  await prisma.$disconnect();
}

migrate().catch(e => {
  console.error("Migration failed:", e);
  prisma.$disconnect();
});
