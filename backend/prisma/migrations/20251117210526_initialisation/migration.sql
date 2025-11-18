-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'enseignant', 'parent');

-- CreateEnum
CREATE TYPE "Libelle" AS ENUM ('controle', 'oral', 'synthese');

-- CreateTable
CREATE TABLE "User" (
    "id_user" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Eleve" (
    "id_eleve" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "id_parent" INTEGER NOT NULL,

    CONSTRAINT "Eleve_pkey" PRIMARY KEY ("id_eleve")
);

-- CreateTable
CREATE TABLE "Classe" (
    "id_classe" SERIAL NOT NULL,
    "nom_classe" TEXT NOT NULL,
    "annee_scolaire" TEXT NOT NULL,

    CONSTRAINT "Classe_pkey" PRIMARY KEY ("id_classe")
);

-- CreateTable
CREATE TABLE "Enseignement" (
    "id_enseignement" SERIAL NOT NULL,
    "id_enseignant" INTEGER NOT NULL,
    "id_classe" INTEGER NOT NULL,
    "matiere" TEXT NOT NULL,

    CONSTRAINT "Enseignement_pkey" PRIMARY KEY ("id_enseignement")
);

-- CreateTable
CREATE TABLE "ElevesClasse" (
    "id_eleve_classe" SERIAL NOT NULL,
    "id_eleve" INTEGER NOT NULL,
    "id_classe" INTEGER NOT NULL,

    CONSTRAINT "ElevesClasse_pkey" PRIMARY KEY ("id_eleve_classe")
);

-- CreateTable
CREATE TABLE "Activite" (
    "id_activite" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "id_classe" INTEGER NOT NULL,
    "cree_par" INTEGER NOT NULL,

    CONSTRAINT "Activite_pkey" PRIMARY KEY ("id_activite")
);

-- CreateTable
CREATE TABLE "Absence" (
    "id_absence" SERIAL NOT NULL,
    "id_activite" INTEGER NOT NULL,
    "id_eleve" INTEGER NOT NULL,
    "justifiee" BOOLEAN NOT NULL DEFAULT false,
    "commentaire" TEXT,

    CONSTRAINT "Absence_pkey" PRIMARY KEY ("id_absence")
);

-- CreateTable
CREATE TABLE "TypeNote" (
    "id_type_note" SERIAL NOT NULL,
    "libelle" "Libelle" NOT NULL,
    "coefficient" DOUBLE PRECISION DEFAULT 1.0,

    CONSTRAINT "TypeNote_pkey" PRIMARY KEY ("id_type_note")
);

-- CreateTable
CREATE TABLE "Note" (
    "id_note" SERIAL NOT NULL,
    "id_eleve" INTEGER NOT NULL,
    "id_enseignement" INTEGER NOT NULL,
    "id_type_note" INTEGER NOT NULL,
    "valeur" DOUBLE PRECISION NOT NULL,
    "date_attribution" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id_note")
);

-- CreateTable
CREATE TABLE "Message" (
    "id_message" SERIAL NOT NULL,
    "expediteur_id" INTEGER NOT NULL,
    "destinataire_id" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_envoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lu" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id_message")
);

-- CreateTable
CREATE TABLE "Annonce" (
    "id_annonce" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_publication" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_auteur" INTEGER NOT NULL,
    "id_classe" INTEGER,

    CONSTRAINT "Annonce_pkey" PRIMARY KEY ("id_annonce")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Eleve_email_key" ON "Eleve"("email");

-- AddForeignKey
ALTER TABLE "Eleve" ADD CONSTRAINT "Eleve_id_parent_fkey" FOREIGN KEY ("id_parent") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enseignement" ADD CONSTRAINT "Enseignement_id_enseignant_fkey" FOREIGN KEY ("id_enseignant") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enseignement" ADD CONSTRAINT "Enseignement_id_classe_fkey" FOREIGN KEY ("id_classe") REFERENCES "Classe"("id_classe") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElevesClasse" ADD CONSTRAINT "ElevesClasse_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "Eleve"("id_eleve") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElevesClasse" ADD CONSTRAINT "ElevesClasse_id_classe_fkey" FOREIGN KEY ("id_classe") REFERENCES "Classe"("id_classe") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_id_classe_fkey" FOREIGN KEY ("id_classe") REFERENCES "Classe"("id_classe") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_cree_par_fkey" FOREIGN KEY ("cree_par") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_id_activite_fkey" FOREIGN KEY ("id_activite") REFERENCES "Activite"("id_activite") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "Eleve"("id_eleve") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "Eleve"("id_eleve") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_id_enseignement_fkey" FOREIGN KEY ("id_enseignement") REFERENCES "Enseignement"("id_enseignement") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_id_type_note_fkey" FOREIGN KEY ("id_type_note") REFERENCES "TypeNote"("id_type_note") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_expediteur_id_fkey" FOREIGN KEY ("expediteur_id") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_destinataire_id_fkey" FOREIGN KEY ("destinataire_id") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_id_auteur_fkey" FOREIGN KEY ("id_auteur") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_id_classe_fkey" FOREIGN KEY ("id_classe") REFERENCES "Classe"("id_classe") ON DELETE SET NULL ON UPDATE CASCADE;
