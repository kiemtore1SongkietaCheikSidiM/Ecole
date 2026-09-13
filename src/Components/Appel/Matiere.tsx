import { useEffect, useState } from "react"
import type { dataClaMa } from "../../Declarations/Types"
import api from "../../Declarations/Api";




const Matiere = ({ index ,classe, setClasse}: { index: number; classe: any[]; setClasse: React.Dispatch<React.SetStateAction<any[]>> }) => {
    const [donnees,setDonnees] = useState<dataClaMa[]>([])
    const accessToken = localStorage.getItem("access_token")
    const Appel = async ()=>{
        try{
            const response = await api.get(`/api/classes/options/`,{
            headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
            setDonnees(response.data.matieres)
        }catch(error){
            console.log("Erreur lors de la récupération des données:", error);
        }
    }
    useEffect(()=>{
        Appel()
    },[])
  return (
    <div>
        <select
            value={classe[index].matiere}
            onChange={(e)=>{
                const NewEleve = [...classe]
                NewEleve[index].matiere = e.target.value
                setClasse(NewEleve)
            }}
            className="block w-full rounded-md  px-3 py-1.5
            text-3xl border text-slate-600 dark:text-slate-200 font-bold  outline-1 -outline-offset-1 outline-white/10
            placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2
            focus:outline-indigo-500 sm:text-sm/6">
                <option value="">Sélectionner une matière</option>
            {donnees.map((item,index)=>(
                <option key={index} value={item.value}>{item.label}</option>
            ))}
        </select>
    </div>
  )
}

export default Matiere