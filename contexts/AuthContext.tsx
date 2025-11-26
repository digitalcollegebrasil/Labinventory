import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Carrega sessão ativa do Supabase
    useEffect(() => {
        let mounted = true;

        const initSession = async () => {
            try {
                // Create a promise that rejects after 5 seconds
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Session timeout')), 5000);
                });

                // Race between getSession and timeout
                const { data } = await Promise.race([
                    supabase.auth.getSession(),
                    timeoutPromise
                ]) as any;

                const session = data?.session;

                if (session?.user && mounted) {
                    const authId = session.user.id;
                    console.log("Session found, fetching profile for:", authId);

                    const { data: profile, error } = await supabase
                        .from("users")
                        .select("*")
                        .eq("auth_id", authId)
                        .maybeSingle();

                    if (error) {
                        console.error("Error fetching profile:", error);
                    }

                    if (profile && mounted) {
                        setUser(profile);
                    }
                }
            } catch (error) {
                console.error("Error initializing session:", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        initSession();

        // Escuta mudanças de login/logout
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("Auth state change:", event);
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from("users")
                        .select("*")
                        .eq("auth_id", session.user.id)
                        .maybeSingle();

                    if (profile) setUser(profile);
                } else {
                    setUser(null);
                }
                setIsLoading(false);
            }
        );

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    // LOGIN
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            const { user: authUser } = data;

            const { data: profile, error: profileError } = await supabase
                .from("users")
                .select("*")
                .eq("auth_id", authUser.id)
                .maybeSingle();

            if (profileError) throw profileError;

            setUser(profile);

        } catch (err: any) {
            alert(err.message || "Erro ao fazer login.");
        } finally {
            setIsLoading(false);
        }
    };

    // CADASTRO
    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) throw error;

            const authUser = data.user;

            const avatarUrl = `https://ui-avatars.com/api/?name=${name}`;

            const { error: insertError } = await supabase
                .from("users")
                .insert({
                    auth_id: authUser.id,
                    email,
                    name,
                    avatar: avatarUrl,
                    role: "user"
                });

            if (insertError) throw insertError;

            alert("Cadastro feito com sucesso! Agora faça login 😊");

        } catch (err: any) {
            alert(err.message || "Erro ao cadastrar.");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
