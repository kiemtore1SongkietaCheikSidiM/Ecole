import { TfiWorld } from "react-icons/tfi";
import type { Search } from "../../Declarations/Types";
import { MenuItemParent } from "../../Declarations/Constant";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Usertype } from "../../Declarations/Types/typage";
import { userInfo } from "../../Declarations/Constant/Fonction";

const SidebarP = ({ sidebarcollaps }: Search) => {
    const [user, setUser] = useState<Usertype>();
  useEffect(()=>{
    userInfo(setUser)
  },[])
  const navigate = useNavigate();
  return (
    <aside
      className={`flex h-screen flex-col border-r border-slate-200/70 bg-white/85 shadow-lg shadow-slate-200 
        backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-slate-700/70 dark:shadow-slate-950 dark:bg-slate-900/80 
        ${sidebarcollaps ? "w-65 md:w-56" : "w-19"}`}
    >
      <div className="flex items-center justify-between border-b border-slate-200/70 p-3 dark:border-slate-700/70 sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-r 
                    from-blue-600 to-purple-600 shadow-lg text-white shadow-blue-600"
          >
            <TfiWorld className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          {/* Condition to the toogle */}
          {sidebarcollaps && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-lora font-bold text-slate-800 dark:text-white">
                At-Taslim
              </h1>
            </div>
          )}
        </div>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto p-2.5 sm:p-3">
        {/* Here the the map I will display all the items */}
        {MenuItemParent.map((item) => {
          const handleClick = () => {
            if (item.action === "logout") {
              localStorage.removeItem("user");
              localStorage.removeItem("Parent");
              localStorage.removeItem("Enseignant");
              localStorage.removeItem("access_token");
              navigate("/login");
            } else if (item.path) {
              navigate(item.path);
            }
          };
          return (
            <div key={item.id}>
              <button
                title={item.label}
                className={`flex w-full cursor-pointer items-center rounded-xl p-3 transition-all duration-200 
                      hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-100
                      dark:hover:bg-blue-400/80 dark:focus:ring-offset-slate-900 ${sidebarcollaps ? "justify-start" : "justify-center"}`}
                onClick={handleClick}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="text-blue-600 w-5 h-5 dark:text-blue-400 sm:W-6 sm:h-6" />

                  {sidebarcollaps && (
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-semibold font-pro text-slate-800 dark:text-slate-200">
                        {item.label}
                      </span>
                      {item.count && (
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                          {item.count}
                        </span>
                      )}
                      {item.badge && (
                        <span className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                          {item.badge}
                        </span>
                      )}
                      {item.active && (
                        <span className="rounded-full bg-blue-500 px-2 py-1 text-xs text-white">
                          {item.active}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-slate-200/70 p-3 dark:border-slate-700/50 sm:p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <CgProfile className="h-8 w-8 shrink-0 text-slate-600 dark:text-slate-300" />

          {sidebarcollaps && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-white">
                {user?.nom}
              </p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {user?.prenom}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarP;
