import { ReactNode, useState } from "react";
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
        <div className="flex flex-col min-h-screen">
            <Header hide={hide} setHide={setHide} onNavigate={(tab:string)=>setDash(tab)} />
            <div className="flex flex-1">
                {!hide && <Sidebar dash={dash} setDash={setDash} />}
                <main className="flex-1 bg-gray-100">{children}</main>
            </div>
            <Footer />
        </div>
    )
}