'use client';

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import {
  ArrowDownAZ,
  ArrowUpDown,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Filter,
  Gamepad2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Trophy,
  X
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Hook to detect mobile screen size
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check initial value
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

interface FilterBarProps {
  types: string[];
  onFiltersChange: (filters: {
    search: string;
    type: string;
    view: 'all' | 'open' | 'upcoming' | 'deadlineSoon';
    sortBy: 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc';
  }) => void;
  currentFilters: {
    search: string;
    type: string;
    view: 'all' | 'open' | 'upcoming' | 'deadlineSoon';
    sortBy: 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc';
  };
  resultsCount?: number;
}

export default function FilterBar({ types, onFiltersChange, currentFilters, resultsCount }: FilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(currentFilters.search);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Detect mobile for conditional DialogPanel rendering
  const isMobile = useIsMobile();

  // Local state for filter modal/sidebar (only applied on "Apply" click)
  const [pendingFilters, setPendingFilters] = useState({
    view: currentFilters.view,
    type: currentFilters.type,
    sortBy: currentFilters.sortBy,
  });

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when expanded on mobile
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Sync searchValue with currentFilters.search when it changes externally (URL navigation)
  useEffect(() => {
    if (searchValue !== currentFilters.search) {
      setSearchValue(currentFilters.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters.search]);

  // Debounced search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      onFiltersChange({ ...currentFilters, search: value });
    }, 300);
  }, [currentFilters, onFiltersChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handlers that apply immediately (for quick filters outside the modal)
  const handleViewChange = (view: 'all' | 'open' | 'upcoming' | 'deadlineSoon') => {
    onFiltersChange({ ...currentFilters, view });
  };

  const handleSortChange = (sortBy: 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc') => {
    onFiltersChange({ ...currentFilters, sortBy });
    setIsSortOpen(false);
  };

  // Pending filter handlers (for modal/sidebar - only visual, not applied yet)
  const handlePendingViewChange = (view: 'all' | 'open' | 'upcoming' | 'deadlineSoon') => {
    setPendingFilters(prev => ({ ...prev, view }));
  };

  const handlePendingTypeChange = (type: string) => {
    setPendingFilters(prev => ({ ...prev, type }));
  };

  const handlePendingSortChange = (sortBy: 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc') => {
    setPendingFilters(prev => ({ ...prev, sortBy }));
  };

  // Open filter modal and sync pending state with current filters
  const openFilterModal = () => {
    setPendingFilters({
      view: currentFilters.view,
      type: currentFilters.type,
      sortBy: currentFilters.sortBy,
    });
    setIsFilterOpen(true);
  };

  // Apply pending filters and close modal
  const applyFilters = () => {
    onFiltersChange({
      ...currentFilters,
      view: pendingFilters.view,
      type: pendingFilters.type,
      sortBy: pendingFilters.sortBy,
    });
    setIsFilterOpen(false);
  };

  // Reset pending filters to defaults
  const resetPendingFilters = () => {
    setPendingFilters({
      view: 'open',
      type: '',
      sortBy: 'deadlineAsc',
    });
  };

  const clearSearch = () => {
    setSearchValue('');
    onFiltersChange({ ...currentFilters, search: '' });
    setIsSearchExpanded(false);
  };

  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({ search: '', type: '', view: 'open', sortBy: 'deadlineAsc' });
  };

  const removeFilter = (filterType: 'search' | 'type') => {
    if (filterType === 'search') {
      clearSearch();
    } else if (filterType === 'type') {
      onFiltersChange({ ...currentFilters, type: '' });
    }
  };

  const hasActiveFilters = currentFilters.search || currentFilters.type;
  const activeFiltersCount = [currentFilters.search, currentFilters.type].filter(Boolean).length;
  const hasPendingChanges = 
    pendingFilters.view !== currentFilters.view || 
    pendingFilters.type !== currentFilters.type || 
    pendingFilters.sortBy !== currentFilters.sortBy;

  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('award')) return <Trophy className="w-3.5 h-3.5" />;
    if (lowerType.includes('steam') || lowerType.includes('sale')) return <Gamepad2 className="w-3.5 h-3.5" />;
    return <Calendar className="w-3.5 h-3.5" />;
  };

  const viewOptions = [
    { id: 'all', label: 'All', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'open', label: 'Open', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'upcoming', label: 'Soon', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'deadlineSoon', label: 'Urgent', icon: <Timer className="w-3.5 h-3.5" />, urgent: true },
  ];

  const sortOptions = [
    { id: 'deadlineAsc', label: 'Deadline', shortLabel: 'Deadline', icon: <Timer className="w-4 h-4" /> },
    { id: 'dateAsc', label: 'Event (Soonest)', shortLabel: 'Soonest', icon: <Calendar className="w-4 h-4" /> },
    { id: 'dateDesc', label: 'Event (Latest)', shortLabel: 'Latest', icon: <Calendar className="w-4 h-4" /> },
    { id: 'relevance', label: 'Relevance', shortLabel: 'Relevant', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const currentSortOption = sortOptions.find(s => s.id === currentFilters.sortBy);

  return (
    <>
      <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-xl border-b border-white/10">
        {/* Mobile Compact Bar */}
        <div className="sm:hidden">
          {/* Search Expanded State */}
          {isSearchExpanded ? (
            <div className="px-3 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search events..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  autoComplete="off"
                  className="w-full pl-9 pr-9 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Compact Controls Row */
            <div className="flex items-center gap-1.5 px-3 py-2">
              {/* Filter Button */}
              <button
                onClick={openFilterModal}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  hasActiveFilters
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-white/5 text-gray-300'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 text-xs bg-purple-500 text-white rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Current View Status Pill */}
              {(() => {
                const currentView = viewOptions.find(v => v.id === currentFilters.view);
                const isUrgent = currentView?.urgent;
                return (
                  <button
                    onClick={openFilterModal}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isUrgent
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {currentView?.icon}
                    <span>{currentView?.id === 'upcoming' ? 'Soon' : currentView?.id === 'open' ? 'Open' : currentView?.id === 'deadlineSoon' ? 'Urgent' : 'All'}</span>
                  </button>
                );
              })()}

              <div className="flex-1" />

              {/* Search Icon Button */}
              <button
                onClick={() => setIsSearchExpanded(true)}
                className={`p-2 rounded-lg transition-all ${
                  currentFilters.search
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-white/5 text-gray-400'
                }`}
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Sort Dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-1 px-2 py-2 rounded-lg bg-white/5 text-gray-400 text-xs"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSortChange(option.id as 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc')}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all ${
                          currentFilters.sortBy === option.id
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        {option.icon}
                        <span>{option.shortLabel}</span>
                        {currentFilters.sortBy === option.id && <Check className="w-3 h-3 ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Filters Pills - Horizontal Scroll */}
          {hasActiveFilters && !isSearchExpanded && (
            <div className="flex items-center gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-none">
              {currentFilters.search && (
                <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs whitespace-nowrap">
                  <span className="max-w-20 truncate">&quot;{currentFilters.search}&quot;</span>
                  <button onClick={() => removeFilter('search')} className="p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {currentFilters.type && (
                <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs whitespace-nowrap">
                  <span>{currentFilters.type}</span>
                  <button onClick={() => removeFilter('type')} className="p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 whitespace-nowrap px-1"
              >
                Clear
              </button>
            </div>
          )}

          {/* Results Count - Only show if exists */}
          {resultsCount !== undefined && !isSearchExpanded && (
            <div className="px-3 pb-2 text-xs text-gray-500">
              <span className="text-white font-medium">{resultsCount}</span> results
            </div>
          )}
        </div>

        {/* Desktop Full Bar */}
        <div className="hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Search Row */}
            <div className="flex gap-3">
              {/* Search Input */}
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search events, festivals, awards..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  autoComplete="off"
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore
                  suppressHydrationWarning
                  className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 focus:bg-white/[0.07] transition-all duration-200"
                />
                {searchValue && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-all"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Sort Dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 px-4 py-3 h-[46px] rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 whitespace-nowrap"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="text-sm font-medium">{currentSortOption?.label}</span>
                </button>
                
                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in slide-in-from-top-2">
                    <div className="p-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleSortChange(option.id as 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc')}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                            currentFilters.sortBy === option.id
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className={currentFilters.sortBy === option.id ? 'text-purple-400' : 'text-gray-500'}>
                            {option.icon}
                          </span>
                          <span className="flex-1 text-left">{option.label}</span>
                          {currentFilters.sortBy === option.id && (
                            <Check className="w-4 h-4 text-purple-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Filters Button */}
              <button
                onClick={openFilterModal}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 h-[46px] ${
                  hasActiveFilters
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-purple-500 text-white rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* View Tabs */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center bg-white/5 rounded-xl p-1 gap-0.5">
                {viewOptions.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => handleViewChange(view.id as 'all' | 'open' | 'upcoming' | 'deadlineSoon')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentFilters.view === view.id
                        ? view.urgent
                          ? 'bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                          : 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {view.icon}
                    <span>{view.id === 'upcoming' ? 'Upcoming' : view.id === 'open' ? 'Open Submissions' : view.id === 'deadlineSoon' ? 'Deadline Soon' : 'All Events'}</span>
                  </button>
                ))}
              </div>

              {resultsCount !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm text-gray-400">
                  <span className="font-semibold text-white">{resultsCount}</span>
                  <span>results</span>
                </div>
              )}
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Active:</span>
                
                {currentFilters.search && (
                  <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full text-sm">
                    <Search className="w-3 h-3" />
                    <span className="max-w-32 truncate">&quot;{currentFilters.search}&quot;</span>
                    <button
                      onClick={() => removeFilter('search')}
                      className="p-0.5 hover:bg-purple-500/30 rounded-full transition-colors ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                
                {currentFilters.type && (
                  <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full text-sm">
                    {getTypeIcon(currentFilters.type)}
                    <span>{currentFilters.type}</span>
                    <button
                      onClick={() => removeFilter('type')}
                      className="p-0.5 hover:bg-purple-500/30 rounded-full transition-colors ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-all"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Dialog - Conditionally render ONE DialogPanel based on screen size */}
      <Dialog open={isFilterOpen} onClose={() => setIsFilterOpen(false)} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out data-closed:opacity-0" 
        />

        {/* Render only ONE DialogPanel based on screen size */}
        {isMobile ? (
          /* Mobile: Slide-in sidebar from left */
          <div className="fixed inset-0">
            <DialogPanel
              transition
              className="w-[85%] max-w-sm h-full bg-gray-900 border-r border-white/10 shadow-2xl transition-transform duration-300 ease-out data-closed:-translate-x-full"
            >
              <MobileFilterContent
                viewOptions={viewOptions}
                sortOptions={sortOptions}
                types={types}
                pendingFilters={pendingFilters}
                activeFiltersCount={activeFiltersCount}
                onClose={() => setIsFilterOpen(false)}
                onViewChange={handlePendingViewChange}
                onTypeChange={handlePendingTypeChange}
                onSortChange={handlePendingSortChange}
                onReset={resetPendingFilters}
                onApply={applyFilters}
                getTypeIcon={getTypeIcon}
              />
            </DialogPanel>
          </div>
        ) : (
          /* Desktop: Centered modal */
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-lg bg-gray-900 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 ease-out data-closed:scale-95 data-closed:opacity-0"
            >
              <DesktopFilterContent
                viewOptions={viewOptions}
                sortOptions={sortOptions}
                types={types}
                pendingFilters={pendingFilters}
                activeFiltersCount={activeFiltersCount}
                hasPendingChanges={hasPendingChanges}
                resultsCount={resultsCount}
                onClose={() => setIsFilterOpen(false)}
                onViewChange={handlePendingViewChange}
                onTypeChange={handlePendingTypeChange}
                onSortChange={handlePendingSortChange}
                onReset={resetPendingFilters}
                onApply={applyFilters}
                getTypeIcon={getTypeIcon}
              />
            </DialogPanel>
          </div>
        )}
      </Dialog>
    </>
  );
}

// =============================================================================
// Mobile Filter Content Component
// =============================================================================
interface MobileFilterContentProps {
  viewOptions: Array<{ id: string; label: string; icon: React.ReactNode; urgent?: boolean }>;
  sortOptions: Array<{ id: string; label: string; shortLabel: string; icon: React.ReactNode }>;
  types: string[];
  pendingFilters: { view: string; type: string; sortBy: string };
  activeFiltersCount: number;
  onClose: () => void;
  onViewChange: (view: 'all' | 'open' | 'upcoming' | 'deadlineSoon') => void;
  onTypeChange: (type: string) => void;
  onSortChange: (sortBy: 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc') => void;
  onReset: () => void;
  onApply: () => void;
  getTypeIcon: (type: string) => React.ReactNode;
}

function MobileFilterContent({
  viewOptions,
  sortOptions,
  types,
  pendingFilters,
  activeFiltersCount,
  onClose,
  onViewChange,
  onTypeChange,
  onSortChange,
  onReset,
  onApply,
  getTypeIcon,
}: MobileFilterContentProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-semibold text-white">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-purple-500 text-white rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* View Section */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Status
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {viewOptions.map((view) => (
              <button
                type="button"
                key={view.id}
                onClick={() => onViewChange(view.id as 'all' | 'open' | 'upcoming' | 'deadlineSoon')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pendingFilters.view === view.id
                    ? view.urgent
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                {view.icon}
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event Type Section */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Event Type
          </h4>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onTypeChange('')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !pendingFilters.type
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'bg-white/5 text-gray-400'
              }`}
            >
              {!pendingFilters.type && <Check className="w-4 h-4" />}
              <span>All Types</span>
            </button>
            {types.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => onTypeChange(type)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pendingFilters.type === type
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                {pendingFilters.type === type ? <Check className="w-4 h-4" /> : getTypeIcon(type)}
                <span>{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Section */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Sort By
          </h4>
          <div className="space-y-1.5">
            {sortOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => onSortChange(option.id as 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc')}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pendingFilters.sortBy === option.id
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                {option.icon}
                <span className="flex-1 text-left">{option.label}</span>
                {pendingFilters.sortBy === option.id && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 text-sm text-gray-400 border border-white/10 rounded-lg"
        >
          Reset All
        </button>
        <button
          type="button"
          onClick={onApply}
          className="w-full py-2.5 bg-purple-500 text-white text-sm font-semibold rounded-lg"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Desktop Filter Content Component
// =============================================================================
interface DesktopFilterContentProps {
  viewOptions: Array<{ id: string; label: string; icon: React.ReactNode; urgent?: boolean }>;
  sortOptions: Array<{ id: string; label: string; shortLabel: string; icon: React.ReactNode }>;
  types: string[];
  pendingFilters: { view: string; type: string; sortBy: string };
  activeFiltersCount: number;
  hasPendingChanges: boolean;
  resultsCount?: number;
  onClose: () => void;
  onViewChange: (view: 'all' | 'open' | 'upcoming' | 'deadlineSoon') => void;
  onTypeChange: (type: string) => void;
  onSortChange: (sortBy: 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc') => void;
  onReset: () => void;
  onApply: () => void;
  getTypeIcon: (type: string) => React.ReactNode;
}

function DesktopFilterContent({
  viewOptions,
  sortOptions,
  types,
  pendingFilters,
  activeFiltersCount,
  hasPendingChanges,
  resultsCount,
  onClose,
  onViewChange,
  onTypeChange,
  onSortChange,
  onReset,
  onApply,
  getTypeIcon,
}: DesktopFilterContentProps) {
  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Filter className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              {activeFiltersCount > 0 && (
                <p className="text-xs text-gray-500">{activeFiltersCount} active</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Status */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
            <Clock className="w-4 h-4 text-purple-400" />
            Status
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {viewOptions.map((view) => (
              <button
                type="button"
                key={view.id}
                onClick={() => onViewChange(view.id as 'all' | 'open' | 'upcoming' | 'deadlineSoon')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pendingFilters.view === view.id
                    ? view.urgent
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {pendingFilters.view === view.id ? <Check className="w-4 h-4" /> : view.icon}
                {view.id === 'upcoming' ? 'Upcoming' : view.id === 'open' ? 'Open' : view.id === 'deadlineSoon' ? 'Deadline Soon' : 'All Events'}
              </button>
            ))}
          </div>
        </div>

        {/* Event Type */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            Event Type
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onTypeChange('')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                !pendingFilters.type
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {!pendingFilters.type && <Check className="w-4 h-4" />}
              All Types
            </button>
            {types.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => onTypeChange(type)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pendingFilters.type === type
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {pendingFilters.type === type ? <Check className="w-4 h-4" /> : getTypeIcon(type)}
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
            <ArrowDownAZ className="w-4 h-4 text-purple-400" />
            Sort By
          </h4>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => onSortChange(option.id as 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pendingFilters.sortBy === option.id
                    ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={pendingFilters.sortBy === option.id ? 'text-purple-400' : 'text-gray-500'}>
                  {option.icon}
                </span>
                <span className="flex-1 text-left">{option.label}</span>
                {pendingFilters.sortBy === option.id && <Check className="w-4 h-4 text-purple-400" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm px-6 py-4 border-t border-white/10">
        <div className="flex gap-3">
          {hasPendingChanges && (
            <button
              type="button"
              onClick={onReset}
              className="flex-1 py-3 px-4 text-gray-400 hover:text-white font-medium rounded-xl border border-white/10 hover:bg-white/5 transition-all"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onApply}
            className={`flex-1 py-3 px-4 bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 ${
              hasPendingChanges ? '' : 'w-full'
            }`}
          >
            {resultsCount !== undefined ? `Show ${resultsCount} Results` : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}