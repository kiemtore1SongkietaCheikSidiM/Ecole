import api from "../Api";
import type { RegisterItem } from "../Types/Interface";
import {
  Identifiant_Enseignant,
  Identifiant_Parent,
  Mot_de_passe_aleatoire,
  Nombre_aleatoire,
} from "./Fonction";

export const handleSubmit = async ({
  Nom,
  prenom,
  email,
  tel,
  fonction,
  setNomManquand,
  setPrenomManquand,
  setEmailManquand,
  setTelManquand,
  setFonctionManquand,
  setSucces,
  setNom,
  setPrenom,
  setEmail,
  setTel,
  setClasse,
  classe,
  eleve,
  setEleve,
}: RegisterItem) => {
  
  if (Nom === "") {
    setNomManquand(true);
  }
  if (prenom === "") {
    setPrenomManquand(true);
  }
  if (email === "") {
    setEmailManquand(true);
  }
  if (tel === "") {
    setTelManquand(true);
  }
  if (fonction === "" || fonction === "Choississez une fonction") {
    setFonctionManquand(true);
  }
  const password = Mot_de_passe_aleatoire(12);
  if (fonction === "Enseignant") {
    const username =
      Identifiant_Enseignant +
      Nombre_aleatoire(10000000000, 99999999999) +
      2026;
    const formData = {
      username,
      nom: Nom,
      prenom,
      email,
      telephone: tel,
      password,
      role: "ENSEIGNANT",
      classe: classe.map((item) => ({
        classe: item.classe,
        matiere: item.matiere,
      })),
    };
    try {
      await api.post(`${URL}/api/auth/register/`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setSucces(true);
      setNomManquand(false);
      setPrenomManquand(false);
      setEmailManquand(false);
      setTelManquand(false);
      setFonctionManquand(false);
      setNom("");
      setPrenom("");
      setEmail("");
      setTel("");
      setClasse([
        {
          classe: "",
          matiere: "",
        },
      ]);
    } catch (error: any) {
      console.log(
        "Ca na pas reussit",
        error.response?.data?.message || error.message,
      );
    }
  } else if (fonction === "Parent") {
    const username =
      Identifiant_Parent + Nombre_aleatoire(10000000000, 99999999999) + 2026;
    const formData = {
      username,
      nom: Nom,
      prenom,
      email,
      telephone: tel,
      password,
      role: "PARENT",
      eleve: eleve.map((item) => ({
        nom: item.Nom,
        prenom: item.Prenom,
        classe: item.Classe,
      })),
    };
    try {
      await api.post(`${URL}/api/auth/register/`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setNomManquand(false);
      setPrenomManquand(false);
      setEmailManquand(false);
      setTelManquand(false);
      setFonctionManquand(false);
      setNom("");
      setPrenom("");
      setEmail("");
      setTel("");
      setEleve([
        {
          Nom: "",
          Prenom: "",
          Classe: "",
        },
      ]);
    } catch (error: any) {
      console.error(
        "Ca na pas reussit",
        error.response?.data?.message || error.message,
      );
    }
  }
};