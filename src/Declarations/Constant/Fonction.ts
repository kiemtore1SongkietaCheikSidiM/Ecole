import { URL } from "./constant";
import type { ChatMessage, Contacttype, Usertype } from "../Types/typage";
import api from "../Api";




export const accessToken = localStorage.getItem("access_token")

export function Nombre_aleatoire(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}
export function Mot_de_passe_aleatoire(length:number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@&?^%$#!";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
export const Identifiant_Enseignant = 'ITE'
export const Identifiant_Parent = 'ITP'

export const ObtenirList = async (setListe:React.Dispatch<React.SetStateAction<any[]>>,setDonnees:React.Dispatch<React.SetStateAction<any[]>>,classe:string)=>{
           try {
            const res = await api.get(`${URL}/api/classes/${classe}`)
            const data = res.data.eleves
            setListe(data)
           } catch (error) {
            console.error(error)
           }
           try {
            const resp = await api.get(`${URL}/api/enseignant/classes/`)
                setDonnees(resp.data.classes)
                console.log(resp.data.classes)
            } catch (error) {
                console.log(error)
            }
        }
export const sendAbsenceList = async (items: any[]) => {
  if (!items.length) return;

  await api.post(
    `${URL}/api/absences/`,
    { 
      absences: items 
    }
  );
};

export const sendMultipleFiles = async (files: File[], endpoint: string, fieldName = "files") => {
  if (!files.length) return;

  const formData = new FormData();

  files.forEach((file) => {
    formData.append(fieldName, file, file.name);
  });

  await api.post(`${URL}${endpoint}`, formData)
}

export const sendRetardList = async (items: any[]) => {
  if (!items.length) return;

  await api.post(
    `${URL}/api/retards/`,
    { 
      retards: items 
    },
    { 
      headers: {
      "Content-Type": "application/json",
    },
   }
  );
}
export const fetchAbsenceHistory = async () => {
  try {
    const response = await api.get(`${URL}/api/absences/`);
    return response.data?.results ?? response.data ?? [];
  } catch (error) {
    console.error("Erreur historique absences :", error);
    return [];
  }
};

export const fetchRetardHistory = async () => {
  try {
    const response = await api.get(`${URL}/api/retards/`);
    return response.data?.results ?? response.data ?? [];
  } catch (error) {
    console.error("Erreur historique retards :", error);
    return [];
  }
};

export const fetchDevoirHistory = async () => {
  const endpoints = [
    `${URL}/api/documents/devoirs/`,
    `${URL}/api/devoirs/`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      return response.data?.results ?? response.data ?? [];
    } catch (error) {
      console.warn(`Endpoint de devoirs indisponible: ${endpoint}`, error);
    }
  }

  return [];
};


export const fetchHistoryData = async () => {
  const [retards, absences, devoirs] = await Promise.all([
    fetchRetardHistory(),
    fetchAbsenceHistory(),
    fetchDevoirHistory(),
  ]);

  return {
    retards,
    absences,
    devoirs,
  };
};

export const fetchParentChildrenNotes = async () => {
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") ?? "null") : null;
  const parentId = user?.id ?? user?.parent_id ?? user?.parentId ?? null;
  const endpoints = [];

  if (parentId) {
    endpoints.push(`${URL}/api/parent/notes/?parent_id=${parentId}`);
    endpoints.push(`${URL}/api/parents/${parentId}/notes/`);
    endpoints.push(`${URL}/api/notes/parent/?parent_id=${parentId}`);
  }

  endpoints.push(`${URL}/api/notes/parent/`);
  endpoints.push(`${URL}/api/parent/notes/`);
  endpoints.push(`${URL}/api/parents/notes/`);

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);

      const data = response.data;
      const payload = data?.results ?? data?.children ?? data?.eleves ?? data?.notes ?? data;

      if (Array.isArray(payload)) {
        return payload;
      }

      if (payload && typeof payload === "object") {
        if (Array.isArray(payload.children)) return payload.children;
        if (Array.isArray(payload.eleves)) return payload.eleves;
        if (Array.isArray(payload.notes)) return payload.notes;
      }
    } catch (error) {
      console.warn(`Endpoint parent notes indisponible: ${endpoint}`, error);
    }
  }

  return [];
};

export const getCurrentUser = () => {
  if (typeof window === "undefined") return null

  try {
    return JSON.parse(localStorage.getItem("user") ?? "null")
  } catch {
    return null
  }
}
export const normalizeContacts = (payload: any): Contacttype[] => {
  if (!payload) return []

  if (Array.isArray(payload)) return payload.filter(Boolean)

  if (typeof payload === "object") {
    const collections = [payload.contacts, payload.results, payload.data, payload.users, payload.amis]
    for (const collection of collections) {
      if (Array.isArray(collection)) return collection.filter(Boolean)
    }

    return Object.values(payload).filter(
      (value) => value && typeof value === "object" && ("nom" in value || "prenom" in value || "username" in value || "id" in value)
    ) as Contacttype[]
  }

  return []
}
export const normalizeMessages = (payload: any): ChatMessage[] => {
  if (!payload) return []

  if (Array.isArray(payload)) return payload.filter(Boolean)

  if (typeof payload === "object") {
    const collections = [payload.messages, payload.results, payload.data, payload.items, payload.conversations]
    for (const collection of collections) {
      if (Array.isArray(collection)) return collection.filter(Boolean)
    }

    return Object.values(payload).filter(
      (value) => value && typeof value === "object" && ("contenu" in value || "content" in value || "message" in value || "audio" in value || "voice" in value)
    ) as ChatMessage[]
  }

  return []
}

export const resolveMediaUrl = (value: string | Blob | undefined): string | null => {
  if (!value) return null

  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value) || /^blob:/i.test(value) || /^data:/i.test(value)) {
      return value
    }
    if (value.startsWith("/")) return `${URL}${value}`
    return value
  }

  return URL.createObjectURL(value)
}
export const getMessageDate = (message: ChatMessage): number => {
  const candidates = [message.created_at, message.date, message.time, message.timestamp]
  const dateString = candidates.find(Boolean) ?? new Date().toISOString()
  const parsed = new Date(dateString)
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}
export const formatFrenchDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Aujourd'hui"
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}
export const formatHour = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}
export const getUserDisplayName = (user?: { nom?: string; prenom?: string; username?: string } | null) => {
  if (!user) return "Inconnu"
  const fullName = `${user.nom ?? ""} ${user.prenom ?? ""}`.trim()
  return fullName || user.username || "Inconnu"
}
export const MessageCount = async (notificationId: number,setMessageCount:React.Dispatch<React.SetStateAction<number>>) => {
    try {
      const response = await api.post(
        `${URL}/api/notifications/${notificationId}/click/`,
        {},
      );
      setMessageCount(response.data.message_count);
    } catch (error) {}
  };
  export const userInfo = async (setUser:React.Dispatch<React.SetStateAction<Usertype | undefined>>) => {
      try {
        const resp = await api.get("api/auth/me/");
        setUser(resp.data);
      } catch (error: any) {
        console.log(error.response?.data);
      }
    };