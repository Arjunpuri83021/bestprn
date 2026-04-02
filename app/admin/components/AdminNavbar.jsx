"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "../AdminStyles.css";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) => pathname === href;

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAdminLoggedIn");
      localStorage.removeItem("adminData");
    }
    router.push("/admin");
  };

  return (
    <nav className="admin-navbar">
      <div className="container">
        <h1 style={{ cursor: "pointer" }} onClick={() => router.push("/admin/dashboard")}>
          bestprn Admin Panel
        </h1>
        <ul className="admin-nav-links">
          <li>
            <Link
              className={isActive("/admin/dashboard") ? "active" : ""}
              href="/admin/dashboard"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link className={isActive("/admin/posts") ? "active" : ""} href="/admin/posts">
              Posts
            </Link>
          </li>
          <li>
            <Link
              className={isActive("/admin/networks") ? "active" : ""}
              href="/admin/networks"
            >
              Networks
            </Link>
          </li>
          <li>
            <Link
              className={isActive("/admin/stars-list") ? "active" : ""}
              href="/admin/stars-list"
            >
              Stars
            </Link>
          </li>
          <li>
            <Link
              className={isActive("/admin/tags-list") ? "active" : ""}
              href="/admin/tags-list"
            >
              Tags
            </Link>
          </li>
          <li>
            <Link
              className={isActive("/admin/seo-meta") ? "active" : ""}
              href="/admin/seo-meta"
            >
              <i className="bi bi-search me-1"></i>SEO Meta
            </Link>
          </li>
          <li>
            <Link
              className={isActive("/admin/custom-content") ? "active" : ""}
              href="/admin/custom-content"
            >
              <i className="bi bi-file-text me-1"></i>Custom Content
            </Link>
          </li>
          <li>
            <Link
              className={isActive("/admin/manage-admins") ? "active" : ""}
              href="/admin/manage-admins"
            >
              Manage Admins
            </Link>
          </li>
          <li>
            <Link
              className={isActive("/admin/schedule-settings") ? "active" : ""}
              href="/admin/schedule-settings"
            >
              <i className="bi bi-gear-fill me-1"></i>Schedule
            </Link>
          </li>
        </ul>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
