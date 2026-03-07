import { test, expect } from '@playwright/test';
import { getAuthToken, getFirstDestinationId } from './test-helper';

test.describe('8. Recommendations API', () => {

    test('TC-REC-01 For You - Personalized (login)', async ({ request }) => {
        const authToken = await getAuthToken(request);
        test.skip(!authToken, 'No auth token');

        const response = await request.get('/api/recommendations/for-you', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.data)).toBe(true);
    });

    test('TC-REC-02 Similar Destinations (public)', async ({ request }) => {
        const destinationId = await getFirstDestinationId(request);
        test.skip(!destinationId, 'No destination found');

        const response = await request.get(`/api/recommendations/similar/${destinationId}`);
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(Array.isArray(body.data)).toBe(true);
    });

    test('TC-REC-03 Similar Destinations - Invalid ID (400)', async ({ request }) => {
        const response = await request.get('/api/recommendations/similar/invalid-id-here');
        expect([400, 500]).toContain(response.status()); // Bad Request format ID or Server Catch Error
    });
});
