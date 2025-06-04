"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  username: string;
  role: string;
}

const ROLES = ["user", "mod", "owner"];

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  const fetchUsers = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("http://localhost:3000/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          alert("Access denied. Owner only.");
          router.push("/");
          return;
        }
        const data = await res.json();
        setUsers(data);
      })
      .catch(() => {
        alert("Failed to fetch users.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("You must be logged in as owner to view this page.");
      router.push("/user/login");
      return;
    }
    fetchUsers();
    // eslint-disable-next-line
  }, [router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    await fetch(`http://localhost:3000/users/${userId}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });
    fetchUsers();
    setUpdating(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setUpdating(userId);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    await fetch(`http://localhost:3000/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
    setUpdating(null);
  };

  const handleInvalidatePassword = async (userId: string) => {
    if (
      !confirm(
        "Invalidate this user's password? They will not be able to log in."
      )
    )
      return;
    setUpdating(userId);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    await fetch(`http://localhost:3000/users/${userId}/invalidate-password`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
    setUpdating(null);
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Users</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Username</th>
            <th className="border px-2 py-1">Role</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border px-2 py-1">{user.username}</td>
              <td className="border px-2 py-1">
                <select
                  value={user.role}
                  disabled={updating === user._id}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  className="border rounded px-1 py-0.5"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border px-2 py-1 space-x-2">
                <button
                  disabled={updating === user._id}
                  onClick={() => handleInvalidatePassword(user._id)}
                >
                  Invalidate Password
                </button>
                <button
                  disabled={updating === user._id}
                  onClick={() => handleDelete(user._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
