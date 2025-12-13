import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API } from "../config";
import Modal from "bootstrap/js/dist/modal";


export default function ProductsAdmin() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);


  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState("");


  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");


  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingField, setEditingField] = useState("");


  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;


  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    load();
    loadCategories();

    const closeMenu = () => setOpenMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  async function load() {
    try {
      const token = window.localStorage.getItem("admin_token");
      const res = await axios.get(`${API}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load products");
    }
  }

  async function loadCategories() {
    try {
      const token = window.localStorage.getItem("admin_token");
      const res = await axios.get(`${API}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function createProduct() {
    try {
      const token = window.localStorage.getItem("admin_token");
      await axios.post(
        `${API}/admin/products`,
        {
          title,
          price: parseFloat(price) || 0,
          description,
          category: categories.find((c) => c._id === category)?.name || "",
          images: images ? images.split(",").map((s) => s.trim()) : [],
          stock: parseInt(stock) || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle("");
      setPrice("");
      setDescription("");
      setCategory("");
      setStock("");
      setImages("");
      load();

      setPage(1);
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      const token = window.localStorage.getItem("admin_token");
      await axios.delete(`${API}/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  }

  function openEdit(id, field, current) {
    setEditingId(id);
    setEditingField(field);
    setEditingValue(Array.isArray(current) ? current.join(",") : (current ?? ""));
    const modalElement = document.getElementById("editModal");
    const modalInstance = Modal.getOrCreateInstance(modalElement);
    modalInstance.show();

  }

  async function saveEdit() {
    try {
      const token = window.localStorage.getItem("admin_token");

      await axios.patch(
        `${API}/admin/products/${editingId}/${editingField}?${editingField}=${encodeURIComponent(editingValue)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      load();
      document.getElementById("closeEditModal").click();
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    }
  }


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = items.slice();
    if (q) {
      result = result.filter((p) => (
        (p.title || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      ));
    }
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (minPrice) {
      const m = parseFloat(minPrice) || 0;
      result = result.filter((p) => (parseFloat(p.price) || 0) >= m);
    }
    if (maxPrice) {
      const M = parseFloat(maxPrice) || Number.POSITIVE_INFINITY;
      result = result.filter((p) => (parseFloat(p.price) || 0) <= M);
    }
    return result;
  }, [items, search, categoryFilter, minPrice, maxPrice]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount]);

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row">

        <aside className="bg-white border-end vh-100 p-3" style={{ minWidth: 250 }}>
          <div className="d-flex align-items-center mb-4">
            <div className="me-3" style={{ width: 48, height: 48, background: '#ff9900', borderRadius: 6 }}></div>
            <div>
              <h5 className="m-0">Amazon Admin</h5>
              <small className="text-muted">Products</small>
            </div>
          </div>

          <nav className="nav flex-column">
            <a className="nav-link active" href="/products">Products</a>
            <a className="nav-link" href="/orders">Orders</a>
            <a className="nav-link" href="/categories">Categories</a>
            <a className="nav-link" href="/payments">Payments</a>
            <hr />
            <button className="btn btn-outline-danger mt-2" onClick={() => { window.localStorage.removeItem('admin_token'); window.location.href = '/'; }}>Logout</button>
          </nav>

          <div className="mt-auto pt-3 small text-muted">© {new Date().getFullYear()}</div>
        </aside>


        <main className="flex-fill p-4">
          <div className="d-flex flex-column flex-lg-row gap-3 align-items-start">
            <div className="w-100">

              <div className="d-flex align-items-center mb-3 gap-2">
                <h4 className="m-0">Products</h4>

                <div className="ms-auto d-flex gap-2">
                  <div className="input-group">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search products, descriptions or categories"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    <button className="btn btn-outline-secondary" onClick={() => { setSearch(''); setPage(1); }}>Clear</button>
                  </div>
                </div>
              </div>


              <div className="card mb-3 p-3">
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-md-4">
                    <select className="form-select" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                      <option value="">All categories</option>
                      {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="col-12 col-md-3">
                    <div className="input-group">
                      <span className="input-group-text">₹ Min</span>
                      <input className="form-control" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} placeholder="0" />
                    </div>
                  </div>

                  <div className="col-12 col-md-3">
                    <div className="input-group">
                      <span className="input-group-text">₹ Max</span>
                      <input className="form-control" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} placeholder="10000" />
                    </div>
                  </div>

                  <div className="col-12 col-md-2 d-flex justify-content-end">
                    <button className="btn btn-outline-secondary" onClick={() => { setCategoryFilter(''); setMinPrice(''); setMaxPrice(''); setPage(1); }}>Reset</button>
                  </div>
                </div>
              </div>


              <div className="card shadow-sm mb-4">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <strong>Create Product</strong>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#createForm"
                    aria-expanded="true"
                  >
                    Toggle
                  </button>
                </div>

                <div id="createForm" className="collapse show">
                  <div className="card-body">

                    <div className="row g-2">
                      <div className="col-12 col-md-6">
                        <input
                          className="form-control"
                          placeholder="Title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className="col-12 col-md-3">
                        <input
                          className="form-control"
                          placeholder="Price"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>

                      <div className="col-12 col-md-3">
                        <select
                          className="form-select"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option value="">Choose category</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="my-3">
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Short description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="row g-2 align-items-center">
                      <div className="col-12 col-md-3">
                        <input
                          className="form-control"
                          placeholder="Stock"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-9">
                        <input
                          className="form-control"
                          placeholder="Image URLs (comma separated)"
                          value={images}
                          onChange={(e) => setImages(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-3 d-flex gap-2">
                      <button className="btn btn-success" onClick={createProduct}>
                        Create
                      </button>

                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setTitle("");
                          setPrice("");
                          setDescription("");
                          setCategory("");
                          setStock("");
                          setImages("");
                        }}
                      >
                        Clear
                      </button>
                    </div>

                  </div>
                </div>
              </div>


              <div className="card">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 80 }}>Image</th>
                        <th>Title</th>
                        <th style={{ width: 120 }}>Price</th>
                        <th>Description</th>
                        <th style={{ width: 140 }}>Category</th>
                        <th style={{ width: 100 }}>Stock</th>
                        <th style={{ width: 80 }}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paged.map((p) => (
                        <tr key={p._id} onClick={() => window.location.href = `/products/${p._id}`} style={{ cursor: 'pointer' }}>
                          <td>
                            {p.images?.length ? (
                              <img src={p.images[0]} alt="product" width={64} height={64} style={{ objectFit: 'cover', borderRadius: 6 }} />
                            ) : (
                              <div style={{ width: 64, height: 64, background: '#f3f3f3', borderRadius: 6 }} />
                            )}
                          </td>

                          <td>{p.title}</td>
                          <td>₹{p.price}</td>
                          <td className="text-truncate" style={{ maxWidth: 240 }}>{p.description}</td>
                          <td>{p.category}</td>
                          <td>{p.stock}</td>

                          <td style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setOpenMenu(openMenu === p._id ? null : p._id)}>⋮</button>

                            {openMenu === p._id && (
                              <ul className="dropdown-menu show" style={{ position: 'absolute', right: 0 }}>
                                <li><button className="dropdown-item" onClick={() => openEdit(p._id, 'title', p.title)}>Edit Title</button></li>
                                <li><button className="dropdown-item" onClick={() => openEdit(p._id, 'price', p.price)}>Edit Price</button></li>
                                <li><button className="dropdown-item" onClick={() => openEdit(p._id, 'description', p.description)}>Edit Description</button></li>
                                <li><button className="dropdown-item" onClick={() => openEdit(p._id, 'category', p.category)}>Edit Category</button></li>
                                <li><button className="dropdown-item" onClick={() => openEdit(p._id, 'stock', p.stock)}>Edit Stock</button></li>
                                <li><button className="dropdown-item" onClick={() => openEdit(p._id, 'images', (p.images || []).join(','))}>Edit Images</button></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item text-danger" onClick={() => remove(p._id)}>Delete</button></li>
                              </ul>
                            )}
                          </td>
                        </tr>
                      ))}

                      {paged.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-4">No products found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>


                <div className="card-footer d-flex justify-content-between align-items-center">
                  <div>
                    Showing <strong>{(page - 1) * PAGE_SIZE + 1}</strong> to <strong>{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong>
                  </div>

                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${page === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(1)}>First</button></li>
                      <li className={`page-item ${page === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(page - 1)}>Prev</button></li>

                      <li className="page-item disabled"><span className="page-link">Page {page} / {pageCount}</span></li>

                      <li className={`page-item ${page === pageCount ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(page + 1)}>Next</button></li>
                      <li className={`page-item ${page === pageCount ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(pageCount)}>Last</button></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>


            <aside className="col-12 col-lg-3">
              <div className="card shadow-sm mb-3 p-3">
                <h6 className="mb-2">Quick Actions</h6>
                <button className="btn btn-outline-primary w-100 mb-2" onClick={() => { window.location.href = '/orders'; }}>View Orders</button>
                <button className="btn btn-outline-secondary w-100 mb-2" onClick={() => { window.location.href = '/categories'; }}>Manage Categories</button>
                <button className="btn btn-outline-success w-100" onClick={() => { load(); }}>Refresh Products</button>
              </div>

              <div className="card p-3">
                <h6 className="mb-2">Stats</h6>
                <div>Total products: <strong>{items.length}</strong></div>
                <div>Filtered: <strong>{filtered.length}</strong></div>
                <div>Page size: <strong>{PAGE_SIZE}</strong></div>
              </div>
            </aside>
          </div>


          <div className="modal fade" id="editModal" tabIndex={-1} aria-hidden>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit {editingField}</h5>
                  <button id="closeEditModal" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div className="modal-body">
                  {editingField === 'category' ? (
                    <select className="form-select" value={editingValue} onChange={(e) => setEditingValue(e.target.value)}>
                      <option value="">Select category</option>
                      {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  ) : (
                    <textarea className="form-control" rows={4} value={editingValue} onChange={(e) => setEditingValue(e.target.value)} />
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="button" className="btn btn-primary" onClick={saveEdit}>Save</button>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
