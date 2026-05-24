import SSLCommerz from 'sslcommerz-lts';

const storeId = process.env.SSLC_STORE_ID!;
const storePasswd = process.env.SSLC_STORE_PASSWD!;
const isLive = process.env.SSLC_SANDBOX !== 'true';

const sslcommerz = new SSLCommerz(storeId, storePasswd, !isLive);

export interface SslcommerzInitParams {
  amount: number;
  currency: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  customerCountry?: string;
  productName: string;
  productCategory: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl?: string;
}

export async function initializePayment(params: SslcommerzInitParams) {
  const data = {
    total_amount: params.amount,
    currency: params.currency || 'BDT',
    tran_id: params.transactionId,
    success_url: params.successUrl,
    fail_url: params.failUrl,
    cancel_url: params.cancelUrl,
    ipn_url: params.ipnUrl || params.successUrl,
    cus_name: params.customerName,
    cus_email: params.customerEmail,
    cus_phone: params.customerPhone,
    cus_add1: params.customerAddress || 'N/A',
    cus_city: params.customerCity || 'Dhaka',
    cus_country: params.customerCountry || 'Bangladesh',
    product_name: params.productName,
    product_category: params.productCategory,
    shipping_method: 'NO',
    num_of_item: 1,
    product_profile: 'general',
  };

  const response = await sslcommerz.init(data);
  return response;
}

export async function validatePayment(data: Record<string, unknown>) {
  if (data.status !== 'VALID') {
    return { valid: false, error: 'Invalid payment status' };
  }

  const response = await sslcommerz.validate(data as Record<string, string>);
  return { valid: true, data: response };
}

export async function transactionQuery(transactionId: string) {
  return sslcommerz.transactionQueryByTransactionId(transactionId);
}

export { sslcommerz };
