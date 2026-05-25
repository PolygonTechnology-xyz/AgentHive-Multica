import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function Card({ children, className, ...props }: CardProps) {
  const classes = className ? styles.card + " " + className : styles.card;
  return <div className={classes} {...props}>{children}</div>;
}
