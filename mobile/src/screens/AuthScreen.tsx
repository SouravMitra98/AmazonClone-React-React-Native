import React, { useContext, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Text, Button, Title } from "react-native-paper";
import { login as apiLogin, signup as apiSignup } from "../services/auth";
import { AuthContext } from "../context/AuthContext";

export default function AuthScreen({ navigation }: any) {
    const { signin } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handelAuth() {
        setLoading(true);
        setError("");

        try {
            if (isLogin) {
                const res = await apiLogin(email, password);
                await signin(res.user);;
            }
            else {
                await apiSignup(name, email, password);
                setIsLogin(true);
                setName("");
                setPassword("");
                setError("Signup Successfull! Please login");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Auth Failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: "padding" })}>
            <View style={styles.card}>
                <Title style={{ textAlign: "center", marginBottom: 8 }}>{isLogin ? "Log In" : "Create Account"}</Title>
                {error ? <Text style={{ color: error.includes("successful") ? "green" : "red", textAlign: "center" }}>{error}</Text> : null}
                {!isLogin && <TextInput label="Name" value={name} onChangeText={setName} style={styles.input} mode="outlined" />}
                <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} mode="outlined" />
                <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} mode="outlined" />
                <Button mode="contained" loading={loading} onPress={handelAuth} style={{ marginTop: 8 }}>
                    {isLogin ? "Login" : "Signup"}
                </Button>
                <Button mode="text" onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 8 }}>
                    {isLogin ? "Create an account" : "Already have and account? Login"}
                </Button>
            </View>
        </KeyboardAvoidingView>
    )

}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 16, backgroundColor: "#fff" },
    card: { backgroundColor: "#fff", padding: 16, borderRadius: 8, elevation: 4 },
    input: { marginBottom: 8 }
});