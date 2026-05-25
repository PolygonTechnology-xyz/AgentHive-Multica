import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";
import styles from "./RoutePlaceholder.module.css";

type RoutePlaceholderProps = { title: string; eyebrow: string; description: string; tags?: string[] };

export function RoutePlaceholder({ title, eyebrow, description, tags = [] }: RoutePlaceholderProps) {
  return (
    <main className={styles.wrapper}>
      <section className="shell">
        <Card>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
          {tags.length > 0 ? <div className={styles.meta}>{tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div> : null}
        </Card>
      </section>
    </main>
  );
}
