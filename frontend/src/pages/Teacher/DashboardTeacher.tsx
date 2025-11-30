import { useState, useEffect } from "react"
import Dashboard from "./Dashboard";
import ModifInfo from "./ModifInfo";
import Layout from "../Shared/Layout";
import Notes from "./Notes";
import NotificationsPage from "../../components/NotificationsPage";
import Announcements from "../../components/Announcements";
import Messaging from "../../components/Messaging";
import ClassesManagement from "../Admin/ClassesManagement";
import ActivitiesManagement from "./ActivitiesManagement";

export default function DashboardTeacher(){
    // Récupérer la dernière page visitée depuis localStorage, ou "dashboard" par défaut
    const [dash, setDash] = useState(() => {
        return localStorage.getItem('teacher_current_page') || 'dashboard';
    });

    // Sauvegarder la page courante dans localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem('teacher_current_page', dash);
    }, [dash]);

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
                case "classes":
                    content=<ClassesManagement/>;
                    break;
                case "activites":
                    content=<ActivitiesManagement/>;
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