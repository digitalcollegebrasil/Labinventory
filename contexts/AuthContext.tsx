import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../db';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: 'online' | 'busy' | 'offline';
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password?: string) => Promise<void>;
    loginWithGoogle: (email: string) => Promise<void>;
    register: (name: string, email: string) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const storedUserId = localStorage.getItem('labmanager_user_id');
            if (storedUserId) {
                const dbUser = await db.users.get(Number(storedUserId));
                if (dbUser) {
                    setUser({
                        id: dbUser.id!.toString(),
                        name: dbUser.name,
                        email: dbUser.email,
                        avatar: dbUser.avatar,
                        status: dbUser.status
                    });
                }
            }
            setIsLoading(false);
        };
        checkSession();
    }, []);

    const login = async (email: string, password?: string) => {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const dbUser = await db.users.where('email').equalsIgnoreCase(email).first();

        if (dbUser) {
            if (dbUser.password && password && dbUser.password !== password) {
                alert('Senha incorreta.');
                setIsLoading(false);
                return;
            }

            localStorage.setItem('labmanager_user_id', dbUser.id!.toString());
            setUser({
                id: dbUser.id!.toString(),
                name: dbUser.name,
                email: dbUser.email,
                avatar: dbUser.avatar,
                status: dbUser.status
            });
        } else {
            alert('Usuário não encontrado.');
        }
        setIsLoading(false);
    };

    const loginWithGoogle = async (email: string) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        let dbUser = await db.users.where('email').equals(email).first();

        if (dbUser) {
            localStorage.setItem('labmanager_user_id', dbUser.id!.toString());
            setUser({
                id: dbUser.id!.toString(),
                name: dbUser.name,
                email: dbUser.email,
                avatar: dbUser.avatar,
                status: dbUser.status
            });
        } else {
            alert('Este email não está cadastrado no sistema. Por favor, solicite o cadastro ao administrador.');
        }

        setIsLoading(false);
    };

    const register = async (name: string, email: string) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const existing = await db.users.where('email').equals(email).first();
            if (existing) {
                alert('Email já cadastrado.');
                setIsLoading(false);
                return;
            }

            const id = await db.users.add({
                name,
                email,
                role: 'user',
                avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
            });

            const newUser = await db.users.get(id);
            if (newUser) {
                localStorage.setItem('labmanager_user_id', newUser.id!.toString());
                setUser({
                    id: newUser.id!.toString(),
                    name: newUser.name,
                    email: newUser.email,
                    avatar: newUser.avatar,
                    status: newUser.status
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("Erro ao registrar usuário.");
        }

        setIsLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('labmanager_user_id');
        setUser(null);
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...updates });
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
