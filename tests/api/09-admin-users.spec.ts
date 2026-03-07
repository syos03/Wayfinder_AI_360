import { test, expect } from '@playwright/test';
import { getAuthToken, getAdminToken, getFirstUserId } from './test-helper';

test.describe('9. Admin - Users', () => {

    test('TC-ADMIN-USER-01 Get All Users', async ({ request }) => {
        const adminToken = await getAdminToken(request);

        const response = await request.get('/api/admin/users?page=1&limit=10', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.data?.users)).toBe(true);
    });

    test('TC-ADMIN-USER-02 Ban User', async ({ request }) => {
        const adminToken = await getAdminToken(request);
        const firstUserId = await getFirstUserId(request, adminToken);

        const response = await request.patch(`/api/admin/users/${firstUserId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
            data: { isBanned: true, banReason: 'Test automation ban' }
        });
        expect(response.status()).toBe(200);
    });

    test('TC-ADMIN-USER-03 Unban User', async ({ request }) => {
        const adminToken = await getAdminToken(request);
        const firstUserId = await getFirstUserId(request, adminToken);

        const response = await request.patch(`/api/admin/users/${firstUserId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
            data: { isBanned: false }
        });
        expect(response.status()).toBe(200);
    });

    test('TC-ADMIN-USER-04 Get Invalid User ID (400)', async ({ request }) => {
        const adminToken = await getAdminToken(request);

        const response = await request.patch('/api/admin/users/invalid-id-format', {
            headers: { 'Authorization': `Bearer ${adminToken}` },
            data: { isBanned: true }
        });
        expect([400, 404, 500]).toContain(response.status());
    });

    test('TC-ADMIN-USER-05 Không Phải Admin (403)', async ({ request }) => {
        const normalUserToken = await getAuthToken(request);

        // Dùng token thường thay vì adminToken để Ban User (hoặc Get User List)
        const response = await request.get('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${normalUserToken}` }
        });

        expect(response.status()).toBe(403);
    });
});
