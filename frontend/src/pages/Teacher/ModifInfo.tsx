import { useState, useEffect } from "react";
import { useUser } from "../Shared/userContext";

interface Props {
    setDash: React.Dispatch<React.SetStateAction<string>>;
}

function ModifInfo({ setDash }: Props) {
    const { user, refreshUser } = useUser();
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Charger les données utilisateur au montage
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nom: user.nom || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validation
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            setLoading(false);
            return;
        }

        try {
            // TODO: Appeler l'API pour mettre à jour les informations
            const response = await fetch(`http://localhost:5000/api/users/${user?.id_user}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: formData.nom,
                    email: formData.email,
                    ...(formData.newPassword && { password: formData.newPassword })
                })
            });

            if (response.ok) {
                await refreshUser(); // Refresh user data from server
                setMessage({ type: 'success', text: 'Informations mises à jour avec succès !' });
                setTimeout(() => setDash('dashboard'), 2000);
            } else {
                setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
            }
        } catch (error) {
            console.error('Erreur:', error);
            setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* En-tête */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Modifier mes informations</h1>
                        <p className="text-gray-600 mt-2">Mettez à jour vos informations personnelles</p>
                    </div>
                    <button
                        onClick={() => setDash('dashboard')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour
                    </button>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Message de succès/erreur */}
                    {message && (
                        <div className={`p-4 ${
                            message.type === 'success' 
                                ? 'bg-green-50 border-l-4 border-green-500' 
                                : 'bg-red-50 border-l-4 border-red-500'
                        }`}>
                            <div className="flex items-center gap-3">
                                {message.type === 'success' ? (
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                                    {message.text}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="p-8 space-y-8">
                        {/* Informations personnelles */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Informations personnelles
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Votre nom"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresse e-mail *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="votre.email@exemple.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Changement de mot de passe */}
                        <div className="border-t pt-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Changer le mot de passe
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">Laissez vide si vous ne souhaitez pas modifier votre mot de passe</p>
                            
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mot de passe actuel
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Votre mot de passe actuel"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nouveau mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Nouveau mot de passe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirmer le mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Confirmer le mot de passe"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="bg-gray-50 px-8 py-6 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => setDash('dashboard')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Enregistrer les modifications
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default ModifInfo;