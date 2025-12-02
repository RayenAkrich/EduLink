import React, { useEffect, useState } from "react";
import { Users as UsersIcon, Plus, X, Edit2, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setForm({ nom: "", email: "", mot_de_passe: "", role: "parent" });
    setEditingUser(null);
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        // Mise à jour
        const updateData = {
          nom: form.nom,
          email: form.email,
          role: form.role,
          ...(form.mot_de_passe && { mot_de_passe: form.mot_de_passe }),
        };
        await userService.updateUser(editingUser.id_user, updateData);
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        // Création
        if (!form.mot_de_passe) {
          toast.error("Le mot de passe est obligatoire pour créer un utilisateur");
          setLoading(false);
          return;
        }
        await userService.createUser(form);
        toast.success("Utilisateur créé avec succès");
      }
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Une erreur est survenue");
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
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    // Vérifier si c'est l'utilisateur actif
    if (currentUser && currentUser.id_user === id) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte administrateur");
      return;
    }

    // Vérifier si c'est un admin
    const userToDelete = users.find((u) => u.id_user === id);
    if (userToDelete && userToDelete.role === "admin") {
      toast.error("Vous ne pouvez pas supprimer un compte administrateur");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    setLoading(true);
    try {
      await userService.deleteUser(id);
      toast.success("Utilisateur supprimé avec succès");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la suppression");
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
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
              <p className="text-slate-600 mt-1">
                {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} trouvé{filteredUsers.length > 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Créer un utilisateur
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
            title="Filtrer les utilisateurs par rôle"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="enseignant">Enseignant</option>
              <option value="parent">Parent</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-t p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-slate-200 rounded"></div>
                        <div className="h-8 w-8 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <UsersIcon size={64} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-400 text-lg">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Rôle</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Date création</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id_user}
                      className="border-t hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{user.nom}</p>
                          {isCurrentUser(user.id_user) && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                              Vous
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(user.date_creation).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                          title="Modifier cet utilisateur"
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-50"
                          >
                            <Edit2 size={18} />
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
                            className={`p-2 rounded transition ${
                              canDelete(user)
                                ? "text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                : "text-slate-300 cursor-not-allowed"
                            }`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowCreateModal(false); resetForm(); }}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold">Créer un utilisateur</h2>
                <button
                title="Fermer le formulaire de création"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={form.nom}
                        onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        placeholder="Ex: Jean Dupont"
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="exemple@email.com"
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Mot de passe
                      </label>
                      <input
                        type="password"
                        value={form.mot_de_passe}
                        onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Rôle
                      </label>
                      <select
                      title="Sélectionner le rôle de l'utilisateur"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="parent">Parent</option>
                        <option value="enseignant">Enseignant</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Création..." : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowEditModal(false); resetForm(); }}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold">Modifier l'utilisateur</h2>
                <button
                title="Fermer le formulaire de modification"
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={form.nom}
                        onChange={(e) => setForm({ ...form, nom: e.target.value })}
                        placeholder="Ex: Jean Dupont"
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="exemple@email.com"
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Mot de passe (laisser vide pour ne pas changer)
                      </label>
                      <input
                        type="password"
                        value={form.mot_de_passe}
                        onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Rôle
                      </label>
                      <select
                      title="Sélectionner le rôle de l'utilisateur"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="parent">Parent</option>
                        <option value="enseignant">Enseignant</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); resetForm(); }}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Mise à jour..." : "Mettre à jour"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};export default Users;