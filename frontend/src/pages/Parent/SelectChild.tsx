import type { Eleve } from "../Shared/types/Eleve"

type SelectChildProps = {
  childrenList: Eleve[];
  onSelect: (child: Eleve) => void;
};

export default function SelectChild({ childrenList, onSelect }: SelectChildProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Sélectionnez un enfant
        </h1>
        <p className="text-gray-600">
          Choisissez l'enfant dont vous souhaitez consulter les informations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {childrenList.map((eleve) => (
          <button
            key={eleve.id_eleve}
            onClick={() => onSelect(eleve)}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-400 group"
          >
            {/* Header avec gradient */}
            <div className="bg-slate-600 p-6 text-white">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                  {eleve.nom.charAt(0).toUpperCase()}
                </div>
                
                {/* Nom */}
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold">{eleve.nom}</h3>
                  <p className="text-sm text-white/80">
                    📅 {formatDate(eleve.date_naissance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Body avec informations */}
            <div className="p-6 space-y-4">
              {/* Classe */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <span className="text-xl">🎓</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs text-gray-500">Classe</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {eleve.classe || "Non assigné"}
                  </p>
                </div>
              </div>

              {/* Stats - Moyenne et Absences */}
              <div className="flex gap-3">
                {/* Moyenne */}
                <div className="flex-1 bg-green-50 rounded-lg p-3 group-hover:bg-green-100 transition-colors">
                  <div className="text-center">
                    <p className="text-xs text-green-600 mb-1">Moyenne</p>
                    <p className="text-lg font-bold text-green-800">
                      {eleve.moyenne ? `${eleve.moyenne}` : "—"}
                    </p>
                  </div>
                </div>

                {/* Absences */}
                <div className="flex-1 bg-orange-50 rounded-lg p-3 group-hover:bg-orange-100 transition-colors">
                  <div className="text-center">
                    <p className="text-xs text-orange-600 mb-1">Absences</p>
                    <p className="text-lg font-bold text-orange-800">
                      {eleve.totalAbsences || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton d'action */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-slate-800 group-hover:text-blue-700 font-medium">
                  <span>Voir le tableau de bord</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
