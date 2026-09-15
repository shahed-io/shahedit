import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  section: string;
  Icon: LucideIcon;
  stats?: Array<{ value: string; label: string }>;
  subtitle?: string;
};

const defaultStats = [
  { value: "248", label: "Products" },
  { value: "৳18.4L", label: "Monthly sales" },
  { value: "1,420", label: "Customers" },
  { value: "11", label: "Low stock" },
];

export const AdminHeroHeader = ({ title, section, Icon, stats = defaultStats, subtitle }: Props) => (
  <section className="admin-hero-header">
    <div className="admin-hero-blob admin-hero-blob-1" aria-hidden="true" />
    <div className="admin-hero-blob admin-hero-blob-2" aria-hidden="true" />
    <div className="admin-hero-blob admin-hero-blob-3" aria-hidden="true" />

    <div className="admin-hero-decor" aria-hidden="true">
      <span className="admin-hero-decor-icon admin-hero-decor-1">✦</span>
      <span className="admin-hero-decor-icon admin-hero-decor-2">◇</span>
      <span className="admin-hero-decor-icon admin-hero-decor-3">▦</span>
    </div>

    <div className="admin-hero-content">
      <div className="admin-hero-icon"><Icon size={26} /></div>

      <div className="admin-hero-text">
        <p className="admin-hero-kicker">{section || "Overview"}</p>
        <h1>{title}</h1>
        <p className="admin-hero-subtitle">
          {subtitle ?? `${section ? `${section} · Manage and configure ${title.toLowerCase()}` : "Welcome to your admin panel"}`}
        </p>
      </div>

      <div className="admin-hero-stats" aria-label="Catalog statistics">
        {stats.map((item) => (
          <span key={`${item.label}-${item.value}`}>
            <strong>{item.value}</strong>
            <small>{item.label}</small>
          </span>
        ))}
      </div>
    </div>
  </section>
);
