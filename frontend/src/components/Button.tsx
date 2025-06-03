import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

const Button: React.FC<ButtonProps> = ({ label, className, ...props }) => {
  const baseClasses =
    "items-center px-3 py-1 font-medium transition-colors  rounded-md disabled:opacity-50";
  const variantClasses = "bg-blue-500 text-white hover:bg-blue-600";
  const combinedClasses = `${baseClasses} ${variantClasses} ${className ?? ""}`;

  return (
    <button className={combinedClasses} {...props}>
      {label}
    </button>
  );
};

export default Button;
