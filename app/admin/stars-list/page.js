"use client";
import { useEffect, useMemo, useState } from "react";
import Protected from "../Protected";
import AdminNavbar from "../components/AdminNavbar";
import { useRouter, useSearchParams } from "next/navigation";
import "../AdminStyles.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminStarsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStars, setTotalStars] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLetter, setFilterLetter] = useState("");
  const itemsPerPage = 20;

  useEffect(() => {
    fetchStars();
  }, [currentPage, searchTerm, filterLetter]);

  const fetchStars = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      });
      if (searchTerm) params.append("search", searchTerm);
      if (filterLetter) params.append("letter", filterLetter);

      const r = await fetch(`${apiUrl}/pornstars?${params.toString()}`);
      const d = await r.json();
      if (d.success) {
        setStars(d.pornstars || []);
        setTotalPages(d.pagination?.totalPages || 1);
        setTotalStars(d.pagination?.totalCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  const handleLetterFilter = (letter) => {
    setFilterLetter(letter === filterLetter ? "" : letter);
    setCurrentPage(1);
  };

  const alphabet = useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), []);

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
            <div className="row">
              <div className="col-12">
                <div className="admin-table-container">
                  <div className="admin-table-header">
                    <h2>All Pornstars ({totalStars})</h2>
                    <div className="d-flex gap-2">
                      <form onSubmit={handleSearch} className="d-flex">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search stars..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ width: "200px" }}
                        />
                        <button type="submit" className="btn btn-primary ms-2">
                          Search
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex flex-wrap gap-1">
                      <button
                        className={`btn btn-sm ${!filterLetter ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => handleLetterFilter("")}
                        type="button"
                      >
                        All
                      </button>
                      {alphabet.map((letter) => (
                        <button
                          key={letter}
                          type="button"
                          className={`btn btn-sm ${filterLetter === letter ? "btn-primary" : "btn-outline-primary"}`}
                          onClick={() => handleLetterFilter(letter)}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading stars...</p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Star Name</th>
                              <th>Total Videos</th>
                              <th>First Appearance</th>
                              <th>Last Updated</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stars.map((star, index) => (
                              <tr
                                key={star.name || index}
                                className="clickable-row"
                                onClick={() =>
                                  router.push(
                                    `/admin/star-videos/${encodeURIComponent(star.name)}?fromPage=${currentPage}`
                                  )
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td>
                                  <strong>{star.name}</strong>
                                </td>
                                <td>
                                  <span className="badge bg-primary">{star.count} videos</span>
                                </td>
                                <td>
                                  {star.firstAppearance
                                    ? new Date(star.firstAppearance).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "N/A"}
                                </td>
                                <td>
                                  {star.lastUpdated
                                    ? new Date(star.lastUpdated).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                          <div className="text-muted">
                            Showing page {currentPage} of {totalPages} ({totalStars} total stars)
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
        </div>
      </div>
    </Protected>
  );
}
