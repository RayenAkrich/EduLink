import { useUser } from "../Shared/userContext";
import { useState, useEffect } from "react";

interface Props {
    setDash: React.Dispatch<React.SetStateAction<string>>;
}

interface Stats {
    totalClasses: number;
    totalStudents: number;
    totalSubjects: number;
}

export default function Dashboard({ setDash }: Props) {
    const { user } = useUser();
    const [stats, setStats] = useState<Stats>({ totalClasses: 0, totalStudents: 0, totalSubjects: 0 });

    useEffect(() => {
        // Charger les statistiques de l'enseignant
        const fetchStats = async () => {
            if (!user?.id_user) return;
            
            try {
                const res = await fetch(`http://localhost:5000/api/notes/ClassMatiere/${user.id_user}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    // Compter les classes uniques
                    const uniqueClasses = new Set(data.map((d: any) => d.classeId));
                    
                    // Compter les élèves uniques
                    const uniqueStudents = new Set();
                    data.forEach((d: any) => {
                        d.nomEleves?.forEach((e: any) => uniqueStudents.add(e.id));
                    });
                    
                    // Compter les matières uniques
                    const uniqueSubjects = new Set(data.map((d: any) => d.subject));
                    
                    setStats({
                        totalClasses: uniqueClasses.size,
                        totalStudents: uniqueStudents.size,
                        totalSubjects: uniqueSubjects.size
                    });
                }
            } catch (e) {
                console.error('Erreur chargement stats:', e);
            }
        };

        fetchStats();
    }, [user?.id_user]);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Non disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    const getRoleLabel = (role: string | undefined) => {
        switch (role) {
            case 'enseignant': return 'Enseignant';
            case 'admin': return 'Administrateur';
            case 'parent': return 'Parent';
            default: return role || 'Non défini';
        }
    };

    return (
        <div className="min-h-screen  bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            {/* En-tête avec profil */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="bg-gray-50 h-32"></div>
                <div className="bg-gray-50 px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start -mt-16 gap-6">
                        {/* Photo de profil */}
                        <div className="relative">
                            <img 
                                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover" 
                                src="https://img.freepik.com/free-photo/young-handsome-man-holding-notebooks-concept-e-learning-courses_1258-26588.jpg" 
                                alt="Photo de profil" 
                            />
                            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        
                        {/* Informations principales */}
                        <div className="flex-1 text-center md:text-left mt-4 md:mt-8">
                            <h1 className="text-3xl font-bold text-gray-800">
                                 {user?.nom || 'Enseignant'}
                            </h1>
                            <p className="text-lg text-gray-600 mt-1">{getRoleLabel(user?.role)}</p>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>{user?.email}</span>
                            </div>
                        </div>

                        {/* Bouton d'action */}
                        <div className="mt-4 md:mt-8">
                            <button 
                                onClick={() => setDash("modifinfo")}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier le profil
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Classes</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalClasses}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Élèves</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalStudents}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Matières</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalSubjects}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informations personnelles */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h2 className="text-lg font-semibold text-gray-800">Informations personnelles</h2>
                    </div>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Nom complet</label>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-gray-800 font-medium">
                                            { user?.nom }
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Adresse email</label>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-800">{user?.email || 'Non renseigné'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Rôle</label>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-800">{getRoleLabel(user?.role)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Date de création du compte</label>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-800">{formatDate(user?.date_creation)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}