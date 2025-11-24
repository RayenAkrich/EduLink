import React from "react";
import LoginForm from "../components/LoginForm";
import LogoHeader from "../components/LogoHeader";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async(email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Email ou mot de passe incorrect !");
      }

      const data = await res.json();

      // 🟦 data doit contenir id_user, role, token
      const { id_user, role, token } = data;

      // 🔐 Stockage UI uniquement
      localStorage.setItem("id_user", id_user);
      localStorage.setItem("role", role);
      localStorage.setItem("token", token);
    console.log("Login successful for:", email);
    
    // Rediriger vers la page d'accueil après connexion réussie
    navigate("/dashboard");
    } catch (error) {
      console.error("Erreur login :", error);
      alert("Échec de connexion !");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')`,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="relative bg-white bg-opacity-95 p-10 rounded-xl shadow-2xl w-full max-w-md animate-fadeIn">
        <LogoHeader />
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
};

export default LoginPage;
