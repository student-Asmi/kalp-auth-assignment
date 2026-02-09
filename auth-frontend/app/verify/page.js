"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    fetch(`http://localhost:5000/api/auth/verify-email?token=${token}`)
      .then(() => router.push("/login"));
  }, [token]);

  return <p>Verifying email...</p>;
}
