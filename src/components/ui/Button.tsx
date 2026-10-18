import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};
const Button = ({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      type={type}
      className={`button button--${variant} ${className}`}
    />
  );
};

export default Button;
