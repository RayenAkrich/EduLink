-- AlterTable
ALTER TABLE "Enseignement" ADD COLUMN     "id_coefficient_matiere" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "CoefficientMatiere" (
    "id" SERIAL NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CoefficientMatiere_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Enseignement" ADD CONSTRAINT "Enseignement_id_coefficient_matiere_fkey" FOREIGN KEY ("id_coefficient_matiere") REFERENCES "CoefficientMatiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
