import { BsArrowDownRight, BsArrowUpRight } from "react-icons/bs"
import { StatsStudent } from "../../Declarations/Constant"


const StatStudent = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
            {
            StatsStudent.map((items,index)=>(
                <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6
                border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl
                hover:shadow-slate-200 dark:hover:shadow-slate-900/20 
                transition-all duration-300 group' key={index}>
                    <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                            <p className='text-sm font-medium text-slate-600 dark:text-slate-400 mb-2'>
                                {items.title}
                            </p>
                            <p className='text-3xl font-bold text-slate-800 dark:text-white mb-4'>
                                {items.value}
                            </p>
                            <div className='flex items-center space-x-2'>
                                {items.trend === "up" ? <BsArrowUpRight className='w-4 h-4 text-emerald-500'/> : <BsArrowDownRight className='w-4 h-4 text-red-500'/>}
                                <span className={`text-sm font-semibold ${items.trend == "up" ? "text-emerald-500" : "text-red-500"}`} >
                                    {items.change}
                                </span>
                                <span className='text-sm text-slate-500 dark:text-slate-400'>Vs last month</span>
                            </div>
                        </div>
                        <div className={` p-3 rounded-xl ${items.bgColor}
                        group-hover:scale-110 transition-all duration-300`}>
                            {<items.icon className={`w-6 h-6 ${items.textColor}`}/> }
                        </div>
                    </div>
                    <div className='mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden'>
                        <div className={`h-10 w-full transition-all duration-300 ${items.color}`} style={{width:items.trend === 'up' ? '75%':"45%"}}/>
                    </div>
                </div>
            ))
            }
        </div>
  )
}

export default StatStudent