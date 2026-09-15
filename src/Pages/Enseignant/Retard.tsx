import type React from "react";
import { useEffect, useState } from "react";
import type { bonne, Student, Todet } from "../../Declarations/Types";
import { TimeLine } from "../../Declarations/Constant";
import { ObtenirList, sendRetardList } from "../../Declarations/Constant/Fonction";
import type { eleves } from "../../Declarations/Types/constant";

const Retard = () => {
  const [classes, setClasse] = useState<string>("");
  const [heure, setheure] = useState<string>("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
    const [Liste, setListe] = useState<eleves[]>([]);
  
  const [todo, setTodo] = useState<Todet[]>([]);
    const [donnees, setDonnees] = useState<bonne[]>([]);
  useEffect(() => {
      ObtenirList(setListe, setDonnees, classes);
    }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo.length) return;

    try {
      await sendRetardList(todo);
    } catch (error) {
      console.error(error);
    } finally {
      setTodo([]);
    }
  };
   const AddTodo = () => {
       if (
         !classes.trim() ||
         !selectedStudent?.Nom?.trim() ||
         !selectedStudent?.Prenom?.trim() ||
         !heure.trim()
       ) {
         return;
       }
   
       const Data: Todet = {
         id: Date.now(),
         classe: classes,
         Nom: selectedStudent.Nom,
         Prenom: selectedStudent.Prenom,
         heure: heure,
       };
       setTodo((prev) => [...prev, Data]);
     };
  const supp = (id: number) => {
    setTodo((prev) => prev.filter((item) => item.id !== id));
  };
  return (
    <div className=" block dark:bg-black">
      <div className="text-center m-5 text-4xl sm:text-5xl">
        <h1>Ajouter un retard</h1>
      </div>
      <div className="grid grid-cols-4 mt-4 text-3xl sm:text-4xl">
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
                    Nom: selected.nom,
                    Prenom: selected.prenom,
                  });
                } else {
                  setSelectedStudent(null);
                }
              }}
            >
              <option value="">Selectionner</option>
              {Liste?.map((item) => (
                <option value={`${item.nom} ${item.prenom}`} key={item.id}>
                  {item.nom} {item.prenom}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="m-2 ml-1">
          <select
            name=""
            id=""
            value={heure}
            onChange={(e) => setheure(e.target.value)}
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
                    {todo.Nom} {todo.Prenom}
                  </td>
                  <td className="p-3 px-5">{todo.heure}</td>
                  <td className="p-3 px-5">{todo.heure}</td>
                  <td>
                    <button
                      onClick={() => supp(todo.id)}
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
        className="border rounded-lg text-gray-600 bg-green-300 hover:bg-green-600 dark:text-gray-50 hover:text-slate-950
      text-3xl m-5 p-5"
      >
        Envoyer tous
      </button>
    </div>
  );
};

export default Retard;
