"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/user/login");
    }
    // Optionally, verify token validity with backend here
  }, [router]);

  return <>{children}</>;
}
