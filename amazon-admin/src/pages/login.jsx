import React, { useState } from "react";
import axios from "axios";
import { API } from "../config";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function submit(e) {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/admin/auth/login`, { email, password });
            const token = res.data.token;
            window.localStorage.setItem("admin_token", token);
            window.location.href = "/Products";
        } catch (err) {
            console.error(err);
            window.alert("Login Failed");
        }
    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ width: "100%", maxWidth: "420px", borderRadius: "12px" }}>

                <div className="text-center mb-3">
                    <h2 className="fw-bold" style={{ color: "#ff9900" }}>Amazon Admin Clone</h2>
                    <p className="text-muted">Sign in to manage your dashboard</p>
                </div>

                <form onSubmit={submit} className="mt-3">
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Email</label>
                        <input
                            type="email"
                            className="form-control form-control-lg"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ borderRadius: "10px" }}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Password</label>
                        <input
                            type="password"
                            className="form-control form-control-lg"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ borderRadius: "10px" }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-warning w-100 py-2 mt-2 fw-bold text-dark"
                        style={{ borderRadius: "10px", fontSize: "18px" }}
                    >
                        Sign In
                    </button>
                </form>

                <div className="text-center mt-3">
                    <a href="#" className="text-primary text-decoration-none">
                        Forgot Password?
                    </a>
                </div>
            </div>

            <p className="text-muted mt-3">© {new Date().getFullYear()} Amazon Admin Panel Clone</p>
        </div>
    );
}
