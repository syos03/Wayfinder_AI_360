import { test, expect } from '@playwright/test';
import { getAuthToken, getFirstDestinationId } from './test-helper';

test.describe('3. Favorites API', () => {

    test('TC-FAV-01 Get Favorites - Có Login', async ({ request }) => {
        const authToken = await getAuthToken(request);
        test.skip(!authToken, 'No auth token');
        const response = await request.get('/api/favorites', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.data.favorites)).toBe(true);
    });

    test('TC-FAV-02 Toggle Favorite - ADD', async ({ request }) => {
        const authToken = await getAuthToken(request);
        const destinationId = await getFirstDestinationId(request);
        test.skip(!authToken || !destinationId, 'Pre-req missing');

        const response = await request.post(`/api/favorites/${destinationId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.status() !== 200) {
            console.error('Toggle Fav ADD error: ', await response.text());
        }
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(typeof body.data.isFavorited).toBe('boolean');
        expect(body.data.isFavorited).toBe(true);
    });

    test('TC-FAV-03 Toggle Favorite - REMOVE (gọi lần 2)', async ({ request }) => {
        const authToken = await getAuthToken(request);
        const destinationId = await getFirstDestinationId(request);
        test.skip(!authToken || !destinationId, 'Pre-req missing');

        // Add first 
        await request.post(`/api/favorites/${destinationId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // Toggle to remove
        const response = await request.post(`/api/favorites/${destinationId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.status() !== 200) {
            console.error('Toggle Fav REMOVE error: ', await response.text());
        }
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(typeof body.data.isFavorited).toBe('boolean');
        expect(body.data.isFavorited).toBe(false);
    });

    test('TC-FAV-04 Get Favorites - Chưa Login (401)', async ({ request }) => {
        const response = await request.get('/api/favorites');
        expect(response.status()).toBe(401);
    });

    test('TC-FAV-05 Toggle Favorite - Invalid ID (400)', async ({ request }) => {
        const authToken = await getAuthToken(request);
        const response = await request.post('/api/favorites/invalid-id-format', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        expect(response.status()).toBe(400);
    });
});
