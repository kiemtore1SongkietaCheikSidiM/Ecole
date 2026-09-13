import { useState } from "react";
import Header from "../Components/Utiles/Header";
import { Link, useNavigate } from "react-router-dom";
import {
  Identifiant_Enseignant,
  Identifiant_Parent,
} from "../Declarations/Constant/Fonction";
import { handleAdminLogin } from "../Declarations/Constant/Admin";
import Loading from "./../image/loading.gif";
import api from "../Declarations/Api";


const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (
      username.includes(Identifiant_Enseignant) ||
      username.includes(Identifiant_Parent)
    ) {
      try {
        const response = await api.post(`/api/auth/login/`, {
          username,
          password,
        });
        const { access, refresh } = response.data.tokens;
        const user = response.data.user;
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        localStorage.setItem("user", JSON.stringify(user));
        if (user.role === "ENSEIGNANT") {
          navigate("/Enseignant");
        } else if (user.role === "PARENT") {
          navigate("/Parent");
        } else if (user.role === "ADMIN") {
          navigate("/Directeur");
        }
      } catch (error) {
        console.log("Ca a refuser petit", error);
      } finally {
        setLoading(false);
      }
    } else {
      handleAdminLogin(e, username, password, setLoading, navigate);
      navigate("/Directeur");
    }
  };

  return (
    <div>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="text-xl font-semibold">
            <img src={Loading} alt="telechargement" />
          </div>
        </div>
      ) : (
        <div className="h-dvh min-h-screen min-w-screen bg-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-x-hidden">
          <Header />
          <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2
                className="mt-10 text-center 
          font-lora text-3xl font-bold tracking-tight text-slate-600 dark:text-slate-300"
              >
                {loading ? "Patienter" : "Connectez-vous"}
              </h2>
            </div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form action="">
                <div>
                  <label
                    htmlFor=""
                    className="block text-sm/6 font-medium text-slate-700 dark:text-slate-200"
                  >
                    Votre Nom d'utilisateur
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      className="block w-full rounded-md  px-3 py-1.5
                 text-3xl border text-slate-600 font-bold  outline-1 -outline-offset-1 outline-white/10
                  placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2
                   focus:outline-indigo-500 sm:text-sm/6"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-3 py-3">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor=""
                      className="block text-sm/6 font-medium text-slate-700 dark:text-slate-200"
                    >
                      Mot de passe
                    </label>
                    <div className="text-sm">
                      <Link
                        to="/oublie"
                        className="font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        Mot de passe oublie?
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2">
                    <input
                      type="password"
                      className="block w-full rounded-md  px-3 py-1.5
                 text-3xl border text-slate-600 font-bold  outline-1 -outline-offset-1 outline-white/10
                  placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2
                   focus:outline-indigo-500 sm:text-sm/6"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-2 py-3">
                  <button
                    onClick={handleSubmit}
                    className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Connexion
                  </button>
                </div>
              </form>

              <p className="mt-10 text-center text-sm/6 text-gray-400">
                Vous n'avez pas vos identifiants ?
                <a
                  href="mailto:kiemtorecheik@gmail.com"
                  className="hidden sm:flex h-10 px-5 bg-linear-to-r
            from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg 
            hover:shadow-indigo-500/25 justify-center transition-all duration-300 items-center gap-2"
                >
                  Contactez-nous
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
