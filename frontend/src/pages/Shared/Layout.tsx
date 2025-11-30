import { useState } from "react";
import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
interface Props{
    children: ReactNode;
    setDash:React.Dispatch<React.SetStateAction<string>>;
    dash:string;
}
export default function Layout({children,setDash,dash}:Props){
    const [hide,setHide]=useState(false);
    return(
        <div className="flex flex-col h-screen overflow-hidden">
            <Header hide={hide} setHide={setHide} onNavigate={(tab:string)=>setDash(tab)} />
            <div className="flex flex-1 overflow-hidden">
                <div className={`transition-all duration-300 ease-in-out overflow-y-auto ${
                    hide ? '-ml-60 w-0 opacity-0' : 'ml-0 w-60 opacity-100'
                }`}>
                    <Sidebar dash={dash} setDash={setDash} />
                </div>
                <main className="flex-1 bg-gray-100 overflow-y-auto">{children}</main>
            </div>
            <Footer />
        </div>
    )
}