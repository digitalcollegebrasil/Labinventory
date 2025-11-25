// =========================
//  DEVICE STATUS (PORTUGUÊS)
// =========================
export enum DeviceStatus {
  OPERATIONAL = 'Operacional',
  MAINTENANCE = 'Manutenção',
  BROKEN = 'Quebrado',
  MISSING = 'Desaparecido'
}

// =========================
//  SEDES
// =========================
export interface Sede {
  id?: number;
  name: string;
}

// =========================
//  LABORATÓRIOS
//  (ligados à tabela sedes)
// =========================
export interface Lab {
  id?: number;
  name: string;
  sedeId: number;
}

// =========================
//  GRUPOS
// =========================
export interface Group {
  id?: number;
  name: string;
  description?: string;
  permissions?: string[];
}

// =========================
//  LOGS DE MANUTENÇÃO
//  (Frontend Only — não existe no Supabase
//  mas é usado na UI)
// =========================
export interface MaintenanceLog {
  id: string;
  date: string;
  description: string;
  reportedBy: string;
}

// =========================
//  CHECKLIST
// =========================
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

// =========================
//  DEVICE (Computadores)
// =========================
// IMPORTANTE:
// A tabela `computadores` do Supabase não possui:
// - name
// - specs
// - logs
// - checkHistory
//
// MAS o frontend usa esses campos.
// Portanto, eles são gerados pela API automaticamente
// para manter compatibilidade.
export interface Device {
  id: string;          // patrimônio
  name: string;        // gerado pela API → `${brand} ${model}`
  brand: string;
  model: string;
  processor: string;
  ram: string;
  storage: string;

  // IMPORTANTE:
  // o banco usa labId (integer)
  // o frontend usa lab (string com nome)
  lab: string;

  status: DeviceStatus;
  specs: string;        // gerado → `${processor}, ${ram}, ${storage}`
  lastCheck: string;    // vindo de created_at

  // usados na UI
  logs: Log[];
  checkHistory?: CheckRecord[];

  isStarred?: boolean;
}

// =========================
//  LOG (UI Only)
// =========================
export interface Log {
  id: number;
  date: string;
  description: string;
  type: 'maintenance' | 'error' | 'info';
  userId?: string;
  userName?: string;
}

// =========================
//  USER
// =========================
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'admin' | 'user';
  isBlocked?: boolean;
  forceChangePassword?: boolean;
  status?: 'online' | 'busy' | 'offline';
}

// =========================
//  TASK
// =========================
export interface Task {
  id?: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'done';
  assignedTo?: string;
  assignedName?: string;
  createdAt: string;
  updatedAt: string;
  checklist?: { id: string; text: string; completed: boolean }[];
}

// =========================
//  MESSAGE
// =========================
export interface Message {
  id?: number;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// =========================
//  DASHBOARD STATS
// =========================
export interface DashboardStats {
  total: number;
  operational: number;
  maintenance: number;
  broken: number;
}
