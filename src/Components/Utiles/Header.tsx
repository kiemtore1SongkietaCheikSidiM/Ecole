import { useEffect, useState } from "react"
import { FaMoon, FaSun } from "react-icons/fa"

const Header = () => {
    //var for localstorage looking for the current theme
        const defaultState : string = localStorage.getItem('theme') || 'light'
        //var to theme
        const [theme, setTheme] = useState<string>(defaultState)
        useEffect(()=>{
            localStorage.setItem('theme', theme)
            document.documentElement.classList.toggle('dark', theme === 'dark')
        },[theme])
        // Handle Button Click to Toggle Theme
        const handleButton = () => {
        // Switches the theme:
        setTheme(theme == 'light' ? 'dark' : 'light');
    }
  return (
    <header className="relative bg-white/80 dark:bg-neutral-950/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 items-center h-20">
                <nav className="hidden lg:flex items-center gap-8 justify-start">
                    <p className="text-2xl italic font-bold font-playfair text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Education
                    </p>
                    <p className="text-2xl italic font-playfair font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Travail
                    </p>
                    <p className="text-2xl italic font-playfair font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                        Discipline
                    </p>
                </nav>


                <div id="logo" className="flex items-center justify-center ">
                    <img src="https://cdn.ln-cdn.com/image/placeholder-logo-full.png" ln-logo="" className="h-8" alt="Logo"></img>
                </div>

                <div className="flex items-center gap-3 justify-end">
                    <button onClick={handleButton} className={`p-2.5 rounded-xl text-slate-600 dark:text-slate-300
                    hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}>
                        {theme === 'light' ? <FaMoon className='w-5 h-5 text-black'/> : <FaSun className='w-5 h-5 text-yellow-400'/>}
                    </button>


                    <a href="mailto:kiemtorecheik@gmail.com" className="hidden sm:flex h-10 px-5 bg-linear-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 items-center gap-2">
                       Contactez-nous
                    </a>
                </div>
            </div>
        </div>
    </header>
  )
}

export default Header