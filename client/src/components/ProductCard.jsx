import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const isSold = product.isSold;
    const conditionLabel = product.condition || 'Standard';
    const isPolarized = String(conditionLabel).toLowerCase().includes('polar');

    return (
        <motion.div
            whileHover={{ y: -6 }}
            style={{
                background: '#ffffff',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={() => navigate(`/product/${product._id}`)}
        >
            <div style={{ height: '210px', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                {product.image && product.image !== 'no-photo.jpg' ? (
                    <img
                        src={`/uploads/${product.image}`}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isSold ? 'grayscale(80%) brightness(0.85)' : 'none', transform: 'scale(1.02)' }}
                    />
                ) : (
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem', letterSpacing: '0.16em' }}>VISIONMAX</span>
                )}

                {isSold && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(17, 24, 39, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '1.1rem',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        zIndex: 2
                    }}>
                        SOLD OUT
                    </div>
                )}

                {!isSold && (
                    <span style={{
                        position: 'absolute',
                        top: '0.9rem',
                        left: '0.9rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.65rem',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        background: '#111827',
                        color: '#ffffff'
                    }}>
                        {isPolarized ? 'Polarized' : 'UV400'}
                    </span>
                )}
            </div>

            <div style={{ padding: '1.1rem 1.2rem 1.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280' }}>{product.category || 'Eyewear'}</span>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280' }}>{conditionLabel}</span>
                </div>
                <h3 style={{ fontSize: '1.02rem', fontWeight: '600', margin: 0, color: '#111827', lineHeight: '1.35' }}>{product.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.8rem' }}>
                    <span style={{ fontWeight: '700', color: '#d72626', fontSize: '1rem' }}>Rs. {product.price}</span>
                    {!isSold && (
                        <span style={{ fontSize: '0.7rem', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                            View
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
