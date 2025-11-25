export enum DeviceStatus {
  OPERATIONAL = 'Operacional',
  MAINTENANCE = 'Manutenção',
  BROKEN = 'Quebrado',
  MISSING = 'Desaparecido'
}

// Deprecated: Use Lab interface from DB instead
// Keeping for backward compatibility during migration if needed, 
// but ideally we switch to string IDs or names from DB.
export type LabName = string;

export interface Sede {
  id?: number;
  name: string;
}



// Unit is deprecated/removed
// export interface Unit { ... }

export interface Lab {
  id?: number;
  name: string;
  sedeId: number; // Linked directly to Sede
}

export interface Group {
  id?: number;
  name: string;
  description?: string;
  permissions?: string[];
}

export interface MaintenanceLog {
  id: string;
  date: string;
  description: string;
  reportedBy: string;
}

export interface CheckRecord {
  date: string;
  time: string;
  teclado: boolean;
  mouse: boolean;
  monitor: boolean;
  cabos: boolean;
  software: boolean;
  observacoes: string;
  userId?: string;
  userName?: string;
}

export interface Device {
  id: string; // Patrimônio
  name: string;
  brand: string;
  model: string;
  processor: string;
  ram: string;
  storage: string;
  lab: string; // Now stores the Lab Name or ID
  status: DeviceStatus;
  specs: string;
  lastCheck: string;
  checkHistory?: CheckRecord[];
  logs: Log[];
  isStarred?: boolean;
}

export interface Log {
  id: number;
  date: string;
  description: string;
  type: 'maintenance' | 'error' | 'info';
  userId?: string;
  userName?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user'; // Keeping for basic role check
  groupId?: number;
  isBlocked?: boolean;
  forceChangePassword?: boolean;
  status?: 'online' | 'busy' | 'offline';
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'done';
  assignedTo?: string; // User ID
  assignedName?: string;
  createdAt: string;
  updatedAt: string;
  checklist?: { id: string; text: string; completed: boolean }[];
}

export interface Message {
  id?: number;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface DashboardStats {
  total: number;
  operational: number;
  maintenance: number;
  broken: number;
}
