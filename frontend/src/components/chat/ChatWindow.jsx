import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';

const ChatWindow = ({ connectionId, recipientName, currentUserRole, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const socket = useSocket();
    const messagesEndRef = useRef(null);

    console.log("ChatWindow: Socket state:", socket ? "Connected" : "Null", socket?.id);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/chat/${connectionId}`, {
                    headers: { 'x-auth-token': token }
                });
                setMessages(res.data);
                setLoading(false);
                scrollToBottom();
            } catch (err) {
                console.error("Failed to fetch messages", err);
                setLoading(false);
            }
        };

        fetchMessages();
    }, [connectionId]);

    useEffect(() => {
        if (!socket) return;

        console.log("ChatWindow: Joining room", connectionId, "Role:", currentUserRole);
        socket.emit('join_room', connectionId);

        // Mark unread messages as read on join
        socket.emit('mark_read', { connectionId, role: currentUserRole });

        const handleReceiveMessage = (message) => {
            console.log("ChatWindow: Received message", message);
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
            // If I receive a message and chat is open, mark it as read immediately if it's not from me
            if (message.senderRole !== currentUserRole) {
                socket.emit('mark_read', { connectionId, role: currentUserRole });
            }
        };

        const handleMessagesRead = ({ readerRole }) => {
            // If the other person read my messages, update local state
            if (readerRole !== currentUserRole) {
                setMessages(prev => prev.map(msg => msg.senderRole === currentUserRole ? { ...msg, read: true } : msg));
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('messages_read', handleMessagesRead);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('messages_read', handleMessagesRead);
        };
    }, [socket, connectionId, currentUserRole]);

    // Scroll on initial load/new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            connectionId,
            senderRole: currentUserRole,
            message: newMessage,
        };

        await socket.emit('send_message', messageData);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800">
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <MessageSquare size={20} />
                    <h3 className="font-bold">Chat with {recipientName}</h3>
                    <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} title={socket?.connected ? 'Connected' : 'Disconnected'}></div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950">
                {loading ? (
                    <p className="text-center text-gray-500 text-sm">Loading history...</p>
                ) : messages.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm mt-10">No messages yet. Say hello!</p>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderRole === currentUserRole;
                        return (
                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-bl-none'
                                        }`}
                                >
                                    <p>{msg.message}</p>
                                    <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        <span className="text-[10px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {isMe && (
                                            msg.read ? <CheckCheck size={12} /> : <Check size={12} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-2 shrink-0">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
