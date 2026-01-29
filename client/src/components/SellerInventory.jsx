import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package } from 'lucide-react';

const SellerInventory = () => {
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const fetchMyProducts = async () => {
        try {
            const { data } = await api.get('/products/seller/myproducts');
            setMyProducts(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="card">
            <h2 style={{ marginBottom: '1.5rem' }}>My Inventory</h2>
            {myProducts.length === 0 ? (
                <p style={{ color: '#64748b' }}>You haven't listed any items yet.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {myProducts.map(product => (
                        <div key={product._id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                            {product.image && (
                                <img src={`/uploads/${product.image}`} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <h4 style={{ fontWeight: '600' }}>{product.name}</h4>
                                    <span style={{
                                        background: product.isApproved ? '#dcfce7' : '#fef9c3',
                                        color: product.isApproved ? '#166534' : '#854d0e',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }}>
                                        {product.isApproved ? 'Active' : 'Pending Approval'}
                                    </span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>${product.price} • {product.category}</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>Listed on {new Date(product.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerInventory;
