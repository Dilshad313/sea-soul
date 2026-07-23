import crypto from 'crypto';

export const verifySignature = (orderId: string, paymentId: string, signature: string): boolean => {
    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    const generatedSignature = crypto.createHmac('sha256', secret)
        .update(orderId + '|' + paymentId)
        .digest('hex');

    return generatedSignature === signature;
};