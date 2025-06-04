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

    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/users/me`, {
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-lg">
        Loading profile...
      </div>
    );
  if (!profile) return null;

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md border border-indigo-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-200 rounded-full w-20 h-20 flex items-center justify-center mb-3">
            <svg
              className="w-12 h-12 text-indigo-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-indigo-700 mb-1">
            Your Profile
          </h1>
          <p className="text-gray-500">
            Welcome back,{" "}
            <span className="font-semibold">{profile.username}</span>!
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 w-23">Username:</span>
            <span className="text-gray-900">{profile.username}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 w-32">
              Account Level:
            </span>
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
              {profile.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
