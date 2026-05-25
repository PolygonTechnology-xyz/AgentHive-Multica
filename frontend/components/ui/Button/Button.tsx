import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";
type BaseProps = { children: ReactNode; variant?: Variant; className?: string };
type ButtonAsButton = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type ButtonAsLink = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
export type ButtonProps = ButtonAsButton | ButtonAsLink;

function classes(variant: Variant, className?: string) {
  return [styles.button, variant !== "primary" ? styles[variant] : "", className ?? ""].filter(Boolean).join(" ");
}

export function Button(props: ButtonProps) {
  if ("href" in props && props.href) {
    const { children, variant = "primary", className, href, ...anchorProps } = props;
    return <Link href={href} className={classes(variant, className)} {...anchorProps}>{children}</Link>;
  }

  const buttonOnlyProps = props as ButtonAsButton;
  const { children, variant = "primary", className, type = "button", ...buttonProps } = buttonOnlyProps;
  return <button type={type} className={classes(variant, className)} {...buttonProps}>{children}</button>;
}
