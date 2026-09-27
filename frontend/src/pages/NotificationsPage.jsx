import React, { useEffect, useState } from "react";
import { fetchNotifications, markNotificationRead } from "../lib/api";
const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id || user?._id;
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchNotifications(userId);
                setNotifications(Array.isArray(data) ? data : []);
            }
            catch (err) {
                console.error("Failed to load notifications:", err);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [userId]);
    const handleMarkRead = async (id) => {
        try {
            const updated = await markNotificationRead(id);
            setNotifications((prev) => prev.map((n) => ((n.id || n._id) === id ? updated : n)));
        }
        catch (err) {
            console.error("Failed to mark read:", err);
        }
    };
    if (loading)
        return <div className="min-h-screen bg-base-100 flex items-center justify-center text-base-content/70">Loading notifications...</div>;
    return (<div className="min-h-screen bg-base-100 text-base-content p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-base-200/60 border border-base-300 rounded-3xl shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold text-base-content mb-6 text-center tracking-tight">
          Notifications
        </h1>
        {notifications.length === 0 ? (<p className="text-base-content/60 text-center py-8">No notifications yet.</p>) : (<ul className="space-y-4">
            {Array.isArray(notifications) &&
                notifications.map((n) => (<li key={n._id} className={`p-4 rounded-2xl border transition-all ${n.isRead
                        ? "bg-base-100/70 border-base-300/60 opacity-80"
                        : "bg-base-100 border-primary/40 shadow-sm"}`}>
                  <p className="text-primary font-bold">
                    {n.vendor?.hotelName || "NearMeet Venue"}
                  </p>
                  <p className="text-base-content mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-base-content/50 mt-2 font-medium">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                  {!n.isRead && (<button onClick={() => handleMarkRead(n._id)} className="mt-2 text-xs font-semibold text-primary hover:underline block">
                      Mark as read
                    </button>)}
                </li>))}
          </ul>)}
      </div>
    </div>);
};
export default NotificationPage;
