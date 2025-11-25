// ...existing code...
import { useEffect, useState } from "react"
import type { Eleve } from "../Shared/types/Eleve";
import Dashboard from "./Dashboard";
import SelectChild from "./SelectChild";
import { useUser } from "../Shared/userContext";

export default function DashboardChoix(){
  const [children, setChildren] = useState<Eleve[]>([]);
  const [selectedChild, setSelectedChild] = useState<Eleve | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user} = useUser();
  const [reload, setReload] = useState(0);

  useEffect(()=>{
    let cancelled = false;
    const id = user?.id_user;
    if (!id) {
      setError("Utilisateur non identifié");
      setLoading(false);
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
    const tryUrls = [
      `${apiUrl}/notes/parent/${id}/children`,
      `${apiUrl}/parent/${id}/children`,
    ];

    const fetchChildren = async () => {
      setLoading(true);
      setError(null);
      for (const url of tryUrls) {
        try {
          console.log("Trying fetch:", url);
          const res = await fetch(url);
          const text = await res.text();
          console.log("Response for", url, res.status, text.slice(0,200));
          if (!res.ok) {
            // try next url
            continue;
          }
          // parse JSON safely
          const data = JSON.parse(text) as Eleve[];
          if (!cancelled) {
            setChildren(data ?? []);
            setLoading(false);
            setError(null);
          }
          return;
        } catch (e) {
          console.warn("Fetch error for", url, e);
          // try next url
          continue;
        }
      }
      if (!cancelled) {
        setChildren([]);
        setError("Impossible de récupérer les enfants (endpoint introuvable ou erreur serveur)");
        setLoading(false);
      }
    };

    fetchChildren();
    return () => { cancelled = true; };
    // re-run when user or reload changes
  }, [user, reload]);

  const hasOneChild = children.length === 1;

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return (
    <div className="p-6 text-red-600">
      {error}
      <div className="mt-4">
        <button className="px-4 py-2 bg-slate-700 text-white rounded" onClick={()=>setReload(r=>r+1)}>Rafraîchir</button>
      </div>
    </div>
  );

  if (children.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg mb-4">Choisissez un enfant</h2>
        <p className="text-gray-600">Aucun enfant trouvé pour ce compte.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={()=>setReload(r=>r+1)}>Rafraîchir</button>
      </div>
    );
  }

  return (
    <div>
      {hasOneChild ? (
        <Dashboard onBack={()=>setSelectedChild(null)} infochild={children[0]} />
      ) : (
        selectedChild ? (
          <Dashboard onBack={()=>setSelectedChild(null)} infochild={selectedChild} />
        ) : (
          <SelectChild
            childrenList={children}
            onSelect={(child) => setSelectedChild(child)}
          />
        )
      )}
    </div>
  );
}
// ...existing code...