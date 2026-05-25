import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

type BadgeTone = "accent" | "violet" | "cyan" | "warn";
type BadgeProps = HTMLAttributes<HTMLSpanElement> & { children: ReactNode; tone?: BadgeTone };

export function Badge({ children, tone = "accent", className, ...props }: BadgeProps) {
  const toneClass = tone === "accent" ? "" : styles[tone];
  const classes = [styles.badge, toneClass, className ?? ""].filter(Boolean).join(" ");
  return <span className={classes} {...props}>{children}</span>;
}
