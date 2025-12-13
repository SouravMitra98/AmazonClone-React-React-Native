import axios from "axios";
import { API_URL } from "./env";
import * as Keychain from "react-native-keychain";

const authApi = axios.create({ baseURL: API_URL });

export async function signup(name: string, email: string, password: string) {
    const res = await authApi.post("/auth/register", { name, email, password });
    return res.data;
}

export async function login(email: string, password: string) {
    const res = await authApi.post("/auth/login/", { email, password });

    if (res.data?.token) {
        await Keychain.setGenericPassword(
            "auth",
            JSON.stringify({
                token: res.data.token,
                user_id: res.data.user?.id || "",
            })
        );
    }

    return res.data;
}

export async function logout() {
    await Keychain.resetGenericPassword();
}

export async function getCredentials() {
    const creds = await Keychain.getGenericPassword();
    if (creds) {
        try {
            return JSON.parse(creds.password);
        } catch (error) {
            return null;
        }
    }
    return null;
}
