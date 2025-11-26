import { supabase } from './supabase';
import { Device, User, Lab, Sede, Group, Task, Message, Log } from '../types';

export const api = {
    // Users
    getUsers: async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*');
        if (error) throw error;
        return data as User[];
    },
    createUser: async (user: Partial<User>) => {
        // Remove fields that might not exist in the Supabase schema or shouldn't be set directly
        const { forceChangePassword, password, ...userData } = user;
        const { data, error } = await supabase.from('users').insert(userData).select().maybeSingle();
        if (error) throw error;
        return data as { id: number | string };
    },
    updateUser: async (id: number | string, user: Partial<User>) => {
        const { forceChangePassword, password, ...userData } = user;
        const { error } = await supabase.from('users').update(userData).eq('id', id);
        if (error) throw error;
        return { success: true };
    },
    deleteUser: async (id: number | string) => {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },
    login: async (credentials: { email: string; password?: string }) => {
        console.log("Attempting login for:", credentials.email);

        // 1 — Login REAL via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password || '',
        });

        if (authError) {
            console.error("Supabase Auth Error:", authError);
            throw new Error("Email ou senha incorretos.");
        }

        const authUser = authData.user;

        // 2 — Buscar perfil pelo auth_id (NUNCA MAIS USAR EMAIL)
        const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", authUser.id)
            .maybeSingle();

        // 3 — Se não existir perfil, cria um novo
        if (!userProfile) {
            console.warn("User profile not found, creating one...");

            const newUser = {
                auth_id: authUser.id,
                email: credentials.email,
                name: authUser.user_metadata?.name || credentials.email.split("@")[0],
                avatar: authUser.user_metadata?.avatar || `https://ui-avatars.com/api/?name=${credentials.email}`,
                role: "user",
                status: "online"
            };

            const { data: created, error: createError } = await supabase
                .from("users")
                .insert(newUser)
                .select()
                .maybeSingle();

            if (createError) {
                console.error("Failed to create user profile:", createError);
                throw new Error("User profile not found and could not be created.");
            }

            return created as User;
        }

        return userProfile as User;
    },
    register: async (user: Partial<User> & { password?: string }) => {
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: user.email!,
            password: user.password!,
            options: {
                data: {
                    name: user.name,
                    avatar: user.avatar
                }
            }
        });

        if (authError) throw authError;

        // 2. Create Public User Record
        // Remove fields that shouldn't be manually set or don't exist in public schema
        const { password, ...userData } = user;

        const { data, error } = await supabase
            .from('users')
            .insert({
                ...userData,
                auth_id: authData.user?.id, // Link to Auth User
                status: 'offline'
            })
            .select()
            .maybeSingle();

        if (error) {
            // If user creation fails, we might want to cleanup auth user, but for now just throw
            console.error("Error creating public user record:", error);
            throw error;
        }

        return data as { id: number | string };
    },

    // Sedes
    getSedes: async () => {
        const { data, error } = await supabase.from("sedes").select("*");
        if (error) throw error;

        return data.map(s => ({
            id: s.id,
            name: s.name
        }));
    },
    createSede: async (sede: Partial<Sede>) => {
        const { data, error } = await supabase.from('sedes').insert(sede).select().maybeSingle();
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
        const { data, error } = await supabase.from("labs").select("*");
        if (error) throw error;

        return data.map(l => ({
            id: l.id,
            name: l.name,
            sedeId: l.sedeid    // <---- muito importante
        }));
    },
    createLab: async (lab: Partial<Lab>) => {
        const dbLab = {
            name: lab.name,
            sedeid: lab.sedeId
        };
        const { data, error } = await supabase.from('labs').insert(dbLab).select().maybeSingle();
        if (error) throw error;
        return { ...data, sedeId: data.sedeid } as { id: number; sedeId: number };
    },
    updateLab: async (id: number, lab: Partial<Lab>) => {
        const dbLab: any = {};
        if (lab.name) dbLab.name = lab.name;
        if (lab.sedeId) dbLab.sedeid = lab.sedeId;

        const { error } = await supabase.from('labs').update(dbLab).eq('id', id);
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
        const { data, error } = await supabase.from("computadores").select("*");
        if (error) throw error;

        return data.map((d: any) => ({
            id: d.id,
            brand: d.brand,
            model: d.model,
            processor: d.processor,
            ram: d.ram,
            storage: d.storage,
            status: d.status,
            labId: d.labid,
            createdAt: d.created_at?.split("T")[0] ?? null
        }));
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
            labid: data.labId
        };

        const { error } = await supabase.from("computadores").insert(deviceData);
        if (error) throw error;

        return { success: true };
    },
    updateDevice: async (id: string, device: any) => {
        const updateData: any = {};

        if (device.brand) updateData.brand = device.brand;
        if (device.model) updateData.model = device.model;
        if (device.processor) updateData.processor = device.processor;
        if (device.ram) updateData.ram = device.ram;
        if (device.storage) updateData.storage = device.storage;
        if (device.status) updateData.status = device.status;
        if (device.labId) updateData.labid = device.labId;

        const { error } = await supabase.from("computadores").update(updateData).eq("id", id);
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
        const { data, error } = await supabase.from('groups').insert(group).select().maybeSingle();
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
        const { data, error } = await supabase.from('tasks').insert(task).select().maybeSingle();
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
        const { data, error } = await supabase.from('messages').insert(message).select().maybeSingle();
        if (error) throw error;
        return data as { id: number };
    },

    // SUBTASKS
    getSubtasks: async (taskId: number) => {
        const { data, error } = await supabase
            .from("subtasks")
            .select("*")
            .eq("task_id", taskId)
            .order("id");

        if (error) throw error;
        return data;
    },

    createSubtask: async (taskId: number, title: string) => {
        const { data, error } = await supabase
            .from("subtasks")
            .insert({ task_id: taskId, title })
            .select()
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    updateSubtask: async (id: number, updates: any) => {
        const { error } = await supabase.from("subtasks").update(updates).eq("id", id);
        if (error) throw error;
    },

    deleteSubtask: async (id: number) => {
        const { error } = await supabase.from("subtasks").delete().eq("id", id);
        if (error) throw error;
    },

    // COMMENTS
    getComments: async (taskId: number) => {
        const { data, error } = await supabase
            .from("task_comments")
            .select("*, users(name, avatar)")
            .eq("task_id", taskId)
            .order("id");

        if (error) throw error;
        return data;
    },

    addComment: async (taskId: number, userId: number | string, content: string) => {
        const { data, error } = await supabase
            .from("task_comments")
            .insert({ task_id: taskId, user_id: userId, content })
            .select()
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    // ATTACHMENTS
    uploadAttachment: async (taskId: number, file: File) => {
        const filePath = `${taskId}/${Date.now()}-${file.name}`;

        const { error: uploadErr } = await supabase.storage
            .from("task_attachments")
            .upload(filePath, file);

        if (uploadErr) throw uploadErr;

        const publicUrl = supabase.storage
            .from("task_attachments")
            .getPublicUrl(filePath).data.publicUrl;

        const { data, error } = await supabase
            .from("task_attachments")
            .insert({
                task_id: taskId,
                file_name: file.name,
                file_url: publicUrl,
                file_type: file.type,
            })
            .select()
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    getTaskAttachments: async (taskId: number) => {
        const { data, error } = await supabase
            .from("task_attachments")
            .select("*")
            .eq("task_id", taskId);

        if (error) throw error;
        return data;
    }
};
