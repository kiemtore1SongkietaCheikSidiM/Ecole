import { useEffect, useRef, useState } from "react";
import {
  URL,
  type Panel,
} from "../../Declarations/Constant/constant";
import { FaBell, FaSchool } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { accessToken, MessageCount } from "../../Declarations/Constant/Fonction";
import api from "../../Declarations/Api";
import type { NotificationItem, NotificationsResponse } from "../../Declarations/Types/Interface";
import { useRealtime } from "../../Declarations/Realtime";

const notificationItems = (data: unknown): NotificationItem[] => {
  if (Array.isArray(data)) {
    return data as NotificationItem[];
  }

  if (data && typeof data === "object") {
    const payload = data as Record<string, unknown>;
    const collection = payload.notifications ?? payload.results ?? payload.data ?? payload.items;

    return Array.isArray(collection) ? collection as NotificationItem[] : [];
  }

  return [];
};

const Notification = () => {
  const [activepanel, setActivePanel] = useState<Panel>(null);
  const containerref = useRef<HTMLDivElement>(null);
  const [absence,setAbsence] = useState<NotificationItem[]>([])
  const [retard,setRetard] = useState<NotificationItem[]>([])
  const [devoir,setDevoir] = useState<NotificationItem[]>([])
  const [evenement,setEvenement] = useState<NotificationItem[]>([])
  const [messageNotifications, setMessageNotifications] = useState<
    NotificationItem[]
  >([]);

  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const { lastNotification } = useRealtime();

  const handlepanel = (panel: Panel) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };
  const clickNotification = async (notificationId: number) => {
    try {
      const response = await api.post(
        `/api/notifications/${notificationId}/click/`,
        {},
      );

      setNotificationCount(response.data.unread_count);
    } catch (error: any) {
      console.error(error.response?.data || error.message);
    }
  };
  
  useEffect(() => {
    const loadMessage = async () => {
      try {
        const response = await api.get(
          `/api/notifications/?type=MESSAGE`
        );
        setMessageNotifications(notificationItems(response.data));
        setMessageCount(
          typeof response.data?.unread_count === "number"
            ? response.data.unread_count
            : 0,
        );
      } catch (error: any) {
        console.log(error.response?.data);
      }
    };
    const loadSchool = async (types:string,setValue:React.Dispatch<React.SetStateAction<NotificationItem[]>>) => {
      try {
        const response = await api.get(
          `/api/notifications/?type=${types}`,
        );
        setValue(notificationItems(response.data));
      } catch (error: any) {
        console.log(error.response?.data);
      }
    };
    const loadNotifications = async () => {
      try {
        const response = await api.get<NotificationsResponse>(
          `${URL}/api/notifications/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const data = response.data;
        setMessageNotifications(notificationItems(data.message_notifications));
        setNotificationCount(data.unread_count);
        setMessageCount(data.message_count);
      } catch (error: any) {
        console.error(error.response?.data || error.message);
      }
    };

    if (accessToken) {
      loadNotifications();
      loadMessage();
      loadSchool("ABSENCE",setAbsence)
      loadSchool("RETARD",setRetard)
      loadSchool("DEVOIR",setDevoir)
      loadSchool("EVENEMENT",setEvenement)
    }
    const handclikOutside = (event: MouseEvent) => {
      if (
        containerref.current &&
        !containerref.current.contains(event.target as Node)
      ) {
        setActivePanel(null);
      }
    };
    document.addEventListener("mousedown", handclikOutside);
    return () => {
      document.removeEventListener("mousedown", handclikOutside);
    };
  }, [accessToken]);

  useEffect(() => {
    if (!lastNotification) return;

    const addOnce = (setValue: React.Dispatch<React.SetStateAction<NotificationItem[]>>) => {
      setValue((current) => current.some((item) => item.id === lastNotification.id)
        ? current
        : [lastNotification, ...current]);
    };

    if (lastNotification.type === "MESSAGE" || lastNotification.category === "MESSAGE") {
      addOnce(setMessageNotifications);
      setMessageCount((count) => count + 1);
      return;
    }

    setNotificationCount((count) => count + 1);
    switch (lastNotification.type) {
      case "ABSENCE":
        addOnce(setAbsence);
        break;
      case "RETARD":
        addOnce(setRetard);
        break;
      case "DEVOIR":
        addOnce(setDevoir);
        break;
      case "EVENEMENT":
        addOnce(setEvenement);
        break;
    }
  }, [lastNotification]);
  return (
    <div ref={containerref} className="relative z-100">
      <div className="flex space-x-3">
        <button
          onClick={() => handlepanel("Notification")}
          className="relative rounded-xl p-2.5 text-slate-700 transition-colors 
            hover:bg-slate-200 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
          aria-label="Notification"
          title="Notification"
        >
          <FaBell className="h-4 sm:w-5 sm:h-5 w-4" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {notificationCount}
          </span>
        </button>
        <button
          onClick={() => handlepanel("message")}
          className="relative rounded-xl p-2.5 text-slate-700 transition-colors 
            hover:bg-slate-200 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
          aria-label="Notification"
          title="Messages"
        >
          <FaMessage className="h-4 sm:w-5 sm:h-5 w-4" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {messageCount}
          </span>
        </button>
      </div>
      {activepanel && (
        <div
          className="z-999 absolute right-0 top-20 w-72 overflow-hidden rounded-md bg-slate-300 sm:w-96 animate-in fade-in
            slide-in-from-top-3
            duration-300
          "
        >
          {activepanel === "Notification" && (
            <section className="cursor-pointer">
              {absence.map((item) => (
                <button
                  className="p-4 bg-white hover:bg-slate-200 hover:rounded-lg backdrop-blur-md shadow-sm flex items-start space-x-3 w-full"
                  key={item.id}
                  onClick={() => clickNotification(item.id)}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200 hover:bg-white flex items-center justify-center">
                    <FaSchool />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-black">
                      {item.type}
                    </h2>
                    <span className="text-xs text-black/40">{item.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm">Votre enfants {item.nom_eleve}{" "}{item.prenom_eleve} est absent a ce jour a {item.heure}</p>
                </button>
              ))}
              {retard.map((item)=>(
                <button
                  className="p-4 bg-white hover:bg-slate-200 hover:rounded-lg backdrop-blur-md shadow-sm flex items-start space-x-3 w-full"
                  key={item.id}
                  onClick={() => clickNotification(item.id)}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200 hover:bg-white flex items-center justify-center">
                    <FaSchool />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-black">
                      {item.type}
                    </h2>
                    <span className="text-xs text-black/40">{item.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm">Votre enfants {item.nom_eleve}{" "}{item.prenom_eleve} est en retard a ce jour a {item.heure}</p>
                </button>
              ))}
              {devoir.map((item)=>(
                <button
                  className="p-4 bg-white hover:bg-slate-200 hover:rounded-lg backdrop-blur-md shadow-sm flex items-start space-x-3 w-full"
                  key={item.id}
                  onClick={() => clickNotification(item.id)}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200 hover:bg-white flex items-center justify-center">
                    <FaSchool />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-black">
                      {item.type}
                    </h2>
                    <span className="text-xs text-black/40">{item.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm">Votre enfants {item.nom_eleve}{" "}{item.prenom_eleve} est en retard a ce jour a {item.heure}</p>
                </button>
              ))}
              {evenement.map((item)=>(
                <button
                  className="p-4 bg-white hover:bg-slate-200 hover:rounded-lg backdrop-blur-md shadow-sm flex items-start space-x-3 w-full"
                  key={item.id}
                  onClick={() => clickNotification(item.id)}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200 hover:bg-white flex items-center justify-center">
                    <FaSchool />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-black">
                      {item.type}
                    </h2>
                    <span className="text-xs text-black/40">{item.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm">Votre enfants {item.nom_eleve}{" "}{item.prenom_eleve} est en retard a ce jour a {item.heure}</p>
                </button>
              ))}
            </section>

          )}
          {activepanel === "message" && (
            <section className="cursor-pointer">
              {messageNotifications.map((item) => (
                <button
                  onClick={() => MessageCount(item.id,setMessageCount)}
                  className="p-4 bg-white hover:bg-slate-200 hover:rounded-lg backdrop-blur-md shadow-sm flex items-start space-x-3 w-full"
                  key={item.id}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200 hover:bg-white flex items-center justify-center">
                    <FaMessage />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-black">
                      {item.type}
                    </h2>
                    <span className="text-xs text-black/40">{item.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm">Vous avez un nouveau message de {item.auteur} a {item.heure}</p>
                </button>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;