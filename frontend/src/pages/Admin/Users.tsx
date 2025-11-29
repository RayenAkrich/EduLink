import React, { useEffect, useState } from "react";
import * as userService from "../../services/usersService";

interface User {
  id_user: number;
  nom: string;
  email: string;
  role: "admin" | "enseignant" | "parent";
  date_creation: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    nom: "",
    email: "",
    mot_de_passe: "",
    role: "parent",
  });

  // Récupérer l'utilisateur actuel depuis localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      setUsers(res.data.users);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setForm({ nom: "", email: "", mot_de_passe: "", role: "parent" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Mise à jour
        const updateData = {
          nom: form.nom,
          email: form.email,
          role: form.role,
          ...(form.mot_de_passe && { mot_de_passe: form.mot_de_passe }),
        };
        await userService.updateUser(editingId, updateData);
        setSuccess("Utilisateur mis à jour avec succès");
      } else {
        // Création
        if (!form.mot_de_passe) {
          setError("Le mot de passe est obligatoire pour créer un utilisateur");
          setLoading(false);
          return;
        }
        await userService.createUser(form);
        setSuccess("Utilisateur créé avec succès");
      }
      resetForm();
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setForm({
      nom: user.nom,
      email: user.email,
      mot_de_passe: "",
      role: user.role,
    });
    setEditingId(user.id_user);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    // Vérifier si c'est l'utilisateur actif
    if (currentUser && currentUser.id_user === id) {
      setError("❌ Vous ne pouvez pas supprimer votre propre compte administrateur");
      setTimeout(() => setError(null), 4000);
      return;
    }

    // Vérifier si c'est un admin
    const userToDelete = users.find((u) => u.id_user === id);
    if (userToDelete && userToDelete.role === "admin") {
      setError("❌ Vous ne pouvez pas supprimer un compte administrateur");
      setTimeout(() => setError(null), 4000);
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    setLoading(true);
    try {
      await userService.deleteUser(id);
      setSuccess("✅ Utilisateur supprimé avec succès");
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "enseignant":
        return "bg-blue-100 text-blue-800";
      case "parent":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isCurrentUser = (id: number) => currentUser && currentUser.id_user === id;
  const isAdmin = (role: string) => role === "admin";
  const canDelete = (user: User) =>
    !isCurrentUser(user.id_user) && !isAdmin(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">👥 Gestion des utilisateurs</h1>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Erreur</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 text-green-700">
          <p className="font-semibold">Succès</p>
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Form Section */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? "✏️ Modifier l'utilisateur" : "➕ Ajouter un nouvel utilisateur"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {editingId ? "Mot de passe (laisser vide pour garder l'actuel)" : "Mot de passe"}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.mot_de_passe}
                  onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
                  required={!editingId}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rôle</label>
                <select
                  title="Rôle de l'utilisateur"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Administrateur</option>
                  <option value="enseignant">Enseignant</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 font-semibold"
              >
                {loading ? "Traitement..." : editingId ? "Mettre à jour" : "Créer"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all font-semibold"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-8 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg"
        >
          ➕ Ajouter un utilisateur
        </button>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            title="Filtrer par rôle"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="enseignant">Enseignant</option>
            <option value="parent">Parent</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-semibold">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Nom</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Rôle</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date création</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id_user}
                    className={`border-t hover:bg-blue-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {user.id_user}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{user.nom}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.date_creation).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      {isCurrentUser(user.id_user) ? (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          🔐 Vous (Actif)
                        </span>
                      ) : isAdmin(user.role) ? (
                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                          🔒 Admin
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(user.id_user)}
                          disabled={!canDelete(user) || loading}
                          title={
                            isCurrentUser(user.id_user)
                              ? "Vous ne pouvez pas supprimer votre propre compte"
                              : isAdmin(user.role)
                              ? "Impossible de supprimer un compte administrateur"
                              : "Supprimer cet utilisateur"
                          }
                          className={`px-4 py-2 rounded-lg transition text-sm font-semibold ${
                            canDelete(user)
                              ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed opacity-50"
                          }`}
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Stats */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-4 border-t">
          <p className="text-sm text-gray-700 font-semibold">
            Total: <span className="text-blue-600">{filteredUsers.length}</span> utilisateur(s) | 
            <span className="text-red-600 ml-2">
              {filteredUsers.filter((u) => isAdmin(u.role)).length} Admin(s)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Users;