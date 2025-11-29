export interface Eleve {
  id_eleve: number;
  nom: string;
  date_naissance: string;
  email?: string;
  id_parent: number;
  classe?: string | null;
  annee_scolaire?: string | null;
  moyenne?: string | null;
  totalNotes?: number;
  totalAbsences?: number;
}