import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, LayoutDashboard, BookOpen, Cpu, Package, Zap, Lightbulb,
  Trophy, User, ChevronLeft, ChevronRight, LogOut, Star
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
  const navigate = useNavigate();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 border-r relative flex-shrink-0"
      style={{
        width: collapsed ? "60px" : "200px",
        background: "hsl(229, 48%, 8%)",
        borderColor: "hsl(229, 42%, 20%)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-3 py-4 border-b cursor-pointer"
        style={{ borderColor: "hsl(229, 42%, 20%)" }}
        onClick={() => navigate("/")}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)" }}
        >
          <Cpu size={16} style={{ color: "#0A0E27" }} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: "#FFFFFF" }}>Arduino AI</p>
            <p className="text-xs truncate" style={{ color: "hsl(226, 35%, 72%)" }}>Project Generator</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group`}
              style={
                isActive
                  ? {
                      background: "rgba(0,245,255,0.12)",
                      color: "#00F5FF",
                    }
                  : { color: "hsl(226, 35%, 72%)" }
              }
              title={collapsed ? label : undefined}
            >
              <Icon
                size={16}
                className="flex-shrink-0"
                style={{ color: isActive ? "#00F5FF" : "inherit" }}
              />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t" style={{ borderColor: "hsl(229, 42%, 20%)" }}>
        {/* Pro Tip */}
        {!collapsed && (
          <div
            className="mx-2 my-2 p-3 rounded-xl"
            style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.15)" }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Star size={11} style={{ color: "#FFD700" }} />
              <span className="text-xs font-bold" style={{ color: "#FFD700" }}>Pro Tip</span>
            </div>
            <p className="text-xs" style={{ color: "hsl(226, 35%, 72%)" }}>
              Add all your components to get the best project recommendations!
            </p>
          </div>
        )}

        <div className="px-2 pb-3">
          <button
            className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg w-full transition-all duration-150 hover:bg-white/5"
            style={{ color: "hsl(226, 35%, 72%)" }}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut size={16} className="flex-shrink-0" style={{ color: "#FF4500" }} />
            {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
        style={{
          background: "hsl(229, 45%, 16%)",
          borderColor: "rgba(0,245,255,0.4)",
          color: "#00F5FF",
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
