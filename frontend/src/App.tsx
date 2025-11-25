import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardParent from "./pages/Parent/DashboardParent";
import LoginPage from "./pages/LoginPage";
import DynamicDashboard from "./pages/Shared/DynamicDashboard";
import UserContextProvider from "./pages/Shared/userContext";

function App() {
  return (
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
        
          <Route path="/dashboard" element={<DynamicDashboard />} />

        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  );
}

export default App;