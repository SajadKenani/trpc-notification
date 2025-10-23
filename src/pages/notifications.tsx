import { trpc } from "@/lib/trpc"; 
import React, { useEffect, useState } from "react";
import styles from "./Navigation.module.css";
import { useNotifications } from "@/components/NotificationProvider";

// interface Account {
//   id: string;
//   name: string;
//   email: string;
// }

export default function Notifications() {
  const { notifications, unreadCount, markAllAsRead, setNotifications } = useNotifications();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("@user_id");
    if (stored) setUserId(stored);
  }, []);

  const { data: accounts = [], isLoading: accountsLoading } =
    trpc.account.getAccounts.useQuery();

  const notificationsQuery = trpc.notifications.list.useQuery(
    { userId },
    {
      enabled: !!userId,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    }
  );

  // --- Add notification mutation ---
  const addNotification = trpc.notifications.addNotification.useMutation({
    onSuccess: async (data) => {
      console.log("Notification added successfully!", data);
      const freshNotifications = await notificationsQuery.refetch();
      if (freshNotifications.data) {
        setNotifications(freshNotifications.data);
      }
    },
    onError: (error) => console.error(error),
  });

  const handleNotificationAddition = (accountId: string) => {
    const account = accounts?.find(a => a.id === accountId);
    addNotification.mutate({
      message: `Hello ${account?.name || 'User'}! This is a test notification.`,
      userId: accountId,
      title: "Test Notification",
      type: "success",
    });
  };

  const handleSwitchUser = (accountId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("@user_id", accountId);
      window.location.reload();
    }
  };

  return (
    <div className={styles.notificationsContainer}>
      {/* Notifications Section */}
      <div className={styles.notificationsWrapper}>
        <h1 className={styles.notificationsTitle}>
          🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
        </h1>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              padding: "8px 16px",
              background: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "16px"
            }}
          >
            Mark All as Read
          </button>
        )}

        {notifications.length === 0 ? (
          <p className={styles.notificationsEmpty}>No notifications yet.</p>
        ) : (
          <div className={styles.notificationsList}>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={styles.notificationItem}
                style={{
                  // backgroundColor: n.read ? "#f5f5f5" : "#e3f2fd",
                  borderLeft: n.read ? "none" : "4px solid #2196F3"
                }}
              >
                <p className={styles.notificationUser}>
                  <strong>{n.user?.name || `User #${n.userId}`}</strong>
                  {!n.read && <span style={{ marginLeft: "8px", color: "#2196F3" }}>● NEW</span>}
                </p>
                <p className={styles.notificationTitle}>
                  <strong>{n.title || "Notification"}</strong>
                </p>
                <p className={styles.notificationMessage}>{n.message || "No message"}</p>
                <p className={styles.notificationDate}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accounts Section */}
      <div className={styles.notificationsWrapper}>
        <h1 className={styles.notificationsTitle}>Accounts</h1>
        {accountsLoading ? (
          <p className={styles.notificationsEmpty}>Loading accounts...</p>
        ) : accounts.length === 0 ? (
          <p className={styles.notificationsEmpty}>No accounts found.</p>
        ) : (
          <div className={styles.notificationsList}>
            {accounts.map((account) => (
              <div
                key={account.id}
                className={styles.notificationItem}
                style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div onClick={() => handleNotificationAddition(account.id)} style={{ flex: 1 }}>
                  <p className={styles.notificationUser}>
                    <strong>{account.name}</strong>
                  </p>
                  <p className={styles.notificationMessage}>{account.email}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwitchUser(account.id);
                  }}
                  style={{
                    padding: "8px 12px",
                    background: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    marginLeft: "10px"
                  }}
                >
                  Switch User
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}