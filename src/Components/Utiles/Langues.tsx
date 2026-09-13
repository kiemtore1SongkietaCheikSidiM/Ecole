

const Langues = () => {
  return (
    <main className="flex-1 overflow-y-auto  bg-transparent justify-between ml-60">
        <h1 className="flex justify-center text-center text-4xl sm:text-5xl p-2 m-2">
            Choississez une langue
        </h1>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 cursor-pointer'>
            <button 
            className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6
            border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl
            hover:shadow-slate-200 dark:hover:shadow-slate-900/20 
            transition-all duration-300 group'>
                <div className='flex-col items-start justify-between'>
                    <p className="text-center text-3xl font-bold">
                        Francais
                    </p>
                    <p className="text-3xl">
                        L'education est la clé du succes
                    </p>
                </div>
            </button>
            <button 
            className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6
            border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl
            hover:shadow-slate-200 dark:hover:shadow-slate-900/20 
            transition-all duration-300 group'>
                <div className='flex-col items-start justify-between'>
                    <p className="text-center text-3xl font-bold">
                        English
                    </p>
                    <p className="text-3xl">
                        Education is the key to success
                    </p>
                </div>
            </button>
            <button 
            className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6
            border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl
            hover:shadow-slate-200 dark:hover:shadow-slate-900/20 
            transition-all duration-300 group'>
                <div className='flex-col items-start justify-between'>
                    <p className="text-center text-3xl font-bold">
                        العربية
                    </p>
                    <p className="text-3xl">
                        التعليم هو مفتاح النجاح
                    </p>
                </div>
            </button>
        </div>
    </main>
  )
}

export default Langues