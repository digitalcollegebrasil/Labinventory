import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { User, Message } from '../types';
import { X, Send, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ChatWindowProps {
    targetUser: User;
    onClose: () => void;
}

export function ChatWindow({ targetUser, onClose }: ChatWindowProps) {
    const { user: currentUser } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);

    const fetchMessages = async () => {
        if (!currentUser?.id || !targetUser.id) return;
        try {
            const allMessages = await api.getMessages();
            const filtered = allMessages.filter(m =>
                (m.senderId === currentUser.id.toString() && m.receiverId === targetUser.id.toString()) ||
                (m.senderId === targetUser.id.toString() && m.receiverId === currentUser.id.toString())
            );
            const sorted = filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            setMessages(sorted);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [currentUser?.id, targetUser.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser?.id) return;

        await api.createMessage({
            senderId: currentUser.id.toString(),
            receiverId: targetUser.id.toString(),
            content: newMessage,
            timestamp: new Date().toISOString(),
            read: false
        });
        fetchMessages();

        setNewMessage('');
    };

    if (!currentUser) return null;

    return (
        <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-t-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-in slide-in-from-bottom-5 h-[500px]">
            {/* Header */}
            <div className="p-3 bg-indigo-600 text-white rounded-t-xl flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center overflow-hidden border border-indigo-400">
                            {targetUser.avatar ? (
                                <img src={targetUser.avatar} alt={targetUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-xs">{targetUser.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-indigo-600 ${targetUser.status === 'busy' ? 'bg-red-400' :
                            targetUser.status === 'offline' ? 'bg-gray-400' :
                                'bg-green-400'
                            }`}></div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">{targetUser.name}</h3>
                        <p className="text-xs text-indigo-200 capitalize">{targetUser.status || 'Offline'}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-indigo-700 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {messages?.map((msg) => {
                    const isMe = msg.senderId === currentUser.id.toString();
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-600'
                                }`}>
                                <p>{msg.content}</p>
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-full focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900 dark:text-white"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
