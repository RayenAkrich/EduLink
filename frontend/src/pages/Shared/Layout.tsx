import { useState } from "react";
import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
interface Props{
    children: ReactNode;
    setDash:React.Dispatch<React.SetStateAction<string>>;
    dash:string;
}
export default function Layout({children,setDash,dash}:Props){
    const [hide,setHide]=useState(false);
    return(
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar à gauche sur toute la hauteur */}
            <div className={`transition-all duration-300 ease-in-out overflow-y-auto ${
                hide ? 'w-0' : 'w-60'
            }`}>
                <div className={`w-60 h-full transition-opacity duration-300 ${hide ? 'opacity-0' : 'opacity-100'}`}>
                    <Sidebar dash={dash} setDash={setDash} />
                </div>
            </div>
            
            {/* Contenu principal avec header en haut */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header hide={hide} setHide={setHide} onNavigate={(tab:string)=>setDash(tab)} />
                <main className={`flex-1 bg-gray-100 overflow-y-auto transition-all duration-300 ${
                    hide ? 'px-8 md:px-16 lg:px-24' : ''
                }`}>
                    {children}
                </main>
            </div>
        </div>
    )
}