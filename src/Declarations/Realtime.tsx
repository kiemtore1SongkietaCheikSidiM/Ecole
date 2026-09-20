import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ChatMessage } from "./Types/typage";
import type { NotificationItem } from "./Types/Interface";

type RealtimeEvent = {
  type?: string;
  event?: string;
  notification?: NotificationItem;
  message?: ChatMessage;
  data?: NotificationItem | ChatMessage;
};

type RealtimeContextValue = {
  lastNotification: NotificationItem | null;
  lastMessage: ChatMessage | null;
  connected: boolean;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  lastNotification: null,
  lastMessage: null,
  connected: false,
});

const websocketUrl = () => {
  const configuredUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (configuredUrl) return configuredUrl;

  const apiUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!apiUrl) return "";

  return `${apiUrl.replace(/^http/, "ws")}/ws/notifications/`;
};

const isMessageEvent = (event: RealtimeEvent, payload: NotificationItem | ChatMessage | undefined) => {
  const eventName = `${event.type ?? event.event ?? ""}`.toLowerCase();
  return eventName.includes("message") || Boolean(payload && ("contenu" in payload || "content" in payload));
};

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const [lastNotification, setLastNotification] = useState<NotificationItem | null>(null);
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let stopped = false;

    const connect = () => {
      const token = localStorage.getItem("access_token");
      const baseUrl = websocketUrl();
      if (!token || !baseUrl || stopped) return;

      const separator = baseUrl.includes("?") ? "&" : "?";
      socket = new WebSocket(`${baseUrl}${separator}token=${encodeURIComponent(token)}`);

      socket.onopen = () => setConnected(true);
      socket.onclose = () => {
        setConnected(false);
        if (!stopped) {
          reconnectTimer.current = window.setTimeout(connect, 3000);
        }
      };
      socket.onerror = () => setConnected(false);
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as RealtimeEvent;
          const eventData = payload.notification ?? payload.message ?? payload.data;
          if (!eventData) return;

          if (isMessageEvent(payload, eventData)) {
            setLastMessage(eventData as ChatMessage);
          } else {
            setLastNotification(eventData as NotificationItem);
          }
        } catch {
          console.warn("Événement WebSocket invalide");
        }
      };
    };

    connect();
    return () => {
      stopped = true;
      window.clearTimeout(reconnectTimer.current);
      socket?.close();
    };
  }, []);

  const value = useMemo(
    () => ({ lastNotification, lastMessage, connected }),
    [lastNotification, lastMessage, connected],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = () => useContext(RealtimeContext);