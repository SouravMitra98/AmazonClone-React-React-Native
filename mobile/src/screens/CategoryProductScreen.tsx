import React, { useEffect, useState } from "react";
import { View, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { api } from "../services/api";
import { Product } from "../type";

export default function CategoryProductsScreen({ navigation, route }: any) {
    const { category } = route.params;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCategoryProducts();
    }, []);

    async function loadCategoryProducts() {
        try {
            setLoading(true);
            const res = await api.get(`/products/category/${category}`);

            setProducts(res.data || []);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>{category}</Text>

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={products}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 12 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate("Product", { id: item._id })}
                        >
                            <Image
                                source={{ uri: item.images?.[0] }}
                                style={styles.img}
                            />
                            <Text numberOfLines={2} style={styles.title}>
                                {item.title}
                            </Text>

                            <Text style={styles.price}>₹{item.price}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f6f7f9",
    },
    heading: {
        fontSize: 22,
        fontWeight: "700",
        marginTop: 12,
        marginLeft: 16,
    },
    card: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 12,
        marginBottom: 16,
        elevation: 3,
    },
    img: {
        width: "100%",
        height: 150,
        resizeMode: "contain",
    },
    title: {
        marginTop: 8,
        fontWeight: "600",
        fontSize: 14,
    },
    price: {
        marginTop: 4,
        fontWeight: "700",
        fontSize: 16,
        color: "#B12704",
    },
});
