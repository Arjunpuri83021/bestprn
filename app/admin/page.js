"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./AdminStyles.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const emailOrUsername = e.currentTarget.emailOrUsername.value;
    const password = e.currentTarget.password.value;
    const isEmail = emailOrUsername.includes("@");
    const loginData = isEmail
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password };
    try {
      const res = await fetch(`${apiUrl}/adminlogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Login successful! Redirecting...");
        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("adminData", JSON.stringify(data.admin));
        router.push("/admin/dashboard");
      } else {
        setMessage(
          "Login failed: " + (data.message || "Invalid credentials")
        );
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>Admin Login</h2>
          <p>bestprn Admin Panel</p>
        </div>
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="emailOrUsername">Email or Username</label>
            <input
              className="form-control"
              type="text"
              name="emailOrUsername"
              id="emailOrUsername"
              placeholder="Enter your email or username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              className="form-control"
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              required
            />
          </div>
          {message && (
            <div
              className={`alert ${
                message.includes("successful") ? "alert-success" : "alert-danger"
              }`}
            >
              {message}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary admin-login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
