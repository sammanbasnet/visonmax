import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { User, Shield, CreditCard, Activity, Store, Package, ShoppingCart } from 'lucide-react';
import SellerDashboard from '../components/SellerDashboard';
import SellerInventory from '../components/SellerInventory';
import SellerOrders from '../components/SellerOrders';
import AdminDashboard from '../components/AdminDashboard';
import ActivityLogs from '../components/ActivityLogs';
import OrderList from '../components/OrderList';
import WalletCard from '../components/WalletCard';
import { motion } from 'framer-motion';
import api from '../api/axios';

import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, updateProfile } = useAuth();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? 'admin' : 'profile');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) {

            if (tab === 'orders' && user?.role === 'seller') {
                setActiveTab('sales');
            } else {
                setActiveTab(tab);
            }
        }
    }, [location, user]);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');


    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [mfaData, setMfaData] = useState({ secret: '', qrCode: '' });
    const [mfaCode, setMfaCode] = useState('');
    const [sellerEarnings, setSellerEarnings] = useState(0);
    const [isSimulation, setIsSimulation] = useState(true);

    useEffect(() => {

        api.post('/payment/create-intent', { items: [] })
            .then(res => setIsSimulation(res.data.isSimulation))
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (user?.role === 'seller' || user?.role === 'admin') {
            fetchSellerEarnings();
        }
    }, [user]);

    const fetchSellerEarnings = async () => {
        try {
            const { data } = await api.get('/orders/seller/myorders');
            const total = data.data.reduce((acc, order) => acc + (order.sellerTotal || 0), 0);
            setSellerEarnings(total);
        } catch (err) {
            console.error('Failed to fetch seller earnings', err);
        }
    };

    const setupMFA = async () => {
        try {
            const { data } = await api.post('/auth/mfa/setup');
            setMfaData({ secret: data.secret, qrCode: data.qrCode });
            toast.success('MFA Setup Generated');
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate MFA setup');
        }
    };

    const enableMFA = async () => {
        try {
            await api.post('/auth/mfa/enable', { code: mfaCode });
            toast.success('2FA Enabled Successfully!');
            setMfaData({ secret: '', qrCode: '' });
            setMfaCode('');

            window.location.reload();
        } catch (err) {
            toast.error('Invalid Code');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(name, email);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await api.put('/users/updatepassword', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update password');
        }
    };

    const handleTopUp = async () => {
        const amountStr = prompt("Enter amount to top up (USD):", "50");
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Invalid amount");
            return;
        }

        try {
            const { data } = await api.post('/payment/top-up', { amount });
            toast.success(`Successfully topped up $${amount}!`);
            updateProfile(user.name, user.email); // Refresh user data to get new balance
        } catch (err) {
            toast.error("Top up failed");
        }
    };

    return (
        <div style={{ padding: '2.5rem 0 4rem', background: '#ffffff' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    <div>
                        <p style={{ fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6b7280' }}>Account Center</p>
                        <h1 style={{ marginTop: '0.35rem', fontSize: '2.25rem', fontWeight: '800' }}>Dashboard</h1>
                        <p style={{ color: '#6b7280' }}>Manage your profile, security, orders, and billing.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <Link to="/shop" className="btn btn-outline" style={{ textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            Shop Glasses
                        </Link>
                        <button className="btn btn-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            Quick Add
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    {/* Top Navigation */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {[
                            { id: 'profile', label: 'Profile', icon: <User size={16} /> },
                            { id: 'security', label: 'Security', icon: <Shield size={16} /> },
                            ...(user.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: <Shield size={16} /> }] : []),
                            ...(user.role === 'seller'
                                ? [
                                    { id: 'seller', label: 'My Shop', icon: <Store size={16} /> },
                                    { id: 'inventory', label: 'Inventory', icon: <Package size={16} /> },
                                    { id: 'sales', label: 'Sales', icon: <ShoppingCart size={16} /> }
                                ]
                                : []),
                            { id: 'orders', label: user.role === 'seller' ? 'Purchases' : 'Orders', icon: <ShoppingCart size={16} /> },
                            { id: 'billing', label: 'Billing', icon: <CreditCard size={16} /> },
                            { id: 'activity', label: 'Activity', icon: <Activity size={16} /> }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className="btn"
                                style={{
                                    background: activeTab === item.id ? '#d72626' : '#ffffff',
                                    color: activeTab === item.id ? '#ffffff' : '#111827',
                                    border: activeTab === item.id ? '1px solid #d72626' : '1px solid #e5e7eb',
                                    borderRadius: '999px',
                                    padding: '0.6rem 1.1rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.14em',
                                    fontSize: '0.7rem'
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
                        <div className="card" style={{ border: '1px solid #fecaca', background: '#fff5f5' }}>
                            <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#991b1b' }}>Account</p>
                            <h3 style={{ marginTop: '0.75rem', marginBottom: '0.25rem' }}>{user?.name}</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{user?.email}</p>
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #fecaca' }}>
                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#6b7280' }}>Role</p>
                                <p style={{ fontWeight: '600', marginTop: '0.35rem' }}>{user?.role}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >


                        {activeTab === 'profile' && (
                            <div className="card">
                                <h2 style={{ marginBottom: '1.5rem' }}>Profile Information</h2>
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="input-group">
                                        <label className="input-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <button className="btn btn-primary">Save Changes</button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="card">
                                <h2 style={{ marginBottom: '1.5rem' }}>Security Settings</h2>
                                {/* ... existing security form ... */}
                                <form onSubmit={handlePasswordChange}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Change Password</h3>
                                    <div className="input-group">
                                        <label className="input-label">Current Password</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">New Password</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                    <button className="btn btn-primary">Update Password</button>
                                </form>

                                {mfaData.qrCode ? (
                                    <div style={{ marginTop: '1rem' }}>
                                        <p style={{ marginBottom: '0.5rem' }}>1. Scan this QR code with your authenticator app (e.g. Google Authenticator).</p>
                                        <img src={mfaData.qrCode} alt="MFA QR Code" style={{ border: '1px solid #e2e8f0', borderRadius: '4px' }} />

                                        <p style={{ margin: '1rem 0 0.5rem' }}>2. Enter the 6-digit code below to confirm.</p>
                                        <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '300px' }}>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="000000"
                                                maxLength={6}
                                                value={mfaCode}
                                                onChange={(e) => setMfaCode(e.target.value)}
                                            />
                                            <button onClick={enableMFA} className="btn btn-primary">Verify</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={setupMFA} className="btn btn-outline" disabled={user?.mfaEnabled}>
                                        {user?.mfaEnabled ? '2FA is Enabled' : 'Enable 2FA'}
                                    </button>
                                )}
                            </div>
                        )}

                        {activeTab === 'admin' && user.role === 'admin' && <AdminDashboard />}
                        {activeTab === 'seller' && user.role === 'seller' && <SellerDashboard />}
                        {activeTab === 'inventory' && user.role === 'seller' && <SellerInventory />}
                        {activeTab === 'sales' && user.role === 'seller' && <SellerOrders />}
                        {activeTab === 'orders' && <OrderList />}

                        {activeTab === 'billing' && (
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h2 style={{ marginBottom: '0.25rem' }}>Billing & Payments</h2>
                                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage your funds and view transaction history.</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#d72626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {isSimulation ? 'Mode: Simulation' : 'Mode: Live Stripe'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Powered by Stripe</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                    <WalletCard
                                        balance={user?.walletBalance || 0}
                                        name={user?.name}
                                        onTopUp={handleTopUp}
                                    />

                                    {(user.role === 'seller' || user.role === 'admin') && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, #d72626 0%, #f97316 100%)',
                                            padding: '1.5rem',
                                            borderRadius: '1.25rem',
                                            color: 'white',
                                            boxShadow: '0 10px 25px -5px rgba(215, 38, 38, 0.4)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            minHeight: '200px'
                                        }}>
                                            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Sales Earnings</p>
                                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>${sellerEarnings.toFixed(2)}</h2>
                                            <p style={{ fontSize: '0.75rem', marginTop: '1rem', opacity: 0.85 }}>Automatically settled to your bank account weekly.</p>
                                        </div>
                                    )}
                                </div>

                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: '700' }}>Transaction History</h3>
                                <OrderList showHeader={false} />
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="card">
                                <h2 style={{ marginBottom: '1.5rem' }}>Recent Activity</h2>
                                <ActivityLogs />
                            </div>
                        )}

                    </motion.div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Dashboard;
