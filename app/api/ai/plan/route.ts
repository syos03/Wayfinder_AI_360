/**
 * POST /api/ai/plan
 * Generate AI trip plan using Google Gemini
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server-auth';
import { connectDB } from '@/lib/db/mongodb';
import TripPlan from '@/lib/models/TripPlan';
import Destination from '@/lib/models/Destination';
import { generateTripPlan } from '@/lib/ai/gemini';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const {
      origin,
      destinationIds,
      days,
      budget,
      travelers,
      travelStyle,
      interests,
      startDate,
    } = body;

    if (!origin || !destinationIds || !days || !budget || !travelers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch destination names
    const destinations = await Destination.find({
      _id: { $in: destinationIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
    }).lean();

    const destinationNames = destinations.map((d) => d.name);

    // Generate plan with AI
    console.log('🤖 Calling Gemini AI...');
    const aiPlan = await generateTripPlan({
      origin,
      destinations: destinationNames,
      days,
      budget,
      travelers,
      travelStyle: travelStyle || 'Khám phá',
      interests: interests || [],
      startDate,
    });

    // Calculate end date
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + days);

    // Save to database
    const tripPlan = await TripPlan.create({
      userId: new mongoose.Types.ObjectId(user.id),
      title: aiPlan.title,
      origin,
      destinations: destinationIds.map((id: string) => new mongoose.Types.ObjectId(id)),
      days,
      budget,
      startDate: start,
      endDate: end,
      travelers,
      travelStyle: travelStyle || 'Khám phá',
      interests: interests || [],
      itinerary: aiPlan.itinerary.map((day) => ({
        day: day.day,
        date: new Date(day.date),
        morning: day.morning,
        afternoon: day.afternoon,
        evening: day.evening,
        accommodation: day.accommodation,
        totalDayCost: day.totalDayCost,
      })),
      transportation: aiPlan.transportation,
      budgetBreakdown: aiPlan.budgetBreakdown,
      tips: aiPlan.tips || [],
      warnings: aiPlan.warnings || [],
      aiGenerated: true,
      aiModel: 'gemini-2.5-flash',
    });

    console.log('✅ Trip plan saved to database');

    return NextResponse.json({
      success: true,
      data: {
        planId: tripPlan._id,
        plan: tripPlan,
      },
    });
  } catch (error: any) {
    console.error('❌ AI plan generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate trip plan' },
      { status: 500 }
    );
  }
}

