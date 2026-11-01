interface BadgeProps {
  label: string;
  href?: string;
  variant?: "default" | "muted";
}

export default function Badge({ label, href, variant = "default" }: BadgeProps) {
  const cls =
    variant === "muted"
      ? "inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600"
      : "inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700";

  if (href) {
    return (
      <a href={href} className={`${cls} hover:opacity-80 transition-opacity`}>
        {label}
      </a>
    );
  }
  return <span className={cls}>{label}</span>;
}
