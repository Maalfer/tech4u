import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user) return;

        // Conectar WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host.includes('localhost') ? 'localhost:8000' : window.location.host}/ws/${user.id}`;

        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            addNotification(data);
        };

        ws.onerror = (err) => console.error("WS Error:", err);
        ws.onclose = () => console.log("WS Closed");

        return () => ws.close();
    }, [user]);

    const addNotification = (notif) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { ...notif, id }]);

        // Auto-remover después de 5-10 segundos dependiendo del tipo
        const duration = notif.type === 'achievement_unlocked' ? 8000 : 5000;
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notifications, removeNotification }}>
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

export const useNotifications = () => useContext(NotificationContext);
