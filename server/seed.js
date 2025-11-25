import { db } from './database.js';

async function seed() {
    console.log("Iniciando seed...");

    // Clear existing data
    await db('users').del();
    await db('sedes').del();
    await db('labs').del();
    await db('devices').del();
    await db('groups').del();

    // Seed Sedes
    const sedeId = await db('sedes').insert({ name: 'Matriz' }, ['id']);
    const sedeSulId = await db('sedes').insert({ name: 'Filial Zona Sul' }, ['id']);

    // SQLite returns array of objects with id if specified, or just array of ids depending on version/config.
    // Knex with sqlite3 usually returns [id] for single insert or array of ids.
    // Let's handle it safely.
    const getID = (result) => result[0]?.id || result[0];

    const s1 = getID(sedeId);
    const s2 = getID(sedeSulId);

    // Seed Labs
    await db('labs').insert([
        { name: 'Laboratório A (Ciências)', sedeId: s1 },
        { name: 'Laboratório B (Informática)', sedeId: s1 },
        { name: 'Laboratório C (Robótica)', sedeId: s1 },
        { name: 'Laboratório Steve Jobs (1º Andar)', sedeId: s1 },
        { name: 'Laboratório Bill Gates (1º Andar)', sedeId: s1 },
        { name: 'Laboratório Sam Altman (1º Andar)', sedeId: s1 },
        { name: 'Laboratório Mark Zuckerberg (10º Andar)', sedeId: s2 },
        { name: 'Laboratório Lary Page (10º Andar)', sedeId: s2 },
        { name: 'Laboratório Philip Kotler (10º Andar)', sedeId: s2 },
        { name: 'Laboratório Jack Ma (10º Andar)', sedeId: s2 },
        { name: 'Laboratório Sergey Brin (1º Andar)', sedeId: s1 }
    ]);

    // Seed Groups
    const adminGroupId = await db('groups').insert({ name: 'Administradores', description: 'Acesso total ao sistema' }, ['id']);
    await db('groups').insert({ name: 'Técnicos', description: 'Acesso a inventário e manutenção' });
    await db('groups').insert({ name: 'Professores', description: 'Visualização de laboratórios' });

    const g1 = getID(adminGroupId);

    // Seed Users
    await db('users').insert({
        name: 'Admin',
        email: 'ph134406@gmail.com',
        password: 'Digital@25',
        role: 'admin',
        groupId: g1,
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=random',
        isBlocked: false,
        forceChangePassword: false,
        status: 'online'
    });

    // Seed Devices
    await db('devices').insert([
        {
            id: 'PAT-001',
            name: 'Dell Inspiron 15',
            brand: 'Dell',
            model: 'Inspiron 15',
            processor: 'i5 11th Gen',
            ram: '8GB',
            storage: '256GB SSD',
            lab: 'Laboratório A (Ciências)',
            status: 'operational',
            specs: 'i5 11th Gen, 8GB RAM',
            lastCheck: '2023-10-25'
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
            status: 'maintenance',
            specs: 'Ryzen 5, 16GB RAM',
            lastCheck: '2023-10-24'
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
            status: 'operational',
            specs: 'i7 10th Gen, 16GB RAM',
            lastCheck: '2023-10-26'
        }
    ]);

    // Seed Logs for PAT-002
    await db('logs').insert({
        deviceId: 'PAT-002',
        date: '2023-10-24',
        description: 'Teclado com defeito',
        type: 'maintenance'
    });

    console.log("Seed concluído!");
    process.exit();
}

seed();
