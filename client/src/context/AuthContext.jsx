import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data.user);
        // Token is in cookie
    };

    const register = async (name, email, password, role) => {
        const { data } = await api.post('/auth/register', { name, email, password, role });
        setUser(data.user);
    };

    const logout = async () => {
        await api.get('/auth/logout');
        setUser(null);
    };

    const updateProfile = async (name, email) => {
        const { data } = await api.put('/users/updatedetails', { name, email });
        setUser(data.data);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, checkUserLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};
