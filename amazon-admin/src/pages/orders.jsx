import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../config";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const token = window.localStorage.getItem("admin_token");

    const STATUS_FLOW = [
        "pending",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
    ];

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            const res = await axios.get(`${API}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load orders");
        }
    }

    function nextStatuses(current) {
        if (current === "cancelled" || current === "delivered") return [];
        const idx = STATUS_FLOW.indexOf(current);
        return STATUS_FLOW.slice(idx + 1, idx + 2);
    }

    async function updateOrder(id, status) {
        try {
            await axios.patch(
                `${API}/admin/orders/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            loadOrders();
        } catch (err) {
            console.error(err);
            alert("Failed to update order");
        }
    }

    return (
        <div className="container-fluid p-0">

            <div className="d-flex">

                <aside className="bg-white border-end p-3" style={{ width: 250, minHeight: "100vh" }}>
                    <div className="d-flex align-items-center mb-4">
                        <div className="me-3" style={{ width: 48, height: 48, background: '#ff9900', borderRadius: 6 }}></div>
                        <div>
                            <h5 className="m-0">Amazon Admin</h5>
                            <small className="text-muted">Orders</small>
                        </div>
                    </div>

                    <nav className="nav flex-column mt-4">
                        <a className="nav-link" href="/products">Products</a>
                        <a className="nav-link active" href="/orders">Orders</a>
                        <a className="nav-link" href="/categories">Categories</a>
                        <a className="nav-link" href="/payments">Payments</a>
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

                    <div className="mt-auto small text-muted">© {new Date().getFullYear()}</div>
                </aside>


                <main className="flex-grow-1 p-4">

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="fw-bold">Orders</h3>
                        <button className="btn btn-outline-secondary" onClick={loadOrders}>Refresh</button>
                    </div>

                    <div className="card shadow-sm">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Order ID</th>
                                        <th>User</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Next Step</th>
                                        <th>Cancel</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.map((o) => {
                                        const next = nextStatuses(o.status);

                                        return (
                                            <tr key={o._id}>
                                                <td className="fw-semibold">{o._id}</td>

                                                <td>
                                                    <div>{o.user?.email || "Unknown"}</div>
                                                    <small className="text-muted">User ID: {o.user?._id}</small>
                                                </td>

                                                <td className="fw-bold text-dark">
                                                    ₹{o.totalprice}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`badge px-3 py-2 text-uppercase ${o.status === "delivered"
                                                            ? "bg-success"
                                                            : o.status === "cancelled"
                                                                ? "bg-danger"
                                                                : "bg-warning text-dark"
                                                            }`}
                                                    >
                                                        {o.status.replace(/_/g, " ")}
                                                    </span>
                                                </td>

                                                <td>
                                                    {next.length === 0 ? (
                                                        <span className="text-muted">No further action</span>
                                                    ) : (
                                                        next.map((s) => (
                                                            <button
                                                                key={s}
                                                                className="btn btn-sm btn-primary me-2"
                                                                onClick={() => updateOrder(o._id, s)}
                                                            >
                                                                Mark {s.replace(/_/g, " ")}
                                                            </button>
                                                        ))
                                                    )}
                                                </td>

                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        disabled={o.status !== "pending"}
                                                        onClick={() => updateOrder(o._id, "cancelled")}
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                            </table>
                        </div>


                        <div className="card-footer text-muted small">
                            Total Orders: {orders.length}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
