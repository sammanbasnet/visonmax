import { useState, useEffect } from 'react';
import api from '../api/axios';
import ActivityLogs from './ActivityLogs';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [unapprovedProducts, setUnapprovedProducts] = useState([]);
    const [approvedProducts, setApprovedProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (activeTab === 'products') {
            fetchUnapprovedProducts();
            fetchApprovedProducts();
        } else if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchApprovedProducts = async () => {
        try {
            const { data } = await api.get('/products/admin/approved');
            setApprovedProducts(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUnapprovedProducts = async () => {
        try {
            const { data } = await api.get('/products/admin/unapproved');
            setUnapprovedProducts(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const approveProduct = async (id) => {
        try {
            await api.put(`/products/${id}/approve`);
            setMessage('Product approved!');
            fetchUnapprovedProducts(); 
            fetchApprovedProducts(); 
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Failed to approve product');
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            setMessage('Order status updated');
            fetchOrders();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Failed to update status');
        }
    };

    const handleRefund = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this refund?`)) return;
        try {
            if (action === 'approve') {
                await api.post(`/orders/${id}/refund`);
            } else {
                await api.put(`/orders/${id}/refund/reject`);
            }
            setMessage(`Refund ${action}d`);
            fetchOrders();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage(`Failed to ${action} refund`);
        }
    };

    const tabs = [
        { key: 'products', label: 'Product Approvals', helper: 'Review new frames and publish' },
        { key: 'orders', label: 'Order Management', helper: 'Track orders and refunds' },
        { key: 'audit', label: 'Audit Logs', helper: 'System activity and changes' }
    ];

    const headerStyle = {
        background: 'linear-gradient(120deg, #111827, #1f2937)',
        color: '#ffffff',
        borderRadius: '1rem',
        padding: '1.75rem',
        marginBottom: '1.5rem'
    };

    const pillStyle = (isActive) => ({
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        border: `1px solid ${isActive ? '#dc2626' : '#e5e7eb'}`,
        background: isActive ? '#dc2626' : '#ffffff',
        color: isActive ? '#ffffff' : '#374151',
        fontWeight: 600,
        fontSize: '0.9rem'
    });

    return (
        <div className="card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1.25rem', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)' }}>
            <div style={headerStyle}>
                <p style={{ letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.7 }}>VisionMax Control Room</p>
                <h2 style={{ margin: '0.5rem 0 0.75rem', fontSize: '2rem' }}>Admin Dashboard</h2>
                <p style={{ opacity: 0.8, maxWidth: '520px' }}>Approve new frames, manage orders, and monitor activity with a clean, fast workflow.</p>
            </div>

            {message && <div style={{ background: '#ecfdf3', color: '#166534', padding: '0.85rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>{message}</div>}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="btn"
                        style={pillStyle(activeTab === tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <p style={{ color: '#6b7280', marginBottom: '1.75rem' }}>
                {tabs.find((tab) => tab.key === activeTab)?.helper}
            </p>

            {activeTab === 'audit' && (
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#111827' }}>System Audit Logs</h3>
                    <ActivityLogs endpoint="/users/admin/logs" />
                </div>
            )}

            {activeTab === 'products' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.25rem', background: '#f9fafb' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#111827' }}>Pending Approvals</h3>
                        {unapprovedProducts.length === 0 ? (
                            <p style={{ color: '#64748b' }}>No products pending approval.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {unapprovedProducts.map(product => (
                                    <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', background: '#ffffff' }}>
                                        {product.image && (
                                            <img
                                                src={`/uploads/${product.image}`}
                                                alt={product.name}
                                                style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                                            />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{product.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Seller: {product.addedBy?.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 600 }}>${product.price}</p>
                                        </div>
                                        <button onClick={() => approveProduct(product._id)} className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>Approve</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.25rem', background: '#ffffff' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#111827' }}>Approval History</h3>
                        {approvedProducts.length === 0 ? (
                            <p style={{ color: '#64748b' }}>No approved products yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {approvedProducts.map(product => (
                                    <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                                        {product.image && (
                                            <img
                                                src={`/uploads/${product.image}`}
                                                alt={product.name}
                                                style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                                            />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{product.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Seller: {product.addedBy?.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 600 }}>${product.price}</p>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', border: '1px solid #86efac', padding: '0.25rem 0.5rem', borderRadius: '999px', background: '#f0fdf4' }}>Approved</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#111827' }}>Order Management</h3>
                    {orders.length === 0 ? (
                        <p style={{ color: '#64748b' }}>No orders found.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.map(order => (
                                <div key={order._id} style={{ padding: '1rem', background: '#ffffff', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '700' }}>Order #{order._id.slice(-6)}</span>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '0.35rem' }}>
                                        Customer: {order.buyer?.name} ({order.buyer?.email})
                                    </p>
                                    <p style={{ fontSize: '0.875rem', color: '#111827', marginBottom: '1rem', fontWeight: 600 }}>
                                        Total: ${order.totalAmount}
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.875rem' }}>Status:</span>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                className="input-field"
                                                style={{ padding: '0.3rem 0.5rem', width: 'auto', borderRadius: '0.5rem' }}
                                                disabled={order.status === 'Refunded' || order.status === 'Cancelled'}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                                <option value="Refunded">Refunded</option>
                                            </select>
                                        </div>

                                        {order.refundStatus === 'Requested' && (
                                            <div style={{ background: '#fff7ed', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #ffedd5' }}>
                                                <p style={{ fontSize: '0.875rem', color: '#c2410c', marginBottom: '0.25rem', fontWeight: 'bold' }}>Refund Requested</p>
                                                <p style={{ fontSize: '0.8rem', color: '#9a3412', marginBottom: '0.5rem' }}>Reason: "{order.disputeReason}"</p>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleRefund(order._id, 'approve')} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#dc2626', borderColor: '#dc2626' }}>Approve Refund</button>
                                                    <button onClick={() => handleRefund(order._id, 'reject')} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Reject</button>
                                                </div>
                                            </div>
                                        )}
                                        {order.refundStatus === 'Approved' && <span style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: 'bold' }}>Refunded</span>}
                                        {order.refundStatus === 'Rejected' && <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Refund Rejected</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
