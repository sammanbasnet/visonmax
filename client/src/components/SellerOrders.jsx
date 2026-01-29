import { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, Package, ExternalLink } from 'lucide-react';

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSellerOrders();
    }, []);

    const fetchSellerOrders = async () => {
        try {
            const { data } = await api.get('/orders/seller/myorders');
            setOrders(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;

    return (
        <div className="card">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShoppingCart size={24} color="#4f46e5" /> Recent Sales
            </h2>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                    <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                    <p>No sales yet. Keep listing items!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order._id} style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Order ID: </span>
                                    <span style={{ fontWeight: '600', color: '#0f172a' }}>#{order._id.slice(-6)}</span>
                                    <span style={{ margin: '0 0.5rem', color: '#cbd5e1' }}>•</span>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span style={{
                                    background: '#dcfce7',
                                    color: '#166534',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>
                                    {order.status}
                                </span>
                            </div>
                            <div style={{ padding: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Customer Details</p>
                                    <p style={{ fontWeight: '500' }}>{order.buyer?.name} <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>({order.buyer?.email})</span></p>
                                </div>

                                <div style={{ background: '#f1f5f9', borderRadius: '0.5rem', padding: '0.75rem' }}>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Items from your shop</p>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: idx < order.items.length - 1 ? '0.5rem' : 0 }}>
                                            <span style={{ fontSize: '0.925rem' }}>{item.product?.name}</span>
                                            <span style={{ fontWeight: '600' }}>${item.price}</span>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600' }}>Your Earnings</span>
                                        <span style={{ fontWeight: 'bold', color: '#4f46e5', fontSize: '1.1rem' }}>${order.sellerTotal}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerOrders;
