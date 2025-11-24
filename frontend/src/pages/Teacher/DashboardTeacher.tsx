import { useState } from "react"
import Dashboard from "./Dashboard";
import ModifInfo from "./ModifInfo";
import Layout from "../Shared/Layout";
import Notes from "./Notes";
export default function DashboardTeacher(){
    const [dash,setDash]=useState("Dashboard");
    let content;
    switch (dash) {
                case "ModifInfo":
                    content=<ModifInfo setDash={setDash}/>
                    break;
                case "notes":
                    content=<Notes/>
                    break;
                default:
                    content=<Dashboard setDash={setDash}/>
                    break;
            }
    return(
        <>
            <Layout dash={dash} setDash={setDash}>
                {content}
            </Layout>
            
        </>
    )
}