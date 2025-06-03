"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  username: string;
  role: string;
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("You must be logged in to view your profile.");
      router.push("/user/login");
      return;
    }

    fetch("http://localhost:3000/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          alert("Session expired or unauthorized.");
          router.push("/user/login");
          return;
        }
        const data = await res.json();
        setProfile(data);
      })
      .catch(() => {
        alert("Failed to fetch profile.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return null;

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="mb-2">
        <span className="font-semibold">Username:</span> {profile.username}
      </div>
      <div>
        <span className="font-semibold">Account Level:</span> {profile.role}
      </div>
    </div>
  );
}
