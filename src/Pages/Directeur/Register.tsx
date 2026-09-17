import Classe from "../../Components/Appel/Classe";
import Matiere from "../../Components/Appel/Matiere";
import { TfiClose } from "react-icons/tfi";
import type { EleveType, classetype } from "../../Declarations/Types/typage";
import React, { useState } from "react";
import { handleSubmit } from "../../Declarations/Constant/Register";
import ConfirmDialog from "../../Components/Utiles/ConfirmDialog";

const Register = () => {
  const [fonction, setfonction] = useState<string>("");
  const [Nom, setNom] = useState<string>("");
  const [prenom, setPrenom] = useState<string>("");
  const [succes, setSucces] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [tel, setTel] = useState<string>("");
  const [nommanquand, setNomManquand] = useState<boolean>(false);
  const [prenommanquand, setPrenomManquand] = useState<boolean>(false);
  const [emailmanquand, setEmailManquand] = useState<boolean>(false);
  const [telmanquand, setTelManquand] = useState<boolean>(false);
  const [fonctionmanquand, setFonctionManquand] = useState<boolean>(false);
  const [classe, setClasse] = useState<classetype[]>([
    {
      classe: "",
      matiere: "",
    },
  ]);
  const [eleve, setEleve] = useState<EleveType[]>([
    {
      Nom: "",
      Prenom: "",
      Classe: "",
    },
  ]);

  const AjouterEleve = () => {
    setEleve([
      ...eleve,
      {
        Nom: "",
        Prenom: "",
        Classe: "",
      },
    ]);
  };
  const AjouterClasse = () => {
    setClasse([
      ...classe,
      {
        classe: "",
        matiere: "",
      },
    ]);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await handleSubmit({
        Nom, prenom, email, tel, fonction, succes, nommanquand, prenommanquand,
        emailmanquand, telmanquand, fonctionmanquand, setfonction, setNom,
        setPrenom, setEmail, setTel, setSucces, setNomManquand, setPrenomManquand,
        setEmailManquand, setTelManquand, setFonctionManquand, classe, setClasse,
        eleve, setEleve,
      });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="bg-slate-100 dark:border-slate-800 dark:bg-slate-800 overflow-x-hidden">
      <ConfirmDialog open={confirmOpen} title="Créer cet utilisateur ?" description="Les informations saisies seront envoyées et un compte sera créé." busy={loading} onCancel={() => setConfirmOpen(false)} onConfirm={handleRegister} confirmLabel="Créer le compte" />
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        {succes && (
          <div className="mt-10">
            <div className="flex justify-between rounded-xl py-4 px-8 bg-green-300 shadow-lg text-gray-900 dark:text-slate-200 max-w-xl mx-auto">
              <p>Formulaire envoye avec success</p>
              <span
                className="hover:cursor-pointer font-bold"
                onClick={() => setSucces(false)}
              >
                <TfiClose className="w-4 h-4" />
              </span>
            </div>
          </div>
        )}
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2
            className="mt-10 text-center 
          font-lora text-3xl font-bold tracking-tight text-slate-600 dark:text-slate-300"
          >
            Enregistrer les utilisateurs
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form>
            <div>
              <label
                htmlFor=""
                className="block text-sm/6 font-medium text-slate-700 dark:text-slate-200"
              >
                {nommanquand ? (
                  <span className="text-red-500 text-sm ml-2">
                    Le nom est requis
                  </span>
                ) : (
                  "Nom"
                )}
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  className="block w-full rounded-md  px-3 py-1.5
                 text-3xl border text-slate-600 font-bold  outline-1 -outline-offset-1 outline-white/10
                  placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2
                   focus:outline-indigo-500 sm:text-sm/6"
                  id="Nom"
                  name="Nom"
                  value={Nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor=""
                className="block text-sm/6 font-medium text-slate-700 dark:text-slate-200"
              >
                {prenommanquand ? (
                  <span className="text-red-500 text-sm ml-2">
                    Le prenom est requis
                  </span>
                ) : (
                  "Prenom"
                )}
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  className="block w-full rounded-md  px-3 py-1.5
                 text-3xl border text-slate-600 font-bold  outline-1 -outline-offset-1 outline-white/10
                  placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2
                   focus:outline-indigo-500 sm:text-sm/6"
                  id="Prenom"
                  name="Prenom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor=""
                className="block text-sm/6 font-medium text-slate-700 dark:text-slate-200"
              >
                {emailmanquand ? (
                  <span className="text-red-500 text-sm ml-2">
                    L'email est requis
                  </span>
                ) : (
                  "Email"
                )}
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  className="block w-full rounded-md  px-3 py-1.5
                 text-3xl border text-slate-600 font-bold  outline-1 -outline-offset-1 outline-white/10
                  placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2
                   focus:outline-indigo-500 sm:text-sm/6"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor=""
                className="block text-sm/6 font-medium text-slate-700 dark:text-slate-200"
              >
                {telmanquand ? (
                  <span className="text-red-500 text-sm ml-2">
                    Le numero de telephone est requis
                  </span>
                ) : (
                  "Numero de telephone"
                )}
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  className="block w-full rounded-md  px-3 py-1.5
                 text-3xl border text-slate-600 font-bold  outline-1 -outline-offset-1 outline-white/10
                  placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2
                   focus:outline-indigo-500 sm:text-sm/6"
                  id="tel"
                  name="tel"
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor=""
                className="block text-sm/6 font-medium text-slate-700 dark:text-slate-200"
              >
                {fonctionmanquand ? (
                  <span className="text-red-500 text-sm ml-2">
                    La fonction est requise
                  </span>
                ) : (
                  "Fonction"
                )}
              </label>
              <div className="mt-2">
                <select
                  className="block w-full rounded-md  px-3 py-1.5
                 text-3xl border text-slate-600 dark:text-slate-200 font-bold  outline-1 -outline-offset-1 outline-white/10
                  placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2
                   focus:outline-indigo-500 sm:text-sm/6"
                  id="fonction"
                  name="Fonction"
                  value={fonction}
                  onChange={(e) => setfonction(e.target.value)}
                >
                  <option value="Choisir">Choississez une fonction</option>
                  <option value="Enseignant">Enseignant</option>
                  <option value="Parent">Parent</option>
                </select>
              </div>
            </div>
            {fonction === "Parent" && (
              <div>
                {eleve.map((items, index) => (
                  <div key={index}>
                    <div>
                      <label
                        htmlFor=""
                        className="block text-sm/6 font-medium text-slate-700 dark:text-slate-200"
                      >
                        Nom de l'eleve
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          value={items.Nom}
                          className="block w-full rounded-md  px-3 py-1.5
                     text-3xl border text-slate-600 font-bold  outline-1 -outline-offset-1 outline-white/10
                   placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2
                   focus:outline-indigo-500 sm:text-sm/6"
                          onChange={(e) => {
                            const NewEleve = [...eleve];
                            NewEleve[index].Nom = e.target.value;
                            setEleve(NewEleve);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor=""
                        className="block text-sm/6 font-medium text-slate-700 dark:text-slate-200"
                      >
                        Prenom de l'eleve
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          value={items.Prenom}
                          onChange={(e) => {
                            const NewEleve = [...eleve];
                            NewEleve[index].Prenom = e.target.value;
                            setEleve(NewEleve);
                          }}
                          className="block w-full rounded-md  px-3 py-1.5
                          text-3xl border text-slate-600 font-bold  outline-1 -outline-offset-1 outline-white/10
                        placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2
                        focus:outline-indigo-500 sm:text-sm/6"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mt-4">
                        <Classe
                          index={index}
                          eleve={eleve}
                          setEleve={setEleve}
                          fonction={fonction}
                          classe={classe}
                          setClasse={setClasse}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={AjouterEleve}
                  type="button"
                  className="mt-2 border bg-slate-200 cursor-pointer font-bold"
                >
                  Ajouter un Eleve
                </button>
              </div>
            )}
            {fonction === "Enseignant" && (
              <div>
                {classe.map((items, index) => (
                  <div key={index}>
                    <div>
                      <div className="mt-4" id={items.classe}>
                        <Classe
                          index={index}
                          eleve={eleve}
                          setEleve={setEleve}
                          fonction={fonction}
                          classe={classe}
                          setClasse={setClasse}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mt-4">
                        <Matiere
                          index={index}
                          classe={classe}
                          setClasse={setClasse}
                        />
                      </div>
                    </div>
                    <div></div>
                  </div>
                ))}
                <button
                  onClick={AjouterClasse}
                  type="button"
                  className="mt-2 border bg-slate-200 cursor-pointer font-bold dark:bg-slate-800"
                >
                  Ajouter une classe
                </button>
              </div>
            )}
            <button
              onClick={(e: React.FormEvent) => {
                e.preventDefault();
                setConfirmOpen(true);
              }}
              disabled={loading}
              className="text-3xl border text-slate-800 cursor-pointer rounded-lg bg-blue-500 m-5 hover:bg-blue-700"
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
