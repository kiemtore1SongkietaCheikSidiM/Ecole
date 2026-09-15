import { FaFile, FaHistory, FaList, FaLock, FaSchool } from "react-icons/fa";
import { FcStatistics } from "react-icons/fc";
import { MdDashboard, MdDownload, MdNote } from "react-icons/md";
import { IoIosSchool, IoMdAddCircle, IoMdSettings } from "react-icons/io"
import { FaMessage } from "react-icons/fa6";
import { IoCalendarNumber, IoLogOut, IoSettings } from "react-icons/io5";
import { PiExamFill, PiStudentBold } from "react-icons/pi"
import { BsPeopleFill } from "react-icons/bs"
import { MdAdminPanelSettings,MdDirectionsRun, MdEmojiFoodBeverage } from "react-icons/md"
import type { Active, Bad, Best, Classes, Donne, genere, Moyennes, SidebarProps, stats } from "../Types";
import { LuPartyPopper } from "react-icons/lu";
import { TbCircleDashedLetterA } from "react-icons/tb";
import { GiMaterialsScience } from "react-icons/gi";
import { HiOutlineLanguage } from "react-icons/hi2";
import { CgProfile } from "react-icons/cg";
import { TiUserAdd } from "react-icons/ti";


export const StatsGeneral : stats[] = [
    {
        title: "Total des eleves",
        value: "124,564",
        change: "+12.5%",
        trend: "up",
        icon: PiStudentBold,
        color: "bg-linear-to-r from-purple-500 to-pink-500",
        bgColor: "bg-emerald-50 dark:bg-emerald-400",
        textColor: "text-emerald-600 dark:text-emerald-100"
    },
     {
        title: "Total des admis",
        value: "1,564",
        change: "+17.5%",
        trend: "up",
        icon: IoIosSchool,
        color: "bg-linear-to-r from-violet-500 to-fuchsia-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400"
    },
     {
        title: "Administration",
        value: "124,564",
        change: "+2.5%",
        trend: "up",
        icon: MdAdminPanelSettings,
        color: "bg-linear-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%",
        bgColor: "bg-purple-50 dark:bg-purple-400",
        textColor: "text-purple-600 dark:text-purple-100"
    },
     {
        title: "Nombre de classe",
        value: "30",
        change: "-2.5%",
        trend: "Down",
        icon: FaSchool,
        color: "bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500",
        bgColor: "bg-orange-50 dark:bg-orange-400",
        textColor: "text-orange-600 dark:text-orange-100"
    }
]
export const Statsteacher : stats[] = [
    {
        title: "Total de mes eleves",
        value: "124,564",
        change: "+12.5%",
        trend: "up",
        icon: PiStudentBold,
        color: "bg-linear-to-r from-purple-500 to-pink-500",
        bgColor: "bg-emerald-50 dark:bg-emerald-400",
        textColor: "text-emerald-600 dark:text-emerald-100"
    },
     {
        title: "Total des admis",
        value: "1,564",
        change: "+17.5%",
        trend: "up",
        icon: IoIosSchool,
        color: "bg-linear-to-r from-violet-500 to-fuchsia-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400"
    },
     {
        title: "Total de mes classe",
        value: "124,564",
        change: "+2.5%",
        trend: "up",
        icon: FaSchool,
        color: "bg-linear-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%",
        bgColor: "bg-purple-50 dark:bg-purple-400",
        textColor: "text-purple-600 dark:text-purple-100"
    },
     {
        title: "Nombre de matiere",
        value: "30",
        change: "-2.5%",
        trend: "Down",
        icon: FaFile,
        color: "bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500",
        bgColor: "bg-orange-50 dark:bg-orange-400",
        textColor: "text-orange-600 dark:text-orange-100"
    }
]
export const StatsStudent : stats[] = [
    {
        title: "Total de mes enfants",
        value: "124,564",
        change: "+12.5%",
        trend: "up",
        icon: PiStudentBold,
        color: "bg-linear-to-r from-purple-500 to-pink-500",
        bgColor: "bg-emerald-50 dark:bg-emerald-400",
        textColor: "text-emerald-600 dark:text-emerald-100"
    },
     {
        title: "Total des admis",
        value: "1,564",
        change: "+17.5%",
        trend: "up",
        icon: IoIosSchool,
        color: "bg-linear-to-r from-violet-500 to-fuchsia-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400"
    },
     {
        title: "Reussite en Litterature",
        value: "124,564",
        change: "+2.5%",
        trend: "up",
        icon: TbCircleDashedLetterA,
        color: "bg-linear-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%",
        bgColor: "bg-purple-50 dark:bg-purple-400",
        textColor: "text-purple-600 dark:text-purple-100"
    },
     {
        title: "Reussite en science",
        value: "30",
        change: "-2.5%",
        trend: "Down",
        icon: GiMaterialsScience,
        color: "bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500",
        bgColor: "bg-orange-50 dark:bg-orange-400",
        textColor: "text-orange-600 dark:text-orange-100"
    }
]
export const MenuItemDirecteur : SidebarProps[] =[
    {
        id:1,
        icon:MdDashboard,
        label:'Dashboard',
        path:"/Directeur"
    },
    {
        id:2,
        icon:FaList,
        label:'Listes',
        count:2,
        path: "/liste"

    },
    {
        id:3,
        icon:TiUserAdd,
        label:'Inscriptions',
        count:2,
        path: "/register"

    },
    {
        id:4,
        icon:FcStatistics,
        label: 'Statistique',
        active:true,
        path:"/statDirecteur"
    },
    {
        id:5,
        icon:IoMdAddCircle,
        label:" Bullettin",
        path:"/bulletin"
    },
    {
        id:6,
        icon:IoCalendarNumber,
        label:"Emploi du temps",
        path:"/emploi-du-temps"
    },
    {
        id:7,
        icon:FaMessage,
        label:"Message",
        path:"/Directeur/message"
    },
    {
        id:8,
        icon:IoSettings,
        label: 'Parametres',
        path:"/general"
    },
    {
        id:9,
        icon:IoLogOut,
        label: 'Deconnexion',
        action:"logout"
    },
]
export const MenuItemParent : SidebarProps[] =[
    {
        id:1,
        icon:MdDashboard,
        label:'Dashboard',
        path:"/Parent"
    },
    {
        id:2,
        icon:MdNote,
        label:'Notes',
        count:2,
        path: "/note"

    },
    {
        id:3,
        icon:FcStatistics,
        label: 'Statistique',
        active:true,
        path:"/statParent"
    },
    {
        id:4,
        icon:IoMdAddCircle,
        label:"Bulletin",
        path:"/Parent/Bulletin"
    },
    {
        id:5,
        icon:FaMessage,
        label:"Message",
        path:"/Parent/message"
    },
    {
        id:6,
        icon:IoSettings,
        label: 'Parametres',
        path:"/general"
    },
    {
        id:7,
        icon:IoLogOut,
        label: 'Deconnexion',
        action:"logout"
    },
]
export const MenuItemEnseignant : SidebarProps[] =[
    {
        id:1,
        icon:MdDashboard,
        label:'Dashboard',
        path:"/Enseignant"
    },
    {
        id:2,
        icon:PiStudentBold,
        label:'Absence',
        path: "/absence"

    },
    {
        id:3,
        icon:PiStudentBold,
        label: 'Retard',
        path:"/retard"
    },
    {
        id:4,
        icon:FaHistory,
        label:"Historique",
        path:"/historique"
    },
    {
        id:5,
        icon:PiExamFill,
        label:"Devoirs",
        path:"/fichier-devoir"
    },
    {
        id:6,
        icon:FaMessage,
        label:"Message",
        count:2,
        path:"/Enseignant/message"
    },
    {
        id:7,
        icon:FcStatistics,
        label: 'Statistiques',
        active:true,
        path:"/statEns"
    },
    {
        id:8,
        icon:FaList,
        label: 'Liste',
        path:"/list"
    },
    {
        id:9,
        icon:IoSettings,
        label: 'Parametre',
        path:"/general"
    },
    {
        id:10,
        icon:IoLogOut,
        label: 'Deconnexion',
        action:"logout"
    },
]
export const data : Donne[] = [
    { 
        Class: "6eme", 
        Admis: 72, 
        echec: 22 
    },
    { 
        Class: "5eme", 
        Admis: 35, 
        echec: 18 
    },
    { 
        Class: "4eme", 
        Admis: 200, 
        echec: 100 
    },
    { 
        Class: "3eme A", 
        Admis: 256, 
        echec: 35 
    },
    { 
        Class: "3eme B", 
        Admis: 400, 
        echec: 35 
    },
    { 
        Class: "2nde C", 
        Admis: 12, 
        echec: 35 
    },
    { 
        Class: "2nd A", 
        Admis: 69, 
        echec: 35 
    },
    { 
        Class: "1ere A", 
        Admis: 125, 
        echec: 210 
    },
    { 
        Class: "1ere D", 
        Admis: 45, 
        echec: 35 
    }, 
    { 
        Class: "Tle D", 
        Admis: 400, 
        echec: 35 
    }, 
    { 
        Class: "Tle A", 
        Admis: 63, 
        echec: 70 
    },
    {
        Class: "Electricite",
        Admis:200,
        echec:122
    } 
  ]
export const dataT : Donne[] = [
    { 
        Class: "2nde C", 
        Admis: 12, 
        echec: 35 
    },
    { 
        Class: "2nd A", 
        Admis: 69, 
        echec: 35 
    },
    { 
        Class: "1ere A", 
        Admis: 125, 
        echec: 210 
    },
    { 
        Class: "1ere D", 
        Admis: 45, 
        echec: 35 
    }, 
    { 
        Class: "Tle D", 
        Admis: 400, 
        echec: 35 
    }, 
    { 
        Class: "Tle A", 
        Admis: 63, 
        echec: 70 
    },
    {
        Class: "Electricite",
        Admis:200,
        echec:122
    } 
  ]
export const dataS : Donne[] = [
    { 
        Class: "2nde C", 
        Admis: 12, 
        echec: 35 
    },
    { 
        Class: "2nd A", 
        Admis: 69, 
        echec: 35 
    },
  ]
export const Moyen : Moyennes [] = [
    {
        nom: "Francais", 
        value: 869, 
        color: "#3b82f6"
    },
    {
        nom: "EPS", 
        value: 523, 
        color: "#8b5cf6"
    },
    {
        nom: "Histoire_Geographie", 
        value: 512, 
        color: "#10b981"},
    {
        nom: "other", 
        value: 100, 
        color: "#f59e0b"
    },
]
export const MoyenS : Moyennes [] = [
    {
        nom: "Francais", 
        value: 869, 
        color: "#3b82f6"
    },
    {
        nom: "EPS", 
        value: 523, 
        color: "#8b5cf6"
    },
    {
        nom: "Histoire_Geographie", 
        value: 512, 
        color: "#10b981"},
    {
        nom: "other", 
        value: 100, 
        color: "#f59e0b"
    },
]
export const MoyenT : Moyennes [] = [
    {
        nom: "Francais", 
        value: 869, 
        color: "#3b82f6"
    },
    {
        nom: "Histoire_Geographie", 
        value: 512, 
        color: "#10b981"
    }
]
export const recentBest :Best[] = [
    {
        id: "#4575",
        Nom: "Yameogo Barakissa",
        Classe: "6eme",
        Moyenne: 18.23,
        Honneur: "Accorde",
        Trimestre: "Premier"
    },
    {
        id: "#4575",
        Nom: "Orokiatou Sankara",
        Classe: "5eme",
        Moyenne: 19.23,
        Honneur: "Refuse",
        Trimestre: "Premier"
    },
    {
        id: "#4575",
        Nom: "Soro Sayouba",
        Classe: "4eme",
        Moyenne: 17.23,
        Honneur: "Accorde",
        Trimestre: "Premier"
    },
    {
        id: "#4575",
        Nom: "Derme Mathieu",
        Classe: "2nde",
        Moyenne: 15.23,
        Honneur: "Accorde",
        Trimestre: "Premier"
    }
]
export const BadStudent : Bad[] = [
  {
    name: "Emmanuel Macron",
    Moyenne: 5.30,
    Classe: "5eme",
    trend: "up",
    change: "+2.5%"
  },
  {
    name: "Jordan Bardella",
    Moyenne: 7.45,
    Classe: "6eme",
    trend: "down",
    change: "-2.5%"
  },
  {
    name: "Blaise Compaore",
    Moyenne: 9.30,
    Classe: "4eme",
    trend: "up",
    change: "+2.5%"
  },
  {
    name: "Bala Sakande",
    Moyenne: 6.12,
    Classe: "2nde",
    trend: "down",
    change: "-1.7%"
  }
]
export const activity: Active[] =[
        {
            id: 1,
            type:"User",
            icon: MdEmojiFoodBeverage,
            title: "Cantine",
            description: "Organiser la cantine",
            time: "12h",
            color: "text-blue-500",
            bgColor: "bg-blue-100 dark:bg-blue-900"
        },
        {
            id: 2,
            type:"Sport",
            icon: MdDirectionsRun,
            title: "Activite Sportive",
            description: "Activite",
            time: "7h-10h",
            color: "text-emerald-500",
            bgColor: "bg-emerald-100 dark:bg-emerald-900"
        },
        {
            id: 3,
            type:"Reunion",
            icon: BsPeopleFill,
            title: "Reunion des parents d'eleves",
            description: "for $1.23",
            time: "12 minute ago",
            color: "text-purple-500",
            bgColor: "bg-purple-100 dark:bg-purple-900"
        },
        {
            id: 4,
            type:"Conseil",
            icon: BsPeopleFill,
            title: "Conseil de discipline",
            description: "Conseil de discipline en marche",
            time: "6 hours ago",
            color: "text-orange-500",
            bgColor: "bg-orange-100 dark:bg-orange-900"
        },
        {
            id: 5,
            type:"Cloture",
            icon: LuPartyPopper,
            title: "Low stok alert",
            description: "Iphone 15 pro",
            time: "35 minutes ago",
            color: "text-red-500",
            bgColor: "bg-red-100 dark:bg-red-900"
        }
    ]
export const Parames: genere[] = [
    {
        id:1,
        title:"Generale",
        icon:IoMdSettings,
        path:"/general"
    },
    {
        id:2,
        title:"Langues",
        icon:HiOutlineLanguage,
        path:"/langue"
    },
    {
        id:3,
        title:"Profils",
        icon:CgProfile,
        path:"/profile"
    },
    {
        id:4,
        title:"Confidentialite",
        icon:FaLock,
        path:"/confidentialite"
    },
    {
        id:5,
        title:"Telechargement",
        icon:MdDownload,
        path:"/telechargement"
    }
]


export const classe :Classes[] = [
    {classe:"6eme"},{classe:"5eme"},{classe:"4eme"},{classe:"3eme"},
]
export const TimeLine = [
    {Temps:"55"},{Temps:"10"},{Temps:"20"},{Temps:"8h-10h"},{Temps:"9h-10h"},{Temps:"9h-11h"},{Temps:"10h-11h"},{Temps:"10h-12h"},{Temps:"11h-12h"},{Temps:"14h-16h"}
]