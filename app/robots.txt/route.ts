/**
 * Robots.txt Generator
 * Dynamic robots.txt for SEO
 */

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wayfinder.ai';

  const robotsTxt = `# Wayfinder AI - Robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /register

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}















