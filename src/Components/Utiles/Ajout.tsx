import { FaCloudUploadAlt } from "react-icons/fa";
import pdf from "./../../image/pdf.jpeg";
import word from "./../../image/word.jpeg";

const Ajout = ({ file, setFile, selected, setSelected, nom }: { file: File[]; setFile: React.Dispatch<React.SetStateAction<File[]>>; selected: boolean; setSelected: React.Dispatch<React.SetStateAction<boolean>>; nom: string }) => {
  const handleFilesChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedfiles = Array.from(e.target.files);
      setFile(selectedfiles);
      setSelected(true);
    }
  };
  return (
    <div>
        <div
            id="overlay"
            className="w-full h-full absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-center justify-center rounded-md"
        >
            <FaCloudUploadAlt className="w-15 h-15 text-blue-500" />
            <p className="text-lg text-blue-700">Mets les {nom} pour envoyer</p>
        </div>
        <section className="overflow-auto p-8 w-full h-full flex flex-col">
            <header className="border-dashed border-2 border-gray-400 py-12 flex flex-col justify-center items-center">
                <p className="mb-3 font-semibold text-gray-900 dark:text-gray-100 flex flex-wrap justify-center">
                    <span>Glisser et metter les</span>&nbsp;<span>{nom}</span>
                </p>
                <input
                    id="hidden-input"
                    type="file"
                    multiple
                    className=""
                    onChange={handleFilesChanges}
                />
            </header>

            <h1 className="pt-8 pb-3 font-semibold sm:text-lg text-gray-900 dark:text-gray-100">
                Pour envoyer
            </h1>

            <ul id="gallery" className="flex flex-1 flex-wrap -m-1">
                {selected ? (
                    <li
                        id="empty"
                        className="h-full w-full text-center flex flex-col  justify-center items-center"
                    >
                        {file.map((item, index) => (
                            <div key={index}>
                                {item.type === "application/pdf" ? (
                                    <img src={pdf} alt={item.name} className="mx-auto w-32" />
                                ) 
                                : 
                                item.type === "application/msword" ||
                                item.type ===
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                                    <img src={word} alt={item.name} className="mx-auto w-32" />
                                ) 
                                : 
                                (
                                    <img
                                        src="https://user-images.githubusercontent.com/507615/54591670-ac0a0180-4a65-11e9-846c-e55ffce0fe7b.png"
                                        alt={item.name}
                                        className="mx-auto w-32"
                                    />
                                )
                            }

                            <span className="text-small text-gray-500 dark:text-slate-200">
                                {item.name}
                            </span>
                            </div>
                        ))}
                    </li>
                ) 
                : 
                (
                    <li
                        id="empty"
                        className="h-full w-full text-center flex flex-col  justify-center items-center"
                    >
                    <img
                        className="mx-auto w-32"
                        src="https://user-images.githubusercontent.com/507615/54591670-ac0a0180-4a65-11e9-846c-e55ffce0fe7b.png"
                        alt="no data"
                    />
                    <span className="text-small text-gray-500 dark:text-slate-200">
                        Aucun fichier detecter
                    </span>
                </li>
            )}
            </ul>
        </section>
    </div>
  );
};

export default Ajout;
