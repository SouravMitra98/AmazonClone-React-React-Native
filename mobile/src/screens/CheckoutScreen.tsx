import React, { useContext, useState, useCallback } from "react";
import { View, Alert, Linking, Image, ScrollView } from "react-native";
import { StyleSheet } from "react-native";
import { Text, Button, Card, Divider, RadioButton } from "react-native-paper";
import { createStripePaymentIntent, createRazorpayPaymentIntent } from "../services/payment";
import { api } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

type PaymentMethod = "stripe" | "razorpay" | "gpay";

export default function CheckoutScreen({ route, navigation }: any) {
    const { items } = route.params;
    const { user, setUser } = useContext(AuthContext);

    const total = items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
    );

    const [method, setMethod] = useState<PaymentMethod>("stripe");
    const [loading, setLoading] = useState(false);


    useFocusEffect(
        useCallback(() => {
            loadUser();
        }, [])
    );

    async function loadUser() {
        try {
            const res = await api.get("/user/me");
            console.log("Updated User:", res.data);


            setUser(res.data);

        } catch (err) {
            console.log("Error loading user:", err);
        }
    }

    const buildOrderPayload = (payment_id: string) => ({
        items: items.map((i: any) => ({
            product_id: i.product_id || i._id || i.id,
            quantity: i.quantity,
        })),
        address: user?.address ?? "",
        totalprice: total,
        payment_id,
    });

    async function handlePay() {
        try {
            setLoading(true);
            let paymentRes = null;

            if (method === "stripe") {
                paymentRes = await createStripePaymentIntent(Math.round(total));
                if (paymentRes?.checkout_url) {
                    await api.post("/orders", buildOrderPayload(paymentRes.id));
                    return Linking.openURL(paymentRes.checkout_url);
                }
            }

            if (method === "razorpay") {
                paymentRes = await createRazorpayPaymentIntent(Math.round(total));
                if (paymentRes?.checkout_url) {
                    await api.post("/orders", buildOrderPayload(paymentRes.order.id));
                    return Linking.openURL(paymentRes.checkout_url);
                }
            }

            if (method === "gpay") {
                Alert.alert("Google Pay", "Payment successful!");
                await api.post("/orders", buildOrderPayload("gpay"));
                navigation.navigate("Main", { screen: "OrdersTab" });
                return;
            }

            await api.post("/orders", buildOrderPayload(method));
            navigation.navigate("Main", { screen: "OrdersTab" });

        } catch (err) {
            console.error("Checkout Error:", err);
            Alert.alert("Payment Error", "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F6F7F8" }}>
            <ScrollView style={{ padding: 14 }}
                contentContainerStyle={{ paddingBottom: 160 }}
            >
                <Text style={styles.header}>Checkout</Text>


                <Card style={styles.card}>
                    <Card.Title title="Your Items" titleStyle={styles.cardTitle} />
                    <Divider />

                    {items.map((item: any, index: number) => (
                        <View key={index} style={styles.itemRow}>
                            <Image
                                source={{
                                    uri:
                                        item.images?.[0] ||
                                        "https://via.placeholder.com/80.png?text=No+Image",
                                }}
                                style={styles.itemImage}
                            />

                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                                <Text style={styles.itemPrice}>
                                    ₹{item.price * item.quantity}
                                </Text>
                            </View>
                        </View>
                    ))}
                </Card>


                <Card style={styles.card}>
                    <Card.Title title="Order Summary" titleStyle={styles.cardTitle} />
                    <Divider />

                    <View style={{ padding: 14 }}>
                        <Row label="Items Total" value={`₹${total}`} />
                        <Row label="Delivery" value={total <= 500 ? "₹50" : "₹0"} />
                        <Divider style={{ marginVertical: 10 }} />
                        <Row label="Order Total" value={`₹${total + (total <= 500 ? 50 : 0)}`} bold valueColor="#B12704" />
                    </View>
                </Card>


                <Card style={styles.card}>
                    <Card.Title title="Your Address" titleStyle={styles.cardTitle} />
                    <Divider />

                    <View style={{ padding: 14 }}>
                        <Row label="" value={user?.address ?? "No address found"} />
                    </View>
                </Card>


                <Card style={styles.card}>
                    <Card.Title title="Payment Method" titleStyle={styles.cardTitle} />
                    <Divider />

                    <RadioButton.Group
                        value={method}
                        onValueChange={(v) => setMethod(v as PaymentMethod)}
                    >
                        {["stripe", "razorpay", "gpay"].map((m) => (
                            <View key={m} style={styles.paymentOption}>
                                <RadioButton value={m} />
                                <Text style={styles.paymentLabel}>
                                    {m === "stripe"
                                        ? "Stripe"
                                        : m === "razorpay"
                                            ? "Razorpay"
                                            : "Google Pay"}
                                </Text>
                            </View>
                        ))}
                    </RadioButton.Group>
                </Card>

                <View style={{ height: 90 }} />
            </ScrollView>


            <View style={styles.footer}>
                <Button
                    mode="contained"
                    loading={loading}
                    onPress={handlePay}
                    style={styles.checkoutBtn}
                    labelStyle={styles.checkoutLabel}
                >
                    Place Order • ₹{total}
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    textColor="#007185"
                    style={{ marginTop: 10 }}
                >
                    Go Back
                </Button>
            </View>
        </View>
    );
}

type RowProps = {
    label: string;
    value: string | number;
    bold?: boolean;
    valueColor?: string;
};

function Row({ label, value, bold = false, valueColor = "#0F1111" }: RowProps) {
    return (
        <View style={styles.row}>
            <Text style={[styles.rowLabel, bold && { fontWeight: "700" }]}>
                {label}
            </Text>

            <Text
                style={[
                    styles.rowValue,
                    { color: valueColor },
                    bold && { fontWeight: "700" },
                ]}
            >
                {value}
            </Text>
        </View>
    );
}


const styles = StyleSheet.create({
    header: {
        fontSize: 26,
        fontWeight: "700",
        color: "#0F1111",
        marginBottom: 10,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingBottom: 6,
        marginBottom: 14,
        elevation: 3,
    },

    cardTitle: {
        fontWeight: "700",
        color: "#0F1111",
        fontSize: 18,
    },

    itemRow: {
        flexDirection: "row",
        padding: 12,
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#EFEFEF",
    },

    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: "#eee",
    },

    itemTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F1111",
    },

    itemQty: {
        color: "#555",
    },

    itemPrice: {
        marginTop: 4,
        fontWeight: "700",
        color: "#B12704",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 6,
    },

    rowLabel: {
        fontSize: 15,
        color: "#555",
    },

    rowValue: {
        fontSize: 15,
        color: "#0F1111",
    },

    paymentOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },

    paymentLabel: {
        fontSize: 16,
        marginLeft: 8,
        color: "#0F1111",
    },

    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 14,
        backgroundColor: "white",
        elevation: 8,
    },

    checkoutBtn: {
        backgroundColor: "#FFD814",
        paddingVertical: 8,
        borderRadius: 10,
    },

    checkoutLabel: {
        fontWeight: "700",
        fontSize: 16,
        color: "#0F1111",
    },
});
