import React from "react";
import { Home, Users, BookOpen, Calendar, ClipboardList } from "lucide-react";

type Role = "ADMIN" | "ENSEIGNANT" | "PARENT" | null;

interface SidebarProps {
  hide:boolean;
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  setDash:React.Dispatch<React.SetStateAction<string>>;
  dash:string;
}

const TABS_BY_ROLE: Record<Role, { id: string; label: string; icon: JSX.Element }[]> = {
  ADMIN: [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> }, //ahmed
    { id: "users", label: "Gestion utilisateurs", icon: <Users size={18} /> }, //ahmed
    { id: "classes", label: "Gestion classes", icon: <BookOpen size={18} /> }, //akriche
    { id: "activites", label: "Activités / Absences", icon: <Calendar size={18} /> }, //akriche
    { id: "notifications", label: "Notifications", icon: <ClipboardList size={18} /> }, //ayoub
    { id: "announces", label: "Annonces", icon: <ClipboardList size={18} /> }, //ayoub
    { id: "Messaging", label: "Messagerie", icon: <Users size={18} /> }, //for admin-enseignant communication ayoub
  ],

  ENSEIGNANT: [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> }, //hajji
    { id: "notes", label: "Gestion des notes", icon: <ClipboardList size={18} /> },//hajji
    { id: "activites", label: "Activités / Absences", icon: <Calendar size={18} /> },
    { id: "notifications", label: "Notifications", icon: <ClipboardList size={18} /> },//ayoub
    { id: "announces", label: "Annonces", icon: <ClipboardList size={18} /> },//ayoub
  ],

  PARENT: [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },//hajji
    { id: "notes", label: "Notes de mon enfant", icon: <ClipboardList size={18} /> },//hajji
    { id: "activites", label: "Absences / Activités", icon: <Calendar size={18} /> },//arkiche
    { id: "notifications", label: "Notifications", icon: <ClipboardList size={18} /> },//ayoub
  ],

  null: [], // si jamais aucun rôle trouvé
};

const Sidebar: React.FC<SidebarProps> = ({dash,setDash,hide,selectedTab, onSelectTab }) => {
  // 🔥 Récupération directe depuis localStorage
  const role:Role="PARENT";
  
  const tabs = TABS_BY_ROLE[role];

  if (!role) {
    return (
      <div className="h-screen w-60 bg-slate-900 text-white shadow-lg text-black p-4">
        <p>Aucun rôle trouvé.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-60 bg-slate-900 text-white shadow-lg p-4 flex flex-col gap-3">
      <h2 className="text-xl font-bold mb-4">Espace {role}</h2>

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {setDash(String(tab.id).toLowerCase())}}
          className={`flex items-center cursor-pointer gap-2 p-2 rounded-xl transition-all
            ${String(dash ?? "").toLowerCase() === tab.id ? "bg-slate-700" : "hover:bg-slate-800"}`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
