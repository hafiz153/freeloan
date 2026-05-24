import { connectDB } from '@/lib/db/connect';
import { Payment } from '@/lib/db/models/Payment';
import { Loan } from '@/lib/db/models/Loan';
import { Notification } from '@/lib/db/models/Notification';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { calculateServiceCharge, generateTransactionId } from '@/lib/utils/helpers';
import { parsePageParam, parseLimitParam } from '@/lib/utils/helpers';
import { sendNotificationEmail } from '@/lib/email';

export const GET = withAuth(async (request) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parsePageParam(searchParams.get('page'));
    const limit = parseLimitParam(searchParams.get('limit'), 10);
    const loanId = searchParams.get('loanId');

    const filter: Record<string, unknown> = { borrower: request.user?.userId };
    if (loanId) filter.loan = loanId;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('loan', 'amount purpose')
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return successResponse({
      payments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return errorResponse('Internal server error', 500);
  }
});

export const POST = withAuth(async (request) => {
  try {
    await connectDB();

    const body = await request.json();
    const { loanId, amount, paymentMethod, notes } = body;

    if (!loanId) return errorResponse('Loan ID is required');
    if (!amount || amount < 1) return errorResponse('Invalid amount');

    const loan = await Loan.findById(loanId);
    if (!loan) return errorResponse('Loan not found', 404);
    if (loan.borrower.toString() !== request.user?.userId) {
      return errorResponse('Access denied', 403);
    }
    if (loan.status !== 'disbursed') {
      return errorResponse('Loan is not active');
    }
    if (amount > loan.outstandingBalance) {
      return errorResponse('Amount exceeds outstanding balance');
    }

    const currentServiceCharge = calculateServiceCharge(loan.outstandingBalance, loan.serviceChargeRate);

    let principalPortion = amount - currentServiceCharge;
    let serviceChargePortion = currentServiceCharge;

    if (principalPortion < 0) {
      principalPortion = 0;
      serviceChargePortion = amount;
    }

    if (principalPortion > loan.outstandingBalance) {
      principalPortion = loan.outstandingBalance;
    }

    const transactionId = generateTransactionId();

    const payment = await Payment.create({
      loan: loanId,
      borrower: request.user?.userId,
      amount,
      principalPortion,
      serviceChargePortion,
      remainingBalance: loan.outstandingBalance - principalPortion,
      status: 'completed',
      paymentMethod: paymentMethod || 'online',
      transactionId,
      notes,
      paidAt: new Date(),
    });

    const newAmountPaid = loan.amountPaid + principalPortion;
    const newOutstandingBalance = loan.outstandingBalance - principalPortion;

    loan.amountPaid = newAmountPaid;
    loan.outstandingBalance = newOutstandingBalance;

    if (newOutstandingBalance <= 0) {
      loan.status = 'completed';
    }

    await loan.save();

    await Notification.create({
      recipient: request.user?.userId,
      type: 'in_app',
      title: 'Payment Successful',
      message: `Payment of ${amount} BDT received. Remaining balance: ${newOutstandingBalance.toFixed(2)} BDT.`,
      data: { paymentId: payment._id, loanId },
    });

    if (request.user?.email) {
      sendNotificationEmail(
        request.user.email,
        'Payment Successful',
        `Your payment of <strong>${amount} BDT</strong> has been received.<br><br>Principal: ${principalPortion.toFixed(2)} BDT<br>Service Charge: ${serviceChargePortion.toFixed(2)} BDT<br>Remaining Balance: ${newOutstandingBalance.toFixed(2)} BDT<br><br>Thank you for your payment.`
      ).catch((err) => console.error('Payment email failed:', err));
    }

    return successResponse(payment, 'Payment recorded successfully', 201);
  } catch (error) {
    console.error('Payment error:', error);
    return errorResponse('Internal server error', 500);
  }
});
