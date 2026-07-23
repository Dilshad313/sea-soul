import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const createOrder = async (amount) => {
    try {
        const response = await axios.post(`${API_URL}/create-order`, { amount });
        return response.data;
    } catch (error) {
        throw new Error('Error creating order: ' + error.message);
    }
};

export const verifyPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_URL}/verify-payment`, paymentData);
        return response.data;
    } catch (error) {
        throw new Error('Error verifying payment: ' + error.message);
    }
};