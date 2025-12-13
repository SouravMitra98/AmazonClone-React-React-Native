import React, { useContext } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider, Badge } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { AuthContext } from "../context/AuthContext";

import AuthScreen from "../screens/AuthScreen";
import HomeScreen from "../screens/HomeScreen";
import ProductScreen from "../screens/ProductScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderScreen from "../screens/OrderScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CategoryProductsScreen from "../screens/CategoryProductScreen";
import EditProfileScreen from "../screens/EditProfileScreen";


import HeaderBar from "../components/HeaderBar";
import { CartContext } from "../context/CartContext";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


function HomeStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="HomeMain"
                component={HomeScreen}
                options={({ navigation, route }) => ({
                    header: () => (
                        <HeaderBar
                            showSearch
                            navigation={navigation}
                            onSearchChange={(text) => navigation.setParams({ search: text })}
                            suggestions={(route?.params as any)?.suggestions}
                            onSelectSuggestion={(item) =>
                                navigation.navigate("Product", { id: item._id })
                            }
                        />
                    ),
                })}
            />

            <Stack.Screen
                name="CategoryProducts"
                component={CategoryProductsScreen}
                options={({ navigation, route }) => ({
                    header: () => (
                        <HeaderBar
                            title={(route?.params as any)?.category || "Category"}

                            showSearch={false}
                            navigation={navigation}
                            onBack={() => navigation.goBack()}
                        />
                    ),
                })}
            />

            <Stack.Screen
                name="Product"
                component={ProductScreen}
                options={({ navigation }) => ({
                    header: () => (
                        <HeaderBar
                            title="Product Details"
                            showSearch={false}
                            navigation={navigation}
                            onBack={() => navigation.goBack()}
                        />
                    ),
                })}
            />
        </Stack.Navigator>
    );
}


function OrdersStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="OrdersMain"
                component={OrderScreen}
                options={({ navigation }) => ({
                    header: () => (
                        <HeaderBar
                            title="Your Orders"
                            showSearch={false}
                            navigation={navigation}
                        />
                    ),
                })}
            />
            <Stack.Screen
                name="OrderDetails"
                component={OrderDetailsScreen}
                options={({ navigation }) => ({
                    header: () => (
                        <HeaderBar
                            title="Order Details"
                            showSearch={false}
                            navigation={navigation}
                            onBack={() => navigation.goBack()}
                        />
                    ),
                })}
            />
        </Stack.Navigator>
    );
}

function MainTabs() {
    const { count } = useContext(CartContext);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#000",
                tabBarInactiveTintColor: "gray",
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 6,
                    backgroundColor: "#8FE0E5",
                },

                tabBarIcon: ({ color }) => {

                    if (route.name === "Cart") {
                        return (
                            <View>
                                <Icon name="cart-outline" size={26} color={color} />
                                {count > 0 && (
                                    <Badge
                                        style={{
                                            position: "absolute",
                                            top: -6,
                                            right: -12,
                                            backgroundColor: "#FFA41C",
                                        }}
                                    >
                                        {count}
                                    </Badge>
                                )}
                            </View>
                        );
                    }


                    const icons: any = {
                        HomeTab: "home-outline",
                        OrdersTab: "clipboard-list-outline",
                        Profile: "account-circle-outline",
                    };

                    const iconName = icons[route.name] || "home-outline";
                    return <Icon name={iconName} size={26} color={color} />;
                },
            })}
        >

            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{ title: "Home" }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate("HomeTab", { screen: "HomeMain" });
                    },
                })}
            />


            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={({ navigation }) => ({
                    title: "Cart",
                    header: () => (
                        <HeaderBar
                            title="Your Cart"
                            showSearch={false}
                            navigation={navigation}
                        />
                    ),
                })}
            />


            <Tab.Screen
                name="OrdersTab"
                component={OrdersStack}
                options={{ title: "Orders" }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate("OrdersTab", { screen: "OrdersMain" });
                    },
                })}
            />


            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={({ navigation }) => ({
                    title: "Profile",
                    header: () => (
                        <HeaderBar
                            title="Your Account"
                            showSearch={false}
                            navigation={navigation}
                        />
                    ),
                })}
            />
        </Tab.Navigator>
    );
}


export default function AppNavigator() {
    const { token } = useContext(AuthContext);

    return (
        <PaperProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {!token ? (
                        <Stack.Screen name="Auth" component={AuthScreen} />
                    ) : (
                        <>
                            <Stack.Screen name="Main" component={MainTabs} />

                            <Stack.Screen
                                name="Checkout"
                                component={CheckoutScreen}
                                options={({ navigation }) => ({
                                    header: () => (
                                        <HeaderBar
                                            title="Checkout"
                                            showSearch={false}
                                            navigation={navigation}
                                            onBack={() => navigation.goBack()}
                                        />
                                    ),
                                })}
                            />
                            <Stack.Screen
                                name="EditProfile"
                                component={EditProfileScreen}
                                options={({ navigation }) => ({
                                    header: () => (
                                        <HeaderBar
                                            title="Edit Profile"
                                            showSearch={false}
                                            navigation={navigation}
                                            onBack={() => navigation.goBack()}
                                        />
                                    ),
                                })}
                            />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}
