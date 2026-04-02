"use client";
import { useEffect, useState } from "react";
import Protected from "../Protected";
import AdminNavbar from "../components/AdminNavbar";
import { useRouter, useSearchParams } from "next/navigation";
import "../AdminStyles.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminTagsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTags, setTotalTags] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("count");
  const itemsPerPage = 20;

  useEffect(() => {
    fetchTags();
  }, [currentPage, searchTerm, sortBy]);

  const fetchTags = async () => {
    try {
      setLoading(true);

      const r = await fetch(`${apiUrl}/tags?limit=1000`);
      if (!r.ok) throw new Error("Failed");
      const data = await r.json();
      if (!data.success) throw new Error(data.message || "Failed");

      const arr = data.tags || [];
      const unique = [];
      const seen = new Set();
      arr.forEach((t) => {
        const l = String(t).toLowerCase();
        if (!seen.has(l)) {
          seen.add(l);
          unique.push(String(t));
        }
      });

      const counts = {};
      try {
        const cr = await fetch(`${apiUrl}/getpostdata?limit=5000&includeUnpublished=true`);
        if (cr.ok) {
          const cd = await cr.json();
          const posts = cd.records || [];
          unique.forEach((u) => {
            const lu = u.toLowerCase();
            let c = 0;
            posts.forEach((p) => {
              if (Array.isArray(p.tags) && p.tags.some((pt) => String(pt).toLowerCase() === lu)) c++;
            });
            counts[lu] = c;
          });
        }
      } catch (e) {
        // fallback keeps zeros
      }

      let all = unique.map((t) => ({
        _id: t,
        count: counts[t.toLowerCase()] || 0,
        firstUsed: new Date(),
        lastUpdated: new Date(),
      }));

      if (searchTerm) {
        all = all.filter((x) => x._id.toLowerCase().includes(searchTerm.toLowerCase()));
      }

      all.sort(
        sortBy === "name"
          ? (a, b) => a._id.localeCompare(b._id)
          : (a, b) => b.count - a.count
      );

      const start = (currentPage - 1) * itemsPerPage;
      const pageItems = all.slice(start, start + itemsPerPage);

      setTags(pageItems);
      setTotalTags(all.length);
      setTotalPages(Math.max(1, Math.ceil(all.length / itemsPerPage)));
    } catch (e) {
      const fallback = ["hardcore", "milf", "big-tits", "teen", "mature"];
      let all = fallback.map((t) => ({ _id: t, count: 1, firstUsed: new Date(), lastUpdated: new Date() }));
      if (searchTerm) all = all.filter((x) => x._id.toLowerCase().includes(searchTerm.toLowerCase()));
      const start = (currentPage - 1) * itemsPerPage;
      const pageItems = all.slice(start, start + itemsPerPage);
      setTags(pageItems);
      setTotalTags(all.length);
      setTotalPages(Math.max(1, Math.ceil(all.length / itemsPerPage)));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (p) => {
    setCurrentPage(p);
    const url = new URL(window.location.href);
    url.searchParams.set("page", p);
    window.history.pushState({}, "", url);
    window.scrollTo(0, 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const getVisiblePages = () => {
    const d = 2;
    const r = [];
    const out = [];
    for (let i = Math.max(2, currentPage - d); i <= Math.min(totalPages - 1, currentPage + d); i++) r.push(i);
    if (currentPage - d > 2) out.push(1, "...");
    else out.push(1);
    out.push(...r);
    if (currentPage + d < totalPages - 1) out.push("...", totalPages);
    else out.push(totalPages);
    return out;
  };

  const formatTag = (t) => t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, " ");

  return (
    <Protected>
      <div className="admin-dashboard">
        <AdminNavbar />
        <div className="admin-content">
          <div className="container">
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h2>All Tags ({totalTags})</h2>
                <div className="d-flex gap-2">
                  <form onSubmit={handleSearch} className="d-flex">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: "200px" }}
                    />
                    <button className="btn btn-primary ms-2">Search</button>
                  </form>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex gap-2">
                  <span className="align-self-center me-2">Sort by:</span>
                  <button
                    type="button"
                    className={`btn btn-sm ${sortBy === "count" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => {
                      setSortBy("count");
                      setCurrentPage(1);
                    }}
                  >
                    Video Count
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${sortBy === "name" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => {
                      setSortBy("name");
                      setCurrentPage(1);
                    }}
                  >
                    Alphabetical
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading tags...</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Tag Name</th>
                          <th>Slug</th>
                          <th>Total Videos</th>
                          <th>First Used</th>
                          <th>Last Updated</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tags.map((t, i) => (
                          <tr
                            key={t._id}
                            className="clickable-row"
                            onClick={() =>
                              router.push(
                                `/admin/tag-videos/${encodeURIComponent(t._id)}?fromPage=${currentPage}`
                              )
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                            <td>
                              <strong>{formatTag(t._id)}</strong>
                            </td>
                            <td>
                              <code className="text-muted">{t._id}</code>
                            </td>
                            <td>
                              <span className="badge bg-primary">{t.count} videos</span>
                            </td>
                            <td>{new Date(t.firstUsed).toLocaleDateString()}</td>
                            <td>{new Date(t.lastUpdated).toLocaleDateString()}</td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <div className="d-flex gap-1">
                                <a
                                  href={`/tag/${t._id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-primary"
                                  title="View on site"
                                >
                                  <i className="bi bi-eye" />
                                </a>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success"
                                  title="Manage videos"
                                  onClick={() =>
                                    router.push(`/admin/tag-videos/${encodeURIComponent(t._id)}`)
                                  }
                                >
                                  <i className="bi bi-list" />
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
                        Showing page {currentPage} of {totalPages} ({totalTags} total tags)
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
      </div>
    </Protected>
  );
}
