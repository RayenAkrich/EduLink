import React, { useState, useEffect } from "react";
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
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCounts();
      // Refresh counts every 30 seconds
      const interval = setInterval(fetchUnreadCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch unread notifications count
      const notifResponse = await fetch("http://localhost:5000/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (notifResponse.ok) {
        const notifData = await notifResponse.json();
        setUnreadNotifications(notifData.data?.count || 0);
      }

      // Fetch unread messages count
      const msgResponse = await fetch("http://localhost:5000/api/messages/unread-count", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (msgResponse.ok) {
        const msgData = await msgResponse.json();
        setUnreadMessages(msgData.count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  };
  
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
          className={`flex items-center cursor-pointer gap-2 p-2 rounded-xl transition-all relative
            ${String(dash ?? "").toLowerCase() === tab.id ? "bg-slate-600" : "hover:bg-slate-600"}`}
        >
          {tab.icon}
          <span className="flex-1 text-left">{tab.label}</span>
          {tab.id === "notifications" && unreadNotifications > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadNotifications}
            </span>
          )}
          {tab.id === "messaging" && unreadMessages > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadMessages}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;

