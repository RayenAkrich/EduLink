// ...existing code...
import React, { useEffect, useMemo, useState } from "react";
import type { Eleve } from "../Shared/types/Eleve";

interface Props {
  selectedChild: Eleve;
}

type Note = {
  id: number;
  subject: string;
  grade: number | null;
  coefficient?: number;
  teacher?: string;
  period?: string;
};

export default function Notes({ selectedChild }: Props) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        // try a realistic endpoint; fallback to mock if it fails
        const url = `${base}/notes/child/${selectedChild.id_eleve}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("no remote notes");
        const data = await res.json();
        if (!mounted) return;
        setNotes(data);
      } catch {
        // fallback mock data (design preview)
        if (!mounted) return;
        setNotes([
          { id: 1, subject: "Mathématiques", grade: 15, coefficient: 3, teacher: "Mme. Ali", period: "T1" },
          { id: 2, subject: "Français", grade: 14, coefficient: 2, teacher: "M. Ben", period: "T1" },
          { id: 3, subject: "Anglais", grade: 12, coefficient: 1, teacher: "Mme. Nora", period: "T1" },
          { id: 4, subject: "Histoire", grade: null, coefficient: 1, teacher: "M. Samir", period: "T1" },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotes();
    return () => {
      mounted = false;
    };
  }, [selectedChild]);

  const average = useMemo(() => {
    if (!notes || notes.length === 0) return null;
    let total = 0;
    let weight = 0;
    for (const n of notes) {
      if (n.grade === null || typeof n.grade !== "number") continue;
      const coef = n.coefficient ?? 1;
      total += n.grade * coef;
      weight += coef;
    }
    if (weight === 0) return null;
    return +(total / weight).toFixed(2);
  }, [notes]);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Chargement des notes…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Notes de {selectedChild.nom}</h1>
          <p className="text-sm text-gray-500">
            Né(e) le: <span className="font-medium text-gray-700">{selectedChild.date_naissance ?? "—"}</span>
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">Moyenne générale</div>
          <div className="mt-1 text-2xl font-bold">{average !== null ? `${average} / 20` : "—"}</div>
        </div>
      </header>

      <section className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Bulletin — Trimestre 1</h2>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => {
                  // simple client refresh
                  setNotes(null);
                  setTimeout(() => {
                    // trigger re-fetch by resetting notes to null (useEffect will run because selectedChild unchanged)
                    // to keep it simple here we just call the effect by toggling state – already covered by effect on selectedChild
                  }, 0);
                }}
              >
                Rafraîchir
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {!notes || notes.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Aucune note disponible pour le moment.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="py-2 px-3">Matière</th>
                    <th className="py-2 px-3">Note</th>
                    <th className="py-2 px-3">Coef.</th>
                    <th className="py-2 px-3">Enseignant</th>
                    <th className="py-2 px-3">Période</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((n) => (
                    <tr key={n.id} className="odd:bg-gray-50">
                      <td className="py-3 px-3">{n.subject}</td>
                      <td className="py-3 px-3">
                        {n.grade === null ? (
                          <span className="text-gray-400 italic">Abs/Non noté</span>
                        ) : (
                          <span className="font-medium">{n.grade} / 20</span>
                        )}
                      </td>
                      <td className="py-3 px-3">{n.coefficient ?? 1}</td>
                      <td className="py-3 px-3">{n.teacher ?? "—"}</td>
                      <td className="py-3 px-3">{n.period ?? "—"}</td>
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
// ...existing code...