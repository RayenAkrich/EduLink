// ...existing code...
import { useEffect, useState } from "react"
import type { Eleve } from "../Shared/types/Eleve";
import Dashboard from "./Dashboard";
import SelectChild from "./SelectChild";

export default function DashboardChoix(){
  const [children, setChildren] = useState<Eleve[]>([]);
  const [selectedChild, setSelectedChild] = useState<Eleve | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    
  // ne settez pas localStorage à chaque render — faites-le une seule fois si besoin
  useEffect(() => {
    if (!localStorage.getItem("id_user")) localStorage.setItem("id_user", "4");
  }, []);

  useEffect(()=>{
    const id = localStorage.getItem("id_user");
    if (!id) {
      setError("Utilisateur non identifié");
      setLoading(false);
      return;
    }

    const fetchChildren = async () => {
      try {
        const apiUrl = "http://localhost:5000";
        const res = await fetch(`${apiUrl}/notes/parent/${id}/children`);
        if (!res.ok) {
          throw new Error(`fetch failed: ${res.status}`);
        }
        const enfants = (await res.json()) as Eleve[];
        console.log("children fetched:", enfants);
        setChildren(enfants ?? []);
      } catch (err) {
        console.error("Erreur fetch children:", err);
        setError("Impossible de récupérer les enfants");
        setChildren([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);


  const hasOneChild = children.length === 1;

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

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