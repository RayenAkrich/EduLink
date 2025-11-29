import type { Eleve } from "../Shared/types/Eleve"

interface Props{
    infochild:Eleve
    onBack?:()=>void
}
export default function Dashboard({onBack,infochild}:Props){
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    return(
        <div className="p-6 space-y-6">
            {/* Header avec bouton retour */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Tableau de bord de l'élève</h1>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                    ← Retour
                </button>
            </div>

            {/* Profile Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-4xl font-bold">
                        {infochild.nom.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-2">{infochild.nom}</h2>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur">
                                📅 Né(e) le {formatDate(infochild.date_naissance)}
                            </span>
                            {infochild.classe && (
                                <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur">
                                    🎓 Classe: {infochild.classe}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Classe Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500 rounded-lg">
                            <span className="text-2xl">🎓</span>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
                            CLASSE
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-blue-800 mb-1">
                        {infochild.classe || "Non assigné"}
                    </h3>
                    <p className="text-sm text-blue-600">
                        {infochild.annee_scolaire || "Année non définie"}
                    </p>
                </div>

                {/* Moyenne Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500 rounded-lg">
                            <span className="text-2xl">📊</span>
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-200 px-2 py-1 rounded-full">
                            MOYENNE
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-1">
                        {infochild.moyenne ? `${infochild.moyenne} / 20` : "—"}
                    </h3>
                    <p className="text-sm text-green-600">
                        {infochild.totalNotes ? `${infochild.totalNotes} notes enregistrées` : "Aucune note"}
                    </p>
                </div>

                {/* Absences Card */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-500 rounded-lg">
                            <span className="text-2xl">📅</span>
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-200 px-2 py-1 rounded-full">
                            ABSENCES
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-orange-800 mb-1">
                        {infochild.totalAbsences || 0}
                    </h3>
                    <p className="text-sm text-orange-600">
                        {infochild.totalAbsences === 0 
                            ? "Aucune absence enregistrée" 
                            : infochild.totalAbsences === 1 
                            ? "1 absence enregistrée"
                            : `${infochild.totalAbsences} absences enregistrées`}
                    </p>
                </div>
            </div>

            {/* Informations Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h3 className="text-xl font-bold text-gray-800">📋 Informations de l'élève</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nom complet */}
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-xl">👤</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Nom complet</p>
                                <p className="text-base font-semibold text-gray-800">{infochild.nom}</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <span className="text-xl">📧</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Email</p>
                                <p className="text-base font-semibold text-gray-800">
                                    {infochild.email || "Non renseigné"}
                                </p>
                            </div>
                        </div>

                        {/* Date de naissance */}
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-xl">🎂</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Date de naissance</p>
                                <p className="text-base font-semibold text-gray-800">
                                    {formatDate(infochild.date_naissance)}
                                </p>
                            </div>
                        </div>

                        {/* Classe */}
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-xl">🏫</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Classe</p>
                                <p className="text-base font-semibold text-gray-800">
                                    {infochild.classe || "Non assigné"}
                                </p>
                            </div>
                        </div>

                        {/* Année scolaire */}
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <span className="text-xl">📚</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Année scolaire</p>
                                <p className="text-base font-semibold text-gray-800">
                                    {infochild.annee_scolaire || "Non définie"}
                                </p>
                            </div>
                        </div>

                        {/* ID Élève */}
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <span className="text-xl">🔢</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">ID Élève</p>
                                <p className="text-base font-semibold text-gray-800">
                                    #{infochild.id_eleve}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}