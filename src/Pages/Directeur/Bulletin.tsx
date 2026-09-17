import { useState } from "react";

import Ajout from "../../Components/Utiles/Ajout";
import { sendMultipleFiles } from "../../Declarations/Constant/Fonction";
import ConfirmDialog from "../../Components/Utiles/ConfirmDialog";
import LoadingOverlay from "../../Components/Utiles/LoadingOverlay";

const Bulletin = () => {
  const [file, setFile] = useState<File[]>([]);
  const [selected, setSelected] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (file.length) setConfirmOpen(true);
  };
  const handleConfirm = async () => {
    if (!file.length) return;
    setLoading(true);
    try {
      await sendMultipleFiles(file, "/api/bulletins/scanner/", "bulletins");
    } catch (error: any) {
      console.log(error.response?.data);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setFile([]);
      setSelected(false);
    }
  };

  const nom = "Bulletins";
  return (
    <div>
      {loading && <LoadingOverlay label="Envoi des bulletins..." />}
      <ConfirmDialog
        open={confirmOpen}
        title="Envoyer les bulletins ?"
        description={`${file.length} fichier(s) seront transmis au serveur.`}
        busy={loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        confirmLabel="Envoyer"
      />
      <div className="bg-gray-500 dark:bg-gray-200  sm:px-8 md:px-16 sm:py-8">
        <main className="container mx-auto max-w-5xl h-full">
          <article
            aria-label="File Upload Modal"
            className="relative h-full flex flex-col bg-white dark:bg-black shadow-xl rounded-md"
          >
            <Ajout
              file={file}
              setFile={setFile}
              selected={selected}
              setSelected={setSelected}
              nom={nom}
            />

            <footer className="flex justify-end px-8 pb-8 pt-4">
                <button
                onClick={handleClick}
                id="submit"
                  disabled={loading || !file.length}
                className="rounded-sm px-3 py-1 dark:bg-green-700 dark:hover:bg-green-500 bg-blue-700 hover:bg-blue-500 dark:text-black text-white focus:shadow-outline focus:outline-none"
              >
                Envoyer les bulletins
              </button>
              <button
                onClick={() => setFile([])}
                id="cancel"
                className="ml-3 rounded-sm px-3 py-1 hover:bg-gray-300 dark:hover:bg-gray-700 dark:text-white focus:shadow-outline focus:outline-none"
              >
                Annuler
              </button>
            </footer>
          </article>
        </main>
      </div>
    </div>
  );
};

export default Bulletin;
