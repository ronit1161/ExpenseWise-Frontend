import axios from 'axios';

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Request Interceptor to inject the active Access Token
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor to intercept 401 errors, refresh session silently, and retry
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is unauthorized and we haven't retried yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Execute refresh call (sends HttpOnly refresh cookie)
                const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
                    withCredentials: true
                });

                if (response.data?.status === 'success') {
                    const { accessToken: newToken } = response.data.data;
                    setAccessToken(newToken);

                    // Re-apply auth header and retry original query
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshErr) {
                // Silent refresh failed (cookie expired/invalid) - bubble error up to context
                setAccessToken(null);
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
