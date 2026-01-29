import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Store } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Default to user
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Prime CSRF token
        api.get('/products').catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Client-side validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            await register(name, email, password, role); // Pass role
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#ffffff' }}>
            <div style={{ background: 'linear-gradient(120deg, rgba(17, 24, 39, 0.65), rgba(17, 24, 39, 0.45)), url("https://i.pinimg.com/1200x/ac/cb/2c/accb2cf369045e33e5a451a1b2f0e558.jpg") center/cover no-repeat', color: '#ffffff', padding: '3rem', display: 'flex', alignItems: 'center' }}>
                <div style={{ maxWidth: '420px' }}>
                    <p style={{ letterSpacing: '0.25em', textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.85 }}>VisionMax</p>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '1rem' }}>Join the studio</h2>
                    <p style={{ opacity: 0.75 }}>Create your account to unlock exclusive drops and custom lens upgrades.</p>
                </div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: '440px', margin: '3rem auto', background: '#ffffff', border: '1px solid #e5e7eb' }}
            >
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#111827' }}>Create VisionMax Account</h2>
                {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#6b7280' }} />
                            <input
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: '2.5rem' }}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#6b7280' }} />
                            <input
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: '2.5rem' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#6b7280' }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '2.5rem' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Must be at least 8 characters</p>
                    </div>

                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff5f5', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #fecaca' }}>
                        <input
                            type="checkbox"
                            id="sellerCheck"
                            checked={role === 'seller'}
                            onChange={(e) => setRole(e.target.checked ? 'seller' : 'user')}
                            style={{ width: 'auto', marginRight: '0.5rem' }}
                        />
                        <label htmlFor="sellerCheck" style={{ fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Store size={16} />
                            I want to sell frames
                        </label>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    Already have an account? <Link to="/login" style={{ color: '#dc2626', textDecoration: 'none' }}>Log in</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
