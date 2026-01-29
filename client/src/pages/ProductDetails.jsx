import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '2rem', color: '#6b7280' }}>Loading...</div>;
    if (!product) return <div className="container" style={{ padding: '2rem', color: '#6b7280' }}>Product not found</div>;

    return (
        <div style={{ background: '#ffffff' }}>
            <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
            <button onClick={() => navigate('/shop')} className="btn btn-outline" style={{ marginBottom: '2rem', border: 'none', paddingLeft: 0, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back to Collections
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem' }}>
                <div style={{ background: '#fff5f5', borderRadius: '1.75rem', height: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #fecaca' }}>
                    {product.image && product.image !== 'no-photo.jpg' ? (
                        <img
                            src={`/uploads/${product.image}`}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <span style={{ color: '#9ca3af', fontSize: '1.1rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>VisionMax</span>
                    )}
                </div>

                <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ background: '#111827', color: '#ffffff', padding: '0.3rem 0.85rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{product.category}</span>
                        <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.3rem 0.85rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{product.condition}</span>
                    </div>

                    <h1 style={{ fontSize: '2.6rem', fontWeight: '800', marginBottom: '0.5rem', lineHeight: 1.05, color: '#111827' }}>{product.name}</h1>
                    <p style={{ fontSize: '1.5rem', color: '#d72626', fontWeight: '700', marginBottom: '1.75rem' }}>Rs. {product.price}</p>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.6rem', color: '#111827', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Description</h3>
                        <p style={{ color: '#6b7280', lineHeight: '1.7' }}>{product.description}</p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.6rem', color: '#111827', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Specs</h3>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.6rem', color: '#6b7280' }}>
                                <span>Frame size</span>
                                <span>{product.size}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.6rem', color: '#6b7280' }}>
                                <span>Stock</span>
                                <span>{product.quantity} available</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                                <span>Listed</span>
                                <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/checkout', { state: { items: [product] } })}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}
                        disabled={product.isSold}
                    >
                        <ShoppingBag size={20} style={{ marginRight: '0.5rem' }} />
                        {product.isSold ? 'Sold Out' : 'Buy Now'}
                    </button>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>
                        Secure checkout powered by Stripe.
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
};

export default ProductDetails;
