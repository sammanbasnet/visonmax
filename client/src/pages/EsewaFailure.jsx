import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const EsewaFailure = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
            <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '3rem' }}>
                <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Payment Cancelled</h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>You have cancelled the eSewa payment or it was declined. No funds were charged.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ width: '100%', background: '#6366f1' }}>
                        Try Again
                    </button>
                    <button onClick={() => navigate('/shop')} className="btn btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <ArrowLeft size={16} /> Return to Shop
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EsewaFailure;
