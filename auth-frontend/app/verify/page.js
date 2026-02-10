"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-email?token=${token}`)
      .then(() => router.push("/login"));
  }, [token]);

  return <p>Verifying email...</p>;
}
