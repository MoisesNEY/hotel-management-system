import React, { useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { initPayment, capturePayment } from '../services/client/paymentService';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PayPalPaymentButtonProps {
  invoiceId: number;
  onSuccess?: (payment: any) => void;
  onError?: (error: any) => void;
}

const PayPalPaymentButton: React.FC<PayPalPaymentButtonProps> = ({ 
  invoiceId, 
  onSuccess, 
  onError 
}) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateOrder = async () => {
    try {
      setStatus('processing');
      const response = await initPayment({ invoiceId });
      if (!response.paypalOrderId) {
        throw new Error('No se recibió el ID de orden de PayPal');
      }
      return response.paypalOrderId;
    } catch (err: any) {
      console.error('Error al iniciar pago:', err);
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'Error al conectar con PayPal');
      if (onError) onError(err);
      throw err;
    }
  };

  const handleApprove = async (data: any) => {
    try {
      setStatus('processing');
      const response = await capturePayment({
        invoiceId,
        paypalOrderId: data.orderID
      });
      
      setStatus('success');
      if (onSuccess) onSuccess(response);
    } catch (err: any) {
      console.error('Error al capturar pago:', err);
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'No se pudo confirmar el pago');
      if (onError) onError(err);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600">
        <CheckCircle2 size={24} />
        <span className="font-bold">¡Pago completado con éxito!</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 text-sm">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}
      
      <div className="relative">
        {status === 'processing' && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Loader2 className="animate-spin text-[#d4af37]" size={32} />
          </div>
        )}
        
        <PayPalButtons
          style={{ 
            layout: 'vertical',
            color: 'gold',
            shape: 'pill',
            label: 'pay'
          }}
          disabled={status === 'processing'}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onCancel={() => {
            setStatus('idle');
          }}
          onError={(err) => {
            console.error('PayPal Button Error:', err);
            setStatus('error');
            setErrorMessage('Error en el componente de pago');
          }}
        />
      </div>
    </div>
  );
};

export default PayPalPaymentButton;
