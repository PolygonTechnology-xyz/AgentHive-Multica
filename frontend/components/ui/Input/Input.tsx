import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };

export function Input({ id, label, error, ...props }: InputProps) {
  return (
    <label className={styles.field} htmlFor={id}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input id={id} className={styles.input} aria-invalid={error ? "true" : undefined} aria-describedby={error && id ? id + "-error" : undefined} {...props} />
      {error ? <span id={id ? id + "-error" : undefined} className={styles.error}>{error}</span> : null}
    </label>
  );
}
