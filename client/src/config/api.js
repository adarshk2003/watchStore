const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || 'https://watchstore-backends.onrender.com';

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');
