import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Users,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Lock
} from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "../Shared/userContext";

interface Class {
  id_classe: number;
  nom_classe: string;
  annee_scolaire: string;
}

interface Student {
  id_eleve: number;
  nom: string;
  date_naissance: string;
}

interface Activite {
  id_activite: number;
  titre: string;
  description: string | null;
  date_debut: string;
  date_fin: string;
  id_classe: number;
  cree_par: number;
  classe: {
    nom_classe: string;
  };
  enseignant: {
    id_user: number;
    nom: string;
  };
  _count?: {
    absences: number;
  };
}

interface Absence {
  id_absence: number;
  id_activite: number;
  id_eleve: number;
  justifiee: boolean;
  commentaire: string | null;
  eleve: {
    nom: string;
  };
  activite: {
    titre: string;
  };
}

const ActivitiesManagement: React.FC = () => {
  const { user } = useUser();
  const [activites, setActivites] = useState<Activite[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivite, setSelectedActivite] = useState<Activite | null>(null);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAbsencesModal, setShowAbsencesModal] = useState(false);
  const [showAddAbsenceModal, setShowAddAbsenceModal] = useState(false);
  
  // Absences
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loadingAbsences, setLoadingAbsences] = useState(false);
  
  // Form state for Activité
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [selectedClasseId, setSelectedClasseId] = useState<number | null>(null);
  
  // Form state for Absence
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [justifiee, setJustifiee] = useState(false);
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    fetchActivites();
    fetchClasses();
  }, []);

  const fetchActivites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/activites", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setActivites(data.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Erreur lors du chargement des activités");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/classes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchStudentsByClass = async (classId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const studentsData = data.data.eleves_classes.map((ec: any) => ({
          id_eleve: ec.eleve.id_eleve,
          nom: ec.eleve.nom,
          date_naissance: ec.eleve.date_naissance
        }));
        setStudents(studentsData);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchAbsences = async (activiteId: number) => {
    try {
      setLoadingAbsences(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/activites/${activiteId}/absences`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAbsences(data.data);
      }
    } catch (error) {
      console.error("Error fetching absences:", error);
      toast.error("Erreur lors du chargement des absences");
    } finally {
      setLoadingAbsences(false);
    }
  };

  const createActivite = async () => {
    if (!titre || !dateDebut || !dateFin || !selectedClasseId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/activites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titre,
          description: description || null,
          date_debut: new Date(dateDebut).toISOString(),
          date_fin: new Date(dateFin).toISOString(),
          id_classe: selectedClasseId
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Activité créée avec succès");
        setShowCreateModal(false);
        resetForm();
        fetchActivites();
      } else {
        toast.error(data.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      toast.error("Erreur lors de la création de l'activité");
    }
  };

  const updateActivite = async () => {
    if (!selectedActivite || !titre || !dateDebut || !dateFin || !selectedClasseId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Check if user owns this activity
    if (!user || selectedActivite.cree_par !== user.id_user) {
      toast.error("Vous ne pouvez modifier que vos propres activités");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/activites/${selectedActivite.id_activite}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titre,
          description: description || null,
          date_debut: new Date(dateDebut).toISOString(),
          date_fin: new Date(dateFin).toISOString(),
          id_classe: selectedClasseId
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Activité modifiée avec succès");
        setShowEditModal(false);
        resetForm();
        fetchActivites();
      } else {
        toast.error(data.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error("Erreur lors de la modification de l'activité");
    }
  };

  const deleteActivite = async (activite: Activite) => {
    // Check if user owns this activity
    if (!user || activite.cree_par !== user.id_user) {
      toast.error("Vous ne pouvez supprimer que vos propres activités");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/activites/${activite.id_activite}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Activité supprimée avec succès");
        fetchActivites();
      } else {
        toast.error(data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Erreur lors de la suppression de l'activité");
    }
  };

  const addAbsence = async () => {
    if (!selectedActivite || !selectedStudentId) {
      toast.error("Veuillez sélectionner un élève");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/absences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_activite: selectedActivite.id_activite,
          id_eleve: selectedStudentId,
          justifiee,
          commentaire: commentaire || null
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Absence ajoutée avec succès");
        setShowAddAbsenceModal(false);
        resetAbsenceForm();
        fetchAbsences(selectedActivite.id_activite);
      } else {
        toast.error(data.message || "Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error("Error adding absence:", error);
      toast.error("Erreur lors de l'ajout de l'absence");
    }
  };

  const updateAbsence = async (id: number, updates: Partial<Absence>) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/absences/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Absence modifiée avec succès");
        if (selectedActivite) {
          fetchAbsences(selectedActivite.id_activite);
        }
      } else {
        toast.error(data.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Error updating absence:", error);
      toast.error("Erreur lors de la modification de l'absence");
    }
  };

  const deleteAbsence = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette absence ?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/absences/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Absence supprimée avec succès");
        if (selectedActivite) {
          fetchAbsences(selectedActivite.id_activite);
        }
      } else {
        toast.error(data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting absence:", error);
      toast.error("Erreur lors de la suppression de l'absence");
    }
  };

  const resetForm = () => {
    setTitre("");
    setDescription("");
    setDateDebut("");
    setDateFin("");
    setSelectedClasseId(null);
    setSelectedActivite(null);
  };

  const resetAbsenceForm = () => {
    setSelectedStudentId(null);
    setJustifiee(false);
    setCommentaire("");
  };

  const openEditModal = (activite: Activite) => {
    // Check if user owns this activity
    if (!user || activite.cree_par !== user.id_user) {
      toast.error("Vous ne pouvez modifier que vos propres activités");
      return;
    }

    setSelectedActivite(activite);
    setTitre(activite.titre);
    setDescription(activite.description || "");
    setDateDebut(activite.date_debut.slice(0, 16));
    setDateFin(activite.date_fin.slice(0, 16));
    setSelectedClasseId(activite.id_classe);
    setShowEditModal(true);
  };

  const openAbsencesModal = async (activite: Activite) => {
    setSelectedActivite(activite);
    await fetchStudentsByClass(activite.id_classe);
    await fetchAbsences(activite.id_activite);
    setShowAbsencesModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canModify = (activite: Activite) => {
    if (!user) return false;
    const creePar = Number(activite.cree_par);
    const userId = Number(user.id_user);
    return creePar === userId;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestion des Activités & Absences</h1>
          <p className="text-slate-600 mt-1">Gérer les activités et suivre les absences</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nouvelle Activité
        </button>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Aucune activité trouvée</p>
          </div>
        ) : (
          activites.map((activite) => (
            <div key={activite.id_activite} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{activite.titre}</h3>
                    {!canModify(activite) && (
                      <span className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        <Lock size={12} />
                        Lecture seule
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 mt-1">{activite.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-600" />
                      <span>Du {formatDate(activite.date_debut)} au {formatDate(activite.date_fin)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-green-600" />
                      <span>Classe: {activite.classe.nom_classe}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-purple-600" />
                      <span>Créé par: {activite.enseignant.nom}</span>
                    </div>
                    {activite._count && (
                      <div className="flex items-center gap-2">
                        <XCircle size={16} className="text-red-600" />
                        <span>{activite._count.absences} absence(s)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openAbsencesModal(activite)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Gérer les absences"
                  >
                    <Users size={20} />
                  </button>
                  {canModify(activite) ? (
                    <>
                      <button
                        onClick={() => openEditModal(activite)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => deleteActivite(activite)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="p-2 text-slate-300 cursor-not-allowed"
                      title="Vous ne pouvez pas modifier cette activité"
                      disabled
                    >
                      <Lock size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowCreateModal(false); resetForm(); }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Nouvelle Activité</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex: Sortie scolaire, Cours de sport..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détails de l'activité..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date & Heure de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date & Heure de fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Classe concernée <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClasseId || ""}
                  onChange={(e) => setSelectedClasseId(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map((classe) => (
                    <option key={classe.id_classe} value={classe.id_classe}>
                      {classe.nom_classe} ({classe.annee_scolaire})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={createActivite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedActivite && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowEditModal(false); resetForm(); }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Modifier l'Activité</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date & Heure de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date & Heure de fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Classe concernée <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClasseId || ""}
                  onChange={(e) => setSelectedClasseId(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map((classe) => (
                    <option key={classe.id_classe} value={classe.id_classe}>
                      {classe.nom_classe} ({classe.annee_scolaire})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowEditModal(false); resetForm(); }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={updateActivite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Absences Modal */}
      {showAbsencesModal && selectedActivite && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowAbsencesModal(false); setSelectedActivite(null); }}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold">Absences - {selectedActivite.titre}</h2>
                <p className="text-sm text-slate-600">{selectedActivite.classe.nom_classe}</p>
              </div>
              <button onClick={() => { setShowAbsencesModal(false); setSelectedActivite(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Liste des absences</h3>
                {canModify(selectedActivite) && (
                  <button
                    onClick={() => setShowAddAbsenceModal(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus size={16} />
                    Ajouter une absence
                  </button>
                )}
              </div>

              {loadingAbsences ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-slate-100 rounded-lg p-4 h-20"></div>
                  ))}
                </div>
              ) : absences.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Aucune absence enregistrée</p>
              ) : (
                <div className="space-y-2">
                  {absences.map((absence) => (
                    <div key={absence.id_absence} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{absence.eleve.nom}</p>
                        {absence.commentaire && (
                          <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                            <MessageSquare size={14} />
                            {absence.commentaire}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {canModify(selectedActivite) ? (
                          <>
                            <button
                              onClick={() => updateAbsence(absence.id_absence, { justifiee: !absence.justifiee })}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                absence.justifiee 
                                  ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              {absence.justifiee ? <CheckCircle size={16} /> : <XCircle size={16} />}
                              {absence.justifiee ? "Justifiée" : "Non justifiée"}
                            </button>
                            
                            <button
                              onClick={() => deleteAbsence(absence.id_absence)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${
                            absence.justifiee 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            {absence.justifiee ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            {absence.justifiee ? "Justifiée" : "Non justifiée"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Absence Modal */}
      {showAddAbsenceModal && selectedActivite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => { setShowAddAbsenceModal(false); resetAbsenceForm(); }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Ajouter une Absence</h2>
              <button onClick={() => { setShowAddAbsenceModal(false); resetAbsenceForm(); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Élève <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStudentId || ""}
                  onChange={(e) => setSelectedStudentId(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un élève</option>
                  {students.map((student) => (
                    <option key={student.id_eleve} value={student.id_eleve}>
                      {student.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={justifiee}
                    onChange={(e) => setJustifiee(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">Absence justifiée</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Commentaire
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Raison de l'absence..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowAddAbsenceModal(false); resetAbsenceForm(); }}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={addAbsence}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesManagement;
