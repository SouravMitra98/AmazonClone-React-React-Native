import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../config";
import Modal from "bootstrap/js/dist/modal";


export default function Categories() {
    const [cats, setCats] = useState([]);
    const [name, setName] = useState("");

    const [editId, setEditId] = useState("");
    const [editName, setEditName] = useState("");

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const token = localStorage.getItem("admin_token");
        const res = await axios.get(`${API}/admin/categories`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setCats(res.data);
    }

    async function create() {
        if (!name.trim()) return alert("Category name required");

        const token = localStorage.getItem("admin_token");
        await axios.post(
            `${API}/admin/categories`,
            { name },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setName("");
        load();
    }

    async function remove(id) {
        if (!window.confirm("Delete this category?")) return;

        const token = localStorage.getItem("admin_token");
        await axios.delete(`${API}/admin/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        load();
    }

    function openEdit(cat) {
        setEditId(cat._id);
        setEditName(cat.name);

        const modalElement = document.getElementById("editModal");
        const modalInstance = Modal.getOrCreateInstance(modalElement);
        modalInstance.show();

    }

    async function saveEdit() {
        const token = localStorage.getItem("admin_token");

        await axios.patch(
            `${API}/admin/categories/${editId}`,
            { name: editName },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        document.getElementById("closeEdit").click();
        load();
    }


    return (
        <div className="container-fluid p-0">
            <div className="d-flex">

                <aside className="bg-white border-end p-3" style={{ width: 250, minHeight: "100vh" }}>
                    <div className="d-flex align-items-center mb-4">
                        <div className="me-3" style={{ width: 48, height: 48, background: '#ff9900', borderRadius: 6 }}></div>
                        <div>
                            <h5 className="m-0">Amazon Admin</h5>
                            <small className="text-muted">Category</small>
                        </div>
                    </div>

                    <nav className="nav flex-column mt-4">
                        <a className="nav-link" href="/products">Products</a>
                        <a className="nav-link" href="/orders">Orders</a>
                        <a className="nav-link active" href="/categories">Categories</a>
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

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold">Categories</h3>
                        <button className="btn btn-outline-secondary" onClick={load}>Refresh</button>
                    </div>


                    <div className="card shadow-sm mb-4">
                        <div className="card-header fw-semibold">Add New Category</div>

                        <div className="card-body">
                            <div className="d-flex gap-2" style={{ maxWidth: 500 }}>
                                <input
                                    className="form-control"
                                    placeholder="Category name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <button className="btn btn-primary px-4" onClick={create}>Add</button>
                            </div>
                        </div>
                    </div>


                    <div className="card shadow-sm">
                        <div className="card-header fw-semibold">Category List</div>

                        <ul className="list-group list-group-flush">
                            {cats.map((c) => (
                                <li
                                    key={c._id}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-warning text-dark">{c.name[0].toUpperCase()}</span>
                                        <span className="fw-semibold">{c.name}</span>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => openEdit(c)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => remove(c._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}

                            {cats.length === 0 && (
                                <li className="list-group-item text-center text-muted py-3">
                                    No categories found
                                </li>
                            )}
                        </ul>
                    </div>

                </main>
            </div>


            <div className="modal fade" id="editModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">Edit Category</h5>
                            <button
                                id="closeEdit"
                                className="btn-close"
                                data-bs-dismiss="modal"
                            ></button>
                        </div>

                        <div className="modal-body">
                            <input
                                className="form-control"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Cancel
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={saveEdit}
                            >
                                Save
                            </button>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}
