import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import api from '../api/axios';
import { CreditCard, ShieldCheck, Wallet, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';


const stripePromise = loadStripe('pk_test_51O7...REPLACE_WITH_REAL_KEY_OR_MOCK');


const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { items } = location.state || {};

    const [clientSecret, setClientSecret] = useState('');
    const [isSimulation, setIsSimulation] = useState(false);
    const [total, setTotal] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const { user, checkUserLoggedIn } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!items || items.length === 0) {
            navigate('/shop');
            return;
        }


        const t = items.reduce((acc, item) => acc + item.price, 0);
        setTotal(t);


        api.post('/payment/create-intent', { items: items.map(i => ({ id: i._id })) })
            .then(res => {
                setClientSecret(res.data.clientSecret);
                setIsSimulation(res.data.isSimulation);
            })
            .catch(err => {
                console.error("Payment intent failed", err);
                alert("Could not initiate checkout: " + (err.response?.data?.error || "Unknown Error"));
                navigate('/shop');
            });

    }, [items, navigate]);

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#dc2626',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    const handleWalletPayment = async () => {
        if (!user || user.walletBalance < total) {
            toast.error("Insufficient balance");
            return;
        }

        setIsProcessing(true);
        try {
            await api.post('/payment/pay-with-balance', {
                items: items.map(i => ({ id: i._id }))
            });
            toast.success("Payment successful using wallet!");
            checkUserLoggedIn(); // Update balance
            setTimeout(() => navigate('/dashboard?tab=orders'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.error || "Payment failed");
            setIsProcessing(false);
        }
    };

    const handleEsewaPayment = async () => {
        setIsProcessing(true);
        try {
            const { data } = await api.post('/payment/initiate-esewa', {
                items: items.map(i => ({ id: i._id }))
            });

            if (data.success) {
                // Store productIds in localStorage for verification on redirect
                localStorage.setItem('pendingEsewaProductIds', data.productIds);

                // eSewa v2 requires posting a form to their endpoint
                const form = document.createElement('form');
                form.setAttribute('method', 'POST');
                form.setAttribute('action', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'); // Test environment URL

                // Add all esewaData as hidden fields
                Object.entries(data.esewaData).forEach(([key, value]) => {
                    const hiddenField = document.createElement('input');
                    hiddenField.setAttribute('type', 'hidden');
                    hiddenField.setAttribute('name', key);
                    hiddenField.setAttribute('value', value);
                    form.appendChild(hiddenField);
                });

                document.body.appendChild(form);
                form.submit();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "eSewa initiation failed");
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ padding: '2rem 0', minHeight: '80vh', background: '#ffffff', color: '#111827' }}>
            <div className="container" style={{ maxWidth: '960px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
                    <div className="card" style={{ border: '1px solid #fecaca', background: '#fff5f5' }}>
                        <h3 style={{ fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem', color: '#991b1b' }}>
                            Order Summary
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {items && items.map(item => (
                                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.925rem' }}>
                                    <span style={{ color: '#6b7280' }}>{item.name}</span>
                                    <span style={{ fontWeight: '500' }}>Rs. {item.price.toFixed(2)}</span>
                                </div>
                            ))}
                            <div style={{ borderTop: '1px solid #fecaca', marginTop: '0.5rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.125rem' }}>
                                <span>Total</span>
                                <span style={{ color: '#d72626' }}>Rs. {total.toFixed(2)}</span>
                            </div>
                        </div>
                        <div style={{ paddingTop: '1.25rem', color: '#6b7280', fontSize: '0.75rem' }}>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                                <ShieldCheck size={14} /> PCI Compliant & Secure
                            </p>
                            <p>All payments are encrypted. We never store your full card details.</p>
                        </div>
                    </div>

                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldCheck color="#d72626" /> Payment Method
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            <div
                                onClick={() => setPaymentMethod('card')}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '0.75rem',
                                    border: `2px solid ${paymentMethod === 'card' ? '#dc2626' : '#e5e7eb'}`,
                                    background: paymentMethod === 'card' ? '#fff5f5' : '#ffffff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ background: '#dc2626', color: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                    <CreditCard size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.125rem' }}>Stripe</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>Simulation</p>
                                </div>
                                {paymentMethod === 'card' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626' }}></div>}
                            </div>

                            <div
                                onClick={() => setPaymentMethod('esewa')}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '0.75rem',
                                    border: `2px solid ${paymentMethod === 'esewa' ? '#dc2626' : '#e5e7eb'}`,
                                    background: paymentMethod === 'esewa' ? '#fff5f5' : '#ffffff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ background: '#20ad2c', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>eSewa</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.125rem' }}>eSewa</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>Nepal Gateway</p>
                                </div>
                                {paymentMethod === 'esewa' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626' }}></div>}
                            </div>

                            <div
                                onClick={() => setPaymentMethod('wallet')}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '0.75rem',
                                    border: `2px solid ${paymentMethod === 'wallet' ? '#dc2626' : '#e5e7eb'}`,
                                    background: paymentMethod === 'wallet' ? '#fff5f5' : '#ffffff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ background: '#d97706', color: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                    <Wallet size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.125rem' }}>Account Balance</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>Balance: Rs. {user?.walletBalance?.toFixed(2) || '0.00'}</p>
                                </div>
                                {paymentMethod === 'wallet' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626' }}></div>}
                            </div>
                        </div>

                        {paymentMethod === 'card' && (
                            <>
                                {clientSecret && !isSimulation && (
                                    <Elements options={options} stripe={stripePromise}>
                                        <CheckoutForm items={items.map(i => ({ id: i._id }))} total={total} />
                                    </Elements>
                                )}

                                {clientSecret && isSimulation && (
                                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#fffbeb', borderRadius: '0.75rem', border: '1px solid #fde68a' }}>
                                        <div style={{ marginBottom: '1rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <ShieldCheck size={20} />
                                            <strong>Demo Mode</strong>
                                        </div>
                                        <CheckoutForm items={items.map(i => ({ id: i._id }))} total={total} isSimulation={true} clientSecret={clientSecret} />
                                    </div>
                                )}
                            </>
                        )}

                        {paymentMethod === 'esewa' && (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#ecfdf5', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                                    <p style={{ color: '#166534', fontSize: '0.925rem', fontWeight: '600' }}>You will be redirected to eSewa to complete your payment.</p>
                                </div>
                                <button
                                    onClick={handleEsewaPayment}
                                    disabled={isProcessing}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: '#41a124', borderColor: '#41a124' }}
                                >
                                    {isProcessing ? "Redirecting..." : `Pay Rs. ${total} with eSewa`}
                                </button>
                            </div>
                        )}

                        {paymentMethod === 'wallet' && (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                {user?.walletBalance >= total ? (
                                    <button
                                        onClick={handleWalletPayment}
                                        disabled={isProcessing}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: '#d97706', borderColor: '#d97706' }}
                                    >
                                        {isProcessing ? "Processing..." : `Pay Rs. ${total} from Balance`}
                                    </button>
                                ) : (
                                    <div style={{ padding: '1.5rem', background: '#fef2f2', borderRadius: '0.75rem', border: '1px solid #fecaca' }}>
                                        <p style={{ color: '#991b1b', marginBottom: '1rem' }}>Insufficient balance in your wallet.</p>
                                        <button
                                            onClick={() => navigate('/dashboard?tab=billing')}
                                            className="btn btn-outline"
                                            style={{ width: '100%' }}
                                        >
                                            Top up Wallet
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
