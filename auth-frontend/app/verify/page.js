"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-email?token=${token}`
    )
      .then(() => {
        router.replace("/login");
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [searchParams, router]);

  return (
    <div style={{ padding: 40 }}>
      <h2>Verifying your email…</h2>
      <p>Please wait</p>
    </div>
  );