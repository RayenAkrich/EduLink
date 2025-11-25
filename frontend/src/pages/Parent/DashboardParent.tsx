import { useState } from "react";
import Layout from "../Shared/Layout";
import DashboardChoix from "./DashboardChoix";
import Notes from "./Notes";
import NotificationsPage from "../../components/NotificationsPage";
import Announcements from "../../components/Announcements";
export default function DashboardParent() {
  const [dash, setDash] = useState("Dashboard");
  let content;
  switch (dash) {
    case "notifications":
      content = <NotificationsPage onNavigate={setDash} />;
      break;
    case "notes":
      content = <Notes />;
      break;

    case "announces":
        content=<Announcements/>;
        break;
    default:
      content = <DashboardChoix />;
      break;
  }
  return (
    <>
      <Layout dash={dash} setDash={setDash}>
        {content}
      </Layout>
    </>
  );
}
