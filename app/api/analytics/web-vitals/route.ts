/**
 * Web Vitals API
 * Store Web Vitals metrics for monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    // Log metric (in production, you might want to store in database)
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: new Date().toISOString(),
    });

    // Could store in MongoDB for historical tracking:
    // await WebVital.create({
    //   name: metric.name,
    //   value: metric.value,
    //   rating: metric.rating,
    //   ...
    // });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Web vitals error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}















