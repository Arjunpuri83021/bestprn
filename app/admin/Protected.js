"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Protected({ children }) {
  const router = useRouter();
  useEffect(() => {
    const isAdminLoggedIn =
      localStorage.getItem("isAdminLoggedIn") === "true";
    if (!isAdminLoggedIn) router.replace("/admin");
  }, [router]);
  return children;
}
