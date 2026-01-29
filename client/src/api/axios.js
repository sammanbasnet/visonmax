import axios from 'axios';

const api = axios.create({
    baseURL: '/api', 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});


const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};


api.interceptors.request.use((config) => {
    if (config.method !== 'get') {
        const token = getCookie('XSRF-TOKEN-V2');
        if (token) {
            config.headers['X-XSRF-TOKEN'] = token;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
