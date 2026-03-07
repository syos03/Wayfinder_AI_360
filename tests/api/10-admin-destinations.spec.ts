import { test, expect } from '@playwright/test';
import { getAuthToken, getAdminToken, getFirstDestinationId } from './test-helper';

test.describe('10. Admin - Destinations', () => {

    test('TC-ADMIN-DEST-01 Get All (kể cả inactive)', async ({ request }) => {
        const adminToken = await getAdminToken(request);
        const response = await request.get('/api/admin/destinations', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.data?.destinations)).toBe(true);
    });

    test('TC-ADMIN-DEST-02 Update Destination', async ({ request }) => {
        const adminToken = await getAdminToken(request);
        const destinationId = await getFirstDestinationId(request);
        test.skip(!destinationId, 'Pre-req missing');

        const response = await request.patch(`/api/admin/destinations/${destinationId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
            data: { isActive: true }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.destination.isActive).toBe(true);
    });

    test('TC-ADMIN-DEST-03 Không Phải Admin (403)', async ({ request }) => {
        const normalUserToken = await getAuthToken(request);

        const response = await request.get('/api/admin/destinations', {
            headers: { 'Authorization': `Bearer ${normalUserToken}` }
        });
        expect(response.status()).toBe(403);
    });
});
