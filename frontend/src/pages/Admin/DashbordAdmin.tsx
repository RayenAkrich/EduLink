import { useState } from "react"
import Dashboard from "./Dashboard";
import Layout from "../Shared/Layout";
import Users from "./Users";
import ClassesManagement from "./ClassesManagement";
import ActivitiesManagement from "./ActivitiesManagement";
import NotificationsPage from "../../components/NotificationsPage";
import Announcements from "../../components/Announcements";
import Messaging from "../../components/Messaging";

export default function DashboardAdmin(){
    const [dash,setDash]=useState("dashboard");
    let content;
    switch (dash) {
                case "users":
                    content = <Users />;
                    break;
        case "classes":
            content = <ClassesManagement />;
            break;
        case "activites":
            content = <ActivitiesManagement />;
            break;
        case "notifications":
            content = <NotificationsPage onNavigate={setDash} />;
            break;
        case "announces":
            content = <Announcements />;
            break;
        case "messaging":
            content = <Messaging />;
            break;
                default:
                    content = <Dashboard setDash={setDash} />;
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