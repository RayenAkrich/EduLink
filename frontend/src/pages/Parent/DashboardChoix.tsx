// ...existing code...
import { useEffect, useState } from "react"
import type { Eleve } from "../Shared/types/Eleve";
import Dashboard from "./Dashboard";
import SelectChild from "./SelectChild";
import { useUser } from "../Shared/userContext";
interface Props{
  selectedChild:Eleve|null ;
  setSelectedChild:(child: Eleve|null)=>void;
}
export default function DashboardChoix({selectedChild,setSelectedChild}:Props){
  const [children, setChildren] = useState<Eleve[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user} = useUser();
  

  useEffect(()=>{
    const id = user?.id_user;
    if (!id) {
      setError("Utilisateur non identifié");
      setLoading(false);
      return;
    }

    const fetchChildren = async () => {
      try {
        const apiUrl = "http://localhost:5000";
        const res = await fetch(`${apiUrl}/dashboard/parent/${id}/children`);
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

  useEffect(() => {
    if (!selectedChild && children.length === 1) {
      setSelectedChild(children[0]);
    }
    // ne pas inclure setSelectedChild dans les deps pour éviter double appel si parent la redéfinit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, selectedChild]);
  const hasOneChild = children.length === 1;

  if (loading) return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
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