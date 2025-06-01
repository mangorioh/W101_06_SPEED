"use client";
import Link from "next/link";
import { useState, useRef, useEffect, ReactNode } from "react";

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
  const navRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (hasChildren) {
      setIsOpen((prev) => !prev);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown when a child link is clicked
  const handleChildClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={navRef}>
      {href ? (
        <Link
          href={href}
          className="block py-2 px-4 hover:bg-blue-800 rounded-md"
          onClick={() => setIsOpen(false)}
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
          {/* Clone children to add onClick to close dropdown */}
          {Array.isArray(children)
            ? children.map((child, idx) =>
                child && typeof child === "object"
                  ? // @ts-ignore
                    { ...child, props: { ...child.props, onClick: handleChildClick } }
                  : child
              )
            : children}
        </div>
      )}
    </div>
  );
};

export default NavComponent;
