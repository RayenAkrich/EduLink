import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./Shared/userContext";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Email ou mot de passe incorrect");
      }

      // Store only the token
      localStorage.setItem("token", data.token);
      
      // Fetch user data from token via context
      await refreshUser();
      
      toast.success("Connexion réussie !");
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erreur login :", error);
      toast.error(error.message || "Échec de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Slogan */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-96 h-96 border-[3px] border-orange-200 rounded-full opacity-40"></div>
        <div className="absolute top-32 left-32 w-72 h-72 border-[2px] border-red-200 rounded-full opacity-30"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-200 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-red-100 rounded-full opacity-20"></div>
        
        {/* Radial lines effect */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-64 bg-gradient-to-t from-orange-300 to-transparent origin-bottom"
              style={{
                transform: `rotate(${i * 9}deg) translateY(-50%)`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-6xl font-black leading-tight mb-4">
            <span className="block">Une éducation de qualité</span>
            <span className="block">est la clé de</span>
            <span className="block">votre réussite future</span>
          </h1>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-100">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold">EduLink</h2>
          </div>

          {/* Carte de connexion */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-3xl font-bold mb-2">Connexion</h3>
                <p className="text-gray-600 mb-8">
                  Bon retour ! Veuillez vous connecter pour accéder à votre compte.
                </p>

                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Champ e-mail */}
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre e-mail"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                    disabled={loading}
                  />
                  </div>

                  {/* Champ mot de passe */}
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                    disabled={loading}
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  </div>

                  {/* Bouton de connexion */}
                  <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                  {loading ? "Connexion..." : "Se connecter"}
                  </button>
                </form>
                </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
