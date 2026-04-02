"use client";
import { useEffect, useState } from "react";
import Protected from "../Protected";
import AdminNavbar from "../components/AdminNavbar";
import "../AdminStyles.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const ad = localStorage.getItem("adminData");
    if (ad) setCurrentAdmin(JSON.parse(ad));
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const ad = localStorage.getItem("adminData");
      if (!ad) {
        setMessage("Admin data not found. Please login again.");
        return;
      }
      const admin = JSON.parse(ad);
      const r = await fetch(`${apiUrl}/admin/all?adminId=${admin._id}`);
      const d = await r.json();
      if (d.success) setAdmins(d.admins);
      else setMessage(d.message || "Failed to fetch admins");
    } catch (e) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }
    try {
      const ad = localStorage.getItem("adminData");
      const admin = JSON.parse(ad);
      const r = await fetch(`${apiUrl}/admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          createdBy: admin._id,
        }),
      });
      const d = await r.json();
      if (d.success) {
        setMessage("Admin created successfully!");
        setShowCreate(false);
        setFormData({ username: "", email: "", password: "", confirmPassword: "" });
        fetchAdmins();
      } else {
        setMessage(d.message || "Failed to create admin");
      }
    } catch (e) {
      setMessage("Network error. Please try again.");
    }
  };

  const handleDelete = async (adminId, username) => {
    if (!confirm(`Delete admin "${username}"?`)) return;
    try {
      const ad = localStorage.getItem("adminData");
      const admin = JSON.parse(ad);
      const r = await fetch(`${apiUrl}/admin/${adminId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestingAdminId: admin._id }),
      });
      const d = await r.json();
      if (d.success) {
        setMessage(`Admin "${username}" deleted successfully!`);
        fetchAdmins();
      } else {
        setMessage(d.message || "Failed to delete admin");
      }
    } catch (e) {
      setMessage("Network error. Please try again.");
    }
  };

  const handleToggle = async (adminId, isActive, username) => {
    const action = isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} admin "${username}"?`)) return;
    try {
      const ad = localStorage.getItem("adminData");
      const admin = JSON.parse(ad);
      const r = await fetch(`${apiUrl}/admin/${adminId}/toggle-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestingAdminId: admin._id }),
      });
      const d = await r.json();
      if (d.success) {
        setMessage(d.message);
        fetchAdmins();
      } else {
        setMessage(d.message || "Failed to update admin status");
      }
    } catch (e) {
      setMessage("Network error. Please try again.");
    }
  };

  const isMainAdmin = currentAdmin && currentAdmin.role === "main_admin";

  if (loading) {
    return (
      <Protected>
        <AdminNavbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" />
        </div>
      </Protected>
    );
  }

  if (!isMainAdmin) {
    return (
      <Protected>
        <AdminNavbar />
        <div className="container py-5">
          <div className="alert alert-danger">
            Access Denied. Only main admin can access admin management.
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              localStorage.removeItem("adminData");
              location.href = "/admin";
            }}
          >
            Re-login
          </button>
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <div className="admin-dashboard">
        <AdminNavbar />
        <div className="admin-content">
          <div className="container">
            {message && (
              <div className={`alert ${message.includes("success") ? "alert-success" : "alert-danger"}`}>
                {message}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-3">
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                Create New Admin
              </button>
              <span className="badge bg-secondary">Total: {admins.length} admins</span>
            </div>

            <div className="table-responsive admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Created At</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a._id}>
                      <td>
                        {a.username}
                        {a.role === "main_admin" && (
                          <span className="badge bg-warning text-dark ms-2">Main</span>
                        )}
                      </td>
                      <td>{a.email}</td>
                      <td>
                        <span className={`badge ${a.role === "main_admin" ? "bg-warning text-dark" : "bg-info"}`}>
                          {a.role === "main_admin" ? "Main Admin" : "Admin"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${a.isActive ? "bg-success" : "bg-danger"}`}>
                          {a.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {a.createdBy ? `${a.createdBy.username} (${a.createdBy.email})` : "System"}
                      </td>
                      <td>{new Date(a.createdAt).toLocaleString()}</td>
                      <td>{a.lastLogin ? new Date(a.lastLogin).toLocaleString() : "Never"}</td>
                      <td>
                        {a.role !== "main_admin" ? (
                          <div className="d-flex gap-2">
                            <button
                              className={`btn btn-sm ${a.isActive ? "btn-warning" : "btn-success"}`}
                              onClick={() => handleToggle(a._id, a.isActive, a.username)}
                            >
                              {a.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(a._id, a.username)}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="badge bg-light text-dark">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showCreate && (
              <div className="admin-modal">
                <div className="admin-modal-content">
                  <div className="admin-modal-header">
                    <h3>Create New Admin</h3>
                    <button className="admin-modal-close" onClick={() => setShowCreate(false)}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                  <form onSubmit={handleCreate}>
                    <div className="admin-modal-body">
                      <div className="admin-form-group">
                        <label>Username</label>
                        <input
                          className="form-control"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          required
                          minLength={3}
                          maxLength={20}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Email</label>
                        <input
                          className="form-control"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Password</label>
                        <input
                          className="form-control"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="admin-form-group">
                        <label>Confirm Password</label>
                        <input
                          className="form-control"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    <div className="admin-modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Create Admin
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Protected>
  );
}
