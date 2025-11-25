import React, { useState, useEffect } from "react";
import { Bell, Trash2, CheckCheck, MessageCircle, Megaphone, FileText, AlertCircle } from "lucide-react";
import { useUser } from "../pages/Shared/userContext";
import toast from "react-hot-toast";

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

interface NotificationsPageProps {
  onNavigate?: (tab: string, data?: any) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif.id_notification === id ? { ...notif, lu: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.map(notif => ({ ...notif, lu: true })));
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.filter(n => n.id_notification !== id));
      toast.success("Notification supprimée");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.lu) {
      markAsRead(notification.id_notification);
    }

    if (onNavigate && notification.reference_type) {
      if (notification.reference_type === "message") {
        onNavigate("messaging");
      } else if (notification.reference_type === "announcement") {
        onNavigate("announces");
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle size={20} className="text-blue-600" />;
      case "announcement":
        return <Megaphone size={20} className="text-purple-600" />;
      case "note":
        return <FileText size={20} className="text-green-600" />;
      case "absence":
        return <AlertCircle size={20} className="text-orange-600" />;
      default:
        return <Bell size={20} className="text-slate-600" />;
    }
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
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: diffDays > 365 ? "numeric" : undefined
    });
  };

  const filteredNotifications = notifications
    .filter(n => filter === "all" || !n.lu)
    .filter(n => typeFilter === "all" || n.type === typeFilter);

  const unreadCount = notifications.filter(n => !n.lu).length;
  const types = ["all", ...Array.from(new Set(notifications.map(n => n.type)))];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-1">
              {unreadCount > 0
                ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                : "Toutes vos notifications sont à jour"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCheck size={18} />
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex gap-4 items-center flex-wrap">
            {/* Read/Unread Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Toutes ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "unread"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Non lues ({unreadCount})
              </button>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === "all" ? "Tous les types" : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Bell size={64} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-400 text-lg">
                {filter === "unread"
                  ? "Aucune notification non lue"
                  : "Aucune notification"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id_notification}
                onClick={() => handleNotificationClick(notif)}
                className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all cursor-pointer border-l-4 ${
                  !notif.lu
                    ? "border-l-blue-500 bg-blue-50"
                    : "border-l-transparent"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !notif.lu ? "bg-blue-100" : "bg-slate-100"
                  }`}>
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-slate-900">{notif.titre}</h3>
                      <div className="flex items-center gap-2 ml-2">
                        {!notif.lu && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id_notification);
                          }}
                          className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm mb-2">{notif.contenu}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{formatDate(notif.date_creation)}</span>
                      {notif.reference_type && (
                        <>
                          <span>•</span>
                          <span className="bg-slate-100 px-2 py-1 rounded">
                            {notif.reference_type}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;