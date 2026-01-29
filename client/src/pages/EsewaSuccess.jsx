import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EsewaSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const hasVerified = useRef(false);

    useEffect(() => {
        const verifyPayment = async () => {
            const data = searchParams.get('data');
            // eSewa returns productIds in the success URL if we pass it, but usually we handle it via session or extra params.
            // Since we are using a simple approach, we'll assume the productIds were stored in localStorage during initiation.
            const productIds = localStorage.getItem('pendingEsewaProductIds');

            if (!data || !productIds) {
                setStatus('error');
                toast.error("Invalid payment data");
                return;
            }

            try {
                await api.post('/payment/verify-esewa', {
                    encodedData: data,
                    productIds: productIds
                });
                setStatus('success');
                localStorage.removeItem('pendingEsewaProductIds');
                toast.success("eSewa Payment Successful!");
                setTimeout(() => navigate('/dashboard?tab=orders'), 3000);
            } catch (err) {
                console.error(err);
                setStatus('error');
                toast.error(err.response?.data?.error || "Verification failed");
            }
        };

        if (!hasVerified.current) {
            hasVerified.current = true;
            verifyPayment();
        }
    }, [searchParams, navigate]);

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
            <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '3rem' }}>
                {status === 'verifying' && (
                    <>
                        <Loader2 className="animate-spin" size={48} color="#6366f1" style={{ margin: '0 auto 1.5rem' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Verifying Payment</h2>
                        <p style={{ color: '#64748b' }}>Please do not close this window while we verify your eSewa transaction...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Success!</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your payment was processed successfully. Redirecting you to your orders...</p>
                        <button onClick={() => navigate('/dashboard?tab=orders')} className="btn btn-primary" style={{ width: '100%' }}>
                            Go to Dashboard
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Payment Failed</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>We couldn't verify your eSewa transaction. If money was deducted, please contact support.</p>
                        <button onClick={() => navigate('/shop')} className="btn btn-outline" style={{ width: '100%' }}>
                            Back to Shop
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default EsewaSuccess;
