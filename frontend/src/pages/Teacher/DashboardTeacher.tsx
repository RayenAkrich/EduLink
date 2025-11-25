import { useState } from "react"
import Dashboard from "./Dashboard";
import ModifInfo from "./ModifInfo";
import Layout from "../Shared/Layout";
import Notes from "./Notes";
import NotificationsPage from "../../components/NotificationsPage";
import Announcements from "../../components/Announcements";
import Messaging from "../../components/Messaging";
export default function DashboardTeacher(){
    const [dash,setDash]=useState("dashboard");
    let content;
    switch (dash) {
                case "modifinfo":
                    content=<ModifInfo setDash={setDash}/>
                    break;
                case "notes":
                    content=<Notes/>
                    break;
                case "notifications":
                    content=<NotificationsPage onNavigate={setDash}/>
                    break;
                case "announces":
                    content=<Announcements/>;
                    break;
                case "messaging":
                    content=<Messaging/>;
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