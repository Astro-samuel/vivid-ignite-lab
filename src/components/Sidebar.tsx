import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, GraduationCap, LayoutDashboard, BookOpen, Cpu, Package, Zap,
  Trophy, User, LogOut, LogIn, Code, MessageSquareHeart, PlusCircle,
  Bot, AlertTriangle, BarChart3, Lightbulb, X, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

// ── Nav sections — grouped like Duolingo ──
const navSections = [
  {
    label: "Learn",
    items: [
      { icon: Home,            label: "Home",          path: "/" },
      { icon: GraduationCap,  label: "Learn",         path: "/learn" },
      { icon: LayoutDashboard, label: "Dashboard",    path: "/dashboard" },
      { icon: Trophy,          label: "Achievements", path: "/achievements" },
    ],
  },
  {
    label: "Build",
    items: [
      { icon: BookOpen, label: "Catalog",        path: "/catalog" },
      { icon: Cpu,      label: "My Components",  path: "/components" },
      { icon: Package,  label: "Kits",           path: "/kits" },
      { icon: Zap,      label: "Generate",       path: "/generate" },
      { icon: Code,     label: "IDE",            path: "/ide" },
    ],
  },
  {
    label: "Resources",
    items: [
      { icon: Code,           label: "Snippets",       path: "/snippets" },
      { icon: AlertTriangle,  label: "Error DB",       path: "/errors" },
      { icon: BarChart3,      label: "Insights",       path: "/insights" },
      { icon: Lightbulb,      label: "Think Bigger",   path: "/think-bigger" },
      { icon: BookOpen,       label: "Resources",      path: "/resources" },
    ],
  },
  {
    label: "Settings",
    items: [
      { icon: MessageSquareHeart, label: "Feedback",      path: "/feedback" },
      { icon: PlusCircle,         label: "Submit Project", path: "/submit-project" },
      { icon: Bot,                label: "AI Settings",    path: "/ai-settings" },
    ],
  },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

// Robot mascot SVG
function RobotMascot() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <rect x="10" y="12" width="28" height="22" rx="7" fill="#6366F1"/>
      {/* Antenna */}
      <rect x="22" y="6" width="4" height="7" rx="2" fill="#818CF8"/>
      <circle cx="24" cy="5" r="3" fill="#A5B4FC"/>
      {/* Eyes */}
      <rect x="15" y="18" width="7" height="7" rx="3" fill="white"/>
      <rect x="26" y="18" width="7" height="7" rx="3" fill="white"/>
      <circle cx="18" cy="21" r="2.5" fill="#312E81"/>
      <circle cx="29" cy="21" r="2.5" fill="#312E81"/>
      {/* Eye shine */}
      <circle cx="19" cy="20" r="1" fill="white"/>
      <circle cx="30" cy="20" r="1" fill="white"/>
      {/* Mouth */}
      <rect x="18" y="28" width="12" height="3" rx="1.5" fill="#E0E7FF"/>
      {/* Body */}
      <rect x="14" y="35" width="20" height="10" rx="5" fill="#818CF8"/>
      {/* Body detail */}
      <rect x="19" y="38" width="10" height="4" rx="2" fill="#6366F1"/>
    </svg>
  );
}

export default function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const sidebarContent = (
    <aside
      className="flex flex-col h-full overflow-hidden select-none"
      style={{
        width: "240px",
        background: "var(--sidebar-background)",
        borderRight: "2.5px solid var(--sidebar-border)",
      }}
    >
      {/* ── Logo / Brand ── */}
      <div
        className="flex items-center justify-between px-4 py-4 flex-shrink-0"
        style={{ borderBottom: "2px solid var(--sidebar-border)" }}
      >
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => { navigate("/"); onClose?.(); }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{
              background: "hsl(var(--primary))",
              boxShadow: "0 3px 0 hsl(var(--primary-dark))",
              border: "2px solid hsl(var(--primary-dark))",
            }}
          >
            A
          </div>
          <div>
            <p className="font-black text-sm leading-none" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(var(--foreground))" }}>
              ArduinoLab
            </p>
            <p className="text-[10px] font-semibold" style={{ color: "hsl(var(--foreground-muted))" }}>
              Learn Electronics
            </p>
          </div>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer"
            style={{ background: "var(--background-hover)", color: "hsl(var(--foreground-muted))" }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Mascot ── */}
      <div className="flex flex-col items-center py-4 flex-shrink-0">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <RobotMascot />
        </motion.div>
        {user ? (
          <p className="text-xs font-bold mt-1" style={{ color: "hsl(var(--primary))", fontFamily: "'Baloo 2', sans-serif" }}>
            Keep it up! 🎉
          </p>
        ) : (
          <p className="text-xs font-bold mt-1" style={{ color: "hsl(var(--foreground-muted))", fontFamily: "'Baloo 2', sans-serif" }}>
            Let's build things!
          </p>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p
              className="text-[10px] font-black uppercase tracking-widest px-2 mb-1"
              style={{ color: "hsl(240, 14%, 72%)", fontFamily: "'Baloo 2', sans-serif" }}
            >
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ icon: Icon, label, path }) => {
                const isActive = location.pathname === path ||
                  (path !== "/" && location.pathname.startsWith(path));
                return (
                  <Link
                    key={path}
                    to={path}
                    id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={onClose}
                    className="duo-nav-item"
                    style={
                      isActive
                        ? {
                            background: "var(--primary-light)",
                            color: "hsl(var(--primary))",
                            borderColor: "hsl(var(--primary) / 0.3)",
                            boxShadow: "0 2px 0 0 hsl(var(--primary) / 0.2)",
                          }
                        : {}
                    }
                  >
                    <Icon
                      size={18}
                      className="flex-shrink-0"
                      strokeWidth={isActive ? 2.5 : 2}
                      style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--foreground-muted))" }}
                    />
                    <span className="flex-1 truncate">{label}</span>
                    {isActive && (
                      <ChevronRight size={14} style={{ color: "hsl(var(--primary))" }} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom: Profile + Auth ── */}
      <div
        className="px-3 pb-3 pt-2 flex-shrink-0 space-y-1"
        style={{ borderTop: "2px solid var(--sidebar-border)" }}
      >
        <Link
          to="/profile"
          onClick={onClose}
          className="duo-nav-item"
          style={
            location.pathname === "/profile"
              ? {
                  background: "var(--primary-light)",
                  color: "hsl(var(--primary))",
                  borderColor: "hsl(var(--primary) / 0.3)",
                }
              : {}
          }
        >
          <User size={18} strokeWidth={location.pathname === "/profile" ? 2.5 : 2} />
          <span>Profile</span>
        </Link>

        {user ? (
          <button
            onClick={async () => { await signOut(); navigate("/auth"); onClose?.(); }}
            className="duo-nav-item w-full text-left"
            style={{ color: "hsl(0, 84%, 55%)" }}
          >
            <LogOut size={18} style={{ color: "hsl(0, 84%, 55%)" }} />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => { navigate("/auth"); onClose?.(); }}
            className="clay-btn clay-btn-primary w-full"
            style={{ borderRadius: 12, padding: "10px 16px", fontSize: "0.85rem" }}
          >
            <LogIn size={16} />
            Sign In
          </button>
        )}
      </div>
    </aside>
  );

  if (mobile) {
    return sidebarContent;
  }

  return (
    <div className="hidden md:flex flex-shrink-0">
      {sidebarContent}
    </div>
  );
}
