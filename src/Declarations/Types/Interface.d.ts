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