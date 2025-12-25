import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const initializeSocket = () => {
            const token = localStorage.getItem('token');
            if (token) {
                // If socket already exists and connected, do nothing? 
                // Better to close old and open new to be safe with new token
                setSocket(prev => {
                    if (prev) prev.close();
                    return io('http://localhost:5000', {
                        auth: { token },
                        query: { token }
                    });
                });
            } else {
                setSocket(prev => {
                    if (prev) prev.close();
                    return null;
                });
            }
        };

        // Initial load
        initializeSocket();

        // Listen for login/logout events
        window.addEventListener('auth-change', initializeSocket);

        return () => {
            window.removeEventListener('auth-change', initializeSocket);
            setSocket(prev => {
                if (prev) prev.close();
                return null;
            });
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
