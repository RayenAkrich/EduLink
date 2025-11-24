
import DashboardParent from "../Parent/DashboardParent";
import DashboardTeacher from "../Teacher/DashboardTeacher";

export default function DynamicDashboard() {
  const role = localStorage.getItem("role");

  if (!role) {
    return <div>Erreur : aucun rôle trouvé</div>;
  }

  switch (role) {
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
