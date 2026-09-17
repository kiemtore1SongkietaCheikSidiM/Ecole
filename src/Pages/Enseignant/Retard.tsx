import type React from "react";
import { useEffect, useState } from "react";
import type { bonne, Student, Todet } from "../../Declarations/Types";
import { TimeLine } from "../../Declarations/Constant";
import {
  ObtenirList,
  sendRetardList,
} from "../../Declarations/Constant/Fonction";
import type { eleves } from "../../Declarations/Types/constant";
import ConfirmDialog from "../../Components/Utiles/ConfirmDialog";
import LoadingOverlay from "../../Components/Utiles/LoadingOverlay";

const Retard = () => {
  const [classes, setClasse] = useState<string>("");
  const [minutes, setMinute] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [Liste, setListe] = useState<eleves[]>([]);
  const [todo, setTodo] = useState<Todet[]>([]);
  const [donnees, setDonnees] = useState<bonne[]>([]);
  const [confirmSend, setConfirmSend] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const date = new Date().toISOString().split("T")[0];

  useEffect(() => {
    ObtenirList(setListe, setDonnees, classes);
  }, [classes]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (todo.length) setConfirmSend(true);
  };

  const handleConfirmSend = async () => {
    if (!todo.length) return;
    setLoading(true);

    try {
      const absence = todo.map((item) => ({
        eleve_id: item.eleve,
        minutes: item.minutes,
        date: item.date,
        motif: item.motif,
      }));
      await sendRetardList(absence);
      setTodo([]);
    } catch (error: any) {
      console.error(error);
      console.error(error.response?.data);
    } finally {
      setLoading(false);
      setConfirmSend(false);
    }
  };
  const AddTodo = () => {
    if (!classes.trim() || !selectedStudent || !minutes.trim()) {
      return;
    }

    const data: Todet = {
      id: Date.now(),
      eleve: selectedStudent.id,
      classe: classes,
      Nom: selectedStudent.Nom,
      Prenom: selectedStudent.Prenom,
      minutes: Number(minutes),
      date,
      motif: "retard",
    };

    setTodo((prev) => [...prev, data]);

    setSelectedStudent(null);
    setMinute("");
  };
  const supp = (id: number) => {
    setTodo((prev) => prev.filter((item) => item.id !== id));
    setPendingDelete(null);
  };
  return (
    <div className=" block dark:bg-black">
      {loading && <LoadingOverlay label="Envoi des retards..." />}
      <ConfirmDialog open={confirmSend} title="Envoyer les retards ?" description={`${todo.length} retard(s) seront enregistrés.`} busy={loading} onCancel={() => setConfirmSend(false)} onConfirm={handleConfirmSend} confirmLabel="Envoyer" />
      <ConfirmDialog open={pendingDelete !== null} title="Supprimer cette ligne ?" description="Ce retard sera retiré de la liste avant l'envoi." onCancel={() => setPendingDelete(null)} onConfirm={() => pendingDelete !== null && supp(pendingDelete)} confirmLabel="Supprimer" />
      <div className="text-center m-5 text-4xl sm:text-5xl">
        <h1>Ajouter un retard</h1>
      </div>
      <div className="grid grid-cols-1 gap-2 mt-4 text-xl sm:grid-cols-2 sm:text-2xl lg:grid-cols-4 lg:text-3xl">
        <div className="m-2 mr-5 ">
          <select
            name=""
            id=""
            value={classes}
            onChange={(e) => setClasse(e.target.value)}
          >
            <option value="" className="text-2xl">
              Selectionne
            </option>
            {donnees.map((items) => (
              <option value={items.nom} key={items.id}>
                {items.nom}
              </option>
            ))}
          </select>
        </div>
        <div className="m-2 ml-1 ">
          <div>
            <select
              name="eleve"
              id="eleve"
              value={`${selectedStudent?.Nom ?? ""} ${selectedStudent?.Prenom ?? ""}`.trim()}
              onChange={(e) => {
                const selected = Liste.find(
                  (item) => `${item.nom} ${item.prenom}` === e.target.value,
                );

                if (selected) {
                  setSelectedStudent({
                    id: selected.id,
                    Nom: selected.nom,
                    Prenom: selected.prenom,
                  });
                } else {
                  setSelectedStudent(null);
                }
              }}
            >
              <option value="">Selectionner</option>
              {Liste?.map((item) => {
                return (
                  <option value={`${item.nom} ${item.prenom}`} key={item.id}>
                    {item.nom} {item.prenom}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className="m-2 ml-1">
          <select
            name=""
            id=""
            value={minutes}
            onChange={(e) => setMinute(e.target.value)}
          >
            {TimeLine.map((items, index) => (
              <option value={items.Temps} key={index}>
                {items.Temps}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={AddTodo}
          className="border rounded-lg  dark:text-slate-200 bg-slate-100 hover:bg-blue-300 dark:bg-slate-600 dark:hover:bg-green-500"
        >
          Ajouter
        </button>
      </div>
      <div className="text-gray-900 bg-gray-200 dark:text-gray-100 dark:bg-gray-800">
        <div className="p-4 flex">
          <h1 className="text-3xl">Liste des retards</h1>
        </div>
        <div className="px-3 py-4 flex justify-center">
          <table className="w-full text-md bg-white dark:bg-black shadow-md rounded mb-4">
            <tbody>
              <tr className="border-b">
                <th className="text-left p-3 px-5">Classe</th>
                <th className="text-left p-3 px-5">Nom et Prenom</th>
                <th className="text-left p-3 px-5">Heure</th>
                <th className="text-left p-3 px-5">status</th>
              </tr>
              {todo.map((todo) => (
                <tr
                  className="border-b hover:bg-orange-100 bg-gray-100 dark:bg-gray-900"
                  key={todo.id}
                >
                  <td className="p-3 px-5">{todo.classe}</td>
                  <td className="p-3 px-5">
                    {todo.Nom} {todo?.Prenom}
                  </td>
                  <td className="p-3 px-5">{todo.minutes}</td>
                  <td>
                    <button
                      onClick={() => setPendingDelete(todo.id)}
                      type="button"
                      className="text-sm cursor-pointer bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading || !todo.length}
        className="border rounded-lg text-gray-600 bg-green-300 hover:bg-green-600 dark:text-gray-50 hover:text-slate-950
      text-3xl m-5 p-5"
      >
        Envoyer tous
      </button>
    </div>
  );
};

export default Retard;
