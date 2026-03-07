import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const authFile = path.join(process.cwd(), '.auth', 'user.json');

setup('authenticate', async ({ request }) => {
    const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const testEmail = `global_${uniqueId}@gmail.com`;
    const testPassword = 'password123';

    // Register a new user just for testing
    await request.post('/api/auth/register', {
        data: { name: 'Automation Global User', email: testEmail, password: testPassword }
    });

    // Login
    const loginRes = await request.post('/api/auth/login', {
        data: { email: testEmail, password: testPassword }
    });

    const body = await loginRes.json();
    const token = body.data?.token || '';

    // Login as admin
    const adminRes = await request.post('/api/auth/login', {
        data: { email: 'admin@wayfinder.vn', password: 'adminpassword' }
    });
    const adminBody = await adminRes.json();
    const adminToken = adminBody.data?.token || '';

    // Ensure directory exists
    const dir = path.dirname(authFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Save tokens to files
    fs.writeFileSync(authFile, JSON.stringify({ token }));
    fs.writeFileSync(path.join(dir, 'admin.json'), JSON.stringify({ token: adminToken }));
});
