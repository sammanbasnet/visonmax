import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const StripeCheckoutForm = ({ items, total, navigate }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {},
            redirect: 'if_required'
        });

        if (error) {
            setMessage(error.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                await api.post('/payment/confirm-order', {
                    paymentIntentId: paymentIntent.id,
                    items: items
                });
                setMessage('Payment Successful! Order created.');
                setTimeout(() => navigate('/dashboard?tab=orders'), 2000);
            } catch (err) {
                setMessage('Payment verified but order creation failed.');
                setIsProcessing(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <PaymentElement />
            <button disabled={isProcessing || !stripe || !elements} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                {isProcessing ? "Processing..." : `Pay Rs. ${total}`}
            </button>
            {message && <div style={{ marginTop: '1rem', color: '#dc2626', fontSize: '0.9rem' }}>{message}</div>}
        </form>
    );
};

const SimulatedCheckoutForm = ({ items, total, clientSecret, navigate }) => {
    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardData, setCardData] = useState({
        number: '**** **** **** ****',
        expiry: 'MM/YY',
        cvv: '***',
        name: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            await api.post('/payment/confirm-order', {
                paymentIntentId: clientSecret,
                items: items
            });
            setMessage('Simulated Payment Successful! Order created.');
            setTimeout(() => navigate('/dashboard?tab=orders'), 2000);
        } catch (err) {
            setMessage('Simulation failed.');
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ marginTop: '0.5rem' }}>
            {/* Visual Card */}
            <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '1rem',
                marginBottom: '1.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontFamily: '"Courier New", Courier, monospace',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '45px', height: '35px', background: '#ffd700', borderRadius: '4px', opacity: 0.8 }}></div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', fontStyle: 'italic' }}>VISA</div>
                </div>

                <div style={{ fontSize: '1.25rem', letterSpacing: '0.15em', textAlign: 'center', margin: '1rem 0' }}>
                    {cardData.number || '**** **** **** ****'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.8rem' }}>
                    <div>
                        <div style={{ opacity: 0.7, fontSize: '0.6rem', marginBottom: '0.2rem' }}>CARD HOLDER</div>
                        <div style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cardData.name || 'YOUR NAME'}</div>
                    </div>
                    <div>
                        <div style={{ opacity: 0.7, fontSize: '0.6rem', marginBottom: '0.2rem' }}>EXPIRES</div>
                        <div style={{ letterSpacing: '0.1em' }}>{cardData.expiry || 'MM/YY'}</div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Card Number"
                        className="input-field"
                        maxLength={19}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="MM/YY"
                            className="input-field"
                            maxLength={5}
                            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="CVC"
                            className="input-field"
                            maxLength={3}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        />
                    </div>
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Cardholder Name"
                        className="input-field"
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    />
                </div>

                <button disabled={isProcessing} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: '#059669', borderColor: '#059669' }}>
                    {isProcessing ? "Processing Security Check..." : `Authorize Payment (Rs. ${total})`}
                </button>
                {message && <div style={{ marginTop: '1rem', color: '#059669', fontSize: '0.9rem', fontWeight: '600' }}>{message}</div>}
            </form>
        </div>
    );
};

const CheckoutForm = (props) => {
    const navigate = useNavigate();
    if (props.isSimulation) {
        return <SimulatedCheckoutForm {...props} navigate={navigate} />;
    }
    return <StripeCheckoutForm {...props} navigate={navigate} />;
};

export default CheckoutForm;
