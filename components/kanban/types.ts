export interface Task {
    id: number;
    title: string;
    description: string;
    status: "pendente" | "progresso" | "cancelado" | "concluido";
    assigned_to?: number | null;
    priority?: "normal" | "alta" | "critica" | "urgente";
    sede_id?: number;
    lab_id?: number;
    computador_id?: number;
    created_at?: string;
}

export interface Subtask {
    id: number;
    task_id: number;
    title: string;
    done: boolean;
}

export interface Comment {
    id: number;
    task_id: number;
    user_id: number;
    content: string;
    users?: {
        name: string;
        avatar?: string;
    };
}

export interface Attachment {
    id: number;
    task_id: number;
    file_name: string;
    file_url: string;
    file_type: string;
}
