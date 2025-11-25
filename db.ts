import Dexie, { Table } from 'dexie';
import { Device, DeviceStatus, Log, Sede, Lab, Group, Task, Message } from './types';

export interface UserDB {
    id?: number; // Auto-incremented
    name: string;
    email: string;
    password?: string; // In a real app, this should be hashed
    avatar?: string;
    role: 'admin' | 'user';
    groupId?: number;
    isBlocked?: boolean;
    forceChangePassword?: boolean;
    status?: 'online' | 'busy' | 'offline';
}

export class LabManagerDB extends Dexie {
    devices!: Table<Device>;
    logs!: Table<Log>;
    users!: Table<UserDB>;
    sedes!: Table<Sede>;
    labs!: Table<Lab>;
    groups!: Table<Group>;
    tasks!: Table<Task>;
    messages!: Table<Message>;

    constructor() {
        super('LabManagerDB');

        // Define tables and indexes
        this.version(3).stores({
            devices: 'id, name, lab, status',
            logs: 'id, deviceId, date',
            users: '++id, &email, groupId',
            sedes: '++id, name',
            labs: '++id, name, sedeId, [name+sedeId]', // Compound index for uniqueness
            groups: '++id, name',
            tasks: '++id, status, assignedTo',
            messages: '++id, senderId, receiverId, timestamp'
        });

        // Populate with mock data if empty
        this.on('populate', async () => {
            // Seed Structure
            const sedeId = await this.sedes.add({ name: 'Matriz' });
            const sedeSulId = await this.sedes.add({ name: 'Filial Zona Sul' });

            // Seed Labs (Linked directly to Sedes)
            await this.labs.bulkAdd([
                { name: 'Laboratório A (Ciências)', sedeId: sedeId },
                { name: 'Laboratório B (Informática)', sedeId: sedeId },
                { name: 'Laboratório C (Robótica)', sedeId: sedeId },
                { name: 'Laboratório Steve Jobs (1º Andar)', sedeId: sedeId },
                { name: 'Laboratório Bill Gates (1º Andar)', sedeId: sedeId },
                { name: 'Laboratório Sam Altman (1º Andar)', sedeId: sedeId },
                { name: 'Laboratório Mark Zuckerberg (10º Andar)', sedeId: sedeSulId },
                { name: 'Laboratório Lary Page (10º Andar)', sedeId: sedeSulId },
                { name: 'Laboratório Philip Kotler (10º Andar)', sedeId: sedeSulId },
                { name: 'Laboratório Jack Ma (10º Andar)', sedeId: sedeSulId },
                { name: 'Laboratório Sergey Brin (1º Andar)', sedeId: sedeId }
            ]);

            // Seed Groups
            const adminGroupId = await this.groups.add({ name: 'Administradores', description: 'Acesso total ao sistema' });
            await this.groups.add({ name: 'Técnicos', description: 'Acesso a inventário e manutenção' });
            await this.groups.add({ name: 'Professores', description: 'Visualização de laboratórios' });

            // Seed Devices
            await this.devices.bulkAdd([
                {
                    id: 'PAT-001',
                    name: 'Dell Inspiron 15',
                    brand: 'Dell',
                    model: 'Inspiron 15',
                    processor: 'i5 11th Gen',
                    ram: '8GB',
                    storage: '256GB SSD',
                    lab: 'Laboratório A (Ciências)',
                    status: DeviceStatus.OPERATIONAL,
                    specs: 'i5 11th Gen, 8GB RAM',
                    lastCheck: '2023-10-25',
                    logs: [],
                    checkHistory: []
                },
                {
                    id: 'PAT-002',
                    name: 'Lenovo ThinkPad',
                    brand: 'Lenovo',
                    model: 'ThinkPad E14',
                    processor: 'Ryzen 5',
                    ram: '16GB',
                    storage: '512GB SSD',
                    lab: 'Laboratório B (Informática)',
                    status: DeviceStatus.MAINTENANCE,
                    specs: 'Ryzen 5, 16GB RAM',
                    lastCheck: '2023-10-24',
                    logs: [
                        { id: 1, date: '2023-10-24', description: 'Teclado com defeito', type: 'maintenance' }
                    ],
                    checkHistory: []
                },
                {
                    id: 'PAT-003',
                    name: 'HP ProDesk',
                    brand: 'HP',
                    model: 'ProDesk 400',
                    processor: 'i7 10th Gen',
                    ram: '16GB',
                    storage: '1TB HDD',
                    lab: 'Laboratório C (Robótica)',
                    status: DeviceStatus.OPERATIONAL,
                    specs: 'i7 10th Gen, 16GB RAM',
                    lastCheck: '2023-10-26',
                    logs: [],
                    checkHistory: []
                }
            ]);

            // Add a default admin user
            await this.users.add({
                name: 'Admin',
                email: 'ph134406@gmail.com',
                password: 'Digital@25',
                role: 'admin',
                groupId: adminGroupId,
                avatar: 'https://ui-avatars.com/api/?name=Admin&background=random',
                isBlocked: false,
                forceChangePassword: false
            });
        });
    }
}

export const db = new LabManagerDB();
