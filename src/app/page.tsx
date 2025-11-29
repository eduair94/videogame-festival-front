import EventsGrid from '@/components/EventsGrid';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import { fetchFestivals, fetchFestivalStats, fetchFestivalTypes } from '@/lib/api';
import { Festival } from '@/types';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

interface StatsData {
  total: number;
  byType: { type: string; count: number }[];
  openSubmissions?: number;
}

async function getData() {
  try {
    const [festivalsRes, statsRes, typesRes] = await Promise.all([
      fetchFestivals({ limit: 200 }),
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

export default async function Home() {
  const { festivals, stats, types } = await getData();

  return (
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
  );
}
