import { useEffect, useState } from "react";
import type { User } from "../Shared/types/User";
import { useUser } from "../Shared/userContext";

interface Props{
    setDash:React.Dispatch<React.SetStateAction<string>>;
}
export default function Dashboard({setDash}:Props){
    const {user}= useUser();
    return(
        <>
            <div className="flex rounded shadow-sm mx-5 mt-5 p-10">
                <img className="p-5 w-70" src="https://img.freepik.com/free-photo/young-handsome-man-holding-notebooks-concept-e-learning-courses_1258-26588.jpg" alt="imgProfil" />
                <div>
                    <h2>Professeur {user?.nom} </h2>
                    <p>Formatique</p>
                    <p className="before:content-['\f0e0'] before:font-['FontAwesome']">{user?.email}</p>
                </div>
            </div>
            <div className="bg-white shadow-sm mx-5 ">
                <button className="border rounded px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white my-3 mx-10 cursor-pointer ">A propos</button>
                <button className="border rounded px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">Mot de passe</button>
            </div>
            <div className="bg-white flex justify-between rounded m-5 shadow-sm p-5">
                <div>
                    <h1 className="text-lg p-2">Information personnel:</h1>
                    <p className="text-sm p-2">Nom : Mohsen</p>
                    <p className="text-sm p-2">Prénom : Mohsen</p>
                    <p className="text-sm p-2">Adresse email : Mohsen</p>
                    <p className="text-sm p-2">Mobile : Mohsen</p>
                
                </div>
                
                <p className="cursor-pointer text-gray-400" onClick={()=>setDash("modifinfo")}>Modifier</p>
            </div>
        </>
    )
}