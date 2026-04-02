"use client";
import { useEffect, useState } from "react";
import Protected from "../Protected";
import AdminNavbar from "../components/AdminNavbar";
import "../AdminStyles.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminNetworksPage() {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    logo: "",
    description: "",
    category: "adult",
  });

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${apiUrl}/networks`);
      if (r.ok) {
        const d = await r.json();
        setNetworks(Array.isArray(d) ? d : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingNetwork
        ? `${apiUrl}/networks/${editingNetwork._id}`
        : `${apiUrl}/networks`;
      const method = editingNetwork ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await fetchNetworks();
        closeModal();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this network?")) return;
    try {
      const r = await fetch(`${apiUrl}/networks/${id}`, { method: "DELETE" });
      if (r.ok) await fetchNetworks();
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setEditingNetwork(null);
    setFormData({ name: "", url: "", logo: "", description: "", category: "adult" });
    setShowModal(true);
  };

  const openEditModal = (network) => {
    setEditingNetwork(network);
    setFormData({
      name: network.name || "",
      url: network.url || "",
      logo: network.logo || "",
      description: network.description || "",
      category: network.category || "adult",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNetwork(null);
    setFormData({ name: "", url: "", logo: "", description: "", category: "adult" });
  };

  return (
    <Protected>
      <div className="admin-dashboard">
        <AdminNavbar />
        <div className="admin-content">
          <div className="container">
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h2>Manage Networks</h2>
                <button className="admin-add-btn" onClick={openAddModal}>
                  <i className="bi bi-plus-circle me-2"></i>Add New Network
                </button>
              </div>

              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading networks...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Logo</th>
                        <th>Name</th>
                        <th>URL</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {networks.map((n) => (
                        <tr key={n._id}>
                          <td>
                            {n.logo && (
                              <img
                                src={n.logo}
                                alt={n.name}
                                style={{ width: "50px", height: "50px", objectFit: "contain" }}
                              />
                            )}
                          </td>
                          <td>{n.name}</td>
                          <td>
                            <a
                              href={n.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              {n.url?.substring(0, 30)}...
                            </a>
                          </td>
                          <td>
                            <span className="badge bg-info">{n.category}</span>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: "200px" }}>
                              {n.description}
                            </div>
                          </td>
                          <td>
                            <div className="admin-action-btns">
                              <button
                                onClick={() => openEditModal(n)}
                                className="admin-edit-btn"
                                title="Edit Network"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(n._id)}
                                className="admin-delete-btn"
                                title="Delete Network"
                              >
                                <i className="bi bi-trash3"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {showModal && (
          <div className="admin-modal">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h3>{editingNetwork ? "Edit Network" : "Add New Network"}</h3>
                <button className="admin-modal-close" onClick={closeModal}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <label htmlFor="name">Network Name</label>
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="url">Website URL</label>
                    <input
                      type="url"
                      id="url"
                      className="form-control"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="logo">Logo URL</label>
                    <input
                      type="url"
                      id="logo"
                      className="form-control"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="adult">Adult</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="social">Social</option>
                      <option value="streaming">Streaming</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      className="form-control"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter network description..."
                    />
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingNetwork ? "Update Network" : "Add Network"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Protected>
  );
}
