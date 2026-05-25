import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";

export default function NotFound() {
  return (
    <main className="shell">
      <Card>
        <p className="mono">404</p>
        <h1>Page not found</h1>
        <p>The requested AgentHive route is not available.</p>
        <Button href="/">Return home</Button>
      </Card>
    </main>
  );
}
