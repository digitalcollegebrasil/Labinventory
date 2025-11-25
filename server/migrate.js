import { db } from './database.js';

async function migrate() {
    console.log("Iniciando migração...");

    // Users
    if (!(await db.schema.hasTable('users'))) {
        await db.schema.createTable('users', table => {
            table.increments('id').primary();
            table.string('name');
            table.string('email').unique();
            table.string('password');
            table.string('avatar');
            table.string('role');
            table.integer('groupId');
            table.boolean('isBlocked');
            table.boolean('forceChangePassword');
            table.string('status');
        });
        console.log("Tabela 'users' criada.");
    }

    // Sedes
    if (!(await db.schema.hasTable('sedes'))) {
        await db.schema.createTable('sedes', table => {
            table.increments('id').primary();
            table.string('name');
        });
        console.log("Tabela 'sedes' criada.");
    }

    // Labs
    if (!(await db.schema.hasTable('labs'))) {
        await db.schema.createTable('labs', table => {
            table.increments('id').primary();
            table.string('name');
            table.integer('sedeId');
        });
        console.log("Tabela 'labs' criada.");
    }

    // Devices
    if (!(await db.schema.hasTable('devices'))) {
        await db.schema.createTable('devices', table => {
            table.string('id').primary();
            table.string('name');
            table.string('brand');
            table.string('model');
            table.string('processor');
            table.string('ram');
            table.string('storage');
            table.string('lab');
            table.string('status');
            table.string('specs');
            table.string('lastCheck');
        });
        console.log("Tabela 'devices' criada.");
    }

    // Logs
    if (!(await db.schema.hasTable('logs'))) {
        await db.schema.createTable('logs', table => {
            table.increments('id').primary();
            table.string('deviceId');
            table.string('date');
            table.string('description');
            table.string('type');
        });
        console.log("Tabela 'logs' criada.");
    }

    // Groups
    if (!(await db.schema.hasTable('groups'))) {
        await db.schema.createTable('groups', table => {
            table.increments('id').primary();
            table.string('name');
            table.string('description');
        });
        console.log("Tabela 'groups' criada.");
    }

    // Tasks
    if (!(await db.schema.hasTable('tasks'))) {
        await db.schema.createTable('tasks', table => {
            table.increments('id').primary();
            table.string('title');
            table.string('description');
            table.string('status');
            table.string('priority');
            table.string('dueDate');
            table.integer('assignedTo');
            table.integer('createdBy');
        });
        console.log("Tabela 'tasks' criada.");
    }

    // Messages
    if (!(await db.schema.hasTable('messages'))) {
        await db.schema.createTable('messages', table => {
            table.increments('id').primary();
            table.integer('senderId');
            table.integer('receiverId');
            table.string('content');
            table.string('timestamp');
            table.boolean('read');
        });
        console.log("Tabela 'messages' criada.");
    }

    console.log("Migração concluída!");
    process.exit();
}

migrate();
