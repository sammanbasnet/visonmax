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

    return (
        <div className="card">
            <h2 style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h2>
            {message && <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{message}</div>}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <button
                    onClick={() => setActiveTab('products')}
                    className="btn"
                    style={{
                        borderBottom: activeTab === 'products' ? '2px solid #4f46e5' : 'none',
                        borderRadius: 0,
                        padding: '0.5rem 1rem',
                        color: activeTab === 'products' ? '#4f46e5' : '#64748b'
                    }}
                >
                    Product Approvals
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className="btn"
                    style={{
                        borderBottom: activeTab === 'orders' ? '2px solid #4f46e5' : 'none',
                        borderRadius: 0,
                        padding: '0.5rem 1rem',
                        color: activeTab === 'orders' ? '#4f46e5' : '#64748b'
                    }}
                >
                    Order Management
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className="btn"
                    style={{
                        borderBottom: activeTab === 'audit' ? '2px solid #4f46e5' : 'none',
                        borderRadius: 0,
                        padding: '0.5rem 1rem',
                        color: activeTab === 'audit' ? '#4f46e5' : '#64748b'
                    }}
                >
                    Audit Logs
                </button>
            </div>

            {activeTab === 'audit' && (
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>System Audit Logs</h3>
                    <ActivityLogs endpoint="/users/admin/logs" />
                </div>
            )}

            {activeTab === 'products' && (
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Pending Approvals</h3>
                    {unapprovedProducts.length === 0 ? (
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>No products pending approval.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {unapprovedProducts.map(product => (
                                <div key={product._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {product.image && (
                                            <img
                                                src={`/uploads/${product.image}`}
                                                alt={product.name}
                                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
                                            />
                                        )}
                                        <div>
                                            <p style={{ fontWeight: '600' }}>{product.name}</p>
                                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Sold by: {product.addedBy?.name} | Price: ${product.price}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => approveProduct(product._id)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Approve</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '2px dashed #e2e8f0' }}>Approval History</h3>
                    {approvedProducts.length === 0 ? (
                        <p style={{ color: '#64748b' }}>No approved products yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {approvedProducts.map(product => (
                                <div key={product._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {product.image && (
                                            <img
                                                src={`/uploads/${product.image}`}
                                                alt={product.name}
                                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid #86efac' }}
                                            />
                                        )}
                                        <div>
                                            <p style={{ fontWeight: '600' }}>{product.name}</p>
                                            <p style={{ fontSize: '0.875rem', color: '#166534' }}>Seller: {product.addedBy?.name} | Price: ${product.price}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ color: '#166534', fontWeight: 'bold', fontSize: '0.875rem' }}>✓ Approved</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'orders' && (
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Order Management</h3>
                    {orders.length === 0 ? (
                        <p style={{ color: '#64748b' }}>No orders found.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.map(order => (
                                <div key={order._id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600' }}>Order #{order._id.slice(-6)}</span>
                                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '0.5rem' }}>
                                        Customer: {order.buyer?.name} ({order.buyer?.email})
                                    </p>
                                    <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '1rem' }}>
                                        Total: ${order.totalAmount}
                                    </p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.875rem' }}>Status:</span>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                className="input-field"
                                                style={{ padding: '0.25rem', width: 'auto' }}
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
                                            <div style={{ background: '#fff7ed', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ffedd5' }}>
                                                <p style={{ fontSize: '0.875rem', color: '#c2410c', marginBottom: '0.25rem', fontWeight: 'bold' }}>Refund Requested!</p>
                                                <p style={{ fontSize: '0.8rem', color: '#9a3412', marginBottom: '0.5rem' }}>Reason: "{order.disputeReason}"</p>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleRefund(order._id, 'approve')} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#dc2626', borderColor: '#dc2626' }}>Approve Refund</button>
                                                    <button onClick={() => handleRefund(order._id, 'reject')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Reject</button>
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
