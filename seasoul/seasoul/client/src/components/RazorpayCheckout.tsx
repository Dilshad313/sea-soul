import React, { useState } from 'react';
import axios from 'axios';

const RazorpayCheckout = () => {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/create-order');
            const { orderId } = response.data;

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: response.data.amount,
                currency: response.data.currency,
                name: 'Your Company Name',
                description: 'Test Transaction',
                order_id: orderId,
                handler: async function (response) {
                    const verificationResponse = await axios.post('/api/verify-payment', {
                        orderId: response.razorpay_order_id,
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                    });
                    if (verificationResponse.data.success) {
                        alert('Payment successful!');
                    } else {
                        alert('Payment verification failed!');
                    }
                },
                prefill: {
                    name: 'Customer Name',
                    email: 'customer@example.com',
                    contact: '9999999999',
                },
                theme: {
                    color: '#F37254',
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handlePayment} disabled={loading}>
                {loading ? 'Loading...' : 'Pay with Razorpay'}
            </button>
        </div>
    );
};

export default RazorpayCheckout;