import { supabase } from './supabase';
import { Device, User, Lab, Sede, Group, Task, Message, Log } from '../types';

export const api = {
    // Users
    getUsers: async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        return data as User[];
    },
    createUser: async (user: Partial<User>) => {
        // Remove fields that might not exist in the Supabase schema or shouldn't be set directly
        const { forceChangePassword, ...userData } = user;
        const { data, error } = await supabase.from('users').insert(userData).select().single();
        if (error) throw error;
        return data as { id: number };
    },
    updateUser: async (id: number, user: Partial<User>) => {
        const { forceChangePassword, ...userData } = user;
        const { error } = await supabase.from('users').update(userData).eq('id', id);
        if (error) throw error;
        return { success: true };
    },
    deleteUser: async (id: number) => {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },
    login: async (credentials: { email: string; password?: string }) => {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password || '',
        });

        if (error) throw error;

        // Carregar usuário
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single();

        if (profileError) throw new Error('User profile not found.');

        return userProfile as User;
    },

    // Sedes
    getSedes: async () => {
        const { data, error } = await supabase.from('sedes').select('*');
        if (error) throw error;
        return data as Sede[];
    },
    createSede: async (sede: Partial<Sede>) => {
        const { data, error } = await supabase.from('sedes').insert(sede).select().single();
        if (error) throw error;
        return data as { id: number };
    },
    updateSede: async (id: number, sede: Partial<Sede>) => {
        const { error } = await supabase.from('sedes').update(sede).eq('id', id);
        if (error) throw error;
        return { success: true };
    },
    deleteSede: async (id: number) => {
        const { error } = await supabase.from('sedes').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // Labs
    getLabs: async () => {
        const { data, error } = await supabase.from('labs').select('*');
        if (error) throw error;
        return data as Lab[];
    },
    createLab: async (lab: Partial<Lab>) => {
        const { data, error } = await supabase.from('labs').insert(lab).select().single();
        if (error) throw error;
        return data as { id: number };
    },
    updateLab: async (id: number, lab: Partial<Lab>) => {
        const { error } = await supabase.from('labs').update(lab).eq('id', id);
        if (error) throw error;
        return { success: true };
    },
    deleteLab: async (id: number) => {
        const { error } = await supabase.from('labs').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // Devices (now computadores)
    getDevices: async () => {
        const { data, error } = await supabase
            .from("computadores")
            .select(`
                *,
                lab:labId(name)
            `);

        if (error) throw error;

        return data.map(device => ({
            ...device,
            lab: device.lab?.name || "Sem laboratório"
        })) as Device[];
    },
    // Replaces createDevice and addComputador
    addComputador: async (data: any) => {
        const deviceData = {
            id: data.id,
            brand: data.brand,
            model: data.model,
            processor: data.processor,
            ram: data.ram,
            storage: data.storage,
            status: data.status,
            labId: data.labId,
            name: `${data.brand} ${data.model}`,
            specs: `${data.processor}, ${data.ram}, ${data.storage}`,
            lastCheck: new Date().toISOString().split('T')[0]
        };

        const { error } = await supabase
            .from("computadores")
            .insert(deviceData);

        if (error) throw error;

        return { success: true };
    },
    updateDevice: async (id: string, device: Partial<Device>) => {
        const { error } = await supabase.from('computadores').update(device).eq('id', id);
        if (error) throw error;
        return { success: true };
    },
    deleteDevice: async (id: string) => {
        const { error } = await supabase.from('computadores').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // Groups
    getGroups: async () => {
        const { data, error } = await supabase.from('groups').select('*');
        if (error) throw error;
        return data as Group[];
    },
    createGroup: async (group: Partial<Group>) => {
        const { data, error } = await supabase.from('groups').insert(group).select().single();
        if (error) throw error;
        return data as { id: number };
    },
    updateGroup: async (id: number, group: Partial<Group>) => {
        const { error } = await supabase.from('groups').update(group).eq('id', id);
        if (error) throw error;
        return { success: true };
    },
    deleteGroup: async (id: number) => {
        const { error } = await supabase.from('groups').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // Tasks
    getTasks: async () => {
        const { data, error } = await supabase.from('tasks').select('*');
        if (error) throw error;
        return data as Task[];
    },
    createTask: async (task: Partial<Task>) => {
        const { data, error } = await supabase.from('tasks').insert(task).select().single();
        if (error) throw error;
        return data as { id: number };
    },
    updateTask: async (id: number, task: Partial<Task>) => {
        const { error } = await supabase.from('tasks').update(task).eq('id', id);
        if (error) throw error;
        return { success: true };
    },
    deleteTask: async (id: number) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },

    // Messages
    getMessages: async () => {
        const { data, error } = await supabase.from('messages').select('*');
        if (error) throw error;
        return data as Message[];
    },
    createMessage: async (message: Partial<Message>) => {
        const { data, error } = await supabase.from('messages').insert(message).select().single();
        if (error) throw error;
        return data as { id: number };
    }
};
