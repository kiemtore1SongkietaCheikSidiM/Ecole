import { Outlet, useLocation, useNavigate } from "react-router-dom"
import Params from "../Components/Utiles/Params"
import { useState, type ReactNode } from "react"
import { IoArrowBackOutline, IoSettings } from "react-icons/io5"
import General from "../Components/Utiles/General"
import Profile from "../Components/Utiles/Profile"
import Langues from "../Components/Utiles/Langues"
import Confidentialite from "../Components/Utiles/Confidentialite"
import Telechargement from "../Components/Utiles/Telechargement"




const Setting = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedOption, setSelectedOption] = useState<string | null>(location.pathname)

  const pageMap: Record<string, ReactNode> = {
    "/general": <General />,
    "/profile": <Profile />,
    "/langue": <Langues />,
    "/confidentialite": <Confidentialite />,
    "/telechargement": <Telechargement />,
    "/parent/general": <General />,
    "/parent/profile": <Profile />,
    "/parent/langue": <Langues />,
    "/parent/confidentialite": <Confidentialite />,
    "/parent/telechargement": <Telechargement />,
    "/enseignant/general": <General />,
    "/enseignant/profile": <Profile />,
    "/enseignant/langue": <Langues />,
    "/enseignant/confidentialite": <Confidentialite />,
    "/enseignant/telechargement": <Telechargement />,
    "/admin/general": <General />,
    "/admin/profile": <Profile />,
    "/admin/langue": <Langues />,
    "/admin/confidentialite": <Confidentialite />,
    "/admin/telechargement": <Telechargement />,
  }

  const handleSelect = (path: string) => {
    setSelectedOption(path)
    navigate(path)
  }

  const handleBack = () => {
    setSelectedOption(null)
  }

  const normalizedPath = location.pathname.replace(/^\/(parent|enseignant|admin)\//, "/")
  const renderContent = pageMap[location.pathname] ?? pageMap[normalizedPath] ?? <General />

  return (
    <div className="min-h-screen text-slate-800 transition-all duration-500 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className={`${selectedOption ? "flex md:hidden" : "hidden"} h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}
            aria-label="Retour aux paramètres"
          >
            <IoArrowBackOutline className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-300">
              <IoSettings className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Compte & sécurité
              </p>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Paramètres</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col gap-4 p-3 sm:p-4 lg:flex-row">
        <div className={`${selectedOption ? "hidden md:flex" : "flex"} w-full lg:w-65 lg:shrink-0`}>
          <Params selectedPath={selectedOption} onSelect={handleSelect} />
        </div>

        <main className={`${selectedOption ? "flex md:flex" : "hidden md:flex"} min-w-0 flex-1 overflow-y-auto bg-transparent`}>
          <div className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm shadow-slate-200/60 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40 sm:p-4">
            {renderContent}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Setting