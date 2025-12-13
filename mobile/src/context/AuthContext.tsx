import React, { useEffect, useState, createContext, ReactNode } from "react";
import * as Keychain from "react-native-keychain";
import { User } from "../type";
import { api } from "../services/api";

type AuthContextType = {
    user: User | null;
    token: string | null;
    signin: (token: string) => Promise<void>;
    signout: () => Promise<void>;
    setUser: (user: User | null) => void;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    signin: async () => { },
    signout: async () => { },
    setUser: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);


    const loadUserProfile = async (token: string) => {
        try {
            const res = await api.get("/user/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
        } catch (err) {
            console.log("Failed to load user profile", err);
        }
    };


    useEffect(() => {
        (async () => {
            try {
                const credentials = await Keychain.getGenericPassword();
                if (credentials) {
                    const storedToken = credentials.password;
                    setToken(storedToken);


                    await loadUserProfile(storedToken);
                }
            } catch (err) {
                console.log("Failed to load stored credentials:", err);
            }
        })();
    }, []);

    const signin = async (newToken: string) => {
        try {
            await Keychain.setGenericPassword("user", newToken);

            setToken(newToken);
            await loadUserProfile(newToken);
        } catch (error) {
            console.error("Error storing credentials", error);
        }
    };

    const signout = async () => {
        try {
            await Keychain.resetGenericPassword();
            setUser(null);
            setToken(null);
        } catch (error) {
            console.error("Error clearing credentials", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, signin, signout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
