import axios from "axios";
import { URL } from "./constant";




export const handleAdminLogin = async (e: React.FormEvent,username:string,password:string, setLoading: (loading: boolean) => void,navigate: any) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await axios.post(
      `${URL}/api/auth/login/`,
      {
        username,
        password,
      }
    );

    const { access, refresh } = response.data.tokens;
    const user = response.data.user;

    if (user.role !== "ADMIN") {
        throw new Error("Cet utilisateur n'est pas administrateur.");
    }

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));

    navigate("/Directeur");
  } catch (error: any) {
    console.error(
      "Erreur login admin :",
      error.response?.data || error.message
    );
  } finally {
    setLoading(false);
  }
}