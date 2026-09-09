import { useCallback, useEffect, useRef, useState } from 'react';

export const fieldErrorTextClass = 'mt-1.5 text-xs text-destructive-text';

export function requiredField(label: string) {
  return (value: string) => (value.trim() ? undefined : `${label} is required`);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requiredEmail(value: string) {
  if (!value.trim()) return 'Email is required';
  if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address';
  return undefined;
}

export function requiredPassword(value: string, minLength = 8) {
  if (!value) return 'Password is required';
  if (value.length < minLength) return `Password must be at least ${minLength} characters`;
  return undefined;
}

export function fieldControlProps(id: string, error?: string) {
  return {
    id,
    'aria-invalid': Boolean(error) || undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  };
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className={fieldErrorTextClass} role="alert">
      {message}
    </p>
  );
}

export function focusFirstInvalid(container?: HTMLElement | null) {
  const root = container ?? document;
  const el = root.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (!el) return;
  el.focus();
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

type Rules<T> = { [K in keyof T]: (value: T[K]) => string | undefined };

export function useFormValidation<T extends Record<string, string>>(
  values: T,
  rules: Rules<T>,
) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [attempted, setAttempted] = useState(false);
  const rulesRef = useRef(rules);
  rulesRef.current = rules;
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const compute = useCallback(() => {
    const current = valuesRef.current;
    const next: Partial<Record<keyof T, string>> = {};
    (Object.keys(rulesRef.current) as (keyof T)[]).forEach((key) => {
      const message = rulesRef.current[key](current[key]);
      if (message) next[key] = message;
    });
    return next;
  }, []);

  const snapshot = JSON.stringify(values);
  const pendingFocusRef = useRef(false);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!attempted) return;
    setErrors(compute());
  }, [attempted, compute, snapshot]);

  useEffect(() => {
    if (!pendingFocusRef.current) return;
    pendingFocusRef.current = false;
    focusFirstInvalid(containerRef.current);
  }, [errors]);

  const validate = useCallback((container?: HTMLElement | null) => {
    setAttempted(true);
    const next = compute();
    setErrors(next);
    const ok = Object.keys(next).length === 0;
    containerRef.current = container ?? null;
    pendingFocusRef.current = !ok;
    return ok;
  }, [compute]);

  const reset = useCallback(() => {
    setAttempted(false);
    setErrors({});
  }, []);

  return { errors, attempted, validate, reset };
}
