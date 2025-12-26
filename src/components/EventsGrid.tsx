'use client';

import { Festival } from '@/types';
import { AlertCircle, Calendar, Clock, Loader2, Timer } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EventCard from './EventCard';
import FilterBar from './FilterBar';

type SortOption = 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc';
type ViewOption = 'all' | 'open' | 'upcoming' | 'deadlineSoon';

interface EventsGridProps {
  initialFestivals: Festival[];
  types: string[];
}

export default function EventsGrid({ initialFestivals, types }: EventsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [festivals, setFestivals] = useState<Festival[]>(initialFestivals);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get filters from URL query parameters
  const getFiltersFromURL = useCallback(() => {
    const viewParam = searchParams.get('view');
    const searchParam = searchParams.get('search');
    const typeParam = searchParams.get('type');
    const sortParam = searchParams.get('sort');

    return {
      view: (['open', 'upcoming', 'deadlineSoon', 'all'].includes(viewParam || '') 
        ? viewParam as ViewOption 
        : 'open') as ViewOption,
      search: searchParam || '',
      type: typeParam || '',
      sortBy: (['relevance', 'dateAsc', 'dateDesc', 'deadlineAsc'].includes(sortParam || '')
        ? sortParam as SortOption
        : 'deadlineAsc') as SortOption,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(getFiltersFromURL);

  // Sync filters with URL when URL changes (e.g., back/forward navigation)
  useEffect(() => {
    const urlFilters = getFiltersFromURL();
    setFilters(urlFilters);
    
    // Scroll to events section if coming from a link
    if (searchParams.get('view')) {
      const eventsSection = document.getElementById('events');
      if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams, getFiltersFromURL]);

  // Debounce ref for search updates
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    
    // Build new URL with query parameters
    const params = new URLSearchParams();
    
    if (newFilters.view && newFilters.view !== 'open') {
      params.set('view', newFilters.view);
    }
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    if (newFilters.type) {
      params.set('type', newFilters.type);
    }
    if (newFilters.sortBy && newFilters.sortBy !== 'deadlineAsc') {
      params.set('sort', newFilters.sortBy);
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';
    
    // Debounce URL updates for search to avoid too many history entries
    if (newFilters.search !== filters.search) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = setTimeout(() => {
        router.replace(newUrl, { scroll: false });
      }, 500);
    } else {
      // For non-search filter changes, update immediately
      router.push(newUrl, { scroll: false });
    }
  }, [router, filters.search]);

  const fetchFilteredFestivals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = 'https://videogame-events-api.vercel.app/api/festivals';
      
      if (filters.view === 'open' || filters.view === 'deadlineSoon') {
        endpoint = 'https://videogame-events-api.vercel.app/api/festivals/open';
      } else if (filters.view === 'upcoming') {
        endpoint = 'https://videogame-events-api.vercel.app/api/festivals/upcoming?days=365';
      }
      
      const params = new URLSearchParams();
      if (filters.type && filters.view === 'all') {
        params.set('type', filters.type);
      }
      if (filters.search && filters.view === 'all') {
        params.set('search', filters.search);
      }
      params.set('limit', '500');
      
      const url = filters.view === 'all' ? `${endpoint}?${params.toString()}` : endpoint;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      
      if (data.success) {
        setFestivals(data.data);
      } else {
        setError('Failed to fetch events');
      }
    } catch {
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters.view, filters.type, filters.search]);

  useEffect(() => {
    // Always fetch fresh data from the API (client-side with no-cache)
    // This ensures we bypass any Vercel edge cache
    fetchFilteredFestivals();
  }, [filters.view, filters.type, filters.search, fetchFilteredFestivals]);

  // Client-side filtering and sorting using API fields
  const filteredFestivals = useMemo(() => {
    let result = [...festivals];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(searchLower) ||
          f.type?.toLowerCase().includes(searchLower) ||
          f.enrichment?.description?.toLowerCase().includes(searchLower) ||
          f.when?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply type filter for non-all views
    if (filters.type && filters.view !== 'all') {
      result = result.filter((f) => f.type === filters.type);
    }

    // Apply deadline soon filter (within 14 days) using API's daysToSubmit
    if (filters.view === 'deadlineSoon') {
      result = result.filter((f) => {
        const days = f.daysToSubmit;
        return days !== undefined && days !== null && days >= 0 && days <= 14;
      });
    }

    // Apply sorting using API fields
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'deadlineAsc': {
          // Use API's daysToSubmit field
          const daysA = a.daysToSubmit ?? Infinity;
          const daysB = b.daysToSubmit ?? Infinity;
          // Open submissions first, then by deadline (closest first)
          const openA = a.submissionOpen === true;
          const openB = b.submissionOpen === true;
          if (openA && !openB) return -1;
          if (!openA && openB) return 1;
          // For open ones, sort by closest deadline
          if (openA && openB) {
            return daysA - daysB;
          }
          return daysA - daysB;
        }
        case 'dateAsc': {
          // Use 'when' field or deadline for sorting
          const getMonthOrder = (when?: string) => {
            if (!when) return 999;
            const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                           'july', 'august', 'september', 'october', 'november', 'december'];
            const lowerWhen = when.toLowerCase();
            for (let i = 0; i < months.length; i++) {
              if (lowerWhen.includes(months[i])) return i;
            }
            return 999;
          };
          return getMonthOrder(a.when) - getMonthOrder(b.when);
        }
        case 'dateDesc': {
          const getMonthOrder = (when?: string) => {
            if (!when) return -1;
            const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                           'july', 'august', 'september', 'october', 'november', 'december'];
            const lowerWhen = when.toLowerCase();
            for (let i = 0; i < months.length; i++) {
              if (lowerWhen.includes(months[i])) return i;
            }
            return -1;
          };
          return getMonthOrder(b.when) - getMonthOrder(a.when);
        }
        case 'relevance':
        default:
          // Prioritize open submissions
          const openA = a.submissionOpen === true;
          const openB = b.submissionOpen === true;
          if (openA && !openB) return -1;
          if (!openA && openB) return 1;
          return 0;
      }
    });
    
    return result;
  }, [festivals, filters.search, filters.type, filters.view, filters.sortBy]);

  // Calculate summary stats
  const openCount = filteredFestivals.filter(f => f.submissionOpen === true).length;
  const closingSoonCount = filteredFestivals.filter(f => 
    f.submissionOpen === true && f.daysToSubmit !== undefined && f.daysToSubmit !== null && f.daysToSubmit >= 0 && f.daysToSubmit <= 14
  ).length;

  return (
    <>
      <FilterBar
        types={types}
        onFiltersChange={updateFilters}
        currentFilters={filters}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <p className="text-gray-400 text-sm sm:text-base">
              Showing <span className="text-white font-medium">{filteredFestivals.length}</span> events
            </p>
            <div className="flex items-center gap-2">
              {openCount > 0 && (
                <button
                  onClick={() => updateFilters({ ...filters, view: 'open' })}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-full transition-all hover:scale-105 ${
                    filters.view === 'open' 
                      ? 'bg-green-500/30 text-green-300 ring-1 ring-green-500/50' 
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span className="whitespace-nowrap">{openCount} open</span>
                </button>
              )}
              {closingSoonCount > 0 && (
                <button
                  onClick={() => updateFilters({ ...filters, view: 'deadlineSoon' })}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-full transition-all hover:scale-105 ${
                    filters.view === 'deadlineSoon'
                      ? 'bg-orange-500/30 text-orange-300 ring-1 ring-orange-500/50'
                      : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 animate-pulse'
                  }`}
                >
                  <Timer className="w-3 h-3" />
                  <span className="whitespace-nowrap">{closingSoonCount} closing</span>
                </button>
              )}
            </div>
          </div>
          {filters.view !== 'all' && (
            <span className="flex items-center gap-2 text-xs sm:text-sm text-purple-400">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {filters.view === 'open' && 'Currently accepting submissions'}
              {filters.view === 'upcoming' && 'Upcoming events'}
              {filters.view === 'deadlineSoon' && '⚡ Closing within 14 days'}
            </span>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <span className="ml-3 text-gray-400">Loading events...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchFilteredFestivals}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <>
            {filteredFestivals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFestivals.map((festival) => (
                  <EventCard 
                    key={festival._id} 
                    festival={festival} 
                    onFilterChange={(view) => updateFilters({ ...filters, view })}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Calendar className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                <p className="text-gray-400 max-w-md">
                  Try adjusting your filters or search terms to find more events.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
