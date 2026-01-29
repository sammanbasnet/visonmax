import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';

import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [captchaSvg, setCaptchaSvg] = useState('');
    

    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [tempToken, setTempToken] = useState('');

    const { checkUserLoggedIn } = useAuth(); 
    const navigate = useNavigate();

    useEffect(() => {
        fetchCaptcha();
    }, []);

    const fetchCaptcha = async () => {
        try {
            
            const { data } = await api.get(`/auth/captcha?t=${new Date().getTime()}`, {
                responseType: 'text'
            });
            setCaptchaSvg(data);
        } catch (err) {
            console.error('Failed to load captcha', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mfaRequired) {
           
            try {
                const { data } = await api.post('/auth/login/verify-mfa', { tempToken, code: mfaCode });
                toast.success('Login Successful');
                await checkUserLoggedIn(); 
                navigate('/dashboard');
            } catch (err) {
                toast.error(err.response?.data?.error || 'Invalid Code');
            }
            return;
        }

        
        try {
            const { data } = await api.post('/auth/login', { email, password, captcha });

            if (data.mfaRequired) {
                setMfaRequired(true);
                setTempToken(data.tempToken);
                toast.success('Please enter 2FA Code');
            } else {
                
                toast.success('Welcome back!');
                await checkUserLoggedIn(); 
                navigate('/dashboard');
            }
        } catch (err) {
            const errorData = err.response?.data;

            
            if (errorData?.locked) {
                toast.error(errorData.error, {
                    duration: 6000,
                    icon: '🔒',
                    style: {
                        background: '#fee2e2',
                        color: '#991b1b',
                        fontWeight: '500'
                    }
                });
            }
            
            else if (errorData?.remainingAttempts !== undefined) {
                const attempts = errorData.remainingAttempts;
                toast.error(errorData.error, {
                    duration: 5000,
                    icon: attempts <= 2 ? '⚠️' : '❌',
                    style: attempts <= 2 ? {
                        background: '#fef3c7',
                        color: '#92400e',
                        fontWeight: '500'
                    } : undefined
                });
            }
            
            else {
                toast.error(errorData?.error || 'Login failed');
            }

            fetchCaptcha(); 
            setCaptcha('');
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#ffffff' }}>
            <div
                style={{
                    background: 'linear-gradient(120deg, rgba(215, 38, 38, 0.25), rgba(215, 38, 38, 0.15)), url("https://i.pinimg.com/1200x/69/62/de/6962de08b96b5893708f2588eb0b4b0e.jpg") center/cover no-repeat',
                    color: '#ffffff',
                    padding: '3rem',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <div style={{ maxWidth: '420px' }}>
                    <p style={{ letterSpacing: '0.25em', textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.85 }}>VisionMax</p>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '1rem' }}>Welcome back</h2>
                    <p style={{ opacity: 0.85 }}>Log in to manage your collections, orders, and personalized lens preferences.</p>
                </div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: '440px', margin: '3rem auto', background: '#ffffff', border: '1px solid #e5e7eb' }}
            >
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#111827' }}>
                    {mfaRequired ? 'Two-Factor Authentication' : 'Sign in'}
                </h2>



                <form onSubmit={handleSubmit}>
                    {!mfaRequired ? (
                        <>
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
                                    />
                                </div>
                            </div>

                            {/* CAPTCHA */}
                            <div className="input-group">
                                <label className="input-label">Human Verification</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div
                                        dangerouslySetInnerHTML={{ __html: captchaSvg }}
                                        style={{ background: '#f8fafc', borderRadius: '4px', padding: '0 5px' }}
                                    />
                                    <button type="button" onClick={fetchCaptcha} className="btn" style={{ padding: '0.5rem' }} title="Refresh Captcha">
                                        <RefreshCcw size={16} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter the characters above"
                                    value={captcha}
                                    onChange={(e) => setCaptcha(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
                        </>
                    ) : (
                        <>
                            <div className="input-group">
                                <label className="input-label">Enter Authenticator Code</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="000000"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value)}
                                    maxLength={6}
                                    style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.25rem' }}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Verify</button>
                        </>
                    )}
                </form>

                {!mfaRequired && (
                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        Don't have an account? <Link to="/register" style={{ color: '#dc2626', textDecoration: 'none' }}>Join VisionMax</Link>
                    </p>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
