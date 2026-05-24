import { connectDB } from '@/lib/db/connect';
import { Loan } from '@/lib/db/models/Loan';
import { Notification } from '@/lib/db/models/Notification';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { calculateTotalRepayable, calculateServiceCharge } from '@/lib/utils/helpers';
import { sendNotificationEmail } from '@/lib/email';

export const POST = withAuth(async (request) => {
  try {
    await connectDB();

    const body = await request.json();
    const { amount, purpose, tenureMonths } = body;

    if (!amount || amount < 500) {
      return errorResponse('Minimum loan amount is 500');
    }
    if (!purpose || purpose.length < 10) {
      return errorResponse('Please provide a detailed purpose (min 10 chars)');
    }
    if (!tenureMonths || tenureMonths < 1 || tenureMonths > 60) {
      return errorResponse('Tenure must be between 1 and 60 months');
    }

    const existingLoan = await Loan.findOne({
      borrower: request.user?.userId,
      status: { $in: ['pending', 'approved', 'disbursed'] },
    });

    if (existingLoan) {
      return errorResponse('You already have an active or pending loan');
    }

    const serviceChargeRate = 1;
    const totalRepayable = calculateTotalRepayable(amount, tenureMonths, serviceChargeRate);
    const monthlyServiceCharge = calculateServiceCharge(amount, serviceChargeRate);

    const loan = await Loan.create({
      borrower: request.user?.userId,
      amount,
      purpose,
      tenureMonths,
      interestRate: 0,
      serviceChargeRate,
      monthlyServiceCharge,
      totalRepayable,
      outstandingBalance: totalRepayable,
      amountPaid: 0,
      status: 'pending',
    });

    await Notification.create({
      recipient: request.user?.userId,
      type: 'in_app',
      title: 'Loan Application Submitted',
      message: `Your loan application for ${amount} BDT has been submitted for review.`,
      data: { loanId: loan._id },
    });

    if (request.user?.email) {
      sendNotificationEmail(
        request.user.email,
        'Loan Application Submitted',
        `Your loan application for <strong>${amount} BDT</strong> has been submitted for review.<br><br>Purpose: ${purpose}<br>Tenure: ${tenureMonths} months<br><br>You will be notified once it is reviewed by our team.`
      ).catch((err) => console.error('Loan application email failed:', err));
    }

    return successResponse(loan, 'Loan application submitted successfully', 201);
  } catch (error) {
    console.error('Loan application error:', error);
    return errorResponse('Internal server error', 500);
  }
});
