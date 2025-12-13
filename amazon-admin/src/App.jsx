import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Products from "./pages/products";
import Categories from "./pages/categories";
import Orders from "./pages/orders";
import Payments from "./pages/payment";

function PrivateRoute({ children }) {
    const token = window.localStorage.getItem("admin_token")
    return token ? children : <Navigate to="/products" />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
                <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    )
}