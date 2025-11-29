import { ReactNode, useState } from "react";
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
        <div className="flex flex-col ">
            <Header hide={hide} setHide={setHide} onNavigate={(tab:string)=>setDash(tab)} />
            <div className="flex">
                {!hide && <Sidebar dash={dash} setDash={setDash} />}
                <main className="flex-1 bg-gray-100">{children}</main>
            </div>

        </div>
    )
}