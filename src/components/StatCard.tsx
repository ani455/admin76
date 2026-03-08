import { LucideIcon, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  link?: string;
  delay?: number;
}

export default function StatCard({ title, value, icon: Icon, color, link, delay = 0 }: StatCardProps) {
  const content = (
    <div
      className="stat-card rounded-xl p-5 text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer group"
      style={{
        background: `linear-gradient(135deg, hsl(var(--stat-${color})), hsl(var(--stat-${color}) / 0.8))`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90 mb-2">{title}</p>
          <h3 className="text-2xl font-extrabold tracking-tight animate-counter" style={{ animationDelay: `${delay + 200}ms` }}>
            {value}
          </h3>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary-foreground/15 backdrop-blur-sm transition-transform duration-300 group-hover:rotate-6">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {link && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-primary-foreground/20 relative z-10">
          <span className="text-xs font-medium opacity-80 group-hover:opacity-100 transition-opacity">See Details</span>
          <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      )}
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
        {content}
      </Link>
    );
  }

  return (
    <div className="animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      {content}
    </div>
  );
}
