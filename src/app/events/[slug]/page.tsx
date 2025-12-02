import { AIEnrichmentSection } from '@/components';
import { fetchFestivalBySlug } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Festival } from '@/types';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    ExternalLink,
    FileText,
    Gamepad2,
    Globe,
    MapPin,
    MessageCircle,
    Star,
    Timer,
    Trophy,
    Twitter,
    Users,
    Zap
} from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getEventData(slug: string): Promise<Festival | null> {
  try {
    const res = await fetchFestivalBySlug(slug);
    return res.data;
  } catch {
    return null;
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const festival = await getEventData(slug);

  if (!festival) {
    return {
      title: 'Event Not Found',
      description: 'The event you are looking for could not be found.',
    };
  }

  const isOpen = festival.submissionOpen === true;
  const deadline = festival.deadline;
  const type = festival.type;
  const description = festival.enrichment?.description
    ? festival.enrichment.description.slice(0, 155) + (festival.enrichment.description.length > 155 ? '...' : '')
    : `Discover ${festival.name}, a ${type} event for indie game developers. ${isOpen ? 'Submissions are currently open!' : 'Check back for future submission dates.'}`;

  const ogImage = festival.enrichment?.imageUrl || '/og-image.png';
  const deadlineText = deadline ? ` • Deadline: ${formatDate(deadline)}` : '';
  const statusText = isOpen ? '🟢 Open' : '🔴 Closed';

  return {
    title: festival.name,
    description,
    keywords: [
      festival.name.toLowerCase(),
      type.toLowerCase(),
      'indie games',
      'game festival',
      'game submissions',
      'indie developers',
      festival.enrichment?.organizer?.toLowerCase(),
      festival.enrichment?.location?.toLowerCase(),
    ].filter(Boolean) as string[],
    openGraph: {
      type: 'article',
      title: `${festival.name} - ${type}`,
      description: `${statusText}${deadlineText} • ${description}`,
      url: `/events/${slug}`,
      siteName: 'GameEvents',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${festival.name} - ${type} for Indie Games`,
        },
      ],
      publishedTime: festival.createdAt,
      modifiedTime: festival.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${festival.name} - ${type}`,
      description: `${statusText}${deadlineText} • ${description}`,
      images: [ogImage],
    },
    alternates: {
      canonical: `/events/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Site URL from environment variable
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://videogame-festival-front.vercel.app';

// Generate JSON-LD structured data for events
function generateEventJsonLd(festival: Festival) {
  const isOpen = festival.submissionOpen === true;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: festival.name,
    description: festival.enrichment?.description || `${festival.name} - ${festival.type} for indie game developers`,
    eventStatus: isOpen ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventPostponed',
    eventAttendanceMode: festival.enrichment?.location
      ? 'https://schema.org/MixedEventAttendanceMode'
      : 'https://schema.org/OnlineEventAttendanceMode',
    location: festival.enrichment?.location
      ? {
          '@type': 'Place',
          name: festival.enrichment.location,
        }
      : {
          '@type': 'VirtualLocation',
          url: festival.eventOfficialPage || SITE_URL,
        },
    organizer: festival.enrichment?.organizer
      ? {
          '@type': 'Organization',
          name: festival.enrichment.organizer,
        }
      : undefined,
    image: festival.enrichment?.imageUrl,
    url: festival.eventOfficialPage,
    offers: festival.price
      ? {
          '@type': 'Offer',
          price: festival.price === 'Free' ? '0' : festival.price,
          priceCurrency: 'USD',
          availability: isOpen
            ? 'https://schema.org/InStock'
            : 'https://schema.org/SoldOut',
        }
      : undefined,
    isAccessibleForFree: festival.price === 'Free',
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const festival = await getEventData(slug);

  if (!festival) {
    notFound();
  }

  // Use API fields directly
  const isOpen = festival.submissionOpen === true;
  const daysToSubmit = festival.daysToSubmit ?? null;
  const deadline = festival.deadline;
  const when = festival.when;
  const price = festival.price;
  const hasSteamPage = festival.hasSteamPage;
  const worthIt = festival.worthIt;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Festival': 'bg-purple-600',
      'Award': 'bg-amber-600',
      'Steam Sale': 'bg-blue-600',
      'Showcase': 'bg-green-600',
      'Expo': 'bg-red-600',
      'Game Jam': 'bg-violet-600',
      'Digital Expo': 'bg-indigo-600',
      'Digital Awards': 'bg-yellow-600',
      'Physical Expo': 'bg-teal-600',
      'Physical Awards': 'bg-orange-600',
      'Physical Expo + Digital': 'bg-teal-600',
    };
    return colors[type] || 'bg-gray-600';
  };

  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('award')) return <Trophy className="w-4 h-4" />;
    if (lowerType.includes('steam') || lowerType.includes('sale')) return <Gamepad2 className="w-4 h-4" />;
    if (lowerType.includes('jam')) return <Zap className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  // Get urgency level
  const getUrgencyLevel = () => {
    if (!isOpen || daysToSubmit === null || daysToSubmit < 0) return null;
    if (daysToSubmit <= 3) return 'critical';
    if (daysToSubmit <= 7) return 'soon';
    if (daysToSubmit <= 14) return 'upcoming';
    return 'normal';
  };

  const urgency = getUrgencyLevel();

  // Generate structured data for SEO
  const jsonLd = generateEventJsonLd(festival);

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
      {/* Clean Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Events</span>
            </Link>
            
            {/* Compact Status Badge in Header */}
            <div className="flex items-center gap-3">
              {isOpen && daysToSubmit !== null && daysToSubmit >= 0 && (
                <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  urgency === 'critical' ? 'bg-red-500/20 text-red-300 animate-pulse' :
                  urgency === 'soon' ? 'bg-orange-500/20 text-orange-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    urgency === 'critical' ? 'bg-red-400' :
                    urgency === 'soon' ? 'bg-orange-400' :
                    'bg-green-400'
                  }`} />
                  {daysToSubmit === 0 ? 'Last day!' : `${daysToSubmit}d left`}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Cleaner, More Focused */}
      <header className="relative pt-14">
        {/* Background - Only show tall section if there's an image */}
        {festival.enrichment?.imageUrl ? (
          <div className="relative h-44 sm:h-56 md:h-72 overflow-hidden bg-gray-900">
            <Image
              src={festival.enrichment.imageUrl}
              alt={festival.name}
              fill
              className="object-cover scale-105"
              priority
              unoptimized
            />
            {/* Gradient overlay - fully opaque at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/90 to-gray-950/60" />
          </div>
        ) : (
          <div className="h-8 bg-gray-950" />
        )}

        {/* Hero Content - Positioned Better */}
        <div className={`relative pb-4 px-4 sm:px-6 ${festival.enrichment?.imageUrl ? '-mt-20 sm:-mt-24' : 'pt-4'}`}>
          <div className="max-w-5xl mx-auto">
            {/* Badge Row - More Compact */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white ${getTypeColor(festival.type)} rounded-full shadow-lg`}>
                {getTypeIcon(festival.type)}
                {festival.type}
              </span>
              
              {(festival.category === 'curated' || festival.source === 'curated') && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}

              {worthIt && worthIt !== '???' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-300 bg-yellow-500/15 border border-yellow-500/30 rounded-full">
                  <Star className="w-3 h-3 fill-yellow-400" />
                  {worthIt}
                </span>
              )}
            </div>

            {/* Title - Clean Typography */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1.5 leading-tight tracking-tight">
              {festival.name}
            </h1>

            {/* Subtitle Info Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
              {festival.enrichment?.organizer && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {festival.enrichment.organizer}
                </span>
              )}
              {festival.enrichment?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {festival.enrichment.location}
                </span>
              )}
              {!festival.enrichment?.location && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  Online
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Primary Action Card - Most Important, Always Visible First */}
        <section className={`relative overflow-hidden rounded-2xl mb-6 ${
          isOpen 
            ? urgency === 'critical' 
              ? 'bg-red-950/80 border border-red-500/30' 
              : urgency === 'soon'
                ? 'bg-orange-950/80 border border-orange-500/30'
                : 'bg-emerald-950/80 border border-emerald-500/30'
            : 'bg-gray-900/80 border border-gray-700/30'
        }`}>
          {/* Decorative glow */}
          {isOpen && (
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 ${
              urgency === 'critical' ? 'bg-red-500' :
              urgency === 'soon' ? 'bg-orange-500' : 'bg-emerald-500'
            }`} />
          )}
          
          <div className="relative p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Status Info */}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${
                  isOpen 
                    ? urgency === 'critical' ? 'bg-red-500/20' :
                      urgency === 'soon' ? 'bg-orange-500/20' : 'bg-emerald-500/20'
                    : 'bg-gray-500/20'
                }`}>
                  <Timer className={`w-6 h-6 ${
                    isOpen 
                      ? urgency === 'critical' ? 'text-red-400' :
                        urgency === 'soon' ? 'text-orange-400' : 'text-emerald-400'
                      : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-xl font-bold ${
                    isOpen 
                      ? urgency === 'critical' ? 'text-red-300' :
                        urgency === 'soon' ? 'text-orange-300' : 'text-emerald-300'
                      : 'text-gray-400'
                  }`}>
                    {isOpen ? 'Submissions Open' : 'Submissions Closed'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {deadline ? `Deadline: ${formatDate(deadline)}` : 'No deadline specified'}
                  </p>
                  
                  {/* Days countdown */}
                  {isOpen && daysToSubmit !== null && daysToSubmit >= 0 && (
                    <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-sm font-semibold ${
                      urgency === 'critical' ? 'bg-red-500/20 text-red-300' :
                      urgency === 'soon' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      {daysToSubmit === 0 ? 'Last day to submit!' : 
                       daysToSubmit === 1 ? '1 day remaining' : 
                       `${daysToSubmit} days remaining`}
                    </div>
                  )}
                </div>
              </div>

              {/* Primary CTA Button */}
              {festival.eventOfficialPage && (
                <a
                  href={festival.eventOfficialPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 px-5 py-3 font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all sm:shrink-0 ${
                    isOpen 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-500/25'
                      : 'bg-gray-600 hover:bg-gray-500 text-white hover:shadow-gray-500/25'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  {isOpen ? 'Submit Your Game' : 'View Submission Page'}
                  <ExternalLink className="w-4 h-4 opacity-70" />
                </a>
              )}
            </div>

            {/* Urgency Alert */}
            {isOpen && urgency === 'critical' && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-200">
                  <strong>Hurry!</strong> This deadline is closing very soon. Don&apos;t miss your chance to submit!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Info Bar - Scannable at a glance */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.07] transition-colors">
            <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">{when || 'TBA'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Event Period</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.07] transition-colors">
            <DollarSign className={`w-5 h-5 mx-auto mb-2 ${price === 'Free' ? 'text-emerald-400' : 'text-gray-400'}`} />
            <p className={`text-sm font-medium ${price === 'Free' ? 'text-emerald-400' : 'text-white'}`}>
              {price && price !== '???' ? price : 'TBA'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Entry Fee</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.07] transition-colors">
            <Gamepad2 className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">
              {hasSteamPage && hasSteamPage !== '???' && hasSteamPage !== 'No' ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Steam Page Req.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.07] transition-colors">
            <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">{festival.frequency || 'Annual'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Frequency</p>
          </div>
        </section>

        {/* Two Column Layout for Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Column - Main Content (wider) */}
          <div className="lg:col-span-3 space-y-5">
            
            {/* About Section */}
            {festival.enrichment?.description && (
              <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-purple-500/20 rounded-lg">
                    <FileText className="w-4 h-4 text-purple-400" />
                  </div>
                  <h2 className="text-base font-semibold text-white">About This Event</h2>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {festival.enrichment.description}
                </p>
              </section>
            )}

            {/* Additional Notes */}
            {festival.comments && (
              <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg">
                    <MessageCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Additional Notes</h2>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {festival.comments}
                </p>
              </section>
            )}

            {/* Key Information Grid */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-cyan-400" />
                </div>
                <h2 className="text-base font-semibold text-white">Key Information</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Event Period</p>
                    <p className="text-sm font-medium text-white truncate">{when || 'To be announced'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Timer className={`w-5 h-5 shrink-0 ${isOpen ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Submission Deadline</p>
                    <p className="text-sm font-medium text-white truncate">
                      {deadline ? formatDate(deadline) : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Entry Fee</p>
                    <p className={`text-sm font-medium truncate ${price === 'Free' ? 'text-emerald-400' : 'text-white'}`}>
                      {price && price !== '???' ? price : 'Check website'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <MapPin className="w-5 h-5 text-pink-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-white truncate">
                      {festival.enrichment?.location || 'Online'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* AI-Generated Insights Section */}
            {festival.aiEnrichment && festival.aiEnrichment.enrichmentStatus === 'enriched' && (
              <AIEnrichmentSection aiEnrichment={festival.aiEnrichment} />
            )}
          </div>

          {/* Right Column - Actions Sidebar */}
          <div className="lg:col-span-2">
            {/* Sticky wrapper for both cards */}
            <div className="lg:sticky lg:top-20 space-y-5">
            
            {/* Action Buttons Card */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Take Action</h2>
              
              <div className="space-y-3">
                {/* Primary: Submission Form (eventOfficialPage is the submission link) */}
                {festival.eventOfficialPage && (
                  <a
                    href={festival.eventOfficialPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between w-full px-4 py-3.5 font-medium rounded-xl transition-all group ${
                      isOpen 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99]' 
                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <FileText className="w-5 h-5" />
                      {isOpen ? '📝 Submit Your Game' : 'Submission Page (Closed)'}
                    </span>
                    <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}

                {/* Steam Page */}
                {festival.latestSteamPage && (
                  <a
                    href={festival.latestSteamPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full px-4 py-3 bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium rounded-xl hover:bg-blue-500/20 hover:border-blue-500/30 transition-all group"
                  >
                    <span className="flex items-center gap-3">
                      <Gamepad2 className="w-5 h-5" />
                      View on Steam
                    </span>
                    <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>

              {/* Social Links */}
              {(festival.enrichment?.twitter || festival.enrichment?.discord) && (
                <>
                  <div className="border-t border-white/10 my-4" />
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Connect</h3>
                  <div className="flex gap-2">
                    {festival.enrichment.twitter && (
                      <a
                        href={festival.enrichment.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                        aria-label="Twitter"
                      >
                        <Twitter className="w-4 h-4 text-sky-400" />
                        <span className="text-sm">Twitter</span>
                      </a>
                    )}
                    {festival.enrichment.discord && (
                      <a
                        href={festival.enrichment.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                        aria-label="Discord"
                      >
                        <MessageCircle className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm">Discord</span>
                      </a>
                    )}
                  </div>
                </>
              )}
            </section>

            {/* Pro Tips Card */}
            <section className="bg-purple-950/50 border border-purple-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-semibold text-white">Tips for Success</h2>
              </div>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Have your Steam page ready if required</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Prepare marketing materials in advance</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Check submission requirements carefully</span>
                </li>
              </ul>
            </section>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Footer CTA - Shows on mobile when scrolling */}
      {festival.eventOfficialPage && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/95 backdrop-blur-xl border-t border-white/10 lg:hidden z-40">
          <a
            href={festival.eventOfficialPage}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full py-3.5 font-semibold rounded-xl ${
              isOpen
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            {isOpen ? 'Submit Your Game' : 'View Submission Page'}
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>
        </div>
      )}

      {/* Footer - Clean & Minimal */}
      <footer className="border-t border-white/5 mt-8 pb-24 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group text-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to all events</span>
            </Link>
            <p className="text-gray-600 text-xs">
              Data provided by GameEvents API
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
