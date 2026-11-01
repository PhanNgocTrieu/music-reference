interface BadgeProps {
  label: string;
  href?: string;
  variant?: "default" | "muted";
  /** Tailwind bg/text classes (e.g. "bg-gold-100 text-gold-700") that override `variant`'s color. */
  tone?: string;
}

export default function Badge({ label, href, variant = "default", tone }: BadgeProps) {
  const color = tone ?? (variant === "muted" ? "bg-cream-200 text-navy-600" : "bg-navy-100 text-navy-700");
  const cls = `inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`;

  if (href) {
    return (
      <a href={href} className={`${cls} hover:opacity-80 transition-opacity`}>
        {label}
      </a>
    );
  }
  return <span className={cls}>{label}</span>;
}
