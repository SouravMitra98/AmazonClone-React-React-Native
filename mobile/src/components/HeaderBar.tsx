import React, { useContext, useState } from "react";
import { View, TouchableOpacity, TextInput, FlatList, TouchableWithoutFeedback } from "react-native";
import { Text, Badge } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CartContext } from "../context/CartContext";

export default function HeaderBar({
    title = "",
    showSearch = true,
    onBack,
    navigation,
    onSearchChange,
    suggestions = [],
    onSelectSuggestion,
}: {
    title?: string;
    showSearch?: boolean;
    onBack?: () => void;
    navigation?: any;


    onSearchChange?: (text: string) => void;
    suggestions?: any[];
    onSelectSuggestion?: (item: any) => void;
}) {
    const { count } = useContext(CartContext);
    const [query, setQuery] = useState("");

    function handleTyping(text: string) {
        setQuery(text);
        onSearchChange?.(text);
    }

    return (
        <View style={{ backgroundColor: "#8FE0E5", paddingTop: 45, paddingBottom: 10, paddingHorizontal: 12 }}>
            {showSearch ? (
                <View>
                    {/* SEARCH BAR */}
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {onBack && (
                            <TouchableOpacity onPress={onBack} style={{ marginRight: 10 }}>
                                <Icon name="arrow-left" size={26} color="#000" />
                            </TouchableOpacity>
                        )}

                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#fff",
                                borderRadius: 30,
                                flexDirection: "row",
                                alignItems: "center",
                                paddingHorizontal: 12,
                                height: 40,
                            }}
                        >
                            <Icon name="magnify" size={22} color="#444" />

                            <TextInput
                                placeholder="Search products…"
                                value={query}
                                onChangeText={handleTyping}
                                style={{ flex: 1, marginLeft: 8 }}
                            />

                            <Icon name="camera-outline" size={22} color="#444" />
                            <Icon name="microphone-outline" size={22} color="#444" style={{ marginLeft: 8 }} />
                        </View>


                        <TouchableOpacity onPress={() => navigation?.navigate("Cart")} style={{ marginLeft: 12 }}>
                            <Icon name="cart-outline" size={30} color="#000" />
                            {count > 0 && (
                                <Badge
                                    style={{
                                        position: "absolute",
                                        top: -5,
                                        right: -8,
                                        backgroundColor: "#FFA41C",
                                    }}
                                >
                                    {count}
                                </Badge>
                            )}
                        </TouchableOpacity>
                    </View>


                    {suggestions.length > 0 && (
                        <View
                            style={{
                                backgroundColor: "#fff",
                                position: "absolute",
                                top: 95,
                                left: 12,
                                right: 12,
                                zIndex: 999,
                                borderRadius: 10,
                                elevation: 5,
                                paddingVertical: 6,
                                maxHeight: 250,
                            }}
                        >
                            <FlatList
                                data={suggestions}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => onSelectSuggestion?.(item)}
                                        style={{ padding: 10 }}
                                    >
                                        <Text>{item.title}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                </View>
            ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {onBack && (
                        <TouchableOpacity onPress={onBack} style={{ marginRight: 10 }}>
                            <Icon name="arrow-left" size={26} color="#000" />
                        </TouchableOpacity>
                    )}
                    <Text style={{ fontSize: 20, fontWeight: "700" }}>{title}</Text>
                </View>
            )}
        </View>
    );
}
