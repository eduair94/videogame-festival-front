'use client';

import { formatDate } from '@/lib/utils';
import { Festival } from '@/types';
import { Calendar, CheckCircle, Clock, DollarSign, ExternalLink, Gamepad2, Info, MapPin, Timer, Trophy, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface EventCardProps {
  festival: Festival;
  onFilterChange?: (view: 'open' | 'deadlineSoon') => void;
}

export default function EventCard({ festival, onFilterChange }: EventCardProps) {
  const [showComments, setShowComments] = useState(false);
  
  // Use API fields directly
  const isOpen = festival.submissionOpen === true;
  const daysToSubmit = festival.daysToSubmit ?? null;
  const deadline = festival.deadline;
  const when = festival.when;
  const price = festival.price;
  const hasSteamPage = festival.hasSteamPage;

  // Determine urgency based on daysToSubmit
  const getDeadlineUrgency = () => {
    if (daysToSubmit === null || daysToSubmit < 0) return null;
    if (daysToSubmit <= 3) return 'critical';
    if (daysToSubmit <= 7) return 'soon';
    if (daysToSubmit <= 14) return 'upcoming';
    return 'normal';
  };

  const urgency = getDeadlineUrgency();

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Festival': 'from-purple-500 to-pink-500',
      'Award': 'from-amber-500 to-orange-500',
      'Steam Sale': 'from-blue-500 to-cyan-500',
      'Showcase': 'from-green-500 to-emerald-500',
      'Expo': 'from-red-500 to-rose-500',
      'Game Jam': 'from-violet-500 to-purple-500',
      'Digital Expo': 'from-indigo-500 to-purple-500',
      'Digital Awards': 'from-yellow-500 to-amber-500',
      'Physical Expo': 'from-teal-500 to-cyan-500',
      'Physical Awards': 'from-orange-500 to-red-500',
      'Hybrid Expo': 'from-emerald-500 to-teal-500',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('award')) return <Trophy className="w-3.5 h-3.5" />;
    if (lowerType.includes('steam') || lowerType.includes('sale')) return <Gamepad2 className="w-3.5 h-3.5" />;
    return <Calendar className="w-3.5 h-3.5" />;
  };

  const getUrgencyStyles = (urg: string | null) => {
    switch (urg) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      case 'soon':
        return 'bg-orange-500/20 border-orange-500/30 text-orange-300';
      case 'upcoming':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'normal':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const getStatusBadge = () => {
    if (isOpen && daysToSubmit !== null && daysToSubmit >= 0) {
      // Use 14 days threshold to be consistent with "Deadline Soon" filter
      if (daysToSubmit <= 14) {
        return { text: 'Closing Soon', color: 'from-red-500 to-orange-500', pulse: daysToSubmit <= 3, view: 'deadlineSoon' as const };
      }
      return { text: 'Open', color: 'from-green-500 to-emerald-500', pulse: false, view: 'open' as const };
    }
    if (daysToSubmit !== null && daysToSubmit < 0) {
      return { text: 'Closed', color: 'from-gray-600 to-gray-700', pulse: false, view: null };
    }
    return null;
  };

  const statusBadge = getStatusBadge();

  const placeholderImage = `https://placehold.co/600x400/1a1a2e/9333ea?text=${encodeURIComponent(festival.name.substring(0, 20))}`;
  const imageUrl = festival.enrichment?.imageUrl || placeholderImage;

  // Use slug for SEO-friendly URLs, fallback to _id for backwards compatibility
  const eventUrl = festival.slug ? `/events/${festival.slug}` : `/events/${festival._id}`;

  return (
    <Link href={eventUrl} className="block h-full">
      <article className="group relative bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 h-full flex flex-col min-h-[420px]">
        {/* Image Section - Fixed height */}
        <div className="relative h-40 shrink-0 overflow-hidden">
          <Image
            src={imageUrl}
            alt={festival.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
          
          {/* Badges Container */}
          <div className="absolute inset-x-3 top-3 flex justify-between items-start">
            {/* Type Badge */}
            <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-gradient-to-r ${getTypeColor(festival.type)} rounded-full shadow-lg`}>
              {getTypeIcon(festival.type)}
              <span className="max-w-[100px] truncate">{festival.type}</span>
            </span>

            {/* Status Badge - Clickable */}
            {statusBadge && statusBadge.view && onFilterChange ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFilterChange(statusBadge.view!);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-gradient-to-r ${statusBadge.color} rounded-full shadow-lg hover:scale-105 transition-transform ${statusBadge.pulse ? 'animate-pulse' : ''}`}
              >
                {isOpen ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {statusBadge.text}
              </button>
            ) : statusBadge ? (
              <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-gradient-to-r ${statusBadge.color} rounded-full shadow-lg ${statusBadge.pulse ? 'animate-pulse' : ''}`}>
                {isOpen ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {statusBadge.text}
              </span>
            ) : null}
          </div>
        </div>

        {/* Content Section - Flex grow to fill remaining space */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title - Fixed 2 lines */}
          <h3 className="text-lg font-bold text-white mb-2.5 line-clamp-2 min-h-[3.5rem] group-hover:text-purple-300 transition-colors leading-tight">
            {festival.name}
          </h3>

          {/* Description - Fixed 2 lines */}
          <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
            {festival.enrichment?.description || 'No description available'}
          </p>

          {/* Comments/Notes - Expandable */}
          {festival.comments && (
            <div className="mb-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {showComments ? 'Hide notes' : 'Important notes'}
                </span>
              </button>
              {showComments && (
                <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {festival.comments}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Grid - Consistent spacing */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs mb-4">
            {/* When */}
            <div className="flex items-center gap-1.5 text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">{when || 'TBA'}</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-1.5 text-gray-400">
              <DollarSign className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span className={`truncate ${price === 'Free' ? 'text-green-400 font-medium' : ''}`}>
                {price && price !== '???' ? price : 'TBA'}
              </span>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-1.5 text-gray-400">
              <Timer className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">{deadline ? formatDate(deadline) : 'No deadline'}</span>
            </div>

            {/* Steam/Location */}
            <div className="flex items-center gap-1.5 text-gray-400">
              {hasSteamPage && hasSteamPage !== '???' && hasSteamPage !== 'No' ? (
                <>
                  <Gamepad2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate text-blue-400">Steam Page</span>
                </>
              ) : festival.enrichment?.location ? (
                <>
                  <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span className="truncate">{festival.enrichment.location}</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="truncate text-gray-500">Online</span>
                </>
              )}
            </div>
          </div>

          {/* Spacer to push bottom content down */}
          <div className="flex-1 min-h-2" />

          {/* Bottom Section - Always at bottom */}
          <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
            {/* Deadline Urgency - Only show when open */}
            {isOpen && daysToSubmit !== null && daysToSubmit >= 0 ? (
              <div className={`flex items-center justify-between p-3 rounded-xl border ${getUrgencyStyles(urgency)}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {daysToSubmit === 0 
                      ? '⚠️ Last day!' 
                      : daysToSubmit <= 3
                      ? '🔥 Hurry!'
                      : daysToSubmit <= 7
                      ? '📅 Soon'
                      : '✅ Open'}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  {daysToSubmit === 0 
                    ? 'Today' 
                    : daysToSubmit === 1 
                    ? '1 day left' 
                    : `${daysToSubmit} days left`}
                </span>
              </div>
            ) : daysToSubmit !== null && daysToSubmit < 0 ? (
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <XCircle className="w-3.5 h-3.5" />
                <span>Submissions closed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Check event for details</span>
              </div>
            )}

            {/* Verified Badge */}
            {(festival.category === 'curated' || festival.source === 'curated') && (
              <div className="flex items-center gap-1.5 text-xs text-purple-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified Event</span>
              </div>
            )}

            {/* Direct Links */}
            {(festival.eventOfficialPage || festival.latestSteamPage) && (
              <div className="flex flex-wrap gap-2">
                {festival.eventOfficialPage && (() => {
                  const links = festival.eventOfficialPage.split('\n').filter(link => link.trim());
                  return links.map((link, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(link.trim(), '_blank', 'noopener,noreferrer');
                      }}
                      className="flex-1 min-w-24 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{links.length > 1 ? `Submit ${index + 1}` : 'Submit your game'}</span>
                    </button>
                  ));
                })()}
                {festival.latestSteamPage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(festival.latestSteamPage, '_blank', 'noopener,noreferrer');
                    }}
                    className="flex-1 min-w-20 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Steam</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </article>
    </Link>
  );
}
