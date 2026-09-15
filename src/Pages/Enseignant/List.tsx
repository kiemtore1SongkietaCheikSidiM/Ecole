import { useEffect, useState } from "react"
import { CiCircleChevDown } from "react-icons/ci"
import { IoMdSearch } from "react-icons/io"
import type { eleves } from "../../Declarations/Types/constant"
import type { bonne} from "../../Declarations/Types"
import { ObtenirList } from "../../Declarations/Constant/Fonction"

const List = () => {
    const [classe,setClasse] = useState<string>("")
    const [donnees,setDonnees] = useState<bonne[]>([])
    const [Liste,setListe] = useState<eleves[]>([])
    
    useEffect(()=>{
        
        ObtenirList(setListe,setDonnees,classe)
    },[classe])
  return (
    <div className="antialiased font-sans bg-gray-200 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                <div className="my-2 flex sm:flex-row flex-col">
                    <div className="flex flex-row mb-1 sm:mb-0">
                        <div className="relative">
                            <select value={classe} onChange={(e)=>setClasse(e.target.value)}
                            className="h-full rounded-r border-t sm:rounded-r-none sm:border-r-0 border-r border-b block appearance-none w-full bg-white dark:bg-black border-gray-400 dark:border-gray-700 dark:text-gray-50 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-l focus:border-r focus:bg-white focus:border-gray-500">
                                <option className="dark:bg-black dark:text-white" value="Tout">Select</option>
                                {donnees.map((item)=>(
                                    <option value={item.nom} key={item.id}>{item.nom}</option>
                                ))}
                            </select>
                            <div
                            className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <CiCircleChevDown className="w-4 h-4"/>
                                        
                            </div>
                        </div>
                    </div>
                    
                    <div className="block relative">
                        <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                            <IoMdSearch className="w-4 h-4"/>
                        </span>
                        <input placeholder="Search" type="text"
                        className="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 dark:border-gray-700 dark:bg-black border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-400 dark:text-gray-200 text-gray-700 focus:bg-white dark:focus:bg-black dark:focus:placeholder:text-gray-200 dark:focus:text-gray-100 focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none" />
                    </div>
                </div>
                <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                    <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th
                                    className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 dark:bg-gray-900 bg-gray-100 dark:text-slate-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Nom
                                    </th>
                                    <th
                                    className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 dark:bg-gray-900 bg-gray-100 dark:text-slate-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Prenom
                                    </th>
                                    
                                    <th
                                    className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 dark:bg-gray-900 bg-gray-100 dark:text-slate-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>

                                
                                {
                                    classe !== "Tout" && Liste?.map((items)=>(
                                        
                                        <tr key={items.id}>
                                            <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-800 dark:bg-black bg-white text-sm">
                                                <p className="text-gray-900 dark:text-slate-200 whitespace-no-wrap">
                                                    {items.nom}
                                                </p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-800 dark:bg-black bg-white text-sm">
                                                <p className="text-gray-900 dark:text-slate-200 whitespace-no-wrap">
                                                    {items.prenom}
                                                </p>
                                            </td>
                                            
                                            <td className="p-3 px-5 flex justify-center border-gray-200 dark:border-gray-800 dark:bg-black bg-white">
                                                <button type="button" className="mr-3 text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">
                                                    Voir stat
                                                </button>
                                                <button type="button" 
                                                className="text-sm bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">
                                                    Parler au Parent
                                                </button>
                                            </td>                                        
                                        </tr>
                                        
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default List