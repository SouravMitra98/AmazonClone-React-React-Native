import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
export default function EditProfileScreen({ navigation }: any) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    
    const [addressLine, setAddressLine] = useState("");
    const [district, setDistrict] = useState("");
    const [stateValue, setStateValue] = useState("");
    const [pincode, setPincode] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const res = await api.get("/user/me");

            setName(res.data.name);
            setEmail(res.data.email);

            
            const parts = res.data.address?.split(",") || [];
            setAddressLine(parts[0]?.trim() || "");
            setDistrict(parts[1]?.trim() || "");
            setStateValue(parts[2]?.trim() || "");
            setPincode(parts[3]?.trim() || "");
        } catch (err) {
            console.log(err);
        }
    }

    const { setUser } = useContext(AuthContext);

    async function updateProfile() {
        try {
            setLoading(true);

            
            const fullAddress = `${addressLine}, ${district}, ${stateValue}, ${pincode}`;

            const res = await api.put("/user/update", {
                name,
                address: fullAddress,
            });

            setUser(res.data);

            Alert.alert("Profile updated successfully");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error updating profile");
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={{ padding: 16, backgroundColor: "#F5F5F5", flex: 1 }}>
            <Card style={{ padding: 16, marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
                    Personal Details
                </Text>

                <TextInput
                    label="Name"
                    mode="outlined"
                    value={name}
                    onChangeText={setName}
                    style={{ marginBottom: 12 }}
                />

                <TextInput
                    label="Email"
                    mode="outlined"
                    value={email}
                    disabled
                    style={{ marginBottom: 12 }}
                />

                
                <TextInput
                    label="Address Line"
                    mode="outlined"
                    value={addressLine}
                    onChangeText={setAddressLine}
                    style={{ marginBottom: 12 }}
                />

                <TextInput
                    label="District"
                    mode="outlined"
                    value={district}
                    onChangeText={setDistrict}
                    style={{ marginBottom: 12 }}
                />

                <TextInput
                    label="State"
                    mode="outlined"
                    value={stateValue}
                    onChangeText={setStateValue}
                    style={{ marginBottom: 12 }}
                />

                <TextInput
                    label="Pincode"
                    mode="outlined"
                    keyboardType="numeric"
                    value={pincode}
                    onChangeText={setPincode}
                    style={{ marginBottom: 12 }}
                />

                <Button
                    mode="contained"
                    loading={loading}
                    onPress={updateProfile}
                    style={{
                        marginTop: 10,
                        padding: 6,
                        backgroundColor: "#FF9900",
                    }}
                    textColor="black"
                >
                    Save Changes
                </Button>
            </Card>

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
