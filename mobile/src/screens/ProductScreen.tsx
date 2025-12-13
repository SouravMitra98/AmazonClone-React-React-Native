import React, { useState, useEffect, useContext } from "react";
import { View, Image, ScrollView, Alert, TouchableOpacity } from "react-native";
import { Text, Button, Paragraph, Badge } from "react-native-paper";
import { api } from "../services/api";
import RatingStars from "../components/RatingStars";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CartContext } from "../context/CartContext";

export default function ProductScreen({ route, navigation }: any) {
    const { id } = route.params;

    const { count, addItem, loadCart } = useContext(CartContext);
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        loadProduct();
        loadCart();
    }, []);

    async function loadProduct() {
        try {
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);
        } catch (err) {
            console.log("Product load error:", err);
        }
    }


    async function handleAdd() {
        if (!product) return;

        await addItem(product._id);
        Alert.alert("Added to Cart", `${product.title} added.`);
    }


    function handleBuyNow() {
        if (!product) return;

        navigation.navigate("Checkout", {
            items: [
                {
                    _id: product._id,
                    price: product.price,
                    quantity: 1,
                    title: product.title,
                    images: product.images
                }
            ]
        });
    }

    if (!product) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F3F3F3" }}>


            <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
                <View style={{ padding: 10, flexDirection: "row", justifyContent: "flex-end" }}>
                    <Icon name="cart-outline" size={30} color="#111" />
                    {count > 0 && (
                        <Badge
                            style={{
                                backgroundColor: "#FFA41C",
                                position: "absolute",
                                top: 5,
                                right: 5
                            }}
                        >
                            {count}
                        </Badge>
                    )}
                </View>
            </TouchableOpacity>

            <ScrollView>


                <View style={{ alignItems: "center", padding: 12 }}>
                    <Image
                        source={{ uri: product.images?.[0] }}
                        style={{
                            width: "80%",
                            height: 250,
                            resizeMode: "contain",
                            backgroundColor: "#fff",
                        }}
                    />
                </View>


                <View style={{ padding: 12, backgroundColor: "#fff" }}>
                    <Text style={{ fontSize: 22, fontWeight: "700", color: "#0F1111" }}>
                        {product.title}
                    </Text>

                    <Text style={{ marginTop: 6, fontSize: 20, fontWeight: "700", color: "#B12704" }}>
                        ₹ {product.price}
                    </Text>

                    <RatingStars value={product.avg_rating || 0} />

                    <Paragraph style={{ marginTop: 12 }}>
                        {product.description}
                    </Paragraph>
                </View>


                <View style={{ padding: 12, backgroundColor: "#fff", marginTop: 12 }}>


                    <Button
                        mode="contained"
                        onPress={handleAdd}
                        style={{ backgroundColor: "#FFD814", marginBottom: 10 }}
                        labelStyle={{ color: "#000", fontWeight: "700" }}
                    >
                        Add to Cart
                    </Button>


                    <Button
                        mode="contained"
                        onPress={handleBuyNow}
                        style={{ backgroundColor: "#FFA41C" }}
                        labelStyle={{ color: "#000", fontWeight: "700" }}
                    >
                        Buy Now
                    </Button>

                </View>

                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
}
