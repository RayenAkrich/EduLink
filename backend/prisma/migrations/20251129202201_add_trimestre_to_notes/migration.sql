/*
  Warnings:

  - A unique constraint covering the columns `[id_eleve,id_enseignement,id_type_note,trimestre]` on the table `Note` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `trimestre` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Ajouter la colonne avec une valeur par défaut temporaire
ALTER TABLE "Note" ADD COLUMN "trimestre" INTEGER NOT NULL DEFAULT 1;

-- Mettre à jour les valeurs par défaut pour les données existantes (toutes au trimestre 1)
-- Cette étape est déjà faite par le DEFAULT 1 ci-dessus

-- CreateIndex
CREATE UNIQUE INDEX "Note_id_eleve_id_enseignement_id_type_note_trimestre_key" ON "Note"("id_eleve", "id_enseignement", "id_type_note", "trimestre");
