import React, { useContext } from "react";
import {
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { Text, Button, Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../context/AuthContext";

export default function ProfileScreen({ navigation }: any) {
    const { user, signout } = useContext(AuthContext);

    const displayName = user?.name || user?.email?.split("@")[0] || "User";
    const displayEmail = user?.email || "No email";

    async function doLogout() {
        await signout();
        navigation.replace("Auth");
    }

    function alert(arg0: string): void {
        throw new Error("Function not implemented.");
    }

    return (
        <ScrollView style={styles.container}>


            <View style={styles.headerCard}>
                <Image
                    source={{
                        uri:

                            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                    }}
                    style={styles.avatar}
                />

                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.email}>{displayEmail}</Text>
            </View>


            <View style={{ padding: 12 }}>

                <MenuItem
                    title="Your Orders"
                    icon="package-variant"
                    onPress={() =>
                        navigation.navigate("OrdersTab", { screen: "OrdersMain" })
                    }
                />

                <MenuItem
                    title="Manage User Details"
                    icon="map-marker-outline"
                    onPress={() => navigation.navigate("EditProfile")}
                />

                <MenuItem
                    title="Your Cart"
                    icon="cart-outline"
                    onPress={() => navigation.navigate("Cart")}
                />

                <MenuItem
                    title="Help & Support"
                    icon="help-circle-outline"
                    onPress={() => alert("Help section coming soon")}
                />
            </View>


            <View style={{ paddingHorizontal: 12, paddingBottom: 25 }}>
                <Button
                    mode="contained"
                    onPress={doLogout}
                    style={styles.logoutButton}
                    labelStyle={styles.logoutLabel}
                >
                    Logout
                </Button>


            </View>
        </ScrollView>
    );
}


function MenuItem({
    title,
    icon,
    onPress,
}: {
    title: string;
    icon: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card style={styles.menuCard}>
                <View style={styles.menuRow}>
                    <Icon name={icon} size={26} color="#333" />
                    <Text style={styles.menuText}>{title}</Text>
                    <Icon
                        name="chevron-right"
                        size={28}
                        color="#aaa"
                        style={{ marginLeft: "auto" }}
                    />
                </View>
            </Card>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F3F3",
    },


    headerCard: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 30,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 12,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        marginBottom: 14,
        backgroundColor: "#EAEAEA",
    },
    name: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0F1111",
    },
    email: {
        color: "#555",
        marginTop: 4,
        fontSize: 14,
    },


    menuCard: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: "#FFF",
        marginBottom: 10,
        elevation: 1,
    },
    menuRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuText: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: "600",
        color: "#222",
    },


    logoutButton: {
        backgroundColor: "#FF4C4C",
        borderRadius: 10,
        paddingVertical: 8,
    },
    logoutLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFF",
    },
});
