import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../config";

export default function Payments() {
    const [orders, setOrders] = useState([]);

    useEffect(() => load(), []);

    async function load() {
        try {
            const token = localStorage.getItem("admin_token");
            const res = await axios.get(`${API}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data);
        } catch (err) {
            alert("Failed to load payments");
        }
    }

    async function refund(method, id) {
        try {
            const token = localStorage.getItem("admin_token");

            if (method === "stripe") {
                await axios.post(
                    `${API}/payments/refund/stripe`,
                    { payment_intent_id: id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            if (method === "razorpay") {
                await axios.post(
                    `${API}/payments/refund/razorpay`,
                    { payment_id: id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            alert("Refund processed");
            load();
        } catch (err) {
            alert("Refund failed");
        }
    }

    return (
        <div className="d-flex">


            <aside
                className="bg-white border-end p-3"
                style={{ width: 250, minHeight: "100vh" }}
            >
                <div className="d-flex align-items-center mb-4">
                    <div className="me-3" style={{ width: 48, height: 48, background: '#ff9900', borderRadius: 6 }}></div>
                    <div>
                        <h5 className="m-0">Amazon Admin</h5>
                        <small className="text-muted">Payments</small>
                    </div>
                </div>

                <nav className="nav flex-column mt-4">
                    <a className="nav-link" href="/products">Products</a>
                    <a className="nav-link" href="/orders">Orders</a>
                    <a className="nav-link" href="/categories">Categories</a>
                    <a className="nav-link active fw-bold" href="/payments">Payments</a>

                    <hr />

                    <button
                        className="btn btn-outline-danger"
                        onClick={() => {
                            localStorage.removeItem("admin_token");
                            window.location.href = "/";
                        }}
                    >
                        Logout
                    </button>
                </nav>

                <div className="mt-auto small text-muted">
                    © {new Date().getFullYear()}
                </div>
            </aside>


            <main className="flex-grow-1 p-4">

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold">Payments</h3>
                    <button className="btn btn-outline-secondary" onClick={load}>
                        Refresh
                    </button>
                </div>


                <div className="card shadow-sm">
                    <div className="card-header fw-semibold">
                        Payment History
                    </div>

                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Order ID</th>
                                <th>Method</th>
                                <th>Payment ID</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map(o => (
                                <tr key={o._id}>
                                    <td className="fw-semibold">{o._id}</td>

                                    <td>
                                        {o.payment_method === "stripe" && (
                                            <span className="badge bg-primary">Stripe</span>
                                        )}
                                        {o.payment_method === "razorpay" && (
                                            <span className="badge bg-success">Razorpay</span>
                                        )}
                                        {!o.payment_method && (
                                            <span className="badge bg-secondary">N/A</span>
                                        )}
                                    </td>

                                    <td>{o.payment_id || "-"}</td>

                                    <td>
                                        {(o.payment_method === "stripe" ||
                                            o.payment_method === "razorpay") && (
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() =>
                                                        refund(o.payment_method, o.payment_id)
                                                    }
                                                >
                                                    Refund
                                                </button>
                                            )}
                                    </td>
                                </tr>
                            ))}

                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-3 text-muted">
                                        No payments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
