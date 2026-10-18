
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Card = ({
  children,
  title,
  description,
  className = "",
  ...props
}: CardProps) => {
  return (
    <article
      {...props}
      className={`card ${className}`.trim()}
    >
      {(title || description) && (
        <header className="card__header">
          {title && <h2 className="card__title">{title}</h2>}

          {description && (
            <p className="card__description">{description}</p>
          )}
        </header>
      )}

      <div className="card__content">{children}</div>
    </article>
  );
};

export default Card;
