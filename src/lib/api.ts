const API_BASE_URL = 'https://videogame-events-api.vercel.app';

export async function fetchFestivals(params?: {
  limit?: number;
  skip?: number;
  type?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.skip) searchParams.set('skip', params.skip.toString());
  if (params?.type) searchParams.set('type', params.type);
  if (params?.search) searchParams.set('search', params.search);

  const url = `${API_BASE_URL}/api/festivals${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  
  if (!res.ok) {
    throw new Error('Failed to fetch festivals');
  }
  
  return res.json();
}

export async function fetchFestivalById(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/festivals/${id}`, {
    next: { revalidate: 300 },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch festival');
  }
  
  return res.json();
}

export async function fetchFestivalStats() {
  const res = await fetch(`${API_BASE_URL}/api/festivals/stats`, {
    next: { revalidate: 600 },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch festival stats');
  }
  
  return res.json();
}

export async function fetchFestivalTypes() {
  const res = await fetch(`${API_BASE_URL}/api/festivals/types`, {
    next: { revalidate: 600 },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch festival types');
  }
  
  return res.json();
}

export async function fetchOpenFestivals() {
  const res = await fetch(`${API_BASE_URL}/api/festivals/open`, {
    next: { revalidate: 300 },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch open festivals');
  }
  
  return res.json();
}

export async function fetchUpcomingFestivals(days: number = 90) {
  const res = await fetch(`${API_BASE_URL}/api/festivals/upcoming?days=${days}`, {
    next: { revalidate: 300 },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch upcoming festivals');
  }
  
  return res.json();
}

export async function fetchSteamFeatures(params?: {
  limit?: number;
  skip?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.skip) searchParams.set('skip', params.skip.toString());

  const url = `${API_BASE_URL}/api/steam-features${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  
  if (!res.ok) {
    throw new Error('Failed to fetch steam features');
  }
  
  return res.json();
}
