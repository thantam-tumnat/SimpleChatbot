import { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "forgotten" | "success" | "warning" | "danger";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  const baseStyle = "inline-flex items-center select-none font-medium transition-colors duration-200";

  const variants = {
    default: "text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200",
    forgotten: "text-[10px] text-gray-400 px-1 font-semibold",
    success: "text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200",
    danger: "text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200",
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span
      className={`${baseStyle} ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
