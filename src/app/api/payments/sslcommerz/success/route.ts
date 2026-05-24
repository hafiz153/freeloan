import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Donation } from '@/lib/db/models/Donation';
import { Payment } from '@/lib/db/models/Payment';
import { validatePayment } from '@/lib/sslcommerz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = await validatePayment(body);

    if (!validation.valid) {
      return NextResponse.redirect(new URL('/payment/failed', process.env.NEXT_PUBLIC_APP_URL));
    }

    await connectDB();

    const tranId = body.tran_id as string;

    const donation = await Donation.findOne({ transactionId: tranId });
    if (donation) {
      donation.status = 'completed';
      donation.sslcommerzData = body;
      await donation.save();

      return NextResponse.redirect(
        new URL(`/dashboard/donor?payment=success&tran_id=${tranId}`, process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    const payment = await Payment.findOne({ transactionId: tranId });
    if (payment) {
      payment.status = 'completed';
      payment.sslcommerzData = body;
      payment.paidAt = new Date();
      await payment.save();

      return NextResponse.redirect(
        new URL(`/dashboard/borrower?payment=success&tran_id=${tranId}`, process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    return NextResponse.redirect(
      new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL)
    );
  } catch (error) {
    console.error('SSLCommerz success error:', error);
    return NextResponse.redirect(
      new URL('/payment/failed', process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}
