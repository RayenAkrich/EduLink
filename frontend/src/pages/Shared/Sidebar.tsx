import React from "react";
import { Home, Users, BookOpen, Calendar, ClipboardList } from "lucide-react";

type Role = "ADMIN" | "ENSEIGNANT" | "PARENT" | null;

interface SidebarProps {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
}

const TABS_BY_ROLE: Record<Role, { id: string; label: string; icon: JSX.Element }[]> = {
  ADMIN: [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { id: "users", label: "Gestion utilisateurs", icon: <Users size={18} /> },
    { id: "classes", label: "Gestion classes", icon: <BookOpen size={18} /> },
    { id: "activites", label: "Activités / Absences", icon: <Calendar size={18} /> },
  ],

  ENSEIGNANT: [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { id: "notes", label: "Gestion des notes", icon: <ClipboardList size={18} /> },
    { id: "activites", label: "Activités / Absences", icon: <Calendar size={18} /> },
  ],

  PARENT: [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { id: "notes", label: "Notes de mon enfant", icon: <ClipboardList size={18} /> },
    { id: "activites", label: "Absences / Activités", icon: <Calendar size={18} /> },
  ],

  null: [], // si jamais aucun rôle trouvé
};

const Sidebar: React.FC<SidebarProps> = ({ selectedTab, onSelectTab }) => {
  // 🔥 Récupération directe depuis localStorage
  const role = (localStorage.getItem("user_role") as Role) || null;

  const tabs = TABS_BY_ROLE[role];

  if (!role) {
    return (
      <div className="h-screen w-60 bg-gray-900 text-white p-4">
        <p>Aucun rôle trouvé.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-60 bg-gray-900 text-white p-4 flex flex-col gap-3">
      <h2 className="text-xl font-bold mb-4">Espace {role}</h2>

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={`flex items-center gap-2 p-2 rounded-xl transition-all
            ${selectedTab === tab.id ? "bg-gray-700" : "hover:bg-gray-800"}`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
