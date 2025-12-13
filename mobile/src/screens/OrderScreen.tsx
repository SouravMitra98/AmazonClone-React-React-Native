import React, { useCallback, useState } from "react";
import { View, FlatList, Image, Alert } from "react-native";
import { Text, Card, Button, Chip } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../services/api";
import type { Order, CartItem, Product } from "../type";

export default function OrdersScreen({ navigation }: any) {
    const [orders, setOrders] = useState<Order[]>([]);


    async function enrichOrders(rawOrders: Order[]) {
        const finalOrders: Order[] = [];

        for (const order of rawOrders) {
            const newItems: CartItem[] = [];

            for (const item of order.items) {
                try {
                    const res = await api.get<Product>(`/products/${item.product_id}`);
                    const product = res.data;

                    newItems.push({
                        ...item,
                        price: product.price,
                        title: product.title,
                        images: product.images,
                        productData: product,
                    } as any);
                } catch {
                    newItems.push(item);
                }
            }

            finalOrders.push({ ...order, items: newItems });
        }

        setOrders(finalOrders);
    }

    async function loadOrders() {
        try {
            const res = await api.get<Order[]>("/orders");
            await enrichOrders(res.data);
        } catch (err) {
            console.error("Order load error:", err);
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [])
    );


    async function cancelOrder(order: Order) {
        try {
            await api.patch(`/orders/${order._id}`, { status: "cancelled" });

            Alert.alert("Cancelled", "Your order has been cancelled.");
            loadOrders();
        } catch {
            Alert.alert("Error", "Unable to cancel order");
        }
    }

    function confirmCancel(order: Order) {
        Alert.alert(
            "Cancel Order?",
            "Do you want to cancel this order?",
            [{ text: "No" }, { text: "Yes", onPress: () => cancelOrder(order) }]
        );
    }


    const getStatusColor = (status: string) => {
        switch (status) {
            case "shipped":
                return "#1a7f37"; // green
            case "packed":
                return "#0077cc";
            case "out_for_delivery":
                return "#cc8f00";
            case "delivered":
                return "#148600";
            case "cancelled":
                return "#d62828"; // red
            default:
                return "#E67E22"; // pending
        }
    };


    const renderOrder = ({ item }: { item: Order }) => {
        return (
            <Card
                style={{
                    marginBottom: 16,
                    backgroundColor: "white",
                    borderRadius: 12,
                    elevation: 3,
                    padding: 14,
                }}
            >

                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                    {item.items.map((it, idx) => (
                        <Image
                            key={idx}
                            source={{
                                uri:
                                    it.images?.[0] ||
                                    "https://via.placeholder.com/60.png?text=No+Image",
                            }}
                            style={{
                                width: 58,
                                height: 58,
                                borderRadius: 8,
                                marginRight: 8,
                                backgroundColor: "#f5f5f5",
                            }}
                        />
                    ))}
                </View>


                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#0F1111",
                        marginBottom: 4,
                    }}
                >
                    {item.items.length === 1
                        ? item.items[0].title
                        : item.items.map((i) => i.title).join(" + ")}
                </Text>


                <Text style={{ color: "#666", marginBottom: 8 }}>
                    {item.items.length} item(s)
                </Text>


                <Chip
                    style={{
                        alignSelf: "flex-start",
                        backgroundColor: getStatusColor(item.status || "pending"),
                        marginBottom: 10,
                    }}
                    textStyle={{ color: "white", fontWeight: "600" }}
                >
                    {item.status?.replace(/_/g, " ").toUpperCase()}
                </Chip>


                <Text
                    style={{
                        fontSize: 17,
                        fontWeight: "700",
                        color: "#B12704",
                    }}
                >
                    Total: ₹{item.totalprice}
                </Text>


                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 14,
                    }}
                >

                    <Button
                        mode="contained-tonal"
                        style={{
                            flex: 1,
                            marginRight: 10,
                            borderRadius: 8,
                        }}
                        onPress={() => navigation.navigate("OrderDetails", { order: item })}
                    >
                        View Details
                    </Button>


                    {item.status !== "cancelled" &&
                        item.status !== "delivered" && (
                            <Button
                                mode="contained"
                                buttonColor="#d62828"
                                textColor="white"
                                style={{ flex: 1, borderRadius: 8 }}
                                onPress={() => confirmCancel(item)}
                            >
                                Cancel
                            </Button>
                        )}
                </View>
            </Card>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F2F4F5", padding: 12 }}>
            <Text
                variant="headlineSmall"
                style={{
                    fontWeight: "700",
                    color: "#0F1111",
                    marginBottom: 12,
                }}
            >
                Your Orders
            </Text>

            <FlatList
                data={orders}
                keyExtractor={(o) => o._id}
                renderItem={renderOrder}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
