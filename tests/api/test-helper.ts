import * as fs from 'fs';
import * as path from 'path';

export async function getAuthToken(request: any) {
    const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const testEmail = `testuser_${uniqueId}@gmail.com`;
    const testPassword = 'password123';

    // Register
    await request.post('/api/auth/register', {
        data: { name: 'Automation Test', email: testEmail, password: testPassword }
    });

    // Short delay to let DB/NextJS finish writing user
    await new Promise(r => setTimeout(r, 800));

    // Login
    const loginRes = await request.post('/api/auth/login', {
        data: { email: testEmail, password: testPassword }
    });
    const body = await loginRes.json();
    return body.data?.token || '';
}

export async function getFirstDestinationId(request: any) {
    const destRes = await request.get('/api/destinations?page=1&limit=1');
    const body = await destRes.json();
    if (body.data?.destinations?.length > 0) {
        return body.data.destinations[0]._id;
    }
    return null;
}

export async function getAdminToken(request: any) {
    // Retry login logic to prevent MongoDB concurrent save VersionError
    for (let i = 0; i < 3; i++) {
        const loginRes = await request.post('/api/auth/login', {
            data: { email: 'admin@wayfinder.ai', password: 'admin123456' }
        });
        if (loginRes.status() === 200) {
            const body = await loginRes.json();
            return body.data?.token || '';
        }
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
    }
    return '';
}

export async function getFirstUserId(request: any, adminToken: string) {
    const res = await request.get('/api/admin/users?page=1&limit=2', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const body = await res.json();
    if (body.data?.users?.length > 0) {
        // Avoid admin ID if possible, take second user if exists
        return body.data.users[1]?._id || body.data.users[0]?._id;
    }
    return null;
}
