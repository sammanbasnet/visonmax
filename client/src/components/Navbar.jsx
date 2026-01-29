import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Circle } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ background: '#d72626', color: '#ffffff', fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', textAlign: 'center', padding: '0.4rem 0' }}>
                Free shipping above Rs. 3000
            </div>
            <nav style={{ padding: '1.5rem 0' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {(!user || user.role === 'user') && (
                            <Link to="/shop" style={{ textDecoration: 'none', color: '#111827', fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                                Collections
                            </Link>
                        )}
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                            Crafted for clarity
                        </span>
                    </div>

                    <Link
                        to="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            color: '#111827',
                            gap: '0.65rem',
                            fontWeight: '700',
                            fontSize: '1.2rem',
                            letterSpacing: '0.35em',
                            textTransform: 'uppercase'
                        }}
                    >
                        <Circle size={16} color="#d72626" fill="#d72626" />
                        VisionMax
                    </Link>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="btn btn-outline" style={{ textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Dashboard</Link>
                                <button onClick={handleLogout} className="btn btn-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Login</Link>
                                <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Join VisionMax</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
