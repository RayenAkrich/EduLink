
import { useEffect, useMemo, useState } from "react";

type Student = { id: string; nom: string; prenom?: string };
type NoteRow = { studentId: string; oral?: number | null; controle?: number | null; synthese?: number | null };

export default function Notes() {
  // mock data -> remplacer par fetch depuis API
  const classes = [{ id: "c1", label: "3ème A" }, { id: "c2", label: "4ème B" }];
  const subjects = [{ id: "math", label: "Mathématiques" }, { id: "fr", label: "Français" }];
  const mockStudents: Record<string, Student[]> = {
    c1: [
      { id: "s1", nom: "Ben", prenom: "Ali" },
      { id: "s2", nom: "Smith", prenom: "John" },
      { id: "s3", nom: "Diaz", prenom: "Maya" },
    ],
    c2: [
      { id: "s4", nom: "Nguyen", prenom: "Linh" },
      { id: "s5", nom: "Khan", prenom: "Sara" },
    ],
  };

  const [selectedClass, setSelectedClass] = useState(classes[0].id);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [assessmentType, setAssessmentType] = useState<"oral" | "controle" | "synthese">("controle");

  const [students, setStudents] = useState<Student[]>([]);
  const [rows, setRows] = useState<Record<string, NoteRow>>({});

  // load students when class change
  useEffect(() => {
    const list = mockStudents[selectedClass] ?? [];
    setStudents(list);
    // init rows for students (keep existing values if present)
    const newRows: Record<string, NoteRow> = {};
    list.forEach((s) => {
      newRows[s.id] = rows[s.id] ?? { studentId: s.id, oral: null, controle: null, synthese: null };
    });
    setRows(newRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  const setNote = (studentId: string, field: keyof NoteRow, value: string) => {
    // allow empty, otherwise number between 0 and 20
    const n = value === "" ? null : Math.max(0, Math.min(20, Number(value)));
    setRows((prev) => ({ ...prev, [studentId]: { ...(prev[studentId] ?? { studentId }), [field]: n } }));
  };

  const averageOf = (r: NoteRow) => {
    const vals = [r.oral, r.controle, 2*r.synthese].filter((v) => typeof v === "number") as number[];
    if (vals.length === 0) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / (1+vals.length);
    return Math.round(avg * 10) / 10;
  };

  const canSave = useMemo(() => students.length > 0, [students]);

  const handleSave = () => {
    // Préparer payload -> remplacer par appel API
    const payload = {
      classe: selectedClass,
      matiere: selectedSubject,
      date,
      assessmentType,
      notes: Object.values(rows),
    };
    console.log("Saving notes", payload);
    // TODO: POST /api/notes ...
    alert("Notes sauvegardées (console.log)");
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-semibold">Saisie des notes</h2>
          <p className="text-sm text-gray-500 mt-1">Enregistrer les notes (oral / contrôle / synthèse) pour vos élèves.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* controls */}
          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border rounded-md p-2 bg-white"
              >
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
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded-md p-2 bg-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="type" checked={assessmentType === "oral"} onChange={() => setAssessmentType("oral")} />
                  Oral
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="type" checked={assessmentType === "controle"} onChange={() => setAssessmentType("controle")} />
                  Contrôle
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="type" checked={assessmentType === "synthese"} onChange={() => setAssessmentType("synthese")} />
                  Synthèse
                </label>
              </div>
            </div>
          </div>

          {/* students table */}
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
                          className={`w-20 border rounded-md p-1 ${assessmentType === "oral" ? "ring-2 ring-blue-200" : ""}`}
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
                          className={`w-20 border rounded-md p-1 ${assessmentType === "controle" ? "ring-2 ring-blue-200" : ""}`}
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
                          className={`w-20 border rounded-md p-1 ${assessmentType === "synthese" ? "ring-2 ring-blue-200" : ""}`}
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

          {/* actions */}
          <div className="flex items-center justify-center">
            <button
              disabled={!canSave}
              onClick={handleSave}
              className={`px-6 py-2 rounded-full text-white shadow-md ${canSave ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
