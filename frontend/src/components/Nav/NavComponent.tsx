"use client";
import Link from "next/link";
import { useState, ReactNode } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = !!children;
  const toggleDropdown = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };
  return (
    <div className="relative">
      {href ? (
        <Link
          href={href}
          className="block py-2 px-4 hover:bg-blue-800 rounded-md"
        >
          {label}
        </Link>
      ) : (
        <button
          onClick={toggleDropdown}
          className="block py-2 px-4 hover:bg-blue-800 rounded-md"
        >
          {label}
        </button>
      )}
      {hasChildren && (
        <div
          className={`absolute top-full left-0 shadow-md rounded-md bg-[#001681] z-10 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default NavComponent;
