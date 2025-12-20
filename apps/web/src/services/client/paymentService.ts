import { apiClient } from '../api';
import type { PaymentInitRequest, PaymentCaptureRequest, PaymentResponse } from '../../types/clientTypes';

const PAYMENTS_PATH = '/api/client/payments';

/**
 * Initialize a PayPal payment for an invoice
 */
export const initPayment = async (request: PaymentInitRequest): Promise<PaymentResponse> => {
  const response = await apiClient.post<PaymentResponse>(`${PAYMENTS_PATH}/init`, request);
  return response.data;
};

/**
 * Capture a PayPal payment
 */
export const capturePayment = async (request: PaymentCaptureRequest): Promise<PaymentResponse> => {
  const response = await apiClient.post<PaymentResponse>(`${PAYMENTS_PATH}/capture`, request);
  return response.data;
};
