import { motion } from 'framer-motion';
import { Wallet, Plus, CreditCard } from 'lucide-react';

const WalletCard = ({ balance, onTopUp, name }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '1.25rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
        >
            {/* Background pattern */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                opacity: 0.1,
                transform: 'rotate(15deg)'
            }}>
                <Wallet size={150} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                <div>
                    <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Loyalty Card</h4>
                    <p style={{ fontSize: '1.125rem', fontWeight: '600', marginTop: '0.25rem' }}>{name || "User"}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '0.75rem' }}>
                    <CreditCard size={24} />
                </div>
            </div>

            <div style={{ zIndex: 1 }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Rs. {balance.toFixed(2)}</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6, letterSpacing: '0.1em' }}>VIRTUAL WALLET</span>
                    <button
                        onClick={onTopUp}
                        style={{
                            background: '#d97706',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Plus size={16} /> Top Up
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default WalletCard;
