import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { trpc } from "@/utils/trpc";
import { toast, Toaster  } from "react-hot-toast";

interface NotificationItem {
    userId: string;
    type: string;
    message: string;
    title: string;
    id: string;
    createdAt: string;
    read: boolean;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

// (parameter) notification: {
//     userId: string;
//     type: string;
//     message: string | null;
//     title: string | null;
//     id: string;
//     createdAt: string;
//     user?: {
//         id: string;
//         email: string;
//         name: string;
//     } | undefined;
// }

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllAsRead: () => void;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAllAsRead: () => { },
  setNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState(0);
  const hasShownRef = useRef(false);
  
  const notificationsRef = useRef<NotificationItem[]>(notifications);
  
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("@user_id");
    if (stored) setUserId(stored);
  }, []);

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();

  const notificationsQuery = trpc.notifications.list.useQuery(
    { userId },
    {
      enabled: !!userId,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    }
  );

  const toastMap = useMemo(
    () =>
      ({
        bonus: (msg: string) =>
          toast.success(`💎 ${msg}`, {
            style: { background: "#FFD700", color: "#000" },
          }),
        info: (msg: string) => toast(msg, { icon: "ℹ️" }),
        success: (msg: string) => toast.success(msg),
        warning: (msg: string) =>
          toast(msg, {
            icon: "⚠️",
            style: { background: "#FFA500", color: "#fff" },
          }),
        error: (msg: string) => toast.error(msg),
      }) as Record<NotificationItem["type"], (msg: string) => void>,
    [] 
  );

  useEffect(() => {
    if (!notificationsQuery.data || hasShownRef.current) return;

    const unread = notificationsQuery.data.filter((n) => !n.read);
    if (unread.length > 0) {
      unread.forEach((n) => {
        const showToast = toastMap[n.type];
        showToast(`${n.title ?? "Notification"}: ${n.message ?? ""}`);
      });

      const ids = unread.map((n) => n.id);
      markAsReadMutation.mutate({ ids });
    }

    setNotifications(notificationsQuery.data);
    setUnreadCount(notificationsQuery.data.filter((n) => !n.read).length);
    hasShownRef.current = true;
  }, [notificationsQuery.data, toastMap, markAsReadMutation]);

  trpc.notifications.subscribeToUser.useSubscription(
    { userId },
    {
      enabled: !!userId,
      onData: (notification) => {
        setUnreadCount((prev) => prev + 1);

        const showToast = toastMap[notification.type];
        showToast(`${notification.title ?? "Notification"}: ${notification.message ?? ""}`);

        if (
          typeof window !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification(notification.title ?? "New Notification", {
            body: notification.message ?? "No message",
            icon: "/notification-icon.png",
            tag: notification.id,
          });
        }

        markAsReadMutation.mutate({ ids: [notification.id] });
      },
      onError: (err) => console.error("❌ Subscription error:", err),
    }
  );

  useEffect(() => {
    if (typeof window !== "undefined" && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    const currentNotifications = notificationsRef.current;
    const unreadIds = currentNotifications.filter((n) => !n.read).map((n) => n.id);
    
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate({ ids: unreadIds });
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [markAsReadMutation]); 

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllAsRead, setNotifications }}
    >
       <Toaster position="top-right" />
      {children}
    </NotificationContext.Provider>
  );
}