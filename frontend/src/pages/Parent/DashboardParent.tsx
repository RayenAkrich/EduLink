import { useState, useEffect } from "react";
import Layout from "../Shared/Layout";
import DashboardChoix from "./DashboardChoix";
import Notes from "./Notes";
import Dashboard from "./Dashboard";
import type { Eleve } from "../Shared/types/Eleve";
import NotificationsPage from "../../components/NotificationsPage";
import Announcements from "../../components/Announcements";
import ActivitiesManagement from "./ActivitiesManagement";

export default function DashboardParent() {
    // Récupérer la dernière page visitée depuis localStorage, ou "Dashboard" par défaut
    const [dash, setDash] = useState<string>(() => {
        return localStorage.getItem('parent_current_page') || 'Dashboard';
    });
    const [selectedChild, setSelectedChild] = useState<Eleve | null>(null);

    // Sauvegarder la page courante dans localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem('parent_current_page', dash);
    }, [dash]);

    let content;

    switch (dash.toLowerCase()) {
        case "notes":
            // si aucun enfant sélectionné -> afficher l'écran de choix
            content = selectedChild ? <Notes selectedChild={selectedChild} /> : (
                <DashboardChoix selectedChild={selectedChild} setSelectedChild={setSelectedChild} />
            );
            break;
          case "notifications":
              content = <NotificationsPage onNavigate={setDash} />;
          break;
    

          case "announces":
            content=<Announcements/>;
          break;

          case "activites":
            content=<ActivitiesManagement/>;
          break;

        case "dashboard":
        default:
            // si enfant sélectionné -> afficher le dashboard, sinon l'écran de choix
            content = selectedChild ? (
                <Dashboard infochild={selectedChild} onBack={() => setSelectedChild(null)} />
            ) : (
                <DashboardChoix selectedChild={selectedChild} setSelectedChild={setSelectedChild} />
            );
            break;
    }

    return (
        <Layout dash={dash} setDash={setDash}>
            {content}
        </Layout>
    );
}
