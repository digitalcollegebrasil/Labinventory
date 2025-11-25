import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Circle } from 'lucide-react';

import { User } from '../types';

interface UserStatusSidebarProps {
    onUserClick?: (user: User) => void;
}

export function UserStatusSidebar({ onUserClick }: UserStatusSidebarProps) {
    const users = useLiveQuery(() => db.users.toArray()) || [];

    const onlineUsers = users.filter(u => u.status === 'online' || !u.status); // Default to online if undefined
    const busyUsers = users.filter(u => u.status === 'busy');
    const offlineUsers = users.filter(u => u.status === 'offline');

    const UserItem = ({ user }: { user: User }) => (
        <button
            onClick={() => onUserClick?.(user)}
            className="w-full flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded-lg transition-colors text-left"
        >
            <div className="relative">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{user.name.charAt(0)}</span>
                    )}
                </div>
                <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-gray-800 ${user.status === 'busy' ? 'bg-red-500' :
                    user.status === 'offline' ? 'bg-gray-500' :
                        'bg-green-500'
                    }`}></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300 truncate w-24">{user.name}</span>
        </button>
    );

    return (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Usuários
                </h3>

                <div className="space-y-4">
                    {/* Online */}
                    {onlineUsers.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                                <span>Online</span>
                                <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-200">{onlineUsers.length}</span>
                            </p>
                            <div className="space-y-1">
                                {onlineUsers.map(user => <UserItem key={user.id} user={user as User} />)}
                            </div>
                        </div>
                    )}

                    {/* Busy */}
                    {busyUsers.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                                <span>Não Perturbe</span>
                                <span className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-200">{busyUsers.length}</span>
                            </p>
                            <div className="space-y-1">
                                {busyUsers.map(user => <UserItem key={user.id} user={user as User} />)}
                            </div>
                        </div>
                    )}

                    {/* Offline */}
                    {offlineUsers.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-between">
                                <span>Offline</span>
                                <span className="bg-gray-100 text-gray-800 text-[10px] px-1.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">{offlineUsers.length}</span>
                            </p>
                            <div className="space-y-1">
                                {offlineUsers.map(user => <UserItem key={user.id} user={user as User} />)}
                            </div>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
}
