import { useState } from "react";
import Layout from "../Shared/Layout";
import DashboardChoix from "./DashboardChoix";
import Notes from "./Notes";
import Dashboard from "./Dashboard";
import type { Eleve } from "../Shared/types/Eleve";

export default function DashboardParent() {
    const [dash, setDash] = useState<string>("Dashboard");
    const [selectedChild, setSelectedChild] = useState<Eleve | null>(null);

    let content;

    switch (dash.toLowerCase()) {
        case "notes":
            // si aucun enfant sélectionné -> afficher l'écran de choix
            content = selectedChild ? <Notes selectedChild={selectedChild} /> : (
                <DashboardChoix selectedChild={selectedChild} setSelectedChild={setSelectedChild} />
            );
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