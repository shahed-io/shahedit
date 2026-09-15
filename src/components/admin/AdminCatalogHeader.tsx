import type { LucideIcon } from "lucide-react";

type Props = { title: string; section: string; Icon: LucideIcon };

export const AdminHeroHeader = ({ title, section, Icon }: Props) => (
  <section className="catalog-hero">
    <div className="catalog-hero-icon"><Icon size={26} /></div>
    <div><p>{section}</p><h1>{title}</h1><span>{section} · Manage and configure {title.toLowerCase()}</span></div>
    <div className="catalog-hero-decor" aria-hidden="true"><span>✦</span><span>◇</span><span>▦</span></div>
  </section>
);
