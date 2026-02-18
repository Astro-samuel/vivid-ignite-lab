import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, LayoutDashboard, BookOpen, Cpu, Package, Zap, Lightbulb,
  Trophy, User, ChevronLeft, ChevronRight, Globe, MessageSquare
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen, label: "Catalog", path: "/catalog" },
  { icon: Cpu, label: "My Components", path: "/components" },
  { icon: Package, label: "Kits", path: "/kits" },
  { icon: Zap, label: "Generate", path: "/generate" },
  { icon: Lightbulb, label: "Think Bigger", path: "/think-bigger" },
  { icon: Trophy, label: "Achievements", path: "/achievements" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 border-r"
      style={{
        width: collapsed ? "72px" : "220px",
        background: "hsl(229, 48%, 8%)",
        borderColor: "hsl(229, 42%, 20%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "hsl(229, 42%, 20%)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 animate-neon-pulse"
          style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)" }}
        >
          <Cpu size={18} style={{ color: "#0A0E27" }} />
        </div>
        {!collapsed && (
          <div>
            <span className="font-orbitron font-bold text-sm gradient-text-teal">MakerLab</span>
            <p className="text-xs" style={{ color: "hsl(226, 35%, 72%)" }}>AI Platform</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-4 space-y-1 border-t pt-4" style={{ borderColor: "hsl(229, 42%, 20%)" }}>
        <button
          className="sidebar-nav-item w-full"
          title={collapsed ? "Feedback" : undefined}
        >
          <MessageSquare size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Feedback</span>}
        </button>
        <button
          className="sidebar-nav-item w-full"
          title={collapsed ? "Language" : undefined}
        >
          <Globe size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">English</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          background: "#141B3D",
          borderColor: "rgba(0, 245, 255, 0.4)",
          color: "#00F5FF",
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
