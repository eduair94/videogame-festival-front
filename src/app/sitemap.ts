import { MetadataRoute } from 'next';
import { fetchFestivals } from '@/lib/api';
import { Festival } from '@/types';

// Use environment variable for site URL, fallback to Vercel deployment
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://videogame-festival-front.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Dynamic event pages
  try {
    const response = await fetchFestivals();
    const festivals = (response.data || []) as Festival[];

    const eventPages: MetadataRoute.Sitemap = festivals.map((festival) => ({
      url: `${BASE_URL}/events/${festival.slug || festival._id}`,
      lastModified: festival.updatedAt ? new Date(festival.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...eventPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
