import React, { useEffect, useState } from "react";
import axios from "axios";

const baseUrl="http:localhost:7000"
const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${baseUrl}/notifications/${localStorage.getItem("userId")}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
                });
                setNotifications(response.data.notifications);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div>
            <h3 className="text-xl font-bold">Notifications</h3>
            <ul>
                {notifications.map((notification) => (
                    <li key={notification._id} className="mb-4">
                        <p>{notification.message}</p>
                        <p className="text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;
