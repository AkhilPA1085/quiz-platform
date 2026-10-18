
import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

const Modal = ({
  isOpen,
  title,
  description,
  children,
  onClose,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  function handleClose() {
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="modal-title"
      onClose={handleClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="modal__content">
        <header className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {title}
          </h2>

          {description && (
            <p className="modal__description">{description}</p>
          )}
        </header>

        <div className="modal__body">{children}</div>
      </div>
    </dialog>
  );
};

export default Modal;
