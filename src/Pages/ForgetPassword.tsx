import { useState } from "react";
import Header from "../Components/Utiles/Header"
import { URL } from "../Declarations/Constant/constant";
import api from "../Declarations/Api";


const ForgetPassword = () => {
    const [message, setMessage] = useState<boolean>(false);
    const [username,setUsername] = useState<string>("")
    const handleSubmit = async ()=>{
      try {
        await api.post(`${URL}/api/auth/forgot-password/`,username)
        setMessage(true)
      } catch (error:any) {
        console.error(error.response?.data)
      }
    }
  return (
    <div>
        <Header/>
        {message ? 
            <div className="text-center text-4xl m-4 p-4">
                Un e-mail de réinitialisation a été envoyé  à votre Email
            </div>
            :
            <section className="bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
                        <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
                            Change de mot de passe
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Identifiant
                                </label>
                                <input type="email" name="email" id="email" value={username} onChange={(e)=>setUsername(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                                dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="INE ou IPE"/>
                            </div>
                            <button type="submit" className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 m-5">
                                Change
                            </button>
                        <div>
                        {message && (
                            <div>
                                Échec de l'envoi de l'e-mail. Veuillez réessayer.
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    </section>
    }
</div>
  )
}

export default ForgetPassword