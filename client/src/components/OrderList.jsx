import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, Download, RefreshCcw } from 'lucide-react';

const OrderList = ({ showHeader = true }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/myorders');
            setOrders(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error('Invoice download failed', err);
        }
    };

    const requestRefund = async (orderId) => {
        const reason = window.prompt("Please enter the reason for your refund request:");
        if (!reason) return;

        try {
            await api.post(`/orders/${orderId}/request-refund`, { reason });
            // Update local state
            setOrders(orders.map(o => o._id === orderId ? { ...o, refundStatus: 'Requested' } : o));
            alert('Refund requested successfully');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to request refund');
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {showHeader && <h2 style={{ marginBottom: '1rem' }}>My Orders</h2>}
            {orders.length === 0 ? (
                <p style={{ color: '#64748b' }}>No orders found.</p>
            ) : (
                orders.map(order => (
                    <div key={order._id} className="card" style={{ padding: '1rem', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Package color="#4f46e5" />
                                <span style={{ fontWeight: '600' }}>Order #{order._id.slice(-6)}</span>
                                <span style={{
                                    background: order.status === 'Refunded' ? '#fee2e2' : '#dcfce7',
                                    color: order.status === 'Refunded' ? '#dc2626' : '#166534',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '99px',
                                    fontSize: '0.75rem'
                                }}>
                                    {order.status}
                                </span>
                                {order.refundStatus && order.refundStatus !== 'None' && (
                                    <span style={{
                                        background: '#fef3c7',
                                        color: '#d97706',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '99px',
                                        fontSize: '0.75rem'
                                    }}>
                                        Refund: {order.refundStatus}
                                    </span>
                                )}
                                {order.paymentIntentId?.startsWith('wallet_') && (
                                    <span style={{
                                        background: '#fff7ed',
                                        color: '#ea580c',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '99px',
                                        fontSize: '0.75rem',
                                        border: '1px solid #ffedd5'
                                    }}>
                                        Wallet Payment
                                    </span>
                                )}
                            </div>
                            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            {order.items.map((item, idx) => (
                                <p key={idx} style={{ fontSize: '0.9rem', color: '#334155' }}>
                                    {item.product?.name || 'Unknown Item'} - Rs. {item.price}
                                </p>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                            <span style={{ fontWeight: 'bold' }}>Total: Rs. {order.totalAmount}</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => downloadInvoice(order._id)} className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>
                                    <Download size={14} style={{ marginRight: '0.5rem' }} /> Invoice
                                </button>
                                {order.status === 'Completed' && order.refundStatus === 'None' && (
                                    <button onClick={() => requestRefund(order._id)} className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', color: '#dc2626', borderColor: '#dc2626' }}>
                                        <RefreshCcw size={14} style={{ marginRight: '0.5rem' }} /> Request Refund
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default OrderList;
