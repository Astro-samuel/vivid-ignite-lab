import { Package, CheckCircle, ShoppingCart } from "lucide-react";

interface ProjectComponentsListProps {
  components: string[];
  userInventory?: string[];
}

export default function ProjectComponentsList({ components }: ProjectComponentsListProps) {
  const getPurchaseUrl = (name: string) => {
    return `https://www.adafruit.com/?q=${encodeURIComponent(name)}`;
  };

  return (
    <div className="rounded-2xl border p-5 bg-card border-border mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Package size={18} className="text-primary" />
        <h2 className="text-sm font-bold text-foreground">Required Components ({components.length})</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {components.map((comp) => (
          <div
            key={comp}
            className="flex items-center justify-between p-3 rounded-xl border text-xs bg-muted/30 border-border"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-success" />
              <span className="font-semibold text-foreground">{comp}</span>
            </div>
            <a
              href={getPurchaseUrl(comp)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground text-[10px] font-bold flex items-center gap-1 transition-all"
            >
              <ShoppingCart size={10} /> Buy
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
