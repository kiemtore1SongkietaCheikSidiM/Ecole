import { useEffect, useState } from "react"
import { FaMoon, FaSun } from "react-icons/fa"


const General = () => {
  //var for localstorage looking for the current theme
    const defaultState : string = localStorage.getItem('theme') || 'light'
    //var to theme
    const [theme, setTheme] = useState<string>(defaultState)

    useEffect(()=>{
        localStorage.setItem('theme', theme)
        document.documentElement.classList.toggle('dark', theme === 'dark')
    },[theme])

    //function for the theme clair if it clair it remain but if it dark it came back
    const Clair: React.FC =() =>{
        if(theme=='light'){
            setTheme('light')
        }
        else{
            setTheme('light')
        }
    }
    const Sombre:React.FC = ()=>{
        if (theme=='dark') {
            setTheme('dark')
        }else {
            setTheme("dark")
        }
    } 
  return (
    <div >
        <h1 className="flex justify-center text-center text-4xl sm:text-5xl p-2 m-2 text-slate-800 dark:text-white">
          Choississez un thème
        </h1>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 cursor-pointer'>
           <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6
                border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl
                hover:shadow-slate-200 dark:hover:shadow-slate-900/20 
                transition-all duration-300 group'>
                <div >
                  <button onClick={Sombre} className='flex items-start justify-between cursor-pointer'
                  >
                    <p className="font-medium text-slate-600 dark:text-slate-400 mb-2 text-3xl sm:text-4xl">Thème Sombre</p>
                    <div className='flex items-center space-x-2'>
                      <FaMoon className="w-7 h-7 text-slate-800 dark:text-slate-100"/>
                    </div>
                  </button>
                  
                </div>
            </div>
           <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6
                border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl
                hover:shadow-slate-200 dark:hover:shadow-slate-900/20 
                transition-all duration-300 group'>
                <div >
                  <button onClick={Clair} className='flex items-start justify-between cursor-pointer'
                  >
                    <p className='font-medium text-slate-600 cursor-pointer dark:text-slate-400 mb-2 text-3xl sm:text-4xl'>Thème Clair</p>
                    <div className='flex items-center space-x-2'>
                      <FaSun className="w-7 h-7 text-yellow-600 dark:text-yellow-500"/>
                    </div>
                  </button>
                  
                </div>
            </div>
        </div>
    </div>
  )
}

export default General