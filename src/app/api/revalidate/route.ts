import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Secret token to protect the revalidation endpoint
// Set REVALIDATE_SECRET in your Vercel environment variables
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const path = searchParams.get('path');

  // Check for secret token (optional but recommended for production)
  if (REVALIDATE_SECRET && secret !== REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'Invalid secret token' },
      { status: 401 }
    );
  }

  try {
    // Revalidate specific path if provided
    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        type: 'path',
        path,
        timestamp: new Date().toISOString(),
      });
    }

    // Default: revalidate all main paths
    revalidatePath('/', 'layout');
    
    return NextResponse.json({
      revalidated: true,
      type: 'all',
      message: 'Full site cache cleared',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate', details: String(error) },
      { status: 500 }
    );
  }
}

// Also support POST for webhook integrations
export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');

  // Check for secret token
  if (REVALIDATE_SECRET && secret !== REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'Invalid secret token' },
      { status: 401 }
    );
  }

  try {
    // Parse body for paths to revalidate
    const body = await request.json().catch(() => ({}));
    const { paths } = body as { paths?: string[] };

    const revalidated: string[] = [];

    // Revalidate paths
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
        revalidated.push(path);
      }
    }

    // If nothing specified, revalidate all
    if (revalidated.length === 0) {
      revalidatePath('/', 'layout');
      revalidated.push('/');
    }

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate', details: String(error) },
      { status: 500 }
    );
  }
}
