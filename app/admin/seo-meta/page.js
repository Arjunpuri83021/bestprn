"use client";
import { useEffect, useState } from "react";
import Protected from "../Protected";
import AdminNavbar from "../components/AdminNavbar";
import "../AdminStyles.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SEO_SITE = "bestprn";

export default function SeoMetaPage() {
  const [seoMetas, setSeoMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    pagePath: "",
    pageTitle: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    isActive: true,
  });

  const itemsPerPage = 20;

  useEffect(() => {
    fetchSeoMetas();
  }, [currentPage, searchTerm]);

  const fetchSeoMetas = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${apiUrl}/seo-meta?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}&site=${encodeURIComponent(SEO_SITE)}`
      );
      const data = await res.json();
      if (data.success) {
        setSeoMetas(data.seoMetas || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.totalRecords || 0);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to load SEO meta entries" });
        setSeoMetas([]);
      }
    } catch (error) {
      console.error("Error fetching SEO meta:", error);
      setMessage({ type: "error", text: "Failed to load SEO meta entries. Check console for details." });
      setSeoMetas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const adminData = localStorage.getItem("adminData");
      const admin = adminData ? JSON.parse(adminData) : null;

      let cleanPath = formData.pagePath.trim();

      if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
        try {
          const url = new URL(cleanPath);
          cleanPath = url.pathname;
        } catch (err) {
          setMessage({ type: "error", text: "Invalid URL format. Please enter just the path (e.g., /tag/name)" });
          return;
        }
      }

      if (!cleanPath.startsWith("/")) {
        cleanPath = "/" + cleanPath;
      }

      const payload = {
        ...formData,
        site: SEO_SITE,
        pagePath: cleanPath,
        adminId: admin?._id,
      };

      const url = editingMeta
        ? `${apiUrl}/seo-meta/${editingMeta._id}?site=${encodeURIComponent(SEO_SITE)}`
        : `${apiUrl}/seo-meta?site=${encodeURIComponent(SEO_SITE)}`;
      const method = editingMeta ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: editingMeta ? "SEO meta updated successfully!" : "SEO meta created successfully!",
        });
        closeModal();
        fetchSeoMetas();
      } else {
        setMessage({ type: "error", text: data.message || "Operation failed" });
      }
    } catch (error) {
      console.error("Error saving SEO meta:", error);
      setMessage({ type: "error", text: "Failed to save SEO meta" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this SEO meta entry?")) return;

    try {
      const res = await fetch(`${apiUrl}/seo-meta/${id}?site=${encodeURIComponent(SEO_SITE)}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "SEO meta deleted successfully!" });
        fetchSeoMetas();
      } else {
        setMessage({ type: "error", text: data.message || "Delete failed" });
      }
    } catch (error) {
      console.error("Error deleting SEO meta:", error);
      setMessage({ type: "error", text: "Failed to delete SEO meta" });
    }
  };

  const handleCreateDefaults = async () => {
    if (!confirm("Create default SEO meta entries for common pages?")) return;

    try {
      const adminData = localStorage.getItem("adminData");
      const admin = adminData ? JSON.parse(adminData) : null;

      const res = await fetch(`${apiUrl}/seo-meta/bulk-default`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: admin?._id, site: SEO_SITE }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `${data.message}. Created: ${data.created.length}, Skipped: ${data.skipped.length}`,
        });
        fetchSeoMetas();
      } else {
        setMessage({ type: "error", text: data.message || "Operation failed" });
      }
    } catch (error) {
      console.error("Error creating defaults:", error);
      setMessage({ type: "error", text: "Failed to create default entries" });
    }
  };

  const openAddModal = () => {
    setEditingMeta(null);
    setFormData({
      pagePath: "",
      pageTitle: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (meta) => {
    setEditingMeta(meta);
    setFormData({
      pagePath: meta.pagePath,
      pageTitle: meta.pageTitle,
      metaTitle: meta.metaTitle,
      metaDescription: meta.metaDescription,
      metaKeywords: meta.metaKeywords || "",
      ogTitle: meta.ogTitle || "",
      ogDescription: meta.ogDescription || "",
      ogImage: meta.ogImage || "",
      isActive: meta.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMeta(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const out = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) out.push(1, "...");
    else out.push(1);

    out.push(...range);

    if (currentPage + delta < totalPages - 1) out.push("...", totalPages);
    else if (totalPages > 1) out.push(totalPages);

    return out;
  };

  return (
    <Protected>
      <div className="admin-dashboard">
        <AdminNavbar />
        <div className="admin-content">
          <div className="container">
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h2>
                  <i className="bi bi-search me-2"></i>SEO Meta Management
                </h2>
                <div className="d-flex gap-2">
                  <button className="btn btn-success" onClick={handleCreateDefaults}>
                    <i className="bi bi-plus-circle me-2"></i>Create Defaults
                  </button>
                  <button className="admin-add-btn" onClick={openAddModal}>
                    <i className="bi bi-plus-circle me-2"></i>Add New Page
                  </button>
                </div>
              </div>

              {message.text && (
                <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show`}>
                  {message.text}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMessage({ type: "", text: "" })}
                  ></button>
                </div>
              )}

              <div className="admin-search-bar">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-control"
                  placeholder="Search by page path or title..."
                />
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading SEO meta entries...</p>
                </div>
              ) : seoMetas.length === 0 ? (
                <div className="text-center py-5">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No SEO meta entries found. Click "Create Defaults" or "Add New Page" to get started.
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Page Path</th>
                          <th>Page Title</th>
                          <th>Meta Title</th>
                          <th>Meta Description</th>
                          <th>Status</th>
                          <th>Updated</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seoMetas.map((meta, index) => (
                          <tr key={meta._id}>
                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                            <td>
                              <code className="text-primary">{meta.pagePath}</code>
                            </td>
                            <td>
                              <strong>{meta.pageTitle}</strong>
                            </td>
                            <td>
                              <div className="text-truncate" style={{ maxWidth: "200px" }}>
                                {meta.metaTitle}
                              </div>
                            </td>
                            <td>
                              <div className="text-truncate" style={{ maxWidth: "250px" }}>
                                {meta.metaDescription}
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${meta.isActive ? "bg-success" : "bg-danger"}`}>
                                {meta.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>{new Date(meta.updatedAt).toLocaleDateString()}</td>
                            <td>
                              <div className="admin-action-btns">
                                <button
                                  onClick={() => openEditModal(meta)}
                                  className="admin-edit-btn"
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                                <button
                                  onClick={() => handleDelete(meta._id)}
                                  className="admin-delete-btn"
                                  title="Delete"
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

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <div className="text-muted">
                        Showing page {currentPage} of {totalPages} ({totalRecords} total entries)
                      </div>
                      <nav>
                        <ul className="pagination">
                          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>
                          {getVisiblePages().map((p, i) => (
                            <li
                              key={i}
                              className={`page-item ${p === currentPage ? "active" : ""} ${p === "..." ? "disabled" : ""}`}
                            >
                              {p === "..." ? (
                                <span className="page-link">...</span>
                              ) : (
                                <button className="page-link" onClick={() => handlePageChange(p)}>
                                  {p}
                                </button>
                              )}
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {showModal && (
          <div className="admin-modal">
            <div className="admin-modal-content" style={{ maxWidth: "700px" }}>
              <div className="admin-modal-header">
                <h3>{editingMeta ? "Edit SEO Meta" : "Add New SEO Meta"}</h3>
                <button className="admin-modal-close" onClick={closeModal}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <label htmlFor="pagePath">Page Path <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      id="pagePath"
                      className="form-control"
                      value={formData.pagePath}
                      onChange={(e) => setFormData({ ...formData, pagePath: e.target.value })}
                      placeholder="e.g., /tag/milf, /category/indian, /pornstar/mia-khalifa"
                      required
                      disabled={!!editingMeta}
                    />
                    <small className="text-muted">
                      Enter path only (e.g., /tag/name) or full URL - it will be auto-converted. Cannot be changed after creation.
                    </small>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="pageTitle">Page Title <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      id="pageTitle"
                      className="form-control"
                      value={formData.pageTitle}
                      onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                      placeholder="e.g., Home, About Us"
                      required
                      maxLength={200}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="metaTitle">Meta Title <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      id="metaTitle"
                      className="form-control"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="SEO title (50-60 characters recommended)"
                      required
                      maxLength={70}
                    />
                    <small className="text-muted">{formData.metaTitle.length}/70 characters</small>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="metaDescription">Meta Description <span className="text-danger">*</span></label>
                    <textarea
                      id="metaDescription"
                      className="form-control"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="SEO description (150-160 characters recommended)"
                      required
                      maxLength={200}
                      rows="3"
                    />
                    <small className="text-muted">{formData.metaDescription.length}/200 characters</small>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="metaKeywords">Meta Keywords</label>
                    <input
                      type="text"
                      id="metaKeywords"
                      className="form-control"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      placeholder="keyword1, keyword2, keyword3"
                      maxLength={500}
                    />
                    <small className="text-muted">Comma-separated keywords (optional)</small>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="ogTitle">Open Graph Title</label>
                    <input
                      type="text"
                      id="ogTitle"
                      className="form-control"
                      value={formData.ogTitle}
                      onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                      placeholder="Title for social media sharing (optional)"
                      maxLength={100}
                    />
                    <small className="text-muted">Leave empty to use Meta Title</small>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="ogDescription">Open Graph Description</label>
                    <textarea
                      id="ogDescription"
                      className="form-control"
                      value={formData.ogDescription}
                      onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                      placeholder="Description for social media sharing (optional)"
                      maxLength={200}
                      rows="2"
                    />
                    <small className="text-muted">Leave empty to use Meta Description</small>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="ogImage">Open Graph Image URL</label>
                    <input
                      type="url"
                      id="ogImage"
                      className="form-control"
                      value={formData.ogImage}
                      onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <small className="text-muted">Image for social media sharing (1200x630 recommended)</small>
                  </div>

                  <div className="admin-form-group">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active (Enable this SEO meta)
                      </label>
                    </div>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingMeta ? "Update" : "Create"}
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
