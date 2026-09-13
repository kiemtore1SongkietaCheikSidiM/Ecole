import { useEffect, useState } from "react";
import { fetchHistoryData } from "../../Declarations/Constant/Fonction";

const Historique = () => {
  const [retards, setRetards] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [devoirs, setDevoirs] = useState<any[]>([]);

  useEffect(() => {
    const History = async () => {
      const data = await fetchHistoryData();
      setRetards(data.retards || []);
      setAbsences(data.absences || []);
      setDevoirs(data.devoirs || []);
    };

    History();
  }, []);

  const getDateAndTime = (item: any) => {
    const date =
      item?.date || item?.created_at || item?.createdAt || "Date inconnue";
    const time =
      item?.heure || item?.time || item?.created_time || "Heure inconnue";
    return `${date} ${time}`;
  };

  const entries = [
    ...retards.map((item) => ({
      type: "Retard",
      color: "bg-blue-600",
      accent: "bg-blue-300",
      label: item?.Nom || item?.nom || "Retard",
      detail: `${item?.classe || "Classe"} - ${item?.heure || "Heure inconnue"}`,
      meta: getDateAndTime(item),
    })),
    ...absences.map((item) => ({
      type: "Absence",
      color: "bg-pink-600",
      accent: "bg-pink-300",
      label: item?.Nom || item?.nom || "Absence",
      detail: `${item?.classe || "Classe"} - ${item?.heure || "Heure inconnue"}`,
      meta: getDateAndTime(item),
    })),
    ...devoirs.map((item) => ({
      type: "Devoir",
      color: "bg-green-600",
      accent: "bg-green-300",
      label: item?.nom || item?.title || item?.filename || "Devoir",
      detail: item?.description || item?.matiere || "Document joint",
      meta: getDateAndTime(item),
    })),
  ];
  return (
    <div className="w-10/12 md:w-7/12 lg:6/12 mx-auto relative py-20">
      <h1 className="text-3xl text-center font-bold text-blue-500">
        Historique
      </h1>
      <div className="border-l-2 mt-10">
        {entries.length === 0 ? (
          <div className="ml-10 rounded bg-slate-100 p-6 text-gray-600 dark:bg-slate-800 dark:text-slate-200">
            Aucun historique disponible pour le moment.
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={`${entry.type}-${index}`}
              className={`transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 ${entry.color} text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0`}
            >
              <div
                className={`w-5 h-5 ${entry.color} absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0`}
              ></div>
              <div
                className={`w-10 h-1 ${entry.accent} absolute -left-10 z-0`}
              ></div>

              <div className="flex-auto">
                <h1 className="text-lg">{entry.meta}</h1>
                <h1 className="text-xl font-bold">{entry.type}</h1>
                <h3>{entry.label}</h3>
                <p className="text-sm text-white/80">{entry.detail}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Historique;
