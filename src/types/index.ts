export interface Enrichment {
  imageUrl?: string;
  logoUrl?: string;
  description?: string;
  twitter?: string;
  discord?: string;
  location?: string;
  organizer?: string;
  verifiedAt?: string;
  verificationStatus?: 'pending' | 'verified' | 'failed' | 'outdated';
  lastCheckedAt?: string;
}

export interface DateRange {
  start?: string;
  end?: string;
  raw?: string;
}

export interface Festival {
  _id: string;
  name: string;
  type: string;
  frequency?: string;
  submissionDates?: DateRange;
  eventDates?: DateRange;
  eventOfficialPage?: string;
  submissionForm?: string;
  latestSteamPage?: string;
  comments?: string;
  source?: 'curated' | 'on-the-fence';
  category?: 'curated' | 'on-the-fence';
  enrichment?: Enrichment;
  createdAt?: string;
  updatedAt?: string;
  // New fields from API
  deadline?: string;
  daysToSubmit?: number;
  submissionOpen?: boolean;
  when?: string;
  price?: string;
  hasSteamPage?: string;
  worthIt?: string;
}

export interface SteamFeature {
  _id: string;
  eventName: string;
  year?: number;
  featuring?: string;
  notes?: string;
  registrationStart?: string;
  registrationEnd?: string;
  eventStart?: string;
  eventEnd?: string;
}

export interface FestivalStats {
  success: boolean;
  data: {
    total: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
    withOpenSubmissions: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  total?: number;
  data: T;
}

export type FestivalType = 
  | 'Festival'
  | 'Award'
  | 'Steam Sale'
  | 'Showcase'
  | 'Expo'
  | 'Game Jam'
  | string;

export interface FilterOptions {
  search: string;
  type: string;
  hasOpenSubmissions: boolean;
  sortBy: 'name' | 'date' | 'type';
}
