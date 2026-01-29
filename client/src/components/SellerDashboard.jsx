import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        category: 'Sunglasses',
        condition: 'Standard',
        description: '',
        size: 'Medium',
        quantity: 1
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const sizeMapping = {
        'Sunglasses': ['Small', 'Medium', 'Large', 'Wide'],
        'Optical': ['Small', 'Medium', 'Large', 'Wide'],
        'Aviator': ['Medium', 'Large', 'Wide'],
        'Wayfarer': ['Small', 'Medium', 'Large'],
        'Round': ['Small', 'Medium', 'Large']
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            
            setNewItem({
                ...newItem,
                category: value,
                size: sizeMapping[value][0]
            });
        } else {
            setNewItem({ ...newItem, [name]: value });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', newItem.name);
        formData.append('price', newItem.price);
        formData.append('category', newItem.category);
        formData.append('condition', newItem.condition);
        formData.append('size', newItem.size);
        formData.append('description', newItem.description);
        formData.append('quantity', newItem.quantity);
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Item listed successfully! Pending approval.');
            setNewItem({ name: '', price: '', category: 'Sunglasses', condition: 'Standard', description: '', size: 'Medium', quantity: 1 });
            setImage(null);
            setPreview(null);
        } catch (err) {
            console.error(err);
            toast.error('Failed to list item');
        }
    };

    return (
        <div className="card" style={{ background: '#0f172a', border: '1px solid #1f2937' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#f9fafb' }}>List New Frame</h2>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label">Frame Name</label>
                    <input name="name" className="input-field" value={newItem.name} onChange={handleChange} required />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Price (Rs.)</label>
                        <input name="price" type="number" className="input-field" value={newItem.price} onChange={handleChange} required />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Quantity</label>
                        <input name="quantity" type="number" min="1" className="input-field" value={newItem.quantity} onChange={handleChange} required />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Style</label>
                        <select name="category" className="input-field" value={newItem.category} onChange={handleChange}>
                            <option value="Sunglasses">Sunglasses</option>
                            <option value="Optical">Optical Frames</option>
                            <option value="Aviator">Aviator</option>
                            <option value="Wayfarer">Wayfarer</option>
                            <option value="Round">Round</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Lens Type</label>
                        <select name="condition" className="input-field" value={newItem.condition} onChange={handleChange}>
                            <option value="Standard">Standard</option>
                            <option value="Polarized">Polarized</option>
                            <option value="Photochromic">Photochromic</option>
                            <option value="Premium">Premium</option>
                        </select>
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Frame Size</label>
                        <select name="size" className="input-field" value={newItem.size} onChange={handleChange}>
                            {sizeMapping[newItem.category].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="input-group">
                    <label className="input-label">Product Image</label>
                    <input type="file" className="input-field" onChange={handleImageChange} accept="image/*" />
                    {preview && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <img src={preview} alt="Preview" style={{ width: '100%', maxWidth: '200px', height: 'auto', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                        </div>
                    )}
                </div>
                <div className="input-group">
                    <label className="input-label">Description</label>
                    <textarea name="description" className="input-field" value={newItem.description} onChange={handleChange} rows="3" required></textarea>
                </div>
                <button className="btn btn-primary">List Frame</button>
            </form>
        </div>
    );
};

export default SellerDashboard;
