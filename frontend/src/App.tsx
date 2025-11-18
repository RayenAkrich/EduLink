import { BrowserRouter, Routes, Route } from "react-router-dom";
import Messaging from "./pages/Messaging";
import { UserContext } from "./context/UserContext";
import { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // For now, use demo data. Replace with actual login later.
    const demoToken = "demo-token-12345";
    const demoUser = {
      id_user: 1,
      nom: "Demo User",
      email: "demo@example.com"
    };

    localStorage.setItem("id_user", demoUser.id_user.toString());
    localStorage.setItem("token", demoToken);

    setUser({
      token: demoToken,
      user: demoUser
    });
  }, []);

  if (!user) {
    return <div className="text-white p-4">Loading...</div>;
  }

  return (
    <UserContext.Provider value={user}>
      <BrowserRouter>
        <Routes>
          <Route path="/messages" element={<Messaging />} />
          <Route path="/" element={<div className="text-white p-4">Home Page - Go to /messages</div>} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
