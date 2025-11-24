import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardParent from "./pages/Parent/DashboardParent";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/parent" element={<DashboardParent/>}/>
        <Route path="/*" element={<DashboardParent/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;