
import type { HTMLAttributes } from "react";

type BadgeVariant = "success" | "neutral" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = ({
  variant = "neutral",
  className = "",
  children,
  ...props
}: BadgeProps) => {
  return (
    <span
      {...props}
      className={`badge badge--${variant} ${className}`.trim()}
    >
      {children}
    </span>
  );
};

export default Badge;
