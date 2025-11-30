import React from "react";
import { Home, Users, BookOpen, Calendar, ClipboardList } from "lucide-react";
import { useUser } from "./userContext";

type Role = "admin" | "enseignant" | "parent";

interface SidebarProps {
  hide?: boolean;
  selectedTab?: string;
  onSelectTab?: (tab: string) => void;
  setDash: React.Dispatch<React.SetStateAction<string>>;
  dash: string;
}

const TABS_BY_ROLE: Record<Role, { id: string; label: string; icon: React.ReactNode }[]> = {
  admin: [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> }, //ahmed
    { id: "users", label: "Gestion utilisateurs", icon: <Users size={18} /> }, //ahmed
    { id: "classes", label: "Gestion classes", icon: <BookOpen size={18} /> }, //akriche
    { id: "activites", label: "Activités / Absences", icon: <Calendar size={18} /> }, //akriche
    { id: "notifications", label: "Notifications", icon: <ClipboardList size={18} /> }, //ayoub
    { id: "announces", label: "Annonces", icon: <ClipboardList size={18} /> }, //ayoub
    { id: "messaging", label: "Messagerie", icon: <Users size={18} /> }, //for admin-enseignant communication ayoub
  ],

  enseignant: [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> }, //hajji
    { id: "notes", label: "Gestion des notes", icon: <ClipboardList size={18} /> },//hajji
    { id: "activites", label: "Activités / Absences", icon: <Calendar size={18} /> },
    { id: "notifications", label: "Notifications", icon: <ClipboardList size={18} /> },//ayoub
    { id: "announces", label: "Annonces", icon: <ClipboardList size={18} /> },//ayoub
    { id: "messaging", label: "Messagerie", icon: <Users size={18} /> }, //for admin-enseignant communication ayoub
  ],

  parent: [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },//hajji
    { id: "notes", label: "Notes de mon enfant", icon: <ClipboardList size={18} /> },//hajji
    { id: "activites", label: "Absences / Activités", icon: <Calendar size={18} /> },//arkiche
    { id: "notifications", label: "Notifications", icon: <ClipboardList size={18} /> },//ayoub
    { id: "announces", label: "Annonces", icon: <ClipboardList size={18} /> },//ayoub
  ],

  // 'null' not included: role must be one of specified values
};

const Sidebar: React.FC<SidebarProps> = ({ dash, setDash }) => {
  const {user}= useUser();
  if (!user) return <div>Sidebar...</div>;
  const role:Role=user.role;
  
  const tabs = TABS_BY_ROLE[role];

  if (!role) {
    return (
      <div className="h-screen w-60 bg-slate-900 text-white shadow-lg text-black p-4">
        <p>Aucun rôle trouvé.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-60 bg-slate-900 text-white shadow-lg p-4 flex flex-col gap-3">
      <h2 className="text-xl font-bold mb-4">Espace {role}</h2>

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {setDash(String(tab.id).toLowerCase())}}
          className={`flex items-center cursor-pointer gap-2 p-2 rounded-xl transition-all
            ${String(dash ?? "").toLowerCase() === tab.id ? "bg-slate-600" : "hover:bg-slate-600"}`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
