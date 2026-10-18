
import type { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children?: ReactNode;
}

const FormField = ({
  id,
  label,
  error,
  hint,
  children,
  className = "",
  ...inputProps
}: FormFieldProps) => {
  const describedBy = [
    hint ? `${id}-hint` : undefined,
    error ? `${id}-error` : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
        {inputProps.required && (
          <span aria-hidden="true"> *</span>
        )}
      </label>

      {children ?? (
        <input
          {...inputProps}
          id={id}
          className={`form-field__input ${className}`.trim()}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      )}

      {hint && (
        <p id={`${id}-hint`} className="form-field__hint">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
