-- Insérer les coefficients de matière s'ils n'existent pas
INSERT INTO "CoefficientMatiere" (id, coefficient) VALUES (1, 1.0) ON CONFLICT (id) DO NOTHING;
INSERT INTO "CoefficientMatiere" (id, coefficient) VALUES (2, 2.0) ON CONFLICT (id) DO NOTHING;
INSERT INTO "CoefficientMatiere" (id, coefficient) VALUES (3, 3.0) ON CONFLICT (id) DO NOTHING;
INSERT INTO "CoefficientMatiere" (id, coefficient) VALUES (4, 4.0) ON CONFLICT (id) DO NOTHING;
INSERT INTO "CoefficientMatiere" (id, coefficient) VALUES (5, 5.0) ON CONFLICT (id) DO NOTHING;

-- Vérifier combien d'enseignements existent
SELECT COUNT(*) as total_enseignements FROM "Enseignement";

-- Mettre à jour tous les enseignements pour avoir le coefficient 1 par défaut
UPDATE "Enseignement" SET id_coefficient_matiere = 1 WHERE id_coefficient_matiere IS NULL OR id_coefficient_matiere = 0;
