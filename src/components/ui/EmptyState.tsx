
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="empty-state" role="status">
      <h2 className="empty-state__title">{title}</h2>

      <p className="empty-state__description">{description}</p>

      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
};

export default EmptyState;
