import { useEffect, useState } from "react";
import { apiRequest, getApiErrorMessage } from "../api.js";

function getNotifications(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/notifications")
      .then((response) => {
        if (!active) return;
        setNotifications(getNotifications(response));
        setStatus("ready");
      })
      .catch((requestError) => {
        if (!active) return;
        setError(getApiErrorMessage(requestError));
        setStatus("error");
      });

    return () => { active = false; };
  }, []);

  async function markAsRead(notificationId) {
    setError("");
    try {
      await apiRequest(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PATCH" });
      setNotifications((currentNotifications) => currentNotifications.map((notification) => (
        notification.id === notificationId ? { ...notification, is_read: true } : notification
      )));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  async function markAllAsRead() {
    setError("");
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      setNotifications((currentNotifications) => currentNotifications.map((notification) => ({
        ...notification,
        is_read: true,
      })));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  const unreadCount = notifications.filter((notification) => notification.is_read === false).length;

  return (
    <section className="data-panel" aria-label="Notifications">
      <div className="panel-heading">
        <h2>{unreadCount} unread</h2>
        <button type="button" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Mark all as read
        </button>
      </div>
      {error && <p className="inline-error" role="alert">{error}</p>}
      {status === "loading" && <p className="empty-state">Loading notifications...</p>}
      {status === "ready" && notifications.length === 0 && (
        <p className="empty-state">You are all caught up. New class updates will appear here.</p>
      )}
      {status === "ready" && notifications.length > 0 && (
        <ul className="data-list">
          {notifications.map((notification, index) => (
            <li key={notification.id ?? index}>
              <span className="list-marker" aria-hidden="true">{notification.is_read ? "" : "NEW"}</span>
              <span>
                <strong>{notification.title || notification.type || "Campus update"}</strong>
                <small>{notification.message || notification.created_at || "Open to view details"}</small>
              </span>
              {!notification.is_read && notification.id != null && (
                <button type="button" onClick={() => markAsRead(notification.id)}>
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default NotificationsPanel;