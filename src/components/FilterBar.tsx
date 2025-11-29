'use client';

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { ArrowUpDown, Calendar, Clock, Filter, Gamepad2, Search, Timer, Trophy, X } from 'lucide-react';
import { useState } from 'react';

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
}

export default function FilterBar({ types, onFiltersChange, currentFilters }: FilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...currentFilters, search: e.target.value });
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({ ...currentFilters, type });
  };

  const handleViewChange = (view: 'all' | 'open' | 'upcoming' | 'deadlineSoon') => {
    onFiltersChange({ ...currentFilters, view });
  };

  const handleSortChange = (sortBy: 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc') => {
    onFiltersChange({ ...currentFilters, sortBy });
  };

  const clearFilters = () => {
    onFiltersChange({ search: '', type: '', view: 'open', sortBy: 'deadlineAsc' });
  };

  const hasActiveFilters = currentFilters.search || currentFilters.type;

  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('award')) return <Trophy className="w-4 h-4" />;
    if (lowerType.includes('steam') || lowerType.includes('sale')) return <Gamepad2 className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  const getViewButtonClass = (viewId: string) => {
    if (currentFilters.view !== viewId) {
      return 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10';
    }
    if (viewId === 'deadlineSoon') {
      return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25';
    }
    return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25';
  };

  const getFilterButtonClass = (isActive: boolean) => {
    return isActive
      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10';
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-linear-to-b from-gray-950 via-gray-950 to-gray-950/95 backdrop-blur-xl py-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, festivals, awards..."
                value={currentFilters.search}
                onChange={handleSearchChange}
                autoComplete="off"
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore
                suppressHydrationWarning
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
              />
            </div>
            
            <button
              onClick={() => setIsFilterOpen(true)}
              className={hasActiveFilters
                ? 'flex items-center gap-2 px-6 py-3.5 rounded-xl border transition-all duration-200 bg-purple-500/20 border-purple-500/50 text-purple-300'
                : 'flex items-center gap-2 px-6 py-3.5 rounded-xl border transition-all duration-200 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-purple-500 text-white rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { id: 'all', label: 'All Events', icon: <Gamepad2 className="w-4 h-4" /> },
              { id: 'upcoming', label: 'Upcoming Events', icon: <Calendar className="w-4 h-4" /> },
              { id: 'open', label: 'Open Submissions', icon: <Clock className="w-4 h-4" /> },
              { id: 'deadlineSoon', label: '⚡ Deadline Soon', icon: <Timer className="w-4 h-4" /> },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => handleViewChange(view.id as 'all' | 'open' | 'upcoming' | 'deadlineSoon')}
                className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' + getViewButtonClass(view.id)}
              >
                {view.icon}
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isFilterOpen} onClose={() => setIsFilterOpen(false)} className="relative z-50">
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out data-closed:opacity-0" 
        />

        <div className="fixed inset-0 flex items-end sm:items-center justify-center">
          <DialogPanel
            transition
            className="w-full sm:max-w-lg sm:mx-4 bg-gray-900 sm:rounded-2xl rounded-t-2xl border border-white/10 shadow-2xl transform transition-all duration-300 ease-out data-closed:translate-y-full sm:data-closed:translate-y-0 sm:data-closed:scale-95 sm:data-closed:opacity-0"
          >
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-600 rounded-full" />
            </div>

            <div className="max-h-[80vh] sm:max-h-[70vh] overflow-y-auto p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">Filters & Sorting</h3>
                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 text-gray-400 hover:text-white bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort By
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'relevance', label: 'Relevance' },
                    { id: 'dateAsc', label: 'Event Date (Soonest)' },
                    { id: 'dateDesc', label: 'Event Date (Latest)' },
                    { id: 'deadlineAsc', label: 'Submission Deadline' },
                  ].map((sort) => (
                    <button
                      key={sort.id}
                      onClick={() => handleSortChange(sort.id as 'relevance' | 'dateAsc' | 'dateDesc' | 'deadlineAsc')}
                      className={'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' + getFilterButtonClass(currentFilters.sortBy === sort.id)}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Event Type</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTypeChange('')}
                    className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' + getFilterButtonClass(!currentFilters.type)}
                  >
                    All Types
                  </button>
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' + getFilterButtonClass(currentFilters.type === type)}
                    >
                      {getTypeIcon(type)}
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sm:hidden p-4 pt-0">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}