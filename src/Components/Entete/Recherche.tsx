import { MdSearch } from "react-icons/md";

const Recherche = () => {
  return (
    <div className="relative ">
      <MdSearch
        className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2
            text-slate-400 dark:text-slate-100"
      />
      <input
        type="text"
        className="w-full pl-10 pr-4 font-handjet font-bold text-2xl
        py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800
         dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        placeholder="faites votre recherche"
      />
    </div>
  );
};

export default Recherche;
