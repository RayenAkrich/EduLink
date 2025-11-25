import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useUser } from "./userContext";
import { socketService } from "../../services/socketService";
import toast from "react-hot-toast";

interface Props {
  setHide: React.Dispatch<React.SetStateAction<boolean>>;
  hide: boolean;
  onNavigate?: (tab: string, data?: any) => void;
}

interface Notification {
  id_notification: number;
  type: string;
  titre: string;
  contenu: string;
  reference_id: number | null;
  reference_type: string | null;
  lu: boolean;
  date_creation: string;
}

function Header({ setHide, hide, onNavigate }: Props) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();

      // Connect socket
      socketService.connect(user.id_user);

      // Listen for new notifications
      const handleNewNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast
        toast.success(notification.titre, {
          duration: 4000,
          position: "top-right"
        });
      };

      socketService.on("new_notification", handleNewNotification);

      return () => {
        socketService.off("new_notification", handleNewNotification);
      };
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/notifications/unread-count", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.id_notification === id ? { ...notif, lu: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, lu: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id_notification);
    
    // Navigate based on notification type
    if (onNavigate && notification.reference_type) {
      if (notification.reference_type === "message") {
        onNavigate("messaging");
      } else if (notification.reference_type === "announcement") {
        onNavigate("announces");
      }
    }
    
    setShowDropdown(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="flex flex-nowrap items-center justify-between px-7 py-2 shadow-lg text-slate-900 sticky bg-white top-0 z-50">
      <img
        src="src/assets/ChatGPT Image 23 nov. 2025, 14_44_13.png"
        alt="logo ecole"
        className="w-20 h-20"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6 cursor-pointer -ml-30 mr-35"
        onClick={() => setHide(!hide)}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 cursor-pointer"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          placeholder="Recherche"
          className="border rounded w-80 h-10 p-2"
        />
      </div>

      <div className="flex gap-3 items-center">
        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-slate-200 max-h-[500px] overflow-hidden flex flex-col z-50">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              <div className="overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell size={48} className="mx-auto mb-2 opacity-30" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id_notification}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.lu ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm">{notif.titre}</h4>
                        {!notif.lu && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        {notif.contenu}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(notif.date_creation)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <img src="https://img.freepik.com/free-photo/young-handsome-man-holding-notebooks-concept-e-learning-courses_1258-26588.jpg" alt="image(enseignant/parent)" className="w-10 rounded-full object-fit bg-slate-200" />
        <div className="flex flex-col">
          <p className="font-medium">{localStorage.getItem("nom")}</p>
          <p className="text-sm text-slate-500">{localStorage.getItem("role")}</p>
        </div>
      </div>
    </div>
  );
}

export default Header;