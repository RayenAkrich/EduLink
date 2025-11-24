import React from "react";
import type { Eleve } from "../Shared/types/Eleve"

type SelectChildProps = {
  childrenList: Eleve[];
  onSelect: (child: Eleve) => void;
};

export default function SelectChild({ childrenList, onSelect }: SelectChildProps) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-6">

      <h2 className="text-2xl font-semibold text-slate-800 mb-4">
        Choisissez un enfant
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        {childrenList.map((child) => (
          <button
            key={child.id_eleve}
            onClick={() => onSelect(child)}
            className="
              p-4 rounded-xl bg-slate-100 hover:bg-slate-200
              shadow-md border border-slate-300
              transition cursor-pointer text-left
            "
          >
            <p className="text-lg font-bold text-slate-900">{child.nom}</p>
            <p className="text-sm text-slate-600">
              Né le : {new Date(child.date_naissance).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>

    </div>
  );
}
