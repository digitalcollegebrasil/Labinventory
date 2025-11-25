import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (email: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar sessão salva (via localStorage)
    useEffect(() => {
        const storedId = localStorage.getItem('labmanager_user_id');

        if (storedId) {
            api.getUsers().then(users => {
                const found = users.find(u => u.id === Number(storedId));
                if (found) setUser(found);
            });
        }

        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const users = await api.getUsers();
            const found = users.find(u => u.email === email && u.password === password);

            if (!found) {
                alert("Credenciais inválidas.");
                return;
            }

            setUser(found);
            localStorage.setItem('labmanager_user_id', found.id.toString());

        } catch (err) {
            console.error(err);
            alert("Erro ao fazer login.");
        }
        setIsLoading(false);
    };

    const loginWithGoogle = async (email: string) => {
        const users = await api.getUsers();
        const found = users.find(u => u.email === email);

        if (found) {
            setUser(found);
            localStorage.setItem('labmanager_user_id', found.id.toString());
        } else {
            alert("Email não cadastrado.");
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            await api.createUser({
                name,
                email,
                password: password,
                role: "user",
                avatar: `https://ui-avatars.com/api/?name=${name}`
            });

            alert("Cadastro realizado! Você já pode fazer login.");
        } catch (err) {
            console.error(err);
            alert("Erro ao cadastrar usuário.");
        }
        setIsLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('labmanager_user_id');
        setUser(null);
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;

        await api.updateUser(user.id, updates);
        setUser({ ...user, ...updates });
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
