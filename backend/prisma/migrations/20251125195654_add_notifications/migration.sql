-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('message', 'announcement', 'note', 'absence', 'system');

-- CreateTable
CREATE TABLE "Notification" (
    "id_notification" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "reference_id" INTEGER,
    "reference_type" TEXT,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id_notification")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
