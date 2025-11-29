import { useState } from "react"
import Dashboard from "./Dashboard";
import Layout from "../Shared/Layout";
import Users from "./Users";

export default function DashboardAdmin(){
    const [dash,setDash]=useState("dashboard");
    let content;
    switch (dash) {
                case "users":
                    content=<Users/>;
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