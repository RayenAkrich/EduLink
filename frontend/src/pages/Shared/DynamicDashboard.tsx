import { useSearchParams } from "react-router-dom";
import DashboardParent from "../Parent/DashboardParent";
import DashboardTeacher from "../Teacher/DashboardTeacher";
import type { User } from "./types/User";
import { useUser } from "./userContext";

export default function DynamicDashboard() {
  const { user } = useUser();
  

  if (!user) {
    return <div>Chargement...</div>;
  }

  if (!user.role) {
    return <div>Erreur : aucun rôle trouvé</div>;
  }

  switch (user.role) {
    case "admin":
      return <DashboardTeacher />;

    case "parent":
      return <DashboardParent />;

    case "enseignant":
      return <DashboardTeacher />;

    default:
      return <div>Rôle inconnu</div>;
  }
  
}
