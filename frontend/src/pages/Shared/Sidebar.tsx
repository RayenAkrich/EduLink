import React, { useState, useEffect, useRef } from "react";
import { Users, Calendar, ClipboardList, FileText, Settings, BarChart3, UserCircle, GraduationCap, Bell, MessageSquare, School, LogOut, User } from "lucide-react";
import { useUser } from "./userContext";

type Role = "admin" | "enseignant" | "parent";

interface SidebarProps {
  hide?: boolean;
  selectedTab?: string;
  onSelectTab?: (tab: string) => void;
  setDash: React.Dispatch<React.SetStateAction<string>>;
  dash: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category?: string;
}

const TABS_BY_ROLE: Record<Role, TabItem[]> = {
  admin: [
    { id: "dashboard", label: "Tableau de bord", icon: <BarChart3 size={18} />, category: "main" },
    { id: "users", label: "Gestion du Personnel", icon: <Users size={18} />, category: "GESTION" },
    { id: "classes", label: "Gestion des élèves", icon: <GraduationCap size={18} />, category: "GESTION" },
    { id: "notes", label: "Gestion notes", icon: <FileText size={18} />, category: "SCOLARITE" },
    { id: "activites", label: "Gestion absences", icon: <Calendar size={18} />, category: "SCOLARITE" },
    { id: "announces", label: "Fiches", icon: <ClipboardList size={18} />, category: "RAPPORTS" },
    { id: "messaging", label: "Paramètres", icon: <Settings size={18} />, category: "PARAMETRAGE" },
  ],

  enseignant: [
    { id: "dashboard", label: "Tableau de bord", icon: <BarChart3 size={18} />, category: "main" },
    { id: "notes", label: "Gestion des notes", icon: <FileText size={18} />, category: "SCOLARITE" },
    { id: "activites", label: "Gestion absences", icon: <Calendar size={18} />, category: "SCOLARITE" },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} />, category: "main" },
    { id: "announces", label: "Annonces", icon: <ClipboardList size={18} />, category: "main" },
    { id: "messaging", label: "Messagerie", icon: <MessageSquare size={18} />, category: "main" },
  ],

  parent: [
    { id: "dashboard", label: "Tableau de bord", icon: <BarChart3 size={18} />, category: "main" },
    { id: "notes", label: "Notes de mon enfant", icon: <FileText size={18} />, category: "SCOLARITE" },
    { id: "activites", label: "Absences / Activités", icon: <Calendar size={18} />, category: "SCOLARITE" },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} />, category: "main" },
    { id: "announces", label: "Annonces", icon: <ClipboardList size={18} />, category: "main" },
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

  // Grouper les tabs par catégorie
  const mainTabs = tabs.filter(tab => !tab.category || tab.category === "main");
  const gestionTabs = tabs.filter(tab => tab.category === "GESTION");
  const scolariteTabs = tabs.filter(tab => tab.category === "SCOLARITE");
  const rapportsTabs = tabs.filter(tab => tab.category === "RAPPORTS");
  const parametrageTabs = tabs.filter(tab => tab.category === "PARAMETRAGE");

  const renderTabButton = (tab: TabItem) => (
    <button
      key={tab.id}
      onClick={() => {setDash(String(tab.id).toLowerCase())}}
      className={`flex items-center cursor-pointer gap-3 px-3 py-2.5 transition-all relative text-sm
        ${String(dash ?? "").toLowerCase() === tab.id 
          ? "bg-green-600 text-white rounded-lg" 
          : "text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"}`}
    >
      <span className="flex-shrink-0">{tab.icon}</span>
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
      {String(dash ?? "").toLowerCase() === tab.id && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );

  const renderSection = (title: string, sectionTabs: TabItem[]) => {
    if (sectionTabs.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">{title}</h3>
        <div className="space-y-1">
          {sectionTabs.map(renderTabButton)}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-60 bg-gray-800 text-white shadow-lg flex flex-col">
      {/* Logo et titre */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <School size={24} className="text-blue-600" />
          </div>
          <span className="text-lg font-bold">SCHOOL</span>
        </div>
        <div className="flex items-center gap-2 mt-3 p-2 bg-gray-700 rounded-lg">
          <UserCircle size={32} className="text-gray-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.nom || "Super User"}</p>
          </div>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {mainTabs.map(renderTabButton)}
        {renderSection("GESTION", gestionTabs)}
        {renderSection("SCOLARITE", scolariteTabs)}
        {renderSection("RAPPORTS", rapportsTabs)}
        {renderSection("PARAMETRAGE", parametrageTabs)}
      </div>
    </div>
  );
};

export default Sidebar;

