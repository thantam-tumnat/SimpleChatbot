import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "circle";
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyle = "flex items-center justify-center transition-all duration-200 font-medium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl border border-gray-200",
    danger: "text-gray-500 hover:text-red-600 hover:bg-gray-100 px-2.5 py-1 rounded-lg border border-transparent hover:border-gray-200 gap-1.5 text-xs",
    ghost: "hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg",
    circle: "w-8 h-8 rounded-full bg-black text-white flex-shrink-0 hover:bg-gray-800",
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button
      className={`${baseStyle} ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
