import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Users, 
  GraduationCap,
  UserPlus,
  UserMinus,
  Search
} from "lucide-react";
import toast from "react-hot-toast";

interface Class {
  id_classe: number;
  nom_classe: string;
  annee_scolaire: string;
  _count?: {
    eleves_classes: number;
    enseignements: number;
  };
}

interface ClassDetails extends Class {
  eleves_classes: Array<{
    id_eleve_classe: number;
    eleve: {
      id_eleve: number;
      nom: string;
      date_naissance: string;
      email: string | null;
      parent: {
        id_user: number;
        nom: string;
        email: string;
      };
    };
  }>;
  enseignements: Array<{
    id_enseignement: number;
    matiere: string;
    enseignant: {
      id_user: number;
      nom: string;
      email: string;
    };
  }>;
}

interface Student {
  id_eleve: number;
  nom: string;
  date_naissance: string;
  email: string | null;
}

interface Teacher {
  id_user: number;
  nom: string;
  email: string;
}

interface Coefficient {
  id: number;
  coefficient: number;
}

interface ScheduleInfo {
  exists: boolean;
  data: {
    filename: string;
    extension: string;
  } | null;
}

const ClassesManagement: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassDetails | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddEnseignementModal, setShowAddEnseignementModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [availableCoefficients, setAvailableCoefficients] = useState<Coefficient[]>([]);
  const [scheduleInfo, setScheduleInfo] = useState<ScheduleInfo | null>(null);
  const [uploadingSchedule, setUploadingSchedule] = useState(false);
  
  // Form state
  const [nomClasse, setNomClasse] = useState("");
  const [anneeScolaire, setAnneeScolaire] = useState(() => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  });
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [matiere, setMatiere] = useState("");
  const [selectedCoefficient, setSelectedCoefficient] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
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
      toast.error("Erreur lors du chargement des classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async (classId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedClass(data.data);
        await checkSchedule(classId);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
      toast.error("Erreur lors du chargement des détails");
    }
  };

  const checkSchedule = async (classId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/classes/${classId}/schedule/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setScheduleInfo(data);
      }
    } catch (error) {
      console.error("Error checking schedule:", error);
    }
  };

  const uploadSchedule = async (classId: number, file: File) => {
    try {
      setUploadingSchedule(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("schedule", file);

      const response = await fetch(`http://localhost:5000/api/classes/${classId}/schedule/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        await checkSchedule(classId);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error uploading schedule:", error);
      toast.error("Erreur lors de l'upload de l'emploi");
    } finally {
      setUploadingSchedule(false);
    }
  };

  const downloadSchedule = async (classId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/classes/${classId}/schedule/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = scheduleInfo?.data?.filename || `Emploi-${classId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Emploi téléchargé avec succès");
      } else {
        toast.error("Erreur lors du téléchargement");
      }
    } catch (error) {
      console.error("Error downloading schedule:", error);
      toast.error("Erreur lors du téléchargement de l'emploi");
    }
  };

  const deleteSchedule = async (classId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet emploi ?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/classes/${classId}/schedule`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        await checkSchedule(classId);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Erreur lors de la suppression de l'emploi");
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      setLoadingStudents(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAvailableStudents(data.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAvailableTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/classes/teachers/list", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAvailableTeachers(data.data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchAvailableCoefficients = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/classes/coefficients/list", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAvailableCoefficients(data.data);
      }
    } catch (error) {
      console.error("Error fetching coefficients:", error);
    }
  };

  const createClass = async () => {
    if (!nomClasse.trim() || !anneeScolaire.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/classes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nom_classe: nomClasse,
          annee_scolaire: anneeScolaire
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setClasses(prev => [...prev, data.data]);
        resetForm();
        setShowCreateModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Erreur lors de la création");
    }
  };

  const updateClass = async () => {
    if (!selectedClass || !nomClasse.trim() || !anneeScolaire.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/classes/${selectedClass.id_classe}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nom_classe: nomClasse,
          annee_scolaire: anneeScolaire
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setClasses(prev => prev.map(c => 
          c.id_classe === selectedClass.id_classe ? data.data : c
        ));
        resetForm();
        setShowEditModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteClass = async (classId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/classes/${classId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setClasses(prev => prev.filter(c => c.id_classe !== classId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const addStudentsToClass = async () => {
    if (!selectedClass || selectedStudents.length === 0) {
      toast.error("Veuillez sélectionner au moins un élève");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let successCount = 0;
      let errorCount = 0;

      // Ajouter chaque élève sélectionné
      for (const studentId of selectedStudents) {
        const response = await fetch(`http://localhost:5000/api/classes/${selectedClass.id_classe}/students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ id_eleve: studentId })
        });

        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} élève(s) ajouté(s) avec succès`);
        fetchClassDetails(selectedClass.id_classe);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} élève(s) non ajouté(s) (déjà dans la classe ou erreur)`);
      }

      setShowAddStudentModal(false);
      setSelectedStudents([]);
    } catch (error) {
      console.error("Error adding students:", error);
      toast.error("Erreur lors de l'ajout");
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const addEnseignementToClass = async () => {
    if (!selectedClass || !selectedTeacher || !matiere.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/classes/${selectedClass.id_classe}/enseignements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_enseignant: selectedTeacher,
          matiere: matiere,
          id_coefficient_matiere: selectedCoefficient
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchClassDetails(selectedClass.id_classe);
        setShowAddEnseignementModal(false);
        resetEnseignementForm();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error adding enseignement:", error);
      toast.error("Erreur lors de l'ajout");
    }
  };

  const deleteEnseignement = async (enseignementId: number) => {
    if (!selectedClass || !confirm("Supprimer cet enseignement ?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/classes/${selectedClass.id_classe}/enseignements/${enseignementId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchClassDetails(selectedClass.id_classe);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting enseignement:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetEnseignementForm = () => {
    setSelectedTeacher(null);
    setMatiere("");
    setSelectedCoefficient(1);
  };

  const removeStudentFromClass = async (studentId: number) => {
    if (!selectedClass || !confirm("Retirer cet élève de la classe ?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/classes/${selectedClass.id_classe}/students/${studentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchClassDetails(selectedClass.id_classe);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Erreur lors du retrait");
    }
  };

  const openEditModal = (classe: Class) => {
    setSelectedClass(classe as ClassDetails);
    setNomClasse(classe.nom_classe);
    setAnneeScolaire(classe.annee_scolaire);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setNomClasse("");
    const currentYear = new Date().getFullYear();
    setAnneeScolaire(`${currentYear}-${currentYear + 1}`);
    setSelectedClass(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  // Filter classes based on search query
  const filteredClasses = classes.filter(classe => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      classe.nom_classe.toLowerCase().includes(query) ||
      classe.annee_scolaire.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestion des Classes</h1>
              <p className="text-slate-600 mt-1">
                {filteredClasses.length} classe{filteredClasses.length > 1 ? "s" : ""} affichée{filteredClasses.length > 1 ? "s" : ""}
                {searchQuery && ` sur ${classes.length} au total`}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Créer une classe
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une classe par nom ou année..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="h-9 bg-slate-200 rounded"></div>
              </div>
            ))
          ) : filteredClasses.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center">
              <BookOpen size={64} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-400 text-lg">
                {searchQuery ? `Aucune classe trouvée pour "${searchQuery}"` : "Aucune classe disponible"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            filteredClasses.map((classe) => (
              <div
                key={classe.id_classe}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {classe.nom_classe}
                      </h3>
                      <p className="text-sm text-slate-500">{classe.annee_scolaire}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(classe)}
                      className="text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-50"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteClass(classe.id_classe)}
                      className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users size={16} />
                    <span>{classe._count?.eleves_classes || 0} élève{(classe._count?.eleves_classes || 0) > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <GraduationCap size={16} />
                    <span>{classe._count?.enseignements || 0} matière{(classe._count?.enseignements || 0) > 1 ? "s" : ""}</span>
                  </div>
                </div>

                <button
                  onClick={() => fetchClassDetails(classe.id_classe)}
                  className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  Voir les détails
                </button>
              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowCreateModal(false); resetForm(); }}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold">Créer une classe</h2>
                <button
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nom de la classe
                  </label>
                  <input
                    type="text"
                    value={nomClasse}
                    onChange={(e) => setNomClasse(e.target.value)}
                    placeholder="Ex: 6ème A, Terminale S1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Année scolaire
                  </label>
                  <input
                    type="text"
                    value={anneeScolaire}
                    onChange={(e) => setAnneeScolaire(e.target.value)}
                    placeholder="Ex: 2024-2025"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                  onClick={createClass}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowEditModal(false); resetForm(); }}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold">Modifier la classe</h2>
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nom de la classe
                  </label>
                  <input
                    type="text"
                    value={nomClasse}
                    onChange={(e) => setNomClasse(e.target.value)}
                    placeholder="Ex: 6ème A, Terminale S1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Année scolaire
                  </label>
                  <input
                    type="text"
                    value={anneeScolaire}
                    onChange={(e) => setAnneeScolaire(e.target.value)}
                    placeholder="Ex: 2024-2025"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                  onClick={updateClass}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedClass && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowDetailsModal(false); setSelectedClass(null); }}>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
                <div>
                  <h2 className="text-2xl font-bold">{selectedClass.nom_classe}</h2>
                  <p className="text-slate-600">{selectedClass.annee_scolaire}</p>
                </div>
                <button
                  onClick={() => { setShowDetailsModal(false); setSelectedClass(null); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {/* Schedule Section */}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-800">
                      <BookOpen size={20} />
                      Emploi du temps
                    </h3>
                  </div>

                  {scheduleInfo?.exists ? (
                    <div className="flex gap-3 items-center justify-center">
                      <button
                        onClick={() => downloadSchedule(selectedClass.id_classe)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <BookOpen size={18} />
                        Télécharger l'emploi
                      </button>
                      <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer">
                        <Edit2 size={18} />
                        {uploadingSchedule ? "Uploading..." : "Changer l'emploi"}
                        <input
                          type="file"
                          accept=".pdf,.xlsx,.csv,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadSchedule(selectedClass.id_classe, file);
                          }}
                          className="hidden"
                          disabled={uploadingSchedule}
                        />
                      </label>
                      <button
                        onClick={() => deleteSchedule(selectedClass.id_classe)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={18} />
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer inline-flex mx-auto">
                        <Plus size={18} />
                        {uploadingSchedule ? "Uploading..." : "Ajouter un emploi"}
                        <input
                          type="file"
                          accept=".pdf,.xlsx,.csv,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadSchedule(selectedClass.id_classe, file);
                          }}
                          className="hidden"
                          disabled={uploadingSchedule}
                        />
                      </label>
                      <p className="text-sm text-slate-600 mt-2">
                        Formats acceptés: PDF, Excel (xlsx/csv), Images (png/jpg)
                      </p>
                    </div>
                  )}
                </div>

                {/* Students Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users size={20} />
                      Élèves ({selectedClass.eleves_classes.length})
                    </h3>
                    <button
                      onClick={() => {
                        fetchAvailableStudents();
                        setShowAddStudentModal(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <UserPlus size={16} />
                      Ajouter des élève
                    </button>
                  </div>

                  {selectedClass.eleves_classes.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">Aucun élève dans cette classe</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClass.eleves_classes.map((ec) => (
                        <div
                          key={ec.id_eleve_classe}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{ec.eleve.nom}</p>
                            <p className="text-sm text-slate-600">
                              Né(e) le {formatDate(ec.eleve.date_naissance)}
                            </p>
                            <p className="text-xs text-slate-500">
                              Parent: {ec.eleve.parent.nom} ({ec.eleve.parent.email})
                            </p>
                          </div>
                          <button
                            onClick={() => removeStudentFromClass(ec.eleve.id_eleve)}
                            className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                          >
                            <UserMinus size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Teachings Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <GraduationCap size={20} />
                      Enseignements ({selectedClass.enseignements.length})
                    </h3>
                    <button
                      onClick={() => {
                        fetchAvailableTeachers();
                        fetchAvailableCoefficients();
                        setShowAddEnseignementModal(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus size={16} />
                      Ajouter enseignement
                    </button>
                  </div>

                  {selectedClass.enseignements.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">Aucun enseignement configuré</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClass.enseignements.map((ens) => (
                        <div
                          key={ens.id_enseignement}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{ens.matiere}</p>
                            <p className="text-sm text-slate-600">
                              Enseignant: {ens.enseignant.nom}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteEnseignement(ens.id_enseignement)}
                            className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudentModal && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => { setShowAddStudentModal(false); setSelectedStudents([]); }}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold">Ajouter des élève</h2>
                <button
                  onClick={() => { setShowAddStudentModal(false); setSelectedStudents([]); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sélectionner les élèves ({selectedStudents.length} sélectionné{selectedStudents.length > 1 ? 's' : ''})
                </label>
                <div className="max-h-96 overflow-y-auto border border-slate-300 rounded-lg">
                  {loadingStudents ? (
                    <div className="p-3 space-y-2 animate-pulse">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border-b border-slate-100">
                          <div className="w-4 h-4 bg-slate-200 rounded" />
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                            <div className="h-3 bg-slate-200 rounded w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : availableStudents.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">Aucun élève disponible</p>
                  ) : (
                    availableStudents.map((student) => (
                      <label
                        key={student.id_eleve}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id_eleve)}
                          onChange={() => toggleStudentSelection(student.id_eleve)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{student.nom}</p>
                          {student.email && (
                            <p className="text-xs text-slate-500">{student.email}</p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => { setShowAddStudentModal(false); setSelectedStudents([]); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={addStudentsToClass}
                  disabled={selectedStudents.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter {selectedStudents.length > 0 && `(${selectedStudents.length})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Enseignement Modal */}
        {showAddEnseignementModal && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => { setShowAddEnseignementModal(false); resetEnseignementForm(); }}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold">Ajouter un enseignement</h2>
                <button
                  onClick={() => { setShowAddEnseignementModal(false); resetEnseignementForm(); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Matière */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Matière
                  </label>
                  <input
                    type="text"
                    value={matiere}
                    onChange={(e) => setMatiere(e.target.value)}
                    placeholder="Ex: Mathématiques, Français, Histoire..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Enseignant */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Enseignant
                  </label>
                  <select
                    value={selectedTeacher || ""}
                    onChange={(e) => setSelectedTeacher(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choisir un enseignant --</option>
                    {availableTeachers.map((teacher) => (
                      <option key={teacher.id_user} value={teacher.id_user}>
                        {teacher.nom} ({teacher.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Coefficient */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Coefficient de la matière
                  </label>
                  <select
                    value={selectedCoefficient}
                    onChange={(e) => setSelectedCoefficient(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableCoefficients.length > 0 ? (
                      availableCoefficients.map((coef) => (
                        <option key={coef.id} value={coef.id}>
                          Coefficient {coef.coefficient}
                        </option>
                      ))
                    ) : (
                      <option value="1">Coefficient 1 (par défaut)</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => { setShowAddEnseignementModal(false); resetEnseignementForm(); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={addEnseignementToClass}
                  disabled={!selectedTeacher || !matiere.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesManagement;
