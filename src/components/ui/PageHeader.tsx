
import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

const PageHeader = ({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) => {
  return (
    <header className="page-header">
      <div className="page-header__content">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}

        <h1 className="page-header__title">{title}</h1>

        {description && (
          <p className="page-header__description">{description}</p>
        )}
      </div>

      {action && <div className="page-header__action">{action}</div>}
    </header>
  );
};

export default PageHeader;
