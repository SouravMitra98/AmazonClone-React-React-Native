import React, { useContext } from "react";
import { View, Image, FlatList, Touchable, TouchableOpacity } from "react-native";
import { Text, Button, Card, IconButton } from "react-native-paper";
import { CartContext } from "../context/CartContext";
import { useFocusEffect } from "@react-navigation/native";

export default function CartScreen({ navigation }: any) {
    const { items, addItem, removeItem, loadCart } = useContext(CartContext);

    useFocusEffect(
        React.useCallback(() => {
            loadCart();
        }, [])
    );

    function checkout() {
        if (items.length === 0) return;
        navigation.navigate("Checkout", { items });
    }


    const totalAmount = items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
    );

    return (
        <View style={{ flex: 1, backgroundColor: "#F2F4F5" }}>

            <Text
                style={{
                    fontSize: 24,
                    fontWeight: "700",
                    padding: 14,
                    color: "#0F1111",
                }}
            >
                Your Cart
            </Text>


            <FlatList
                data={items}
                keyExtractor={(item) => item.product_id}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate("HomeTab", {
                            screen: "Product",
                            params: { id: item.product_id }
                        })}
                    >
                        <Card
                            style={{
                                marginBottom: 14,
                                backgroundColor: "white",
                                borderRadius: 12,
                                padding: 12,
                                elevation: 3,
                            }}
                        >
                            <View style={{ flexDirection: "row" }}>

                                <Image
                                    source={{
                                        uri:
                                            item?.images?.[0] ||
                                            "https://via.placeholder.com/80.png?text=No+Image",
                                    }}
                                    style={{
                                        width: 85,
                                        height: 85,
                                        borderRadius: 10,
                                        marginRight: 14,
                                        backgroundColor: "#eee",
                                    }}
                                />


                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "700",
                                            color: "#0F1111",
                                            marginBottom: 6,
                                        }}
                                    >
                                        {item.title}
                                    </Text>

                                    <Text
                                        style={{
                                            fontSize: 17,
                                            fontWeight: "700",
                                            color: "#B12704",
                                        }}
                                    >
                                        ₹ {item.price}
                                    </Text>


                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            backgroundColor: "#F0F2F2",
                                            marginTop: 10,
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 8,
                                            width: 130,
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <IconButton
                                            icon="minus"
                                            size={18}
                                            onPress={() => removeItem(item.product_id)}
                                            iconColor="#0F1111"
                                            style={{ margin: 0 }}
                                        />

                                        <Text style={{ fontSize: 16, fontWeight: "600" }}>
                                            {item.quantity}
                                        </Text>

                                        <IconButton
                                            icon="plus"
                                            size={18}
                                            onPress={() => addItem(item.product_id)}
                                            iconColor="#0F1111"
                                            style={{ margin: 0 }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </Card>
                    </TouchableOpacity>
                )}
            />



            <View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    padding: 14,
                    borderTopWidth: 1,
                    borderColor: "#D5D9D9",
                    elevation: 10,
                }}
            >
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#0F1111",
                        marginBottom: 10,
                    }}
                >
                    Subtotal: ₹{totalAmount}
                </Text>

                <Button
                    mode="contained"
                    onPress={checkout}
                    style={{
                        backgroundColor: "#FFD814",
                        paddingVertical: 6,
                        borderRadius: 8,
                    }}
                    labelStyle={{
                        color: "#0F1111",
                        fontWeight: "700",
                        fontSize: 16,
                    }}
                >
                    Proceed to Buy ({items.length} items)
                </Button>
            </View>
        </View>
    );
}
