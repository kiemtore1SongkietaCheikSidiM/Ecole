import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Satclasse } from "../../Declarations/Constant/constant"
import { useState } from "react"



const LineCharts = () => {
    const [classe,setClasse] = useState<string>("6eme")
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-b-2xl
    border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    Statistique des classes
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Evolution des notes au cours de l'année
                </p>
            </div>
            <div className="flex items-center space-x-4">
                <select name="" id="" value={classe} onChange={(e)=>setClasse(e.target.value)}>
                    <option value="">5eme</option>
                    <option value="">4eme</option>
                </select>
            </div>
        </div>
        <div className="h-80">
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={Satclasse} margin={{ top:20, right: 30, left:20 , bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3}/>
                    <XAxis dataKey="Note" tick={{fontSize:12}}/>
                    <YAxis domain={[0,25]}/>
                    <Line type="monotone" dataKey="Moyenne" stroke="#8b5cf6" strokeWidth={3} dot={{r:5}} activeDot={{r:8}}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  )
}

export default LineCharts