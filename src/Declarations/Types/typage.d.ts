export type Contacttype = {
  id: number | string
  nom?: string
  prenom?: string
  username?: string
  email?: string
  image?: string
  avatar?: string
  photo?: string
}

type ChatMessage = {
  id?: number | string
  contenu?: string
  content?: string
  message?: string
  sender_id?: number | string
  auteur_id?: number | string
  emetteur_id?: number | string
  destinataire_id?: number | string
  created_at?: string
  date?: string
  heure?: string
  time?: string
  timestamp?: string
  audio?: string | Blob
  voice?: string | Blob
  audio_url?: string
  voice_url?: string
  file?: string
  media?: string
  type?: string
  sender?: {
    id?: number | string
    nom?: string
    prenom?: string
    username?: string
  }
  recipient?: {
    id?: number | string
    nom?: string
    prenom?: string
    username?: string
  }
}

export type BulletinRecord = {
  id?: number | string;
  name?: string;
  filename?: string;
  url?: string;
  file?: string;
  path?: string;
  href?: string;
  document?: string;
  fichier?: string;
  type?: string;
  mime_type?: string;
  content_type?: string;
  created_at?: string;
};

export type TrimesterKey = "Premier trimestre" | "Deuxieme Trimestre" | "Troisieme trimestre"
export type classetype = {
  classe:string
  matiere:string
}
export type EleveType = {
  Nom:string
  Prenom:string
  Classe:string
}
export type Usertype = {
  role:string
  nom:string
  prenom:string
  email:string
  telephone:string
}