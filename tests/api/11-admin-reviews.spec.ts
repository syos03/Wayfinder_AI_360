import { test, expect } from '@playwright/test';
import { getAdminToken, getAuthToken, getFirstDestinationId } from './test-helper';

test.describe('11. Admin - Reviews API', () => {

    test('TC-ADMIN-REV-01 Get All Reviews', async ({ request }) => {
        const adminToken = await getAdminToken(request);
        const response = await request.get('/api/admin/reviews?page=1&limit=10', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.data?.reviews)).toBe(true);
    });

    test('TC-ADMIN-REV-02 Approve Review && TC-ADMIN-REV-03 Reject Review', async ({ request }) => {
        const destinationId = await getFirstDestinationId(request);
        const normalUserToken = await getAuthToken(request);
        test.skip(!destinationId || !normalUserToken, 'Pre-req missing');

        // Normal user creates a review
        const reviewRes = await request.post('/api/reviews', {
            headers: { 'Authorization': `Bearer ${normalUserToken}` },
            data: {
                destinationId: destinationId,
                rating: 4,
                title: 'Rất tốt (Admin Test)',
                content: 'Tôi tham gia tour và thấy rất tuyệt (Dành cho Admin test duyệt bài)'
            }
        });

        const reviewBody = await reviewRes.json();
        let reviewId = reviewBody.data?.review?._id;

        if (!reviewId) {
            const existingRes = await request.get('/api/reviews?limit=1');
            const existingBody = await existingRes.json();
            reviewId = existingBody.data?.reviews?.[0]?._id;
        }

        test.skip(!reviewId, 'No review found for admin testing');

        // Admin Token fetch
        const adminToken = await getAdminToken(request);

        // Approve it
        const approveResponse = await request.patch(`/api/admin/reviews/${reviewId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
            data: { action: 'approve', moderatorNotes: 'Ok good' }
        });
        expect([200, 400]).toContain(approveResponse.status());

        // Reject it
        const rejectResponse = await request.patch(`/api/admin/reviews/${reviewId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
            data: { action: 'reject', moderatorNotes: "Nội dung vi phạm" }
        });
        expect([200, 400]).toContain(rejectResponse.status());

        // Delete it
        const deleteResponse = await request.delete(`/api/admin/reviews/${reviewId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        expect(deleteResponse.status()).toBe(200);
    });
});
