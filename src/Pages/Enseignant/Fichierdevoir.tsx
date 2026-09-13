import { useState } from "react"
import Ajout from "../../Components/Utiles/Ajout"
import { URL } from "../../Declarations/Constant/constant"
import api from "../../Declarations/Api"



const access_token = localStorage.getItem("access_token")
const Fichierdevoir = () => {
  const [file,setFile] = useState<File[]>([])
  const [selected,setSelected] = useState<boolean>(false)
  const date = new Date().toLocaleDateString("fr-FR",{
        day:"numeric",
        month:"long",
        year:"numeric"
    })
  const handleClick = (e:React.FormEvent)=>{
      e.preventDefault()
      const formData = new FormData()
      try {
        if (file) {
            file.forEach((file)=>{
                formData.append("devoirs",file)
            })
        formData.append("date",date)
        }
        api.post(`${URL}/api/devoirs/scanner/`,formData,{
            headers: {
                  Authorization: `Bearer ${access_token}`,
                    },
        })
      } catch (error:any) {
        console.log(error.response?.data)
      }
      finally{
        setFile([])
      }
  }
  return (
    <div>
        <div className="bg-gray-500 dark:bg-gray-200  sm:px-8 md:px-16 sm:py-8">
            <main className="container mx-auto max-w-5xl h-full">
                <article
                    aria-label="File Upload Modal"
                    className="relative h-full flex flex-col bg-white dark:bg-black shadow-xl rounded-md"
                >
                    <Ajout file={file} setFile={setFile} nom="Fichier devoir" selected={selected} setSelected={setSelected} />
                    <footer className="flex justify-end px-8 pb-8 pt-4">
                        <button onClick={handleClick}
                            id="submit"
                            className="rounded-sm px-3 py-1 dark:bg-green-700 dark:hover:bg-green-500 bg-blue-700 hover:bg-blue-500 dark:text-black text-white focus:shadow-outline focus:outline-none"
                        >
                            Envoyer les bulletins
                        </button>
                        <button
                            onClick={()=>setFile([])}
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
  )
}

export default Fichierdevoir