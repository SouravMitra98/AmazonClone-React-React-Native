import axios from "axios";
import { API_URL } from "./env";

const p = axios.create({ baseURL: API_URL });

export async function createStripePaymentIntent(amount: number) {
    const res = await p.post(
        "/payments/stripe/create-payment-intent",
        null,
        {params:{ amount }},   
    );
    return res.data;
}

export async function createRazorpayPaymentIntent(amount: number) {
    const res = await p.post(
        "/payments/razorpay/create-order",
        null,
       {params: { amount }} 
    );
    return res.data;
}
