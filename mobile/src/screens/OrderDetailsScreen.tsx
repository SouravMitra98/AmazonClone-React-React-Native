import React from "react";
import { View, ScrollView, Image, Alert } from "react-native";
import { Text, Card, Divider, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../services/api";

export default function OrderDetailsScreen({ route, navigation }: any) {
    const { order } = route.params;

    const steps = [
        { key: "pending", label: "Ordered", icon: "cart" },
        { key: "packed", label: "Packed", icon: "package-variant" },
        { key: "shipped", label: "Shipped", icon: "truck-fast" },
        { key: "out_for_delivery", label: "Out for Delivery", icon: "bike" },
        { key: "delivered", label: "Delivered", icon: "check-circle" },
    ];

    const statusIndex = steps.findIndex((s) => s.key === order.status);

    async function cancelOrder() {
        Alert.alert(
            "Cancel Order",
            "Are you sure you want to cancel this order?",
            [
                { text: "No" },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            await api.patch(`/orders/${order._id}`, {
                                status: "cancelled",
                            });
                            Alert.alert("Order Cancelled");
                            navigation.goBack();
                        } catch {
                            Alert.alert("Error", "Unable to cancel order");
                        }
                    },
                },
            ]
        );
    }

    return (
        <ScrollView style={{ padding: 12, backgroundColor: "#F3F3F3" }}>
            <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 10 }}>
                Order Details
            </Text>


            <Card style={styles.card}>
                <Card.Title title="Items" titleStyle={styles.cardTitle} />
                <Divider />

                {order.items.map((it: any, idx: number) => (
                    <View
                        key={idx}
                        style={{
                            flexDirection: "row",
                            padding: 12,
                            borderBottomWidth: idx < order.items.length - 1 ? 1 : 0,
                            borderColor: "#eee",
                        }}
                    >
                        <Image
                            source={{ uri: it.images?.[0] }}
                            style={styles.itemImage}
                        />

                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitle}>{it.title}</Text>
                            <Text style={{ color: "#555" }}>Qty: {it.quantity}</Text>
                            <Text style={styles.itemPrice}>₹{it.price}</Text>
                        </View>
                    </View>
                ))}
            </Card>


            <Card style={styles.card}>
                <Card.Title title="Delivery Timeline" titleStyle={styles.cardTitle} />
                <Divider />

                {steps.map((step, i) => {
                    const isCompleted = i <= statusIndex;
                    const isCancelled = order.status === "cancelled";

                    return (
                        <View
                            key={i}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: 12,
                                paddingHorizontal: 12,
                            }}
                        >

                            <Icon
                                name={step.icon}
                                size={26}
                                color={
                                    isCancelled
                                        ? "red"
                                        : isCompleted
                                            ? "green"
                                            : "#999"
                                }
                                style={{ marginRight: 12 }}
                            />

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: isCompleted ? "700" : "500",
                                        color: isCancelled
                                            ? "red"
                                            : isCompleted
                                                ? "#0F1111"
                                                : "#777",
                                    }}
                                >
                                    {step.label}
                                </Text>


                                {order.timeline?.[step.key] && (
                                    <Text style={{ fontSize: 12, color: "#666" }}>
                                        {new Date(order.timeline[step.key]).toLocaleString()}
                                    </Text>
                                )}
                            </View>


                            <View
                                style={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: 7,
                                    backgroundColor: isCancelled
                                        ? "red"
                                        : isCompleted
                                            ? "green"
                                            : "#ccc",
                                }}
                            />
                        </View>
                    );
                })}
            </Card>


            <Card style={styles.card}>
                <Card.Title title="Order Summary" titleStyle={styles.cardTitle} />
                <Divider />

                <View style={{ padding: 12 }}>
                    <Text style={styles.summaryText}>
                        Order Total: <Text style={styles.summaryValue}>₹{order.totalprice}</Text>
                    </Text>

                    <Text style={styles.summaryText}>
                        Status:{" "}
                        <Text
                            style={{
                                fontWeight: "700",
                                color: order.status === "cancelled" ? "red" : "green",
                            }}
                        >
                            {order.status}
                        </Text>
                    </Text>

                    <Text style={styles.summaryText}>Payment: {order.payment_id}</Text>
                    <Text style={styles.summaryText}>Address: {order.address}</Text>
                </View>
            </Card>


            {order.status === "pending" && (
                <Button
                    mode="contained"
                    onPress={cancelOrder}
                    style={styles.cancelBtn}
                    labelStyle={{ color: "white", fontWeight: "700" }}
                >
                    Cancel Order
                </Button>
            )}

            <Button
                mode="text"
                onPress={() => navigation.goBack()}
                textColor="#007185"
                style={{ marginTop: 10 }}
            >
                Go Back
            </Button>
        </ScrollView>
    );
}

const styles = {
    card: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#DDD",
        backgroundColor: "white",
        borderRadius: 8,
    },
    cardTitle: {
        fontWeight: "700" as "700",
        color: "#0F1111",
        fontSize: 16,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: "#eee",
    },
    itemTitle: {
        fontWeight: "700" as "700",
        fontSize: 15,
        color: "#0F1111",
    },
    itemPrice: {
        fontWeight: "700" as "700",
        color: "#B12704",
        marginTop: 4,
    },

    summaryText: {
        fontSize: 14,
        marginBottom: 5,
        color: "#333",
    },

    summaryValue: {
        fontSize: 15,
        fontWeight: "700" as "700",
        color: "#B12704",
    },

    cancelBtn: {
        backgroundColor: "red",
        marginTop: 18,
        padding: 6,
        borderRadius: 6,
    },
};

