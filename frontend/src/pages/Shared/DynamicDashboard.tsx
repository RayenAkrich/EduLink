import { useSearchParams } from "react-router-dom";
import DashboardParent from "../Parent/DashboardParent";
import DashboardTeacher from "../Teacher/DashboardTeacher";
import type { User } from "./types/User";
import { useUser } from "./userContext";
import DashboardAdmin from "../Admin/DashbordAdmin";

export default function DynamicDashboard() {
  const { user, loading } = useUser();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center">
          <p className="text-red-600 text-lg">Session expirée. Veuillez vous reconnecter.</p>
        </div>
      </div>
    );
  }

  if (!user.role) {
    return <div>Erreur : aucun rôle trouvé</div>;
  }

  switch (user.role) {
    case "admin":
      return <DashboardAdmin />;

    case "parent":
      return <DashboardParent />;

    case "enseignant":
      return <DashboardTeacher />;

    default:
      return <div>Rôle inconnu</div>;
  }
  
}
