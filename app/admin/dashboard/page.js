"use client";
import { useEffect, useState } from "react";
import Protected from "../Protected";
import AdminNavbar from "../components/AdminNavbar";
import "../AdminStyles.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalUniqueStars: 0,
    totalUniqueTags: 0,
    last7Days: { newPosts: 0, newStars: 0, newTags: 0 },
    last24Hours: { views: 0 },
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const s = await fetch(`${apiUrl}/dashboard/stats`).then((r) => r.json());
        if (s.success) setStats(s.stats);
        const p = await fetch(
          `${apiUrl}/getpostdata?page=1&limit=10&includeUnpublished=true`
        ).then((r) => r.json());
        if (p.records) setRecentPosts(p.records);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatNumber = (n) =>
    n >= 1e6
      ? (n / 1e6).toFixed(1).replace(".0", "") + "M"
      : n >= 1e3
        ? (n / 1e3).toFixed(1).replace(".0", "") + "K"
        : n || 0;

  if (loading)
    return (
      <Protected>
        <div className="admin-dashboard">
          <AdminNavbar />
          <div className="admin-content">
            <div className="container">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      </Protected>
    );

  return (
    <Protected>
      <div className="admin-dashboard">
        <AdminNavbar />
        <div className="admin-content">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h2 className="mb-4">Dashboard Overview</h2>
                <div className="admin-stats">
                  <div
                    className="admin-stat-card posts clickable"
                    onClick={() => (location.href = "/admin/posts")}
                  >
                    <h3>{formatNumber(stats.totalPosts)}</h3>
                    <p>Total Posts</p>
                    <small className="text-success">
                      +{stats.last7Days.newPosts} last 7 days
                    </small>
                  </div>
                  <div className="admin-stat-card views">
                    <h3>{formatNumber(stats.totalViews)}</h3>
                    <p>Total Views</p>
                    <small className="text-info">
                      +{formatNumber(stats.last24Hours.views)} last 24 hrs
                    </small>
                  </div>
                  <div
                    className="admin-stat-card stars clickable"
                    onClick={() => (location.href = "/admin/stars-list")}
                  >
                    <h3>{formatNumber(stats.totalUniqueStars)}</h3>
                    <p>Unique Stars</p>
                    <small className="text-success">
                      +{stats.last7Days.newStars} last 7 days
                    </small>
                  </div>
                  <div
                    className="admin-stat-card tags clickable"
                    onClick={() => (location.href = "/admin/tags-list")}
                  >
                    <h3>{formatNumber(stats.totalUniqueTags)}</h3>
                    <p>Unique Tags</p>
                    <small className="text-success">
                      +{stats.last7Days.newTags} last 7 days
                    </small>
                  </div>
                </div>

                <div className="admin-table-container">
                  <div className="admin-table-header">
                    <h2>Recent Posts</h2>
                    <a href="/admin/posts" className="admin-add-btn">
                      View All Posts
                    </a>
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Title</th>
                          <th>Video No</th>
                          <th>Views</th>
                          <th>Category</th>
                          <th>Stars</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPosts.slice(0, 5).map((post) => (
                          <tr key={post._id}>
                            <td>
                              <img
                                src={post.imageUrl}
                                alt={post.altKeywords || post.titel}
                                className="admin-table-img"
                              />
                            </td>
                            <td>
                              <div
                                className="text-truncate"
                                style={{ maxWidth: "200px" }}
                              >
                                {post.titel}
                              </div>
                            </td>
                            <td>{post.videoNo}</td>
                            <td>{formatNumber(post.views || 0)}</td>
                            <td>
                              <span className="badge bg-primary">
                                {post.Category}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-1">
                                {Array.isArray(post.name) &&
                                  post.name.slice(0, 2).map((star, i) => (
                                    <span key={i} className="badge bg-secondary">
                                      {star}
                                    </span>
                                  ))}
                                {Array.isArray(post.name) && post.name.length > 2 && (
                                  <span className="badge bg-light text-dark">
                                    +{post.name.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="admin-table-container">
                      <h3>Quick Actions</h3>
                      <div className="d-grid gap-2">
                        <a href="/admin/posts" className="btn btn-primary">
                          <i className="bi bi-plus-circle me-2"></i>Add New Post
                        </a>
                        <a
                          href="/admin/manage-admins"
                          className="btn btn-success"
                        >
                          <i className="bi bi-person-gear me-2"></i>Manage Admins
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-table-container">
                      <h3>System Info</h3>
                      <div className="list-group list-group-flush">
                        <div className="list-group-item d-flex justify-content-between">
                          <span>Server Status</span>
                          <span className="badge bg-success">Online</span>
                        </div>
                        <div className="list-group-item d-flex justify-content-between">
                          <span>Database</span>
                          <span className="badge bg-success">Connected</span>
                        </div>
                        <div className="list-group-item d-flex justify-content-between">
                          <span>Last Backup</span>
                          <span className="text-muted">Today</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
}
