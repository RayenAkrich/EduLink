import React from "react";
import LoginForm from "../components/LoginForm";
import LogoHeader from "../components/LogoHeader";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    console.log("Login successful for:", email);
    // Rediriger vers la page d'accueil après connexion réussie
    navigate("/");
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
