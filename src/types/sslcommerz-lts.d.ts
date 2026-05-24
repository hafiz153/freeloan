declare module 'sslcommerz-lts' {
  interface SSLCommerzInitData {
    total_amount: number;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url?: string;
    cus_name: string;
    cus_email: string;
    cus_phone: string;
    cus_add1: string;
    cus_city: string;
    cus_country: string;
    product_name: string;
    product_category: string;
    shipping_method: string;
    num_of_item: number;
    product_profile: string;
    [key: string]: unknown;
  }

  interface SSLCommerzInitResponse {
    status: string;
    GatewayPageURL: string;
    [key: string]: unknown;
  }

  interface SSLCommerzValidateResponse {
    status: string;
    [key: string]: unknown;
  }

  class SSLCommerz {
    constructor(storeId: string, storePasswd: string, isLive: boolean);
    init(data: SSLCommerzInitData): Promise<SSLCommerzInitResponse>;
    validate(data: Record<string, string>): Promise<SSLCommerzValidateResponse>;
    transactionQueryByTransactionId(transactionId: string): Promise<Record<string, unknown>>;
  }

  export default SSLCommerz;
}
