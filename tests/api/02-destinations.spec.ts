import { test, expect } from '@playwright/test';

test.describe('2. Destinations API', () => {
    let firstDestinationId = '';

    test('TC-DEST-01 Get All Public', async ({ request }) => {
        const response = await request.get('/api/destinations?page=1&limit=12');

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.data.destinations)).toBe(true);
        expect(body.data.pagination).toBeDefined();

        // Check destinations are active
        const dests = body.data.destinations;
        dests.forEach((d: any) => expect(d.isActive).toBe(true));

        if (dests.length > 0) {
            firstDestinationId = dests[0]._id;
        }
    });

    test('TC-DEST-02 Search by Keyword', async ({ request }) => {
        const response = await request.get('/api/destinations?search=Hà Nội');
        expect(response.status()).toBe(200);
    });

    test('TC-DEST-03 Filter by Region', async ({ request }) => {
        const response = await request.get('/api/destinations?region=north');
        expect(response.status()).toBe(200);
    });

    test('TC-DEST-04 Filter by Type', async ({ request }) => {
        const response = await request.get('/api/destinations?type=beach');
        expect(response.status()).toBe(200);
    });

    test('TC-DEST-05 Get Detail by ID', async ({ request }) => {
        // Skip if no destinations exist
        test.skip(!firstDestinationId, 'No destination found to test detail');

        const response = await request.get(`/api/destinations/${firstDestinationId}`);
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data).toBeDefined();
    });

    test('TC-DEST-06 Get Invalid ID (400/404/500)', async ({ request }) => {
        const response = await request.get('/api/destinations/invalid-id-123');
        const status = response.status();
        // Validate that it handles error properly. NextJS might throw 500 or 400.
        expect([400, 404, 500].includes(status)).toBe(true);
    });

    test('TC-DEST-07 Pagination - Page 2', async ({ request }) => {
        const response = await request.get('/api/destinations?page=2&limit=6');
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.pagination.page).toBe(2);
    });
});
