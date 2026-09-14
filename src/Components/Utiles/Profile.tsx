import { useEffect, useState } from "react"
import { URL } from "../../Declarations/Constant/constant"
import api from "../../Declarations/Api"
import type{ Usertype } from "../../Declarations/Types/typage"
import { userInfo } from "../../Declarations/Constant/Fonction"

const access_token = localStorage.getItem("access_token")
const Profile = () => {
    const [changer,setChanger] = useState<boolean>(false)
    const [user,setUser] = useState<Usertype>()
    const [nom,setNom] = useState<string>("")
    const [prenom,setPrenom] = useState<string>("")
    const [email,setEmail] = useState<string>("")
    const [telephone,setTelephone] = useState<string>("")
    const [file,setFile]=  useState<File[]>([])
    useEffect(()=>{
        userInfo(setUser) 
    },[])
    const handleFileSet = (e:React.ChangeEvent<HTMLInputElement>)=>{
        if(e.target.files){
            const selectedFiles = Array.from(e.target.files)
            setFile(selectedFiles)
        }
    }
    const handleSubmit =async ()=>{
        const formData = new FormData()
        formData.append("nom",nom)
        formData.append("prenom",prenom)
        formData.append("email",email)
        formData.append("telephone",telephone)
        if(file){
            file.forEach((file)=>{
                formData.append("files", file, file.name)
            })
        }
        try {
            await api.post(`${URL}/api/auth/profile/`,formData,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
        } catch (error:any) {
            console.log(error.response?.data)
        }
    }
  return (
    <div>
       <div className="max-w-lg mx-auto bg-white dark:bg-black p-6 rounded-lg shadow-md">
           <div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                        {changer? "Cliquer ouglisser la photo":"Photo de profile"}
                    </label>
                    {changer ? <input id="file-upload" onChange={handleFileSet}
                    name="file-upload" type="file" className="w-full mt-5"/>:
                    <div className="mt-1 flex items-center space-x-5">
                        <span className="inline-block h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                            <img className="h-full w-full text-gray-300 dark:text-gray-700  object-cover" src="https://picsum.photos/100/100" alt="Current Profile Photo"/>
                        </span>
                        <label  className="flex justify-between py-2 px-3 ">
                            <button onClick={()=>setChanger(true)}
                            className="rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-black py-2 px-3 text-sm font-medium leading-4 text-gray-700 dark:text-slate-300 shadow-sm hover:bg-gray-50">
                                Changer
                            </button>
                            
                        </label>
                    </div>}
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-100">
                        JPG, GIF or PNG.
                    </p>
                </div>
                
           </div>
        </div>


        <div className="max-w-lg mx-auto bg-white dark:bg-black p-6 rounded-lg shadow-md">
            <div>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 text-3xl">
                    <div className="sm:col-span-3">
                        <label className="block  font-medium text-gray-700 dark:text-gray-300">
                            Nom
                        </label>
                        <div className="mt-1">
                            {changer ? <input value={nom} onChange={(e)=>setNom(e.target.value)}
                            type="text" className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm "/>:
                            <span className="block w-full ">
                                {user?.nom}
                            </span>
                            }
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block  font-medium text-gray-700 dark:text-slate-300">
                            Prenom
                        </label>
                        <div className="mt-1">
                            {changer ? <input value={prenom} onChange={(e)=>setPrenom(e.target.value)}
                            type="text" className="block w-full rounded-md border-gray-300 shadow-sm "/>:
                            <span className="block w-full dark:text-white">
                                {user?.prenom}
                            </span>
                            }
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <div className="mt-1">
                            {changer ? <input value={email} onChange={(e)=>setEmail(e.target.value)}
                            type="text" className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm "/>:
                            <span className="block w-full ">
                                {user?.email}
                            </span>
                            }
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block  font-medium text-gray-700 dark:text-gray-300">
                            Numero de téléphone
                        </label>
                        <div className="mt-1">
                            {changer ? <input value={telephone} onChange={(e)=>setTelephone(e.target.value)}
                            type="text" className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm "/>:
                            <span className="block w-full ">
                                {user?.telephone}
                            </span>
                            }
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block  font-medium text-gray-700 dark:text-gray-300">
                            {changer ? "Vous ne pouvez pas changer votre Status":"Statue"}
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="block w-full">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
                <button onClick={()=>setChanger(false)}
                type="button" className="rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-black py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50">
                    Annuler
                </button>
                <button type="submit" onClick={handleSubmit}
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                    Enregistrer
                </button>
            </div>
        </div> 
    </div>
  )
}

export default Profile