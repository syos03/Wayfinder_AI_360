import { test, expect } from '@playwright/test';
import { getAuthToken } from './test-helper';

test.describe('6. Profile API', () => {

    test('TC-PROF-01 Get Profile - Có Login', async ({ request }) => {
        const authToken = await getAuthToken(request);
        test.skip(!authToken, 'No auth token');
        const response = await request.get('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.user).toBeDefined();
        expect(body.data.user.email).toBeDefined();
    });

    test('TC-PROF-02 Update Profile - Basic Info', async ({ request }) => {
        const authToken = await getAuthToken(request);
        test.skip(!authToken, 'No auth token');

        const newName = "Updated Name " + Date.now();
        const response = await request.patch('/api/profile', {
            headers: { 'Authorization': `Bearer ${authToken}` },
            data: {
                name: newName,
                bio: "New interesting bio"
            }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.name).toBe(newName);
        expect(body.data.bio).toBe("New interesting bio");
    });

    test('TC-PROF-03 Update Profile - Location & Social', async ({ request }) => {
        const authToken = await getAuthToken(request);
        test.skip(!authToken, 'No auth token');

        const response = await request.patch('/api/profile', {
            headers: { 'Authorization': `Bearer ${authToken}` },
            data: {
                location: { city: "Hanoi", country: "Vietnam" },
                website: "https://wayfinder.vn"
            }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.location.city).toBe("Hanoi");
        expect(body.data.location.country).toBe("Vietnam");
    });
});
