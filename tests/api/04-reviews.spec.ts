import { test, expect } from '@playwright/test';
import { getAuthToken, getFirstDestinationId } from './test-helper';

test.describe('4. Reviews API', () => {

    test('TC-REV-01 Get Reviews - Newest (Default)', async ({ request }) => {
        const destinationId = await getFirstDestinationId(request);
        test.skip(!destinationId, 'Pre-req missing');
        const response = await request.get(`/api/reviews?destinationId=${destinationId}&limit=5`);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.data.reviews)).toBe(true);
    });

    test('TC-REV-02 Get Reviews - Sort Highest Rating', async ({ request }) => {
        const destinationId = await getFirstDestinationId(request);
        test.skip(!destinationId, 'Pre-req missing');
        const response = await request.get(`/api/reviews?destinationId=${destinationId}&sort=rating_desc`);
        expect(response.status()).toBe(200);
    });

    test('TC-REV-03 Get Reviews - Không Có destinationId (400)', async ({ request }) => {
        const response = await request.get('/api/reviews');
        expect(response.status()).toBe(400);
    });

    test('TC-REV-04 Post Review - Thành Công', async ({ request }) => {
        const authToken = await getAuthToken(request);
        const destinationId = await getFirstDestinationId(request);
        test.skip(!authToken || !destinationId, 'Pre-req missing');

        const response = await request.post('/api/reviews', {
            headers: { 'Authorization': `Bearer ${authToken}` },
            data: {
                destinationId: destinationId,
                rating: 5,
                title: "Địa điểm tuyệt vời!",
                content: "Tôi rất thích nơi này, cảnh đẹp và dịch vụ tốt."
            }
        });

        expect([200, 201]).toContain(response.status()); // Created or OK
        const body = await response.json();
        expect(body.data?.review?.rating || body.rating).toBeDefined();
    });

    test('TC-REV-05 Post Review - Duplicate (400)', async ({ request }) => {
        const authToken = await getAuthToken(request);
        const destinationId = await getFirstDestinationId(request);
        test.skip(!authToken || !destinationId, 'Pre-req missing');

        // Post 1st time
        await request.post('/api/reviews', {
            headers: { 'Authorization': `Bearer ${authToken}` },
            data: { destinationId, rating: 4, title: "Tốt", content: "Khá ổn." }
        });

        // Post 2nd time
        const response = await request.post('/api/reviews', {
            headers: { 'Authorization': `Bearer ${authToken}` },
            data: { destinationId, rating: 3, title: "Bình thường", content: "Tạm được." }
        });

        expect(response.status()).toBe(400);
    });

    test('TC-REV-06 Post Review - Rating > 5 (400)', async ({ request }) => {
        const authToken = await getAuthToken(request);
        const destinationId = await getFirstDestinationId(request);
        test.skip(!authToken || !destinationId, 'Pre-req missing');

        const response = await request.post('/api/reviews', {
            headers: { 'Authorization': `Bearer ${authToken}` },
            data: {
                destinationId: destinationId,
                rating: 6,
                title: "Rating sai",
                content: "Rating không hợp lệ"
            }
        });
        expect(response.status()).toBe(400);
    });
});
