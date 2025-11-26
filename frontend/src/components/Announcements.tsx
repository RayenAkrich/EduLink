import React, { useState, useEffect } from "react";
import { Megaphone, Plus, X, Users, BookOpen, User, Trash2 } from "lucide-react";
import { useUser } from "../pages/Shared/userContext";
import { socketService } from "../services/socketService";
import toast from "react-hot-toast";

interface Announcement {
  id_annonce: number;
  titre: string;
  contenu: string;
  date_publication: string;
  id_auteur: number;
  id_classe: number | null;
  auteur: { nom: string; role: string };
  classe?: { nom_classe: string } | null;
}

interface FilterOptions {
  users: Array<{ id_user: number; nom: string; email: string; role: string; studentName?: string }>;
  classes: Array<{ id_classe: number; nom_classe: string; annee_scolaire: string }>;
}

const Announcements: React.FC = () => {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ users: [], classes: [] });
  
  // Form state
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [targetType, setTargetType] = useState<"role" | "users" | "class">("role");
  const [targetRole, setTargetRole] = useState<"parent" | "enseignant" | "all">("parent");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const canCreate = user?.role === "admin" || user?.role === "enseignant";
  const isTeacher = user?.role === "enseignant";

  useEffect(() => {
    fetchAnnouncements();
    if (canCreate) {
      fetchFilterOptions();
    }

    // Listen for new announcements
    const handleNewAnnouncement = (announcement: Announcement) => {
      setAnnouncements(prev => [announcement, ...prev]);
    };

    socketService.on("new_announcement", handleNewAnnouncement);

    return () => {
      socketService.off("new_announcement", handleNewAnnouncement);
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/announcements", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/announcements/filter-options", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const createAnnouncement = async () => {
    if (!titre.trim() || !contenu.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload: any = { titre, contenu };

      if (targetType === "role") {
        if (targetRole !== "all") {
          payload.targetRole = targetRole;
        }
      } else if (targetType === "users") {
        if (selectedUsers.length === 0) {
          toast.error("Veuillez sélectionner au moins un utilisateur");
          return;
        }
        payload.targetUserIds = selectedUsers;
      } else if (targetType === "class") {
        if (!selectedClass) {
          toast.error("Veuillez sélectionner une classe");
          return;
        }
        payload.id_classe = selectedClass;
      }

      const response = await fetch("http://localhost:5000/api/announcements/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setAnnouncements(prev => [data.data, ...prev]);
        resetForm();
        setShowCreateModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Erreur lors de la création de l'annonce");
    }
  };

  const deleteAnnouncement = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Annonce supprimée");
        setAnnouncements(prev => prev.filter(a => a.id_annonce !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setTitre("");
    setContenu("");
    setTargetType("role");
    setTargetRole("parent");
    setSelectedUsers([]);
    setSelectedClass(null);
    setSearchTerm("");
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = filterOptions.users.filter(u =>
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.studentName && u.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Annonces</h1>
            <p className="text-slate-600 mt-1">
              {canCreate ? "Créez et gérez les annonces" : "Consultez les dernières annonces"}
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Créer une annonce
            </button>
          )}
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Megaphone size={64} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-400 text-lg">Aucune annonce disponible</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id_annonce}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Megaphone size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {announcement.titre}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span>Par {announcement.auteur.nom}</span>
                        <span>•</span>
                        <span>{formatDate(announcement.date_publication)}</span>
                        {announcement.classe && (
                          <>
                            <span>•</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">
                              {announcement.classe.nom_classe}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {user?.id_user === announcement.id_auteur && (
                    <button
                      onClick={() => deleteAnnouncement(announcement.id_annonce)}
                      className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <p className="text-slate-700 whitespace-pre-wrap">{announcement.contenu}</p>
              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold">Créer une annonce</h2>
                <button
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Titre de l'annonce
                  </label>
                  <input
                    type="text"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Ex: Réunion parents-professeurs"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Contenu
                  </label>
                  <textarea
                    value={contenu}
                    onChange={(e) => setContenu(e.target.value)}
                    placeholder="Écrivez votre annonce ici..."
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Target Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Destinataires
                  </label>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setTargetType("role")}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                        targetType === "role"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Users size={18} className="inline mr-2" />
                      Par rôle
                    </button>
                    <button
                      onClick={() => setTargetType("users")}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                        targetType === "users"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <User size={18} className="inline mr-2" />
                      Utilisateurs
                    </button>
                    <button
                      onClick={() => setTargetType("class")}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                        targetType === "class"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <BookOpen size={18} className="inline mr-2" />
                      Par classe
                    </button>
                  </div>

                  {/* Role Selection */}
                  {targetType === "role" && (
                    <div className="space-y-2">
                      {!isTeacher && (
                        <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                          <input
                            type="radio"
                            name="role"
                            value="all"
                            checked={targetRole === "all"}
                            onChange={(e) => setTargetRole(e.target.value as any)}
                            className="w-4 h-4"
                          />
                          <span>Tous les utilisateurs</span>
                        </label>
                      )}
                      <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                          type="radio"
                          name="role"
                          value="parent"
                          checked={targetRole === "parent"}
                          onChange={(e) => setTargetRole(e.target.value as any)}
                          className="w-4 h-4"
                        />
                        <span>Tous les parents</span>
                      </label>
                      {!isTeacher && (
                        <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                          <input
                            type="radio"
                            name="role"
                            value="enseignant"
                            checked={targetRole === "enseignant"}
                            onChange={(e) => setTargetRole(e.target.value as any)}
                            className="w-4 h-4"
                          />
                          <span>Tous les enseignants</span>
                        </label>
                      )}
                    </div>
                  )}

                  {/* Users Selection */}
                  {targetType === "users" && (
                    <div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher un utilisateur..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                        {filteredUsers.map((u) => (
                          <label
                            key={u.id_user}
                            className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(u.id_user)}
                              onChange={() => toggleUserSelection(u.id_user)}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{u.nom}</p>
                              <p className="text-xs text-slate-500">
                                {u.email}
                                {u.studentName && ` • Élève: ${u.studentName}`}
                              </p>
                            </div>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {u.role}
                            </span>
                          </label>
                        ))}
                      </div>
                      <p className="text-sm text-slate-500 mt-2">
                        {selectedUsers.length} utilisateur(s) sélectionné(s)
                      </p>
                    </div>
                  )}

                  {/* Class Selection */}
                  {targetType === "class" && (
                    <div className="space-y-2">
                      {filterOptions.classes.map((c) => (
                        <label
                          key={c.id_classe}
                          className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                        >
                          <input
                            type="radio"
                            name="class"
                            value={c.id_classe}
                            checked={selectedClass === c.id_classe}
                            onChange={() => setSelectedClass(c.id_classe)}
                            className="w-4 h-4"
                          />
                          <span>
                            {c.nom_classe} ({c.annee_scolaire})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={createAnnouncement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Publier l'annonce
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;