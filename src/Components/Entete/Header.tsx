import { FiMenu } from "react-icons/fi"
import { FaMoon, FaSun } from "react-icons/fa"
import Recherche from "./Recherche"
import type { Search } from "../../Declarations/Types"
import { useEffect, useState } from "react"
import Notification from "./Notification"

const user = JSON.parse(localStorage.getItem("user") || "{}")
const Header = ({ontoggle,sidebarcollaps}:Search) => {
    const defaultState : string = localStorage.getItem('theme') || 'light'
    const [theme, setTheme] = useState<string>(defaultState)
    useEffect(()=>{
        localStorage.setItem('theme', theme)
        document.documentElement.classList.toggle('dark', theme === 'dark')
    },[theme])
    const handleButton = () => {
    setTheme((current)=>current ==="light"? "dark":"light");
   }
  return (
    <header 
       className="border-b border-slate-200/50 bg-white/80 px-3 py-3 backdrop-blur-xl shadow-sm shadow-slate-200/40 
       dark:border-slate-700/80 dark:bg-slate-900/80 sm:px-4 md:px-5 lg:px-8 relative z-50">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-3">
                {/* Button for toogle the header and the sidebar */}
                    <button
                        className="rounded-xl border-slate-200 border p-2.5 cursor-pointer text-slate-700 transition-colors 
                        hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800  dark:text-slate-200 dark:hover:bg-slate-700"
                        onClick={ontoggle}
                        aria-label="Ouvrir ou fermer la barre latérale"
                        title="Ouvrir ou fermer la barre latérale"
                    >
                        {/* button Icon */}
                        <FiMenu className="h-5 w-5" />
                    </button>

                    <div 
                    className={`hidden md:block ${sidebarcollaps ? 'max-w-48' : 'max-w-56 lg:max-w-sm'}`}>
                        <h1 
                        className="truncate text-lg font-black text-slate-800 dark:text-white 
                        sm:text-xl lg:text-2xl italic font-playfair">
                            Bienvenue{" Mr "} {user.nom}
                        </h1>
                    </div>
            </div>
            {/* search bar here */}
            <div 
            className="order-3 w-full md:order-2 md:flex-1 md:max-w-xl lg:max-w-2xl">
                <Recherche />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                {/* Button to set notifications */}
                
                <Notification/>
                <button 
                    onClick={handleButton} 
                    type="button"
                    className={`p-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100
                    hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors`}
                    aria-label="Changer de theme"
                    title="Changer de theme">
                    {
                    theme === 'light' ? <FaMoon className='w-4 h-5 sm:w-5 sm:h-5 text-black'/> 
                    : 
                    <FaSun className='w-5 h-5 text-yellow-400 sm:h-5 sm:w-5'/>
                    }
                </button>
            </div>
        </div>
    </header>
  )
}

export default Header