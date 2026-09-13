import axios from "axios";
import { URL } from "./Constant/constant";



const api = axios.create({
    baseURL: URL
})

/* on utilise ca avant chaque requete  */
api.interceptors.request.use(
    (config)=>{
        const accesstoken = localStorage.getItem("access_token")
        if(accesstoken){
            config.headers.Authorization = `Bearer ${accesstoken}`
        }
        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

/* On utilise ca apres chaque requete */
api.interceptors.request.use(
    (response) =>{
        return response
    },

    async (error)=>{
        const requeteOriginal = error.config


        if(error.response?.status === 401 && !requeteOriginal._retry){
            requeteOriginal._retry = true

            const refreshtoken = localStorage.getItem("refresh_token")
            if(!refreshtoken){
                localStorage.removeItem("access_token")
                localStorage.removeItem("refresh_token")

                window.location.href = "/login"

                return Promise.reject(error)
            }
            try {
                const response = await axios.post(`${URL}/api/token/refresh/`,{
                refresh:refreshtoken
            })
            const newaccessToken = response.data.access
            localStorage.setItem("access_token",newaccessToken)

            requeteOriginal.headers.Authorization = `Bearer ${newaccessToken}`
            return api(requeteOriginal)
            } catch (refreshError) {
                localStorage.removeItem("access_token")
                localStorage.removeItem("refresh_token")
                localStorage.removeItem("user")

                window.location.href = '/login'

                return Promise.reject(error)
            }
        }
        return Promise.reject(error)
    }
)
export default api