import { FaAccusoft, FaMoon } from "react-icons/fa";
import type { Note } from "../Types";
import { FaMessage } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";



export const URL = import.meta.env.VITE_API_BASE_URL
export type Panel = "message" | "Notification" | null


export interface MessageProps {
  name: string;
  number: number;
}
export const Mohamed: Note[] = [
    {
        Matiere:"Francais",
        Note:10,
        Note1:15,
        Composition:6,
        Moyenne:10,
        Date:"janvier",
        Mention:"Passable"
    },
    {
        Matiere:"Anglais",
        Note:12,
        Note1:15,
        Composition:6,
        Moyenne:10,
        Date:"janvier",
        Mention:"Passable"
    },
    {
        Matiere:"Pysique-Chimie",
        Note:10,
        Note1:15,
        Composition:6,
        Moyenne:2,
        Date:"janvier",
        Mention:"faible"
    },
    {
        Matiere:"Histoire-Geographie",
        Note:16,
        Note1:15,
        Composition:6,
        Moyenne:7,
        Date:"janvier",
        Mention:"insuffisant"
    },
    {
        Matiere:"Mathematique",
        Note:10,
        Note1:15,
        Composition:6,
        Moyenne:18,
        Date:"janvier",
        Mention:"Très bien"
    },
    {
        Matiere:"EPS",
        Note:10,
        Note1:15,
        Composition:6,
        Moyenne:14,
        Date:"janvier",
        Mention:"Bien"
    },
]

export const Notifications = [
    {
        id:1,
        icon:FaMoon,
        name:"absence",
        content:"Votre enfant karim est absent",
        date:"07/12/2003"
    },
    {
        id:2,
        icon:IoAdd,
        name:"retard",
        content:"Votre enfant karim est en retrd",
        date:"07/12/2003"
    },
    {
        id:3,
        icon:FaAccusoft,
        name:"Activite",
        content:"Il ya une reunion des parent d'eleve",
        date:"07/12/2003"
    },
    {
        id:4,
        icon:FaMessage,
        name:"Message",
        content:"Vous avez un nouveau message",
        date:"07/12/2003"
    },
]
export const Satclasse = [
    {
        Moyenne:10,
        Note:"Devoir1"
    },
    {
        Moyenne:12,
        Note:"Devoir2"
    },
    {
        Moyenne:13,
        Note:"Compo1"
    },
    {
        Moyenne:7,
        Note:"Devoir3"
    },
    {
        Moyenne:15,
        Note:"Devoir4"
    },
    {
        Moyenne:3,
        Note:"Compo2"
    },
    {
        Moyenne:16,
        Note:"Devoir5"
    },
    {
        Moyenne:23,
        Note:"Devoir6"
    },
    {
        Moyenne:10,
        Note:"Compo3"
    },
]
