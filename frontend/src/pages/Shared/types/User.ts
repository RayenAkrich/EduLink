export interface User{
    id_user:number;
    nom:string;
    email:string;
    mot_de_passe: string;
    role: "admin" | "enseignant" | "parent"; // Enum Role
    date_creation: string; 
}