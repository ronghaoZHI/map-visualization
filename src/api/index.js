import axios from './axios';

export const getUser = params => axios.get('/api/user', params);