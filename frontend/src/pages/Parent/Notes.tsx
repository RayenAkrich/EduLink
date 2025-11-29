import   { useEffect, useMemo, useState } from "react";
import type { Eleve } from "../Shared/types/Eleve";

interface Props {
  selectedChild: Eleve;
}

type Note = {
  idchild: number;
  subject: string;
  enseignant: string;
  typedev: string;
  coefficientNote: number;
  coefficientMatiere: number;
  date: string;
  score: number;
  trimestre: number;
  nomclass: string;
};

export default function Notes({ selectedChild }: Props) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [selectedTrimestre, setSelectedTrimestre] = useState<1 | 2 | 3>(1);
  const [viewMode, setViewMode] = useState<"none" | "bulletin" | string>("none"); // "none", "bulletin", ou nom de matière

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${base}/api/notes/child/${selectedChild.id_eleve}`;
        console.log("Fetching notes from:", url);
        console.log("Selected trimestre:", selectedTrimestre);
        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
        const data = await res.json();
        console.log("Notes received:", data);
        console.log("Notes count:", data.length);
        console.log("Filtering by trimestre:", selectedTrimestre);
        setNotes(data);
        setError(null);
      } catch (e: any) {
        if (signal.aborted) return;
        console.error("Error fetching notes:", e);
        setError(`Erreur lors du chargement des notes: ${e.message}`);
        setNotes([]);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchNotes();
    return () => {
      controller.abort();
    };
  }, [selectedChild, reload, selectedTrimestre]);

  // Calculer la moyenne par matière
  const calculateSubjectAverage = (oral: number | null, controle: number | null, synthese: number | null) => {
    // Besoin au minimum de controle et synthese
    if (controle === null || synthese === null) return null;
    
    if (oral !== null) {
      // Si oral existe: (oral + controle + 2*synthese) / 4
      return +((oral + controle + 2 * synthese) / 4).toFixed(2);
    } else {
      // Si pas d'oral: (controle + 2*synthese) / 3
      return +((controle + 2 * synthese) / 3).toFixed(2);
    }
  };

  const average = useMemo(() => {
    console.log("🔢 Calcul moyenne - Notes totales:", notes?.length);
    console.log("🔢 Trimestre sélectionné:", selectedTrimestre);
    
    if (!notes || notes.length === 0) return null;
    
    // Filtrer les notes du trimestre sélectionné
    const notesDuTrimestre = notes.filter(n => n.trimestre === selectedTrimestre);
    console.log("🔢 Notes du trimestre:", notesDuTrimestre.length);
    
    if (notesDuTrimestre.length === 0) return null;
    
    // Grouper par matière pour calculer chaque moyenne de matière
    const bySubject = new Map<string, { 
      oral: number | null, 
      controle: number | null, 
      synthese: number | null,
      coefMatiere: number 
    }>();
    
    for (const n of notesDuTrimestre) {
      if (!bySubject.has(n.subject)) {
        bySubject.set(n.subject, { 
          oral: null, 
          controle: null, 
          synthese: null, 
          coefMatiere: n.coefficientMatiere 
        });
      }
      
      const entry = bySubject.get(n.subject)!;
      const typeNormalized = n.typedev.toLowerCase();
      
      if (typeNormalized === "oral") {
        entry.oral = n.score;
      } else if (typeNormalized === "controle") {
        entry.controle = n.score;
      } else if (typeNormalized === "synthese") {
        entry.synthese = n.score;
      }
    }

    // Calculer la moyenne générale: somme(moyenne_matiere * coef_matiere) / somme(coef_matiere)
    let totalWeighted = 0;
    let totalCoef = 0;

    for (const [_, data] of bySubject) {
      const avgMatiere = calculateSubjectAverage(data.oral, data.controle, data.synthese);
      if (avgMatiere !== null) {
        totalWeighted += avgMatiere * data.coefMatiere;
        totalCoef += data.coefMatiere;
      }
    }

    if (totalCoef === 0) return null;
    return +(totalWeighted / totalCoef).toFixed(2);
  }, [notes, selectedTrimestre]);

  // Grouper les notes par matière
  const groupedNotes = useMemo(() => {
    console.log("📚 Groupement - Notes totales:", notes?.length);
    console.log("📚 Trimestre sélectionné:", selectedTrimestre);
    
    if (!notes || notes.length === 0) return [];

    // Filtrer par trimestre
    const notesDuTrimestre = notes.filter(n => n.trimestre === selectedTrimestre);
    console.log("📚 Notes du trimestre:", notesDuTrimestre.length);

    const grouped = new Map<string, {
      subject: string;
      enseignant: string;
      coefficientMatiere: number;
      oral: number | null;
      controle: number | null;
      synthese: number | null;
    }>();

    for (const n of notesDuTrimestre) {
      if (!grouped.has(n.subject)) {
        grouped.set(n.subject, {
          subject: n.subject,
          enseignant: n.enseignant,
          coefficientMatiere: n.coefficientMatiere,
          oral: null,
          controle: null,
          synthese: null,
        });
      }

      const entry = grouped.get(n.subject)!;
      const typeNormalized = n.typedev.toLowerCase();

      if (typeNormalized === "oral") {
        entry.oral = n.score;
      } else if (typeNormalized === "controle") {
        entry.controle = n.score;
      } else if (typeNormalized === "synthese") {
        entry.synthese = n.score;
      }
    }

    return Array.from(grouped.values());
  }, [notes, selectedTrimestre]);

  // Liste des matières disponibles
  const availableSubjects = useMemo(() => {
    if (!notes || notes.length === 0) return [];
    const notesDuTrimestre = notes.filter(n => n.trimestre === selectedTrimestre);
    const subjects = new Set<string>();
    notesDuTrimestre.forEach(n => subjects.add(n.subject));
    return Array.from(subjects).sort();
  }, [notes, selectedTrimestre]);

  // Filtrer les notes selon le mode de vue
  const filteredNotes = useMemo(() => {
    if (!notes || viewMode === "none") return [];
    const notesDuTrimestre = notes.filter(n => n.trimestre === selectedTrimestre);
    if (viewMode === "bulletin") return notesDuTrimestre;
    // Afficher seulement les notes de la matière sélectionnée
    return notesDuTrimestre.filter(n => n.subject === viewMode);
  }, [notes, viewMode, selectedTrimestre]);

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4">
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-8 w-16 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Notes de {selectedChild.nom}</h1>
        <p className="text-sm text-gray-500">
          Né(e) le: <span className="font-medium text-gray-700">{formatDate(selectedChild.date_naissance)}</span>
        </p>
      </header>

      <section className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {viewMode === "bulletin" ? `Bulletin — ${notes && notes.length > 0 ? notes[0].nomclass : "Classe"}` : 
               viewMode !== "none" ? `Notes de ${viewMode}` : "Sélectionner une vue"}
            </h2>
            <div className="flex gap-2">
              <select 
                value={selectedTrimestre}
                onChange={(e) => setSelectedTrimestre(Number(e.target.value) as 1 | 2 | 3)}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                <option value={1}>1er Trimestre</option>
                <option value={2}>2ème Trimestre</option>
                <option value={3}>3ème Trimestre</option>
              </select>
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value)}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                <option value="none">-- Sélectionner --</option>
                <option value="bulletin">📋 Bulletin complet</option>
                <optgroup label="Matières">
                  {availableSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </optgroup>
              </select>
              <button
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => setReload(r => r + 1)}
              >
                Rafraîchir
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {viewMode === "none" ? (
            <div className="text-center text-gray-500 py-10">
              Veuillez sélectionner le bulletin ou une matière pour afficher les notes.
            </div>
          ) : viewMode === "bulletin" ? (
            // Vue bulletin (groupée par matière)
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="py-2 px-3">Matière</th>
                    <th className="py-2 px-3">Coef.</th>
                    <th className="py-2 px-3 text-center">Oral</th>
                    <th className="py-2 px-3 text-center">Contrôle</th>
                    <th className="py-2 px-3 text-center">Synthèse</th>
                    <th className="py-2 px-3 text-center">Moyenne</th>
                    <th className="py-2 px-3">Enseignant</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedNotes.map((subject, idx) => {
                    const avg = calculateSubjectAverage(subject.oral, subject.controle, subject.synthese);
                    return (
                      <tr key={idx} className="odd:bg-gray-50">
                        <td className="py-3 px-3 font-medium">{subject.subject}</td>
                        <td className="py-3 px-3">{subject.coefficientMatiere}</td>
                        <td className="py-3 px-3 text-center">
                          {subject.oral !== null ? (
                            <span className="font-medium">{subject.oral}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {subject.controle !== null ? (
                            <span className="font-medium">{subject.controle}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {subject.synthese !== null ? (
                            <span className="font-medium">{subject.synthese}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {avg !== null ? (
                            <span className="font-bold text-blue-600">{avg} / 20</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600">{subject.enseignant}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold">
                    <td colSpan={5} className="py-3 px-3 text-right">Moyenne générale :</td>
                    <td className="py-3 px-3 text-center text-lg text-blue-700">
                      {average !== null ? `${average} / 20` : "—"}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            // Vue détaillée d'une matière
            <div className="overflow-x-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{viewMode}</h3>
                <p className="text-sm text-gray-600">
                  Enseignant: {filteredNotes.length > 0 ? filteredNotes[0].enseignant : "—"}
                </p>
              </div>
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Note</th>
                    <th className="py-2 px-3">Coefficient</th>
                    <th className="py-2 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotes.map((note, idx) => (
                    <tr key={idx} className="odd:bg-gray-50">
                      <td className="py-3 px-3 font-medium capitalize">{note.typedev}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-blue-600">{note.score} / 20</span>
                      </td>
                      <td className="py-3 px-3">{note.coefficientNote}</td>
                      <td className="py-3 px-3 text-sm text-gray-600">
                        {new Date(note.date).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t bg-gray-50 text-right">
          <span className="text-sm text-gray-600">Dernière mise à jour : </span>
          <span className="text-sm font-medium ml-2">{new Date().toLocaleString()}</span>
        </div>
      </section>
    </div>
  );
}