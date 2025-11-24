import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardParent from "./pages/Parent/DashboardParent";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;