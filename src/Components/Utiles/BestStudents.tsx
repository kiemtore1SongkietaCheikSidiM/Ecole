import { FiMoreHorizontal } from "react-icons/fi"
import { BadStudent, recentBest } from "../../Declarations/Constant"
import { BiTrendingDown, BiTrendingUp } from "react-icons/bi"


const BestStudents = () => {
  return (
    <div className="space-y-6">
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl rounded-b-2xl
        border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex  items-center justify-between ">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                            Meilleur Elève
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Récemment prime
                        </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Voir tout</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left p-4 text-sm font-semibold
                            text-slate-600">
                                Matricule
                            </th>
                            <th className="text-left p-4 text-sm font-semibold
                            text-slate-600">
                                Nom et Prenom
                            </th>
                            <th className="text-left p-4 text-sm font-semibold
                            text-slate-600">
                                Classe
                            </th>
                            <th className="text-left p-4 text-sm font-semibold
                            text-slate-600">
                                Moyenne
                            </th>
                            <th className="text-left p-4 text-sm font-semibold
                            text-slate-600">
                                Honneur
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            recentBest.map((items,index)=>(
                                <tr className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50
                                transition-all" key={index}>
                                    <td className="p-4">
                                        <span className="text-sm font-medium text-blue-700">
                                            {items.id}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-medium text-blue-700">
                                            {items.Nom}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-medium text-blue-700">
                                            {items.Classe}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-medium text-blue-700">
                                            {items.Moyenne}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-medium text-blue-700">
                                            {items.Honneur}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-medium text-blue-700">
                                            <FiMoreHorizontal className="w-4 h-4"/>
                                        </span>
                                    </td> 
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl
        border border-slate-200/50 bg-border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-slate-800 dark:text-white">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                            Faible Niveau
                        </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        A suivre dans leurs parcours
                    </p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Tous voir
                </button>
            </div>
            <div className="p-6 space-y-4">
                {
                    BadStudent.map((items,index)=>(
                        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50
                         dark:hover:bg-slate-800/50 transition-colors" key={index}>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                                    {items.name}
                                </h4>
                                <p className="text-xs text-slate-50 dark:text-slate-400">
                                    {items.Classe}
                                </p> 
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                   {items.Moyenne}
                                </p>
                                <div className="flex items-center space-x-1">
                                    {items.trend === 'up' ? <BiTrendingUp className="w-3 h-3 text-emerald-500" /> : <BiTrendingDown className="w-3 h-3 text-red-500" />}
                                    <span className={`text-xs font-medium ${items.trend === "up" ? "text-emerald-500":"text-red-500"}`}>{items.change}</span>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    </div>
  )
}

export default BestStudents