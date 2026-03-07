import { test, expect } from '@playwright/test';

test.describe('5. Search API', () => {

    test('TC-SEARCH-01 Search - Có Từ Khóa', async ({ request }) => {
        const response = await request.get('/api/search?q=biển');
        expect(response.status()).toBe(200);
    });

    test('TC-SEARCH-02 Search - Từ Khóa Rỗng', async ({ request }) => {
        const response = await request.get('/api/search?q=');
        expect(response.status()).not.toBe(500);
        // It might be 400 or empty 200 array based on implementation, postman checks no 500
    });

    test('TC-SEARCH-03 Search - Ký Tự Đặc Biệt', async ({ request }) => {
        // encodeURIComponent is safe
        const response = await request.get(`/api/search?q=${encodeURIComponent('!@#$%')}`);
        expect(response.status()).not.toBe(500);
    });
});
