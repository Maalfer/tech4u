import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notif) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { ...notif, id }]);

        const duration = notif.type === 'achievement_unlocked' ? 8000 : 5000;
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host.includes('localhost') ? 'localhost:8000' : window.location.host;
        const wsUrl = `${protocol}//${host}/ws/${user.id}`;

        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                addNotification(data);
            } catch (e) {
                console.error("Error parsing WS message:", e);
            }
        };

        ws.onerror = (err) => console.error("WS Error:", err);
        ws.onclose = () => console.log("WS Closed");

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }, [user?.id, addNotification]);

    const contextValue = useMemo(() => ({
        notifications,
        addNotification,
        removeNotification
    }), [notifications, addNotification, removeNotification]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            {/* Toast Container */}
            <div className="toast-container">
                {notifications.map((n) => (
                    <div key={n.id} className={`toast-card ${n.type}`}>
                        <div className="toast-icon">{n.icon || '🔔'}</div>
                        <div className="toast-content">
                            <h4>{n.title}</h4>
                            <p>{n.description}</p>
                            {n.xp_bonus && <span className="xp-tag">+{n.xp_bonus} XP</span>}
                        </div>
                        <button className="toast-close" onClick={() => removeNotification(n.id)}>&times;</button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
