"use client";
import Link from "next/link";
import { ReactNode } from "react";

interface NavComponentProps {
  href?: string;
  label?: string;
  children?: ReactNode | ReactNode[];
}

const NavComponent: React.FC<NavComponentProps> = ({
  href,
  label,
  children,
}) => {
  const hasChildren = !!children;

  return (
    <div className={`relative group`}>
      {href ? (
        <Link
          href={href}
          className="block py-1 px-4 hover:bg-blue-800/60 bg-blue-800 rounded-md"
        >
          {label}
        </Link>
      ) : (
        <button className="block py-1 px-4 hover:bg-blue-800/60 bg-blue-800 rounded-md">
          {label}
        </button>
      )}
      {hasChildren && (
        <div
          className={`absolute top-full p-2 space-y-2 shadow-md rounded-md bg-blue-950 z-10 hidden group-hover:block group-focus-within:block`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default NavComponent;
