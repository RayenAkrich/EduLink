import type { Eleve } from "../Shared/types/Eleve"
import DashboardChoix from "./DashboardChoix"

interface Props{
    infochild:Eleve
    onBack?:()=>void
}
export default function Dashboard({onBack,infochild}:Props){
    return(
        
            <div className="shadow-sm rounded-lg m-10 bg-white">
                <h2 className="p-4">Information sur {infochild.nom}</h2>
                <div className="grid grid-cols-3 gap-4 p-4">
                    
                    {infochild.date_naissance}
                </div>
                <div className="flex justify-center">
                    <button className=" cursor-pointer m-7 px-10 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded" onClick={()=>onBack?.()}>Go back</button>
                </div>
            </div>
        
        
    )
}