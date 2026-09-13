import { useNavigate } from "react-router-dom"
import { Parames } from "../../Declarations/Constant"
import type { ParamsProps } from "../../Declarations/Types/constant"




const Params = ({ selectedPath, onSelect }: ParamsProps) => {
    const navigate = useNavigate()
  return (
    <aside className="flex  w-full flex-col rounded-2xl border h-screen
    border-slate-200 bg-white/80 p-3 shadow-sm shadow-slate-200/60 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/40 lg:h-full lg:min-h-[calc(100vh-8rem)] lg:rounded-none lg:border-r lg:border-y-0 lg:border-l-0 lg:p-4">
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {Parames.map((items) => {
          const isSelected = selectedPath === items.path

          const handleParams = () => {
            if (items.path) {
              if (onSelect) {
                onSelect(items.path)
                return
              }
              navigate(items.path)
            }
          }

          return (
            <button
              key={items.id}
              type="button"
              onClick={handleParams}
              className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 ${
                isSelected
                  ? "bg-emerald-50 text-emerald-700 shadow-[0_8px_24px_rgba(16,185,129,0.12)] ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <span
                className={`absolute inset-y-2 left-2 w-1 rounded-full transition-all duration-200 ${
                  isSelected ? "bg-emerald-500 opacity-100" : "bg-transparent opacity-0 group-hover:bg-slate-300 dark:group-hover:bg-slate-600"
                }`}
              />
              <items.icon className="relative z-10 h-5 w-5 shrink-0" />
              <span className="relative z-10 text-sm font-semibold">{items.title}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-4 pt-4">
        <button className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          Réinitialiser tous
        </button>
      </div>
    </aside>
  )
}

export default Params