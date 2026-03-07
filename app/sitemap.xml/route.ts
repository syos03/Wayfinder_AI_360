/**
 * Sitemap Generator
 * Dynamic XML sitemap for SEO
 */

import { connectDB } from '@/lib/db/mongodb';
import Destination from '@/lib/models/Destination';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wayfinder.ai';

  // Static pages (always available)
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/explore', priority: '0.9', changefreq: 'daily' },
    { url: '/discover', priority: '0.8', changefreq: 'daily' },
    { url: '/community', priority: '0.7', changefreq: 'weekly' },
  ];

  let destinations: any[] = [];

  // Only fetch from DB if MONGODB_URI is available (not during build)
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
      destinations = await Destination.find({ isActive: true })
        .select('_id updatedAt')
        .lean();
    } catch (error) {
      console.error('Sitemap DB error:', error);
    }
  }

  try {
    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
${destinations
  .map(
    (dest) => `  <url>
    <loc>${baseUrl}/destinations/${dest._id}</loc>
    <lastmod>${new Date(dest.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}















