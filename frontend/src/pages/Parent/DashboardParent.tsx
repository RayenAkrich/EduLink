import { useState } from "react"
import Layout from "../Shared/Layout";
import DashboardChoix from "./DashboardChoix";
import Notes from "./Notes";
export default function DashboardParent(){
    const [dash,setDash]=useState("Dashboard");
    let content;
    switch (dash) {
                case "notes":
                    content=<Notes/>;
                    break;
                default:
                    content=<DashboardChoix/>
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