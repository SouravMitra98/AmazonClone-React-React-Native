import React, { useEffect, useRef, useState } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    RefreshControl,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { api } from "../services/api";
import { getToken } from "../services/storage";
import { Product } from "../type";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation, route }: any) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [suggestions, setSuggestions] = useState<Product[]>([]);

    const [currentBanner, setCurrentBanner] = useState(0);
    const bannerIndex = useRef(0);

    const banners = [
        "https://m.media-amazon.com/images/I/71qid7QFWJL._SX3000_.jpg",
        "https://m.media-amazon.com/images/I/61DUO0NqyyL._SX3000_.jpg",
        "https://m.media-amazon.com/images/I/71Ie3JXGfVL._SX3000_.jpg",
    ];

    const categories = [
        { name: "Mobiles", icon: "📱" },
        { name: "Electronics", icon: "💻" },
        { name: "Fashion", icon: "👗" },
        { name: "Grocery", icon: "🛒" },
        { name: "Home", icon: "🏠" },
        { name: "Toys", icon: "🧸" },
        { name: "Beauty", icon: "💄" },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            bannerIndex.current = (bannerIndex.current + 1) % banners.length;
            setCurrentBanner(bannerIndex.current);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        init();
    }, []);

    async function init() {
        await getToken();
        loadProducts();
    }

    async function loadProducts() {
        try {
            setLoading(true);
            const res = await api.get("/products");
            setProducts(res.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        const query = route?.params?.search ?? "";

        if (query.length === 0) {
            setSuggestions([]);
            navigation.setParams({ suggestions: [] });
            return;
        }

        async function fetchSuggestions() {
            try {
                const res = await api.get("/products", { params: { q: query } });

                setSuggestions(res.data || []);


                navigation.setParams({
                    suggestions: res.data,
                });
            } catch (err) {
                console.log("Search error:", err);
            }
        }

        fetchSuggestions();
    }, [route?.params?.search]);


    async function onRefresh() {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    }


    return (
        <View style={styles.container}>

            <View style={styles.bannerWrapper}>
                <Image source={{ uri: banners[currentBanner] }} style={styles.banner} />
            </View>


            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={{ paddingHorizontal: 10 }}
            >
                {categories.map((cat, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={styles.categoryCard}
                        onPress={() =>
                            navigation.navigate("CategoryProducts", { category: cat.name })
                        }
                    >
                        <View style={styles.categoryIconCircle}>
                            <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                        </View>
                        <Text style={styles.categoryLabel}>{cat.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>


            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} size="large" />
            ) : (
                <FlatList
                    data={products}
                    numColumns={2}
                    keyExtractor={(item) => item._id}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Product", { id: item._id })}
                            style={styles.productCard}
                        >
                            <Image
                                source={{
                                    uri:
                                        item.images?.[0] ||
                                        "https://via.placeholder.com/300x300.png?text=No+Image",
                                }}
                                style={styles.productImg}
                            />
                            <Text numberOfLines={2} style={styles.productTitle}>
                                {item.title}
                            </Text>
                            <Text style={styles.productPrice}>₹{item.price}</Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ padding: 10 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7f9" },

    bannerWrapper: {
        width: "100%",
        height: 190,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        overflow: "hidden",
        elevation: 3,
    },
    banner: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 12,
        marginLeft: 14,
        color: "#111",
    },
    categoryScroll: { marginTop: 10, marginBottom: 5 },

    categoryCard: { alignItems: "center", marginRight: 18 },
    categoryIconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
    },
    categoryEmoji: { fontSize: 32 },
    categoryLabel: { marginTop: 6, fontSize: 13, fontWeight: "600", color: "#333" },

    productCard: {
        width: width / 2 - 22,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 12,
        elevation: 3,
        marginBottom: 18,
    },
    productImg: {
        width: "100%",
        height: 150,
        resizeMode: "contain",
        borderRadius: 10,
    },
    productTitle: {
        marginTop: 10,
        fontSize: 15,
        fontWeight: "600",
        color: "#222",
    },
    productPrice: {
        marginTop: 4,
        fontSize: 17,
        fontWeight: "700",
        color: "#B12704",
    },
});
