import { CgLock } from "react-icons/cg"
import { activity } from "../../Declarations/Constant"


const Activite = () => {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl
     border border-slate-200/50 dark:border-slate-700/50">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    Notifications
                </h3>
                <p className="test-sm text-slate-500 dark:text-slate-400">Activite en cours ...</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Tout voir
            </button>
        </div>
        <div className="p-6">
            <div className="space-y-4">
                {
                activity.map((items,index)=>(
                    <div className="flex items-start space-x-4 p-3 rounded-xl
                   hover:bg-slate-50 dark:hover:bg-slate-800/50
                    transition-colors" key={index}>
                        <div className={`p-2 rounded-lg ${items.bgColor}`}>
                            <items.icon className={`w-4 h-4 ${items.color}`}/>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-800 dark:text-white">
                                {items.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                {items.description}
                            </p>
                            <div className="flex items-center-safe mt-1">
                                <CgLock className="w-3 h-3 text-slate-400"/>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {items.time}
                                </span>
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

export default Activite