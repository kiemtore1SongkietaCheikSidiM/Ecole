import { useEffect, useState } from "react"
import type { dataClaMa } from "../../Declarations/Types"
import api from "../../Declarations/Api";



const Classe = ({ index, eleve, setEleve,fonction, classe, setClasse }: { index: number; eleve: any[]; setEleve: React.Dispatch<React.SetStateAction<any[]>>; fonction: string; classe: any[]; setClasse: React.Dispatch<React.SetStateAction<any[]>> }) => {
    const [donnees,setDonnees] = useState<dataClaMa[]>([])
    const Appel = async ()=>{
        try{
            const response = await api.get(`/api/classes/options/`)
            setDonnees(response.data.classes)
        }catch(error){
            console.log("Erreur lors de la récupération des données:", error);
        }
    }
    const handleChange = (e:React.ChangeEvent<HTMLSelectElement>)=>{
        if (fonction ==="Parent"){
            const NewEleve = [...eleve]
                NewEleve[index].Classe = e.target.value
                setEleve(NewEleve)
        } else if (fonction === "Enseignant"){
            const NewEleve = [...classe]
                NewEleve[index].classe = e.target.value;
                setClasse(NewEleve)
        }
    }

    useEffect(()=>{
    Appel()
    },[])
  return (
    <div>
        <select onChange={handleChange} value={fonction === "Parent" ? eleve[index].Classe : classe[index].classe}
                className="block w-full rounded-md  px-3 py-1.5
                text-3xl border text-slate-600 dark:text-slate-200 font-bold  outline-1 -outline-offset-1 outline-white/10
                placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2
                focus:outline-indigo-500 sm:text-sm/6">
                    <option value="">Sélectionner une classe</option>
            {donnees.map((item,index)=>(
                <option key={index} value={item.value}>{item.label}</option>
            ))}
        </select>
    </div>
  )
}

export default Classe