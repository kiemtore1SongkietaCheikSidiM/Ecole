import { useState } from "react";
import Header from "../../../Components/Entete/Header";
import SidebarP from "../../../Components/Entete/SidebarP";
import { Outlet } from "react-router-dom";



const Layoute = () => {
  const [sidebarcollaps, setSidebarcollaps] = useState<boolean>(false);
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 transition-all duration-500 dark:bg-slate-950 dark:text-slate-100">
      <div className="relative flex h-screen overflow-hidden">
        <div
          className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:static md:translate-x-0 ${
            sidebarcollaps ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarP
            ontoggle={() => setSidebarcollaps((prev) => !prev)}
            sidebarcollaps={sidebarcollaps}
          />
        </div>
        {sidebarcollaps && (
          <button
            type="button"
            aria-label="Fermer le menu"
            title="fermer le menu"
            className="fixed inset-0 z-30 bg-slate-950/40 md:hidden"
            onClick={() => setSidebarcollaps(false)}
          />
        )}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Header
            ontoggle={() => setSidebarcollaps((prev) => !prev)}
            sidebarcollaps={sidebarcollaps}
          />
          <main className="flex-1 overflow-y-auto  bg-transparent">
            <div className="p-4 sm:p-5 lg:p-6 space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layoute;
