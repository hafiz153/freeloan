import { connectDB } from '@/lib/db/connect';
import { Donation } from '@/lib/db/models/Donation';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { initializePayment } from '@/lib/sslcommerz';
import { generateTransactionId } from '@/lib/utils/helpers';

export const POST = withAuth(async (request) => {
  try {
    await connectDB();

    const body = await request.json();
    const { donationId, amount, currency } = body;

    let donation;
    if (donationId) {
      donation = await Donation.findById(donationId);
      if (!donation) return errorResponse('Donation not found', 404);
      if (donation.donor.toString() !== request.user?.userId) {
        return errorResponse('Access denied', 403);
      }
    }

    const transactionId = donation?.transactionId || generateTransactionId();
    const paymentAmount = donation?.amount || amount;
    const paymentCurrency = donation?.currency || currency || 'BDT';

    const user = request.user!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const paymentData = {
      amount: paymentAmount,
      currency: paymentCurrency,
      transactionId,
      customerName: user.email?.split('@')[0] || 'Customer',
      customerEmail: user.email,
      customerPhone: user.email || '01700000000',
      productName: donationId ? 'Donation' : 'Loan Repayment',
      productCategory: donationId ? 'donation' : 'repayment',
      successUrl: `${appUrl}/api/payments/sslcommerz/success`,
      failUrl: `${appUrl}/api/payments/sslcommerz/fail`,
      cancelUrl: `${appUrl}/api/payments/sslcommerz/cancel`,
    };

    const result = await initializePayment(paymentData);

    if (donation) {
      donation.transactionId = transactionId;
      donation.sslcommerzData = result;
      await donation.save();
    }

    return successResponse({
      gatewayUrl: result.GatewayPageURL,
      transactionId,
    }, 'Payment initiated');
  } catch (error) {
    console.error('SSLCommerz init error:', error);
    return errorResponse('Failed to initialize payment', 500);
  }
});
