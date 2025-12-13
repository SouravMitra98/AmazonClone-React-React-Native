import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Product } from "../type";

export default function ProductCard({ item, onPress }: { item: Product; onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: "row", padding: 12, borderBottomWidth: 1, borderColor: "#eee", alignItems: "center" }}>
            <Image source={{ uri: item.images?.[0] || "https://via.placeholder.com/150" }} style={{ width: 100, height: 100, borderRadius: 8, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.title}</Text>
                <Text style={{ marginTop: 6, fontSize: 14 }}>₹{item.price}</Text>
                <Text style={{ color: "#666", marginTop: 6 }}>{item.category}</Text>
            </View>
        </TouchableOpacity>
    );
}