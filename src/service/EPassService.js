import axios from 'axios';
import { AUTHTOKEN } from '../utils/contants';

const BASE_URL = 'https://viruscorona.co.in';

const fileHeaders = {
    'Content-Type': 'multipart/form-data'
};

axios.defaults.baseURL = BASE_URL;
axios.defaults.headers['Content-Type'] = 'application/json';
// Add a request interceptor
axios.interceptors.request.use(
    function(config) {
        return config;
    },
    function(error) {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    function(response) {
        return response;
    },
    function(error) {
        return Promise.reject(error);
    }
);

export default {
    isSessionValid() {
        const expiry = localStorage.getItem('expiry');
        return (
            localStorage.getItem(AUTHTOKEN) &&
            expiry &&
            new Date(expiry) > Date.now()
        );
    },
    signIn(email, password) {
        return axios.post('/signin', { email, password });
    },

    register(name, email, password) {
        return axios.post('/createAccount', { name, email, password });
    },

    createOrder(formData) {
        return axios.post('/createOrder', formData, { headers: fileHeaders });
    },

    getOrders() {
        const userInfo = localStorage.getItem('userInfo');
        const { accountID } = JSON.parse(userInfo);

        return axios.post('/getOrders', {
            accountID,
            authToken: localStorage.getItem(AUTHTOKEN)
        });
    }
};