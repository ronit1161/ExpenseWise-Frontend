import { createContext, useState, useEffect, useContext } from 'react';
import api, { setAccessToken } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // RESTORE USER SESSION ON PAGE REBOOT (Silent token refresh check)
    useEffect(() => {
        const checkActiveSession = async () => {
            try {
                const response = await api.post('/auth/refresh');
                if (response.data?.status === 'success') {
                    const { accessToken, user: userData } = response.data.data;
                    setAccessToken(accessToken);
                    setUser(userData);
                }
            } catch (err) {
                // Ignore failure on initial restore (user is simply logged out)
                setAccessToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkActiveSession();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data?.status === 'success') {
                const { accessToken, user: userData } = response.data.data;
                setAccessToken(accessToken);
                setUser(userData);
                return userData;
            }
        } catch (err) {
            setAccessToken(null);
            setUser(null);
            throw err.response?.data?.message || 'Incorrect email or password.';
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/register', { name, email, password });
            if (response.data?.status === 'success') {
                const { accessToken, user: userData } = response.data.data;
                setAccessToken(accessToken);
                setUser(userData);
                return userData;
            }
        } catch (err) {
            setAccessToken(null);
            setUser(null);
            throw err.response?.data?.message || 'Registration failed. Try again.';
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error on server:', err);
        } finally {
            setAccessToken(null);
            setUser(null);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be consumed inside an AuthProvider');
    }
    return context;
};
