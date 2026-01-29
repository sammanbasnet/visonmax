import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';

const Shop = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        condition: ''
    });

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'seller')) {
            navigate('/dashboard');
            return;
        }
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        try {
            let query = '/products?';
            if (filters.category) query += `category=${filters.category}&`;
            if (filters.condition) query += `condition=${filters.condition}&`;

            const { data } = await api.get(query);
            setProducts(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', color: '#111827' }}>
            <div className="container" style={{ padding: '3rem 1rem 4rem' }}>
                <header style={{ marginBottom: '2.5rem' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.28em', color: '#6b7280', marginBottom: '0.6rem' }}>
                        VisionMax Collections
                    </p>
                    <h1 style={{ fontSize: '2.6rem', fontWeight: '800', marginBottom: '0.6rem' }}>Shop All Frames</h1>
                    <p style={{ color: '#6b7280', maxWidth: '32rem', fontSize: '0.95rem' }}>
                        Filter by style and lens finish to find the right silhouette.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
                    <aside style={{ border: '1px solid #e5e7eb', borderRadius: '1.5rem', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Filter size={18} color="#d72626" />
                            <p style={{ fontWeight: '600', letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: '0.75rem' }}>Filters</p>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280' }}>Style</label>
                            <select
                                className="input-field"
                                style={{ marginTop: '0.5rem' }}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                defaultValue=""
                            >
                                <option value="">All Styles</option>
                                <option value="Sunglasses">Sunglasses</option>
                                <option value="Optical">Optical Frames</option>
                                <option value="Aviator">Aviator</option>
                                <option value="Wayfarer">Wayfarer</option>
                                <option value="Round">Round</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280' }}>Lens</label>
                            <select
                                className="input-field"
                                style={{ marginTop: '0.5rem' }}
                                onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                                defaultValue=""
                            >
                                <option value="">All Options</option>
                                <option value="Premium">Premium</option>
                                <option value="Polarized">Polarized</option>
                                <option value="Standard">Standard</option>
                            </select>
                        </div>
                    </aside>

                    <div>
                        {loading ? (
                            <div style={{ padding: '3rem 0', textAlign: 'center', color: '#6b7280' }}>Loading frames…</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.75rem' }}>
                                {products.length > 0 ? (
                                    products.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))
                                ) : (
                                    <p style={{ color: '#6b7280' }}>No frames match your selection yet. Try removing a filter or check back soon.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
