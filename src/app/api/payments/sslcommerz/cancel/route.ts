import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Donation } from '@/lib/db/models/Donation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tranId = body.tran_id as string;

    if (tranId) {
      await connectDB();
      await Donation.findOneAndUpdate(
        { transactionId: tranId },
        { status: 'failed' }
      );
    }

    return NextResponse.redirect(
      new URL('/dashboard?payment=cancelled', process.env.NEXT_PUBLIC_APP_URL)
    );
  } catch (error) {
    console.error('SSLCommerz cancel error:', error);
    return NextResponse.redirect(
      new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}
