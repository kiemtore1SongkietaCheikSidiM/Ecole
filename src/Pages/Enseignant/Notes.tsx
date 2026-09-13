import { useState } from "react";
import { sendMultipleFiles } from "../../Declarations/Constant/Fonction";
import Ajout from "../../Components/Utiles/Ajout";

const Notes = () => {
  const nom = "Notes";
  const [file, setFile] = useState<File[]>([]);
  const [selected, setSelected] = useState<boolean>(false);
  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file.length) return;
    try {
      await sendMultipleFiles(
        file,
        "/api/documents/emplois-du-temps/",
        "files",
      );
    } catch (error) {
      console.log(error);
    } finally {
      setFile([]);
      setSelected(false);
    }
  };
  return (
    <div>
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
                className="rounded-sm px-3 py-1 dark:bg-green-700 dark:hover:bg-green-500 bg-blue-700 hover:bg-blue-500 dark:text-black text-white focus:shadow-outline focus:outline-none"
              >
                Envoyer les {nom}
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

export default Notes;
