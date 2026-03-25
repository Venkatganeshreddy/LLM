export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4 ${className}`}
      style={{ borderColor: "var(--muted)", borderTopColor: "transparent" }}
    />
  );
}
