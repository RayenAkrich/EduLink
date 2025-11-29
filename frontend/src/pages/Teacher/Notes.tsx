import { useEffect, useMemo, useState } from "react";
import { useUser } from "../Shared/userContext";

type Student = { id: string; nom: string; prenom?: string };
type NoteRow = { studentId: string; oral?: number | null; controle?: number | null; synthese?: number | null };

// Type correspondant à votre backend
type TeachingData = {
  classeId: number;
  classe: string;
  subject: string;
  nomEleves: Student[];
}

export default function Notes() {
  const { user } = useUser();
  
  // États pour les données dynamiques
  const [allData, setAllData] = useState<TeachingData[]>([]);
  const [classes, setClasses] = useState<{ id: string; label: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; label: string }[]>([]);
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTrimestre, setSelectedTrimestre] = useState<1 | 2 | 3>(1);

  const [students, setStudents] = useState<Student[]>([]);
  const [rows, setRows] = useState<Record<string, NoteRow>>({});
  const [allNotes, setAllNotes] = useState<Record<string, Record<string, NoteRow>>>({});  // { matiere: { studentId: NoteRow } }

  // 1. Charger toutes les données au montage
  useEffect(() => {
    const fetchAllData = async () => {
      console.log("User connecté:", user);
      if (!user?.id_user) {
        console.log("Aucun utilisateur connecté ou pas d'ID");
        return;
      }
      
      console.log("Chargement des données pour l'enseignant ID:", user.id_user);
      
      try {
        const url = `http://localhost:5000/api/notes/ClassMatiere/${user.id_user}`;
        console.log("URL appelée:", url);
        
        const res = await fetch(url);
        console.log("Statut de la réponse:", res.status);
        
        if (!res.ok) {
          console.error("Erreur HTTP:", res.status, res.statusText);
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        
        const data: TeachingData[] = await res.json();
        console.log("Données reçues du backend:", data);
        
        setAllData(data);

        // Extraire les classes uniques
        const uniqueClassesMap = new Map();
        data.forEach(d => {
          uniqueClassesMap.set(d.classeId.toString(), { 
            id: d.classeId.toString(), 
            label: d.classe 
          });
        });
        const uniqueClasses = Array.from(uniqueClassesMap.values());
        console.log("Classes extraites:", uniqueClasses);
        
        setClasses(uniqueClasses);
        
        // Sélectionner la première classe par défaut
        if (uniqueClasses.length > 0) {
          setSelectedClass(uniqueClasses[0].id);
          console.log("Classe sélectionnée par défaut:", uniqueClasses[0].id);
        }

      } catch (e) {
        console.error("Erreur lors du fetch:", e);
      }
    };
    
    fetchAllData();
  }, [user]);

  // 2. Mettre à jour matières et élèves selon la classe sélectionnée
  useEffect(() => {
    console.log("Changement de classe sélectionnée:", selectedClass);
    console.log("Données disponibles:", allData.length);
    
    if (!selectedClass || allData.length === 0) return;

    // Filtrer les données pour la classe sélectionnée
    const classData = allData.filter(d => d.classeId.toString() === selectedClass);
    console.log("Données pour la classe sélectionnée:", classData);

    // Extraire les matières disponibles pour cette classe
    const availableSubjects = classData.map(d => ({ 
      id: d.subject, 
      label: d.subject 
    }));
    console.log("Matières disponibles:", availableSubjects);
    
    setSubjects(availableSubjects);
    
    // Sélectionner la première matière par défaut
    if (availableSubjects.length > 0) {
      setSelectedSubject(availableSubjects[0].id);
      console.log("Matière sélectionnée par défaut:", availableSubjects[0].id);
    }

    // Récupérer les élèves (tous les enseignements d'une classe ont les mêmes élèves)
    if (classData.length > 0) {
      const studentsList = classData[0].nomEleves;
      console.log("Liste des élèves:", studentsList);
      
      setStudents(studentsList);

      // Initialiser les lignes de notes
      const newRows: Record<string, NoteRow> = {};
      studentsList.forEach((s) => {
        newRows[s.id] = { 
          studentId: s.id, 
          oral: null, 
          controle: null, 
          synthese: null 
        };
      });
      setRows(newRows);
      console.log("Lignes de notes initialisées:", newRows);
    }
  }, [selectedClass, allData]);

  // 3. Charger toutes les notes une seule fois quand classe ou trimestre change
  useEffect(() => {
    if (selectedClass && students.length > 0 && subjects.length > 0) {
      loadAllNotes();
    }
  }, [selectedClass, selectedTrimestre, students.length, subjects.length]);

  // 4. Mettre à jour les lignes affichées quand la matière change (filtrage local)
  useEffect(() => {
    if (selectedSubject && students.length > 0) {
      // Récupérer les notes de la matière sélectionnée depuis le cache
      const notesForSubject = allNotes[selectedSubject] || {};
      
      const newRows: Record<string, NoteRow> = {};
      students.forEach((s) => {
        newRows[s.id] = notesForSubject[s.id] || { 
          studentId: s.id, 
          oral: null, 
          controle: null, 
          synthese: null 
        };
      });
      setRows(newRows);
    }
  }, [selectedSubject, students, allNotes]);

  const setNote = (studentId: string, field: keyof NoteRow, value: string) => {
    const n = value === "" ? null : Math.max(0, Math.min(20, Number(value)));
    setRows((prev) => ({ 
      ...prev, 
      [studentId]: { ...(prev[studentId] ?? { studentId }), [field]: n } 
    }));
  };

  const averageOf = (r: NoteRow) => {
    const vals = [
      r.oral, 
      r.controle, 
      r.synthese ? 2 * r.synthese : null
    ].filter((v) => typeof v === "number") as number[];
    if (vals.length === 0) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / (1+vals.length);
    return Math.round(avg * 10) / 10;
  };

  const canSave = useMemo(() => students.length > 0, [students]);

  // Fonction pour charger toutes les notes de toutes les matières en une seule fois (optimisé)
  const loadAllNotes = async () => {
    if (!selectedClass || !selectedTrimestre || subjects.length === 0) {
      console.log('Pas assez de paramètres pour charger les notes');
      return;
    }

    try {
      console.log(`⚡ Chargement optimisé de TOUTES les notes pour classe ${selectedClass}, trimestre ${selectedTrimestre}`);
      
      // Charger les notes pour toutes les matières disponibles EN PARALLÈLE
      const notesPromises = subjects.map(async (subject) => {
        const res = await fetch(`http://localhost:5000/api/notes/existing/${selectedClass}/${encodeURIComponent(subject.id)}/${selectedTrimestre}`);
        if (res.ok) {
          const notes: NoteRow[] = await res.json();
          return { matiere: subject.id, notes };
        }
        return { matiere: subject.id, notes: [] };
      });
      
      const results = await Promise.all(notesPromises);
      console.log('✅ Toutes les notes chargées:', results);
      
      // Organiser les notes par matière dans un cache
      const notesByMatiere: Record<string, Record<string, NoteRow>> = {};
      results.forEach(({ matiere, notes }) => {
        const notesMap: Record<string, NoteRow> = {};
        notes.forEach(note => {
          if (note.studentId) {
            notesMap[note.studentId] = {
              studentId: note.studentId,
              oral: note.oral ?? null,
              controle: note.controle ?? null,
              synthese: note.synthese ?? null
            };
          }
        });
        notesByMatiere[matiere] = notesMap;
      });
      
      setAllNotes(notesByMatiere);
      console.log('📦 Notes mises en cache par matière:', notesByMatiere);
      
    } catch (e) {
      console.error('Erreur réseau lors du chargement des notes:', e);
    }
  };

  // Fonction pour charger les notes existantes
  const loadExistingNotes = async () => {
    if (!selectedClass || !selectedSubject || !selectedTrimestre) {
      console.log('Pas assez de paramètres pour charger les notes existantes');
      return;
    }

    try {
      console.log(`Chargement des notes existantes pour classe ${selectedClass}, matière ${selectedSubject}, trimestre ${selectedTrimestre}`);
      
      const res = await fetch(`http://localhost:5000/api/notes/existing/${selectedClass}/${encodeURIComponent(selectedSubject)}/${selectedTrimestre}`);
      
      if (res.ok) {
        const existingNotes: NoteRow[] = await res.json();
        console.log('Notes existantes charg\u00e9es:', existingNotes);
        
        // Fusionner avec les lignes actuelles
        setRows(prev => {
          const newRows = { ...prev };
          
          existingNotes.forEach(note => {
            if (note.studentId) {
              newRows[note.studentId] = {
                studentId: note.studentId,
                oral: note.oral,
                controle: note.controle,
                synthese: note.synthese
              };
            }
          });
          
          return newRows;
        });
      } else {
        console.error('Erreur lors du chargement des notes existantes:', res.status);
      }
    } catch (e) {
      console.error('Erreur r\u00e9seau lors du chargement des notes existantes:', e);
    }
  };

  const handleSave = async () => {
    const payload = {
      classe: selectedClass,
      matiere: selectedSubject,
      date: new Date().toISOString(),
      trimestre: selectedTrimestre,
      assessmentType: "controle", // Valeur factice, le backend traitera tous les types
      notes: Object.values(rows),
    };

    console.log('=== FRONTEND SAUVEGARDE ===');
    console.log('Payload envoyé:', payload);
    console.log('Rows état actuel:', rows);

    try {
      // TODO: Créer la route POST pour sauvegarder
      const res = await fetch("http://localhost:5000/api/notes/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Ajouter token si nécessaire : "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Notes sauvegardées avec succès !");
        // Recharger toutes les notes pour afficher les changements
        setTimeout(() => loadAllNotes(), 500);
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    } catch (e) {
      console.error("Erreur sauvegarde:", e);
      alert("Erreur réseau");
    }
  };

  // ...existing code... (le reste du JSX reste identique)
  return (
    <div className="p-6">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold">Saisie des notes</h2>
          <p className="text-sm text-gray-500 mt-1">Enregistrer les notes (oral / contrôle / synthèse) pour vos élèves.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* controls */}
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border rounded-md p-2 bg-white"
              >
                <option value="">Sélectionnez une classe</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border rounded-md p-2 bg-white"
              >
                <option value="">Sélectionnez une matière</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre</label>
              <select
                value={selectedTrimestre}
                onChange={(e) => setSelectedTrimestre(Number(e.target.value) as 1 | 2 | 3)}
                className="w-full border rounded-md p-2 bg-white"
              >
                <option value={1}>1er Trimestre</option>
                <option value={2}>2ème Trimestre</option>
                <option value={3}>3ème Trimestre</option>
              </select>
            </div>
          </div>

          {/* students table - afficher seulement si une classe est sélectionnée */}
          {selectedClass && selectedSubject ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="py-3 px-3">Élève</th>
                    <th className="py-3 px-3">Oral</th>
                    <th className="py-3 px-3">Contrôle</th>
                    <th className="py-3 px-3">Synthèse</th>
                    <th className="py-3 px-3">Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                  const r = rows[s.id] ?? { studentId: s.id, oral: null, controle: null, synthese: null };
                  const avg = averageOf(r);
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="py-3 px-3">{s.prenom ? `${s.prenom} ${s.nom}` : s.nom}</td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          step="0.5"
                          value={r.oral ?? ""}
                          onChange={(e) => setNote(s.id, "oral", e.target.value)}
                          className="w-20 border rounded-md p-1"
                          placeholder="-"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          step="0.5"
                          value={r.controle ?? ""}
                          onChange={(e) => setNote(s.id, "controle", e.target.value)}
                          className="w-20 border rounded-md p-1"
                          placeholder="-"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          step="0.5"
                          value={r.synthese ?? ""}
                          onChange={(e) => setNote(s.id, "synthese", e.target.value)}
                          className="w-20 border rounded-md p-1"
                          placeholder="-"
                        />
                      </td>

                      <td className="py-2 px-3">{avg ?? "-"}</td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td className="py-4 px-3 text-gray-500" colSpan={5}>Aucun élève trouvé pour cette classe.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Veuillez sélectionner une classe et une matière pour afficher les notes.
            </div>
          )}

          {/* actions */}
          {selectedClass && selectedSubject && (
            <div className="flex items-center justify-center">
              <button
                disabled={!canSave}
                onClick={handleSave}
                className={`px-6 py-2 rounded-full text-white shadow-md ${canSave ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
              >
                Sauvegarder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
