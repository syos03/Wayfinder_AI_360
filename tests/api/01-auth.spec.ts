import { test, expect } from '@playwright/test';

// Use standard isolation per test by randomizing emails
test.describe('1. Auth API', () => {

    test('TC-AUTH-01 Register - Thành Công', async ({ request }) => {
        const uniqueEmail = `user_ok_${Date.now()}@gmail.com`;
        const response = await request.post('/api/auth/register', {
            data: { name: 'Test User', email: uniqueEmail, password: 'password123' }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
    });

    test('TC-AUTH-02 Register - Email Trùng (409)', async ({ request }) => {
        const duplicateEmail = `user_dup_${Date.now()}@gmail.com`;
        // Register first time
        await request.post('/api/auth/register', {
            data: { name: 'User 1', email: duplicateEmail, password: 'password123' }
        });
        // Try again
        const response = await request.post('/api/auth/register', {
            data: { name: 'User 2', email: duplicateEmail, password: 'password123' }
        });
        expect(response.status()).toBe(409);
    });

    test('TC-AUTH-03 Register - Thiếu Field (400)', async ({ request }) => {
        const response = await request.post('/api/auth/register', {
            data: { email: `missing_${Date.now()}@gmail.com` }
        });
        expect(response.status()).toBe(400);
    });

    test('TC-AUTH-03b Register - Password Quá Ngắn (400)', async ({ request }) => {
        const response = await request.post('/api/auth/register', {
            data: { name: 'Test', email: `short_${Date.now()}@gmail.com`, password: '123' }
        });
        expect(response.status()).toBe(400);
    });

    test('TC-AUTH-04 Login - Thành Công', async ({ request }) => {
        const loginEmail = `login_ok_${Date.now()}@gmail.com`;
        const password = 'password123';
        // Register first
        await request.post('/api/auth/register', {
            data: { name: 'Test Login User', email: loginEmail, password: password }
        });

        // Then login
        const response = await request.post('/api/auth/login', {
            data: { email: loginEmail, password: password }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(typeof body.data.token).toBe('string');
    });

    test('TC-AUTH-05 Login - Sai Password (401)', async ({ request }) => {
        const validEmail = `wrongpw_${Date.now()}@gmail.com`;
        await request.post('/api/auth/register', {
            data: { name: 'Wrong PW', email: validEmail, password: 'password123' }
        });

        const response = await request.post('/api/auth/login', {
            data: { email: validEmail, password: 'wrongpassword' }
        });
        expect(response.status()).toBe(401);
    });

    test('TC-AUTH-06 Login - Email Không Tồn Tại (401)', async ({ request }) => {
        const response = await request.post('/api/auth/login', {
            data: { email: `notexist_${Date.now()}@gmail.com`, password: '123456' }
        });
        expect(response.status()).toBe(401);
    });

    test('TC-AUTH-07 Get Me - Có Token (200) & Logout (200)', async ({ request }) => {
        const email = `getme_${Date.now()}@gmail.com`;
        await request.post('/api/auth/register', {
            data: { name: 'Get Me User', email: email, password: 'password123' }
        });

        const loginRes = await request.post('/api/auth/login', {
            data: { email: email, password: 'password123' }
        });
        const { data: { token } } = await loginRes.json();

        // Check Get Me
        const meRes = await request.get('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        expect(meRes.status()).toBe(200);

        // Test Logout - TC 08 luôn tiện
        const logoutRes = await request.post('/api/auth/logout', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        expect(logoutRes.status()).toBe(200);
    });

    test('TC-AUTH-07b Get Me - Không Có Token (401)', async ({ request }) => {
        const response = await request.get('/api/auth/me');
        expect(response.status()).toBe(401);
    });

    test('TC-AUTH-09 Forgot Password', async ({ request }) => {
        const email = `forgot_${Date.now()}@gmail.com`;
        // Register so email exists (although API might return 200 for security reasons anyway)
        await request.post('/api/auth/register', {
            data: { name: 'Forgot User', email: email, password: 'password123' }
        });

        const response = await request.post('/api/auth/forgot-password', {
            data: { email: email }
        });
        expect(response.status()).toBe(200);
    });
});
