import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products?limit=4');
            setProducts(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#ffffff' }}>
            {/* Hero Section */}
            <section
                style={{
                    padding: '4.5rem 0 3rem',
                    background: 'linear-gradient(110deg, rgba(255,255,255,0.82) 35%, rgba(255,245,245,0.82) 100%), url("https://images.unsplash.com/photo-1558752084-f8dd1f3067b9?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3") center/cover no-repeat'
                }}
            >
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem', alignItems: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: '#fff5f5', border: '1px solid #fecaca', color: '#991b1b', padding: '0.4rem 0.9rem', borderRadius: '999px', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            New Season Drop
                        </div>
                        <h1 style={{ fontSize: '3.6rem', fontWeight: '800', marginBottom: '1.25rem', marginTop: '1.25rem', lineHeight: '1', color: '#111827' }}>
                            VisionMax <span style={{ color: '#d72626' }}>Studio</span>
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: '560px', marginBottom: '2rem' }}>
                            Minimal frames, sculpted edges, and crisp lens clarity for everyday confidence.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Link to="/shop" className="btn btn-primary" style={{ padding: '1rem 2.6rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                Shop New
                            </Link>
                            <Link to="/shop" className="btn btn-outline" style={{ padding: '1rem 2.6rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                Explore Looks
                            </Link>
                        </div>
                        <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', maxWidth: '520px' }}>
                            {['UV400', 'Polarized', 'Scratch resistant'].map((label) => (
                                <div key={label} style={{ borderTop: '2px solid #d72626', paddingTop: '0.6rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#6b7280' }}>
                                    {label}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <div
                                style={{
                                    borderRadius: '2rem',
                                    border: '1px solid #e5e7eb',
                                    padding: '1.5rem',
                                    background: '#ffffff'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b7280' }}>Featured</span>
                                    <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#d72626' }}>Limited</span>
                                </div>
                                <div
                                    style={{
                                        height: '140px',
                                        borderRadius: '1.25rem',
                                        background: products[0]?.image && products[0]?.image !== 'no-photo.jpg'
                                            ? `url("/uploads/${products[0].image}") center/cover no-repeat`
                                            : 'url("https://images.unsplash.com/photo-1558752084-f8dd1f3067b9?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3") center/cover no-repeat',
                                        border: '1px solid #fecaca'
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                    <div>
                                        <p style={{ fontWeight: '600' }}>{products[0]?.name || 'Aviator Studio'}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                            {products[0]?.category || 'Metal'} / {products[0]?.condition || 'Polarized'}
                                        </p>
                                    </div>
                                    <p style={{ fontWeight: '700', color: '#d72626' }}>
                                        Rs. {products[0]?.price ?? '18,900'}
                                    </p>
                                </div>
                            </div>
                            <div
                                style={{
                                    borderRadius: '2rem',
                                    border: '1px solid #111827',
                                    padding: '1.5rem',
                                    background: 'linear-gradient(120deg, rgba(17,24,39,0.96), rgba(17,24,39,0.7)), url("https://images.unsplash.com/photo-1558752084-f8dd1f3067b9?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3") center/cover no-repeat',
                                    color: '#ffffff'
                                }}
                            >
                                <p style={{ fontSize: '0.8rem', letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.7 }}>Studio pack</p>
                                <h3 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>2 frames + 1 lens</h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }}>Personalize with matte or gloss finish.</p>
                                <button className="btn btn-primary" style={{ marginTop: '1.2rem' }}>Customize Set</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* New Arrivals Section */}
            <section style={{ padding: '4rem 0 5rem', background: '#ffffff' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#111827' }}>New Arrivals</h2>
                            <p style={{ color: '#6b7280' }}>Swipe through the latest drops.</p>
                        </div>
                        <Link to="/shop" style={{ color: '#dc2626', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Browse All <ArrowRight size={18} />
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading frames...</div>
                    ) : products.length > 0 ? (
                        <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                            {products.map(product => (
                                <div key={product._id} style={{ minWidth: '260px' }}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', background: '#fff5f5', borderRadius: '1rem', border: '1px solid #fecaca' }}>
                            <p style={{ color: '#991b1b', fontSize: '1.1rem' }}>No frames available at the moment. Check back soon!</p>
                            <p style={{ color: '#7f1d1d', fontSize: '0.875rem', marginTop: '0.5rem' }}>Note: Sold items are automatically removed from display.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
