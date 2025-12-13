import React, { createContext, useEffect, useState } from "react";
import { api } from "../services/api";
import * as Keychain from "react-native-keychain";

export const CartContext = createContext<any>(null);

export function CartProvider({ children }: any) {

    const [items, setItems] = useState<any[]>([]);
    const [count, setCount] = useState(0);
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {
        const credentials = await Keychain.getGenericPassword();

        let uid = "demo_user";

        if (credentials) {
            try {

                const parsed = JSON.parse(credentials.username);


                uid = parsed.id;
            } catch (e) {

                uid = credentials.username;
            }
        }

        setUserId(uid);
        loadCart(uid);
    }


    async function loadCart(uid: string = userId) {
        try {
            const res = await api.get(`/cart/${uid}`);
            const cartItems = res.data.items || [];

            const merged: any = {};
            cartItems.forEach((c: any) => {
                if (!merged[c.product_id]) {
                    merged[c.product_id] = { product_id: c.product_id, quantity: 0 };
                }
                merged[c.product_id].quantity += c.quantity;
            });

            const mergedArray = Object.values(merged);


            const detailed = await Promise.all(
                mergedArray.map(async (c: any) => {
                    const p = await api.get(`/products/${c.product_id}`);
                    return {
                        product_id: c.product_id,
                        quantity: c.quantity,
                        title: p.data.title,
                        price: p.data.price,
                        images: p.data.images
                    };
                })
            );

            setItems(detailed);
            setCount(detailed.reduce((sum, it) => sum + it.quantity, 0));

        } catch (err) {
            console.log("LOAD CART ERROR:", err);
        }
    }

    async function addItem(product_id: string) {


        setItems(prev => {
            let exists = false;

            const updated = prev.map(item => {
                if (item.product_id === product_id) {
                    exists = true;
                    return { ...item, quantity: item.quantity + 1 };
                }
                return item;
            });

            if (!exists) {
                return [...updated, { product_id, quantity: 1 }];
            }

            return updated;
        });

        setCount(prev => prev + 1);


        api.post(`/cart/${userId}/add`, { product_id, quantity: 1 })
            .then(() => loadCart())
            .catch(err => console.log("ADD SYNC ERROR:", err));
    }


    async function removeItem(product_id: string) {

        setItems(prev => {
            const updated = prev
                .map(item =>
                    item.product_id === product_id
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter(item => item.quantity > 0);

            return updated;
        });

        setCount(prev => Math.max(prev - 1, 0));

        api.post(`/cart/${userId}/remove`, { product_id, quantity: 1 })
            .then(() => loadCart())
            .catch(err => console.log("REMOVE SYNC ERROR:", err));
    }


    return (
        <CartContext.Provider value={{ items, count, addItem, removeItem, loadCart }}>
            {children}
        </CartContext.Provider>
    );
}

