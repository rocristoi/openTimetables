import axios from 'axios';
import { useAuth } from '../AuthContext'; 

const api = axios.create({
    baseURL: 'https://api.open-timetables.tech:3000', // Backend API
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;  // Attach to every request
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';  // Redirect to login if unauthorized
        }
        return Promise.reject(error);
    }
);

export default api;
