import LabelInput from "./LabelInput";
interface Props{
    setDash:React.Dispatch<React.SetStateAction<string>>;
}
function ModifInfo({setDash}:Props){
    return(
        
            <div className="shadow-sm rounded-lg m-10 bg-white">
                <h2 className="p-4">Information sur l'enseignant</h2>
                <div className="grid grid-cols-3 gap-4 p-4">
                    <LabelInput label="Nom"/>
                    <LabelInput label="Prénom"/>
                    <LabelInput label="matiére"/>
                    <LabelInput label="E-mail"/>
                    <LabelInput label="Mot de Pass"/>
                </div>
                <div className="flex justify-center">
                    <button className=" cursor-pointer m-7 px-10 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded" onClick={()=>setDash("dashboard")}>Confirm</button>
                </div>
            </div>
        
        
    )
}
export default ModifInfo;