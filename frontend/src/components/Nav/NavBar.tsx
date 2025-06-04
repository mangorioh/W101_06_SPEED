"use client";
import Link from "next/link";
import NavComponent from "./NavComponent";
import { useEffect, useState } from "react";

const NavBar = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      // if no ones logged in, then they are not a mod or owner
      setRole(null);
    } else {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        // any error in the fetch will just assume the user is not logged in
        .then(async (res) => {
          if (res.status === 401 || res.status === 403) {
            setRole(null);
            return;
          }
          const data = await res.json();
          setRole(data.role);
        })
        .catch(() => {
          setRole(null);
        });
    }
  }, []);

  return (
    <nav className="flex justify-between p-2 bg-blue-950 text-white">
      <Link href="/" className="font-bold text-xl ml-2">
        SPEED
      </Link>
      <div className="flex space-x-2 pr-10">
        <NavComponent href="/" label="Home" />
        {(role === "mod" || role === "owner") && (
          <NavComponent label="Moderation">
            <NavComponent
              href="/moderation/queue"
              label="View Moderation Queue"
            />
            <NavComponent
              href="/moderation/rejects"
              label="View rejection queue"
            />
          </NavComponent>
        )}
        {role === "owner" && (
          <NavComponent label="Owner">
            <NavComponent href="/owner/users" label="Manage Users" />
          </NavComponent>
        )}
        <NavComponent label="Articles">
          <NavComponent href="/articles" label="view all articles" />
          <NavComponent href="/articles/submit" label="submit new article" />
        </NavComponent>
        <NavComponent label="Users">
          <NavComponent href="/user/login" label="Login" />
          <NavComponent href="/user/register" label="Register" />
          <NavComponent href="/user/profile" label="Profile" />
          <NavComponent href="/user/submissions" label="Submissions" />
        </NavComponent>
      </div>
    </nav>
  );
};

export default NavBar;
