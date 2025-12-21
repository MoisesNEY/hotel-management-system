import React from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { apiClient } from "../services/api";
import type { PaymentResponse } from "../types/clientTypes";

interface PayPalPaymentButtonProps {
    invoiceId: number;
    amount: number;
    onSuccess?: () => void;
    onError?: (message: string) => void;
}

export const PayPalPaymentButton: React.FC<PayPalPaymentButtonProps> = ({ invoiceId, onSuccess, onError }) => {

    const createOrder = async (_data: any, _actions: any) => {
        try {
            const response = await apiClient.post<PaymentResponse>('/api/client/payments/init', { 
                invoiceId 
            });
            
            if (response.data.paypalOrderId) {
                return response.data.paypalOrderId;
            } else {
                throw new Error("No Order ID returned from backend");
            }
        } catch (error) {
            console.error("Error initializing payment:", error);
            if (onError) onError("No se pudo iniciar el pago.");
            throw error;
        }
    };

    const onApprove = async (data: any, _actions: any) => {
        try {
            await apiClient.post<PaymentResponse>('/api/client/payments/capture', {
                paypalOrderId: data.orderID,
                invoiceId: invoiceId
            });
            
            if (onSuccess) onSuccess();
            
        } catch (error) {
            console.error("Error capturing payment:", error);
            if (onError) onError("Error al procesar el pago. Por favor contacte soporte.");
        }
    };

    return (
        <PayPalButtons 
            createOrder={createOrder}
            onApprove={onApprove}
            style={{ layout: "horizontal", height: 40, tagline: false }}
        />
    );
};
