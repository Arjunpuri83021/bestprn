"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Protected from "../../Protected";
import AdminNavbar from "../../components/AdminNavbar";
import "../../AdminStyles.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminStarVideosPage() {
  const { star } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingVideo, setEditingVideo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [suggestedStars, setSuggestedStars] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showStarSuggestions, setShowStarSuggestions] = useState(false);

  const itemsPerPage = 20;

  useEffect(() => {
    fetchVideos();
  }, [star, currentPage, searchTerm]);

  useEffect(() => {
    fetchSuggestedTags();
    fetchSuggestedStars();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const searchQuery = searchTerm ? `${star} ${searchTerm}` : star;
      const res = await fetch(
        `${apiUrl}/getpostdata?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${itemsPerPage}&includeUnpublished=true`
      );
      const data = await res.json();
      if (data.records) {
        setVideos(data.records);
        setTotalPages(
          data.totalPages ||
            Math.ceil((data.totalRecords || data.records.length) / itemsPerPage)
        );
        setTotalVideos(data.totalRecords || data.records.length);
      }
    } catch (e) {
      console.error("Error fetching videos:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedTags = async () => {
    try {
      const r = await fetch(
        `${apiUrl}/getpostdata?page=1&limit=1000&includeUnpublished=true`
      );
      const d = await r.json();
      const all = d.records || [];
      const set = new Set();
      const map = new Map();
      all.forEach((p) => {
        if (Array.isArray(p.tags)) {
          p.tags.forEach((t) => {
            if (t && t.trim()) {
              const tr = t.trim();
              const n = tr.toLowerCase();
              if (!set.has(n)) {
                set.add(n);
                map.set(n, tr);
              }
            }
          });
        }
      });
      setSuggestedTags(
        Array.from(set)
          .map((n) => map.get(n))
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      );
    } catch (e) {
      setSuggestedTags([]);
    }
  };

  const fetchSuggestedStars = async () => {
    try {
      const r = await fetch(
        `${apiUrl}/getpostdata?page=1&limit=1000&includeUnpublished=true`
      );
      const d = await r.json();
      const all = d.records || [];
      const set = new Set();
      const map = new Map();
      all.forEach((p) => {
        if (Array.isArray(p.name)) {
          p.name.forEach((s) => {
            if (s && s.trim()) {
              const tr = s.trim();
              const n = tr.toLowerCase();
              if (!set.has(n)) {
                set.add(n);
                map.set(n, tr);
              }
            }
          });
        }
      });
      setSuggestedStars(
        Array.from(set)
          .map((n) => map.get(n))
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      );
    } catch (e) {
      setSuggestedStars([]);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const url = new URL(window.location.href);
    url.searchParams.set("page", page);
    window.history.pushState({}, "", url);
    window.scrollTo(0, 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setNameInput("");
    setTagInput("");
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this video?")) return;
    try {
      const r = await fetch(`${apiUrl}/deletepost/${id}`, { method: "DELETE" });
      if (r.ok) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
        alert("Video deleted");
      } else {
        alert("Delete failed");
      }
    } catch (e) {
      alert("Delete failed");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      imageUrl: editingVideo.imageUrl,
      altKeywords: editingVideo.altKeywords,
      name: editingVideo.name,
      tags: editingVideo.tags,
      titel: editingVideo.titel,
      minutes: editingVideo.minutes,
      Category: editingVideo.Category,
      link: editingVideo.link,
      iframeUrl: editingVideo.iframeUrl,
    };
    try {
      const r = await fetch(`${apiUrl}/updatepost/${editingVideo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        setVideos((prev) =>
          prev.map((v) => (v._id === editingVideo._id ? { ...v, ...payload } : v))
        );
        setShowEditModal(false);
        setEditingVideo(null);
      } else {
        const j = await r.json().catch(() => ({}));
        alert("Update failed: " + (j.message || ""));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTags = useMemo(
    () =>
      suggestedTags.filter(
        (t) =>
          t.toLowerCase().includes(tagInput.toLowerCase()) &&
          !(editingVideo?.tags || []).includes(t)
      ),
    [suggestedTags, tagInput, editingVideo]
  );

  const filteredStars = useMemo(
    () =>
      suggestedStars.filter(
        (s) =>
          s.toLowerCase().includes(nameInput.toLowerCase()) &&
          !(editingVideo?.name || []).includes(s)
      ),
    [suggestedStars, nameInput, editingVideo]
  );

  return (
    <Protected>
      <div className="admin-dashboard">
        <AdminNavbar />
        <div className="admin-content">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="admin-table-container">
                  <div className="admin-table-header">
                    <div>
                      <button
                        className="btn btn-outline-secondary me-3"
                        onClick={() => {
                          const fromPage = searchParams.get("fromPage") || "1";
                          router.push(`/admin/stars-list?page=${fromPage}`);
                        }}
                      >
                        ← Back to Stars
                      </button>
                      <h2>
                        Videos for Star: "{decodeURIComponent(star)}" ({totalVideos})
                      </h2>
                    </div>
                    <div className="d-flex gap-2">
                      <form onSubmit={handleSearch} className="d-flex">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search videos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ width: "200px" }}
                        />
                        <button className="btn btn-primary ms-2">Search</button>
                      </form>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading videos...</p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Image</th>
                              <th>Title</th>
                              <th>Category</th>
                              <th>Tags</th>
                              <th>Views</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {videos.map((v, i) => (
                              <tr key={v._id}>
                                <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                <td>
                                  <img
                                    src={v.imageUrl}
                                    alt={v.altKeywords || v.titel}
                                    className="admin-table-img"
                                    style={{ width: "60px", height: "40px", objectFit: "cover" }}
                                  />
                                </td>
                                <td>
                                  <div className="text-truncate" style={{ maxWidth: "200px" }}>
                                    <strong>{v.titel}</strong>
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-info">{v.Category}</span>
                                </td>
                                <td>
                                  <div className="d-flex flex-wrap gap-1">
                                    {Array.isArray(v.tags) &&
                                      v.tags.slice(0, 2).map((t, idx) => (
                                        <span key={idx} className="badge bg-secondary">
                                          {t}
                                        </span>
                                      ))}
                                    {Array.isArray(v.tags) && v.tags.length > 2 && (
                                      <span className="badge bg-light text-dark">
                                        +{v.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td>{v.views || 0}</td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => handleEdit(v)}
                                      title="Edit"
                                    >
                                      <i className="bi bi-pencil" />
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleDelete(v._id)}
                                      title="Delete"
                                    >
                                      <i className="bi bi-trash" />
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
                            Showing page {currentPage} of {totalPages} ({totalVideos} total videos)
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
                              {Array.from({ length: totalPages }).map((_, idx) => {
                                const p = idx + 1;
                                return (
                                  <li key={p} className={`page-item ${currentPage === p ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => handlePageChange(p)}>
                                      {p}
                                    </button>
                                  </li>
                                );
                              })}
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
          </div>
        </div>

        {showEditModal && editingVideo && (
          <div className="admin-modal">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h3>Edit Video</h3>
                <button className="admin-modal-close" onClick={() => setShowEditModal(false)}>
                  <i className="bi bi-x-lg" />
                </button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <label>Image URL</label>
                    <input
                      value={editingVideo.imageUrl || ""}
                      onChange={(e) => setEditingVideo({ ...editingVideo, imageUrl: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Image Alt Keywords</label>
                    <input
                      value={editingVideo.altKeywords || ""}
                      onChange={(e) => setEditingVideo({ ...editingVideo, altKeywords: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Star Names</label>
                    <div className="admin-tags-container">
                      {(editingVideo.name || []).map((n, idx) => (
                        <div className="admin-tag" key={idx}>
                          {n}
                          <button
                            type="button"
                            className="admin-tag-remove"
                            onClick={() => {
                              const arr = (editingVideo.name || []).filter((_, i) => i !== idx);
                              setEditingVideo({ ...editingVideo, name: arr });
                            }}
                          >
                            <i className="bi bi-x" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="admin-input-with-btn position-relative">
                      <input
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          setShowStarSuggestions(e.target.value.length > 0);
                        }}
                        className="form-control"
                        placeholder="Enter star name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (nameInput.trim() !== "" && !(editingVideo.name || []).includes(nameInput.trim())) {
                            setEditingVideo({ ...editingVideo, name: [...(editingVideo.name || []), nameInput.trim()] });
                            setNameInput("");
                            setShowStarSuggestions(false);
                          }
                        }}
                      >
                        Add
                      </button>
                      {showStarSuggestions && filteredStars.length > 0 && (
                        <div className="admin-suggestions">
                          {filteredStars.slice(0, 10).map((s, idx) => (
                            <div
                              key={idx}
                              className="admin-suggestion-item"
                              onClick={() => {
                                setEditingVideo({ ...editingVideo, name: [...(editingVideo.name || []), s] });
                                setNameInput("");
                                setShowStarSuggestions(false);
                              }}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Tags</label>
                    <div className="admin-tags-container">
                      {(editingVideo.tags || []).map((t, idx) => (
                        <div className="admin-tag" key={idx}>
                          {t}
                          <button
                            type="button"
                            className="admin-tag-remove"
                            onClick={() => {
                              const arr = (editingVideo.tags || []).filter((_, i) => i !== idx);
                              setEditingVideo({ ...editingVideo, tags: arr });
                            }}
                          >
                            <i className="bi bi-x" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="admin-input-with-btn position-relative">
                      <input
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setShowSuggestions(e.target.value.length > 0);
                        }}
                        className="form-control"
                        placeholder="Enter tag"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tagInput.trim() !== "" && !(editingVideo.tags || []).includes(tagInput.trim())) {
                            setEditingVideo({ ...editingVideo, tags: [...(editingVideo.tags || []), tagInput.trim()] });
                            setTagInput("");
                            setShowSuggestions(false);
                          }
                        }}
                      >
                        Add
                      </button>
                      {showSuggestions && filteredTags.length > 0 && (
                        <div className="admin-suggestions">
                          {filteredTags.slice(0, 10).map((t, idx) => (
                            <div
                              key={idx}
                              className="admin-suggestion-item"
                              onClick={() => {
                                setEditingVideo({ ...editingVideo, tags: [...(editingVideo.tags || []), t] });
                                setTagInput("");
                                setShowSuggestions(false);
                              }}
                            >
                              {t}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Title</label>
                    <input
                      value={editingVideo.titel || ""}
                      onChange={(e) => setEditingVideo({ ...editingVideo, titel: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="admin-form-group">
                        <label>Duration (minutes)</label>
                        <input
                          type="number"
                          value={editingVideo.minutes || ""}
                          onChange={(e) => setEditingVideo({ ...editingVideo, minutes: e.target.value })}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="admin-form-group">
                        <label>Category</label>
                        <select
                          className="form-control"
                          value={editingVideo.Category || "english"}
                          onChange={(e) => setEditingVideo({ ...editingVideo, Category: e.target.value })}
                        >
                          <option value="english">English</option>
                          <option value="indian">Indian</option>
                          <option value="hijabi">Hijabi</option>
                          <option value="viral">Viral</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>External Link</label>
                    <input
                      value={editingVideo.link || ""}
                      onChange={(e) => setEditingVideo({ ...editingVideo, link: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Video URL</label>
                    <textarea
                      value={editingVideo.iframeUrl || ""}
                      onChange={(e) => setEditingVideo({ ...editingVideo, iframeUrl: e.target.value })}
                      className="form-control"
                      rows="3"
                      placeholder="Direct MP4 URL or iframe embed URL"
                    />
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Video
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
