import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  X, 
  Users,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Eye,
  Plus
} from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "../Shared/userContext";

interface Student {
  id_eleve: number;
  nom: string;
  date_naissance: string;
  eleves_classes: Array<{
    id_classe: number;
    classe: {
      id_classe: number;
      nom_classe: string;
      annee_scolaire: string;
    };
  }>;
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
  const [activites, setActivites] = useState<Activite[]>([]);
  const [myChildren, setMyChildren] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivite, setSelectedActivite] = useState<Activite | null>(null);
  
  // Modals
  const [showAbsencesModal, setShowAbsencesModal] = useState(false);
  const [showAddAbsenceModal, setShowAddAbsenceModal] = useState(false);
  
  // Absences
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loadingAbsences, setLoadingAbsences] = useState(false);
  
  // Form state for Absence
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [justifiee, setJustifiee] = useState(false);
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    fetchMyChildren();
    fetchActivites();
  }, []);

  const fetchMyChildren = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/students/my-children", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMyChildren(data.data);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  const fetchActivites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/activites/my-children-activities", {
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

  const fetchAbsences = async (activiteId: number) => {
    try {
      setLoadingAbsences(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/activites/${activiteId}/absences`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Filter absences to show only my children's absences
        const myChildrenIds = myChildren.map(c => c.id_eleve);
        const filteredAbsences = data.data.filter((absence: Absence) => 
          myChildrenIds.includes(absence.id_eleve)
        );
        setAbsences(filteredAbsences);
      }
    } catch (error) {
      console.error("Error fetching absences:", error);
      toast.error("Erreur lors du chargement des absences");
    } finally {
      setLoadingAbsences(false);
    }
  };

  // Filter children enrolled in the selected activity's class
  const getChildrenForActivity = (activite: Activite): Student[] => {
    return myChildren.filter(child => 
      child.eleves_classes.some(ec => ec.id_classe === activite.id_classe)
    );
  };

  const addAbsence = async () => {
    if (!selectedActivite || !selectedStudentId) {
      toast.error("Veuillez sélectionner un enfant");
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
        toast.success("Absence déclarée avec succès");
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

  const resetAbsenceForm = () => {
    setSelectedStudentId(null);
    setJustifiee(false);
    setCommentaire("");
  };

  const openAbsencesModal = async (activite: Activite) => {
    setSelectedActivite(activite);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Activités & Absences</h1>
        <p className="text-slate-600 mt-1">Consulter les activités et déclarer les absences de vos enfants</p>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Aucune activité trouvée pour vos enfants</p>
          </div>
        ) : (
          activites.map((activite) => (
            <div key={activite.id_activite} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{activite.titre}</h3>
                    <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      <Eye size={12} />
                      Lecture seule
                    </span>
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
                      <span>Enseignant: {activite.enseignant.nom}</span>
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
                    title="Voir et déclarer les absences"
                  >
                    <Users size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
                <h3 className="text-lg font-semibold">Absences de mes enfants</h3>
                <button
                  onClick={() => setShowAddAbsenceModal(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Déclarer une absence
                </button>
              </div>

              {loadingAbsences ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-slate-100 rounded-lg p-4 h-20"></div>
                  ))}
                </div>
              ) : absences.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Aucune absence enregistrée pour vos enfants</p>
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
                        <div
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${
                            absence.justifiee 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {absence.justifiee ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          {absence.justifiee ? "Justifiée" : "Non justifiée"}
                        </div>
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
              <h2 className="text-xl font-bold">Déclarer une Absence</h2>
              <button onClick={() => { setShowAddAbsenceModal(false); resetAbsenceForm(); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Enfant concerné <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStudentId || ""}
                  onChange={(e) => setSelectedStudentId(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un enfant</option>
                  {getChildrenForActivity(selectedActivite).map((child) => (
                    <option key={child.id_eleve} value={child.id_eleve}>
                      {child.nom}
                    </option>
                  ))}
                </select>
                {getChildrenForActivity(selectedActivite).length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    Aucun de vos enfants n'est inscrit dans cette classe
                  </p>
                )}
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
                  Motif / Commentaire
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Raison de l'absence (médical, familial, etc.)..."
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
                Déclarer l'absence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesManagement;
