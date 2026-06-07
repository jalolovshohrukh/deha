import { Children, cloneElement, isValidElement, useId } from 'react';

export type FormFieldProps = {
  /** Field label rendered above the control. */
  label?: React.ReactNode;
  /** Helper text shown below — switches tone to pink when `error` is set. */
  hint?: React.ReactNode;
  /** Inline error message. When set, takes precedence over `hint`. */
  error?: React.ReactNode;
  /** Marks the field with a "(optional)" suffix when true (the inverse pattern of "*required" — use this for the rare optional-in-a-required-form case). */
  optional?: boolean;
  /** Marks the field with a red asterisk after the label. */
  required?: boolean;
  /** Field id; auto-generated when omitted. The input child is wired to it. */
  htmlFor?: string;
  /** The actual control — Input, Select, Textarea, etc. */
  children: React.ReactElement;
  className?: string;
};

/**
 * Wrapper that bundles a label, the control, and a hint/error line. Use it
 * around any input that doesn't already have a built-in label/hint (Toggle,
 * Combobox, Numpad, etc.) — or when you want consistent spacing and error
 * handling across a form.
 *
 * The control receives an auto-generated `id` and `aria-describedby` if it
 * didn't already carry one, so screen readers announce the hint/error.
 *
 * @example
 *   <FormField label="Email" required hint="We'll send the receipt here." error={errors.email}>
 *     <Input type="email" />
 *   </FormField>
 */
export function FormField({
  label,
  hint,
  error,
  optional,
  required,
  htmlFor,
  children,
  className = '',
}: FormFieldProps) {
  const generatedId = useId();
  const child = Children.only(children);
  const childProps = (child.props ?? {}) as Record<string, unknown>;
  const fieldId = htmlFor ?? (childProps.id as string | undefined) ?? generatedId;
  const describedById = hint || error ? `${fieldId}-desc` : undefined;
  const message = error ?? hint;

  // Wire the field id + aria-describedby + aria-invalid through to the child.
  const enhancedChild = isValidElement(child)
    ? cloneElement(child, {
        id: fieldId,
        'aria-describedby': describedById,
        'aria-invalid': error ? true : (childProps['aria-invalid'] as boolean | undefined),
      } as Record<string, unknown>)
    : child;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className="flex items-center gap-1.5 text-xs font-medium text-refresh-muted"
        >
          <span>{label}</span>
          {required && (
            <span aria-hidden className="text-refresh-pink">
              *
            </span>
          )}
          {optional && !required && (
            <span className="text-[10px] font-normal text-refresh-muted-2">(optional)</span>
          )}
        </label>
      )}
      {enhancedChild}
      {message && (
        <p
          id={describedById}
          className={`text-[11px] ${error ? 'text-refresh-pink' : 'text-refresh-muted-2'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
