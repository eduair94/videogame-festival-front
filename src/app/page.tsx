import EventsGrid from '@/components/EventsGrid';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import { fetchFestivalStats, fetchFestivalTypes, fetchOpenFestivals } from '@/lib/api';
import { Festival } from '@/types';
import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

// Page-specific metadata (will be merged with layout metadata)
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

interface StatsData {
  total: number;
  byType: { type: string; count: number }[];
  openSubmissions?: number;
}

async function getData() {
  try {
    const [festivalsRes, statsRes, typesRes] = await Promise.all([
      fetchOpenFestivals(),
      fetchFestivalStats(),
      fetchFestivalTypes(),
    ]);

    return {
      festivals: festivalsRes.data as Festival[],
      stats: statsRes.data as StatsData,
      types: typesRes.data as string[],
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      festivals: [],
      stats: { total: 0, byType: [], openSubmissions: 0 },
      types: [],
    };
  }
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex items-center gap-3">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <span className="text-gray-400 text-lg">Loading events...</span>
      </div>
    </div>
  );
}

// Site URL from environment variable
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://videogame-festival-front.vercel.app';

// Generate JSON-LD structured data for homepage (ItemList of events)
function generateHomePageJsonLd(festivals: Festival[], stats: StatsData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Indie Game Festivals & Events',
    description: `Discover ${stats.total} indie game festivals, showcases, and awards. ${stats.openSubmissions || 0} currently accepting submissions.`,
    numberOfItems: festivals.length,
    itemListElement: festivals.slice(0, 20).map((festival, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: festival.name,
        description: festival.enrichment?.description || `${festival.name} - ${festival.type}`,
        url: `${SITE_URL}/events/${festival.slug || festival._id}`,
        eventStatus: festival.submissionOpen
          ? 'https://schema.org/EventScheduled'
          : 'https://schema.org/EventPostponed',
      },
    })),
  };
}

export default async function Home() {
  const { festivals, stats, types } = await getData();

  const jsonLd = generateHomePageJsonLd(festivals, stats);

  return (
    <>
      {/* JSON-LD Structured Data for rich search results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        
        <main id="events">
          <StatsBar stats={stats} />
          
          <Suspense fallback={<LoadingFallback />}>
            <EventsGrid initialFestivals={festivals} types={types} />
          </Suspense>
        </main>

        <Footer />
      </div>
    </>
  );
}
