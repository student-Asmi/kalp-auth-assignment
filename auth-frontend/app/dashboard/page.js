"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setData)
      .catch(() => router.push("/login"));
  }, []);

  if (!data) return <p className="loading">Loading...</p>;

  return (
    <div className="dash-container">
      <div className="dash-card">
        <h2>Dashboard</h2>
        <p><b>User ID:</b> {data.userId}</p>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
