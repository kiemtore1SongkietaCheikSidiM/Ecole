import type { classetype, EleveType } from "./typage";

interface NotificationItem {
  id: number;
  type: "ABSENCE" | "RETARD" | "DEVOIR" | "EVENEMENT" | "MESSAGE";
  category: "SCHOOL" | "MESSAGE";

  eleve: {
    id: number;
    nom: string;
    prenom: string;
    classe: string;
  } | null;

  nom_eleve: string | null;
  prenom_eleve: string | null;

  date: string;
  heure: string;

  auteur: User | null;
}
interface NotificationsResponse {
  success: boolean;
  count: number;
  unread_count: number;
  school_count: number;
  message_count: number;
  notifications: NotificationItem[];
  school_notifications: NotificationItem[];
  message_notifications: NotificationItem[];
}
interface RegisterItem {
  fonction:string
  Nom:string
  prenom:string
  email:string
  tel:string
  succes:boolean
  nommanquand:boolean
  prenommanquand:boolean
  emailmanquand:boolean
  telmanquand:boolean
  fonctionmanquand:boolean
  classe:classetype[]
  eleve:EleveType[]
  setfonction:React.Dispatch<React.SetStateAction<string>>
  setNom:React.Dispatch<React.SetStateAction<string>>
  setPrenom:React.Dispatch<React.SetStateAction<string>>
  setEmail:React.Dispatch<React.SetStateAction<string>>
  setTel:React.Dispatch<React.SetStateAction<string>>
  setSucces:React.Dispatch<React.SetStateAction<boolean>>
  setNomManquand:React.Dispatch<React.SetStateAction<boolean>>
  setPrenomManquand:React.Dispatch<React.SetStateAction<boolean>>
  setEmailManquand:React.Dispatch<React.SetStateAction<boolean>>
  setTelManquand:React.Dispatch<React.SetStateAction<boolean>>
  setFonctionManquand:React.Dispatch<React.SetStateAction<boolean>>
  setClasse:React.Dispatch<React.SetStateAction<classetype[]>>
  setEleve:React.Dispatch<React.SetStateAction<EleveType[]>>
}