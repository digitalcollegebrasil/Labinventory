import express from 'express';
import cors from 'cors';
import { db } from './database.js';

const app = express();
app.use(express.json());
app.use(cors());

// --- Users ---
app.get('/users', async (req, res) => {
    try {
        const users = await db('users');
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/users', async (req, res) => {
    try {
        const ids = await db('users').insert(req.body);
        res.json({ id: ids[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        await db('users').where({ id: req.params.id }).update(req.body);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        await db('users').where({ id: req.params.id }).del();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db('users').where({ email, password }).first();
        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Sedes ---
app.get('/sedes', async (req, res) => {
    try {
        const sedes = await db('sedes');
        res.json(sedes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/sedes', async (req, res) => {
    try {
        const ids = await db('sedes').insert(req.body);
        res.json({ id: ids[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/sedes/:id', async (req, res) => {
    try {
        await db('sedes').where({ id: req.params.id }).update(req.body);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/sedes/:id', async (req, res) => {
    try {
        await db('sedes').where({ id: req.params.id }).del();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Labs ---
app.get('/labs', async (req, res) => {
    try {
        const labs = await db('labs');
        res.json(labs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/labs', async (req, res) => {
    try {
        const ids = await db('labs').insert(req.body);
        res.json({ id: ids[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/labs/:id', async (req, res) => {
    try {
        await db('labs').where({ id: req.params.id }).update(req.body);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/labs/:id', async (req, res) => {
    try {
        await db('labs').where({ id: req.params.id }).del();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Devices ---
app.get('/devices', async (req, res) => {
    try {
        const devices = await db('devices');
        // Fetch logs for each device to match Dexie structure if needed, 
        // but better to fetch logs separately or join.
        // For now, let's keep it simple and maybe fetch logs on demand or join.
        // The Dexie structure had logs embedded. 
        // Let's fetch logs and attach them for compatibility if needed, or just return devices.
        // The frontend expects `logs` array in device object?
        // Let's check `Device` type in `types.ts` later. 
        // For now, let's attach logs.
        for (let device of devices) {
            device.logs = await db('logs').where({ deviceId: device.id });
        }
        res.json(devices);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/devices', async (req, res) => {
    try {
        const { logs, ...deviceData } = req.body;
        await db('devices').insert(deviceData);
        if (logs && logs.length > 0) {
            // Insert logs
            // Ensure logs have deviceId
            const logsToInsert = logs.map(l => ({ ...l, deviceId: deviceData.id }));
            await db('logs').insert(logsToInsert);
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/devices/:id', async (req, res) => {
    try {
        const { logs, ...deviceData } = req.body;
        await db('devices').where({ id: req.params.id }).update(deviceData);
        // Handle logs update? Usually logs are just added.
        // If we replace logs, we delete old ones and add new ones.
        // But logs are usually append-only.
        // Let's assume for now we don't update logs via device update often, or we handle it separately.
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/devices/:id', async (req, res) => {
    try {
        await db('devices').where({ id: req.params.id }).del();
        await db('logs').where({ deviceId: req.params.id }).del();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Groups ---
app.get('/groups', async (req, res) => {
    try {
        const groups = await db('groups');
        res.json(groups);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/groups', async (req, res) => {
    try {
        const ids = await db('groups').insert(req.body);
        res.json({ id: ids[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/groups/:id', async (req, res) => {
    try {
        await db('groups').where({ id: req.params.id }).update(req.body);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/groups/:id', async (req, res) => {
    try {
        await db('groups').where({ id: req.params.id }).del();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Tasks ---
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await db('tasks');
        res.json(tasks);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const ids = await db('tasks').insert(req.body);
        res.json({ id: ids[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        await db('tasks').where({ id: req.params.id }).update(req.body);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        await db('tasks').where({ id: req.params.id }).del();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Messages ---
app.get('/messages', async (req, res) => {
    try {
        const messages = await db('messages');
        res.json(messages);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/messages', async (req, res) => {
    try {
        const ids = await db('messages').insert(req.body);
        res.json({ id: ids[0] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
