import { useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, GraduationCap, LayoutDashboard, BookOpen, Cpu, Package, Zap,
  Trophy, User, LogOut, LogIn, Code, MessageSquareHeart, PlusCircle,
  Bot, AlertTriangle, BarChart3, Lightbulb, X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

// ── Nav sections — grouped, single neutral icon color, accent only on active ──
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
      <rect x="10" y="12" width="28" height="22" rx="7" fill="hsl(var(--primary))"/>
      {/* Antenna */}
      <rect x="22" y="6" width="4" height="7" rx="2" fill="hsl(var(--primary))" opacity="0.7"/>
      <circle cx="24" cy="5" r="3" fill="hsl(var(--primary))" opacity="0.5"/>
      {/* Eyes */}
      <rect x="15" y="18" width="7" height="7" rx="3" fill="white"/>
      <rect x="26" y="18" width="7" height="7" rx="3" fill="white"/>
      <circle cx="18" cy="21" r="2.5" fill="hsl(var(--primary-dark))"/>
      <circle cx="29" cy="21" r="2.5" fill="hsl(var(--primary-dark))"/>
      {/* Eye shine */}
      <circle cx="19" cy="20" r="1" fill="white"/>
      <circle cx="30" cy="20" r="1" fill="white"/>
      {/* Mouth */}
      <rect x="18" y="28" width="12" height="3" rx="1.5" fill="white" opacity="0.85"/>
      {/* Body */}
      <rect x="14" y="35" width="20" height="10" rx="5" fill="hsl(var(--primary))" opacity="0.7"/>
      {/* Body detail */}
      <rect x="19" y="38" width="10" height="4" rx="2" fill="hsl(var(--primary))"/>
    </svg>
  );
}

export default function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  // Restore scroll position when sidebar mounts
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    if (savedScroll && navRef.current) {
      navRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, []);

  // Save scroll position when user scrolls the navigation
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    sessionStorage.setItem("sidebar-scroll", e.currentTarget.scrollTop.toString());
  };

  const isProfileActive = location.pathname === "/profile";

  const sidebarContent = (
    <aside className="flex flex-col h-full overflow-hidden select-none sidebar-aside">
      {/* ── Logo / Brand ── */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0 sidebar-header">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => { navigate("/"); onClose?.(); }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm sidebar-logo-icon">
            A
          </div>
          <div>
            <p className="font-black text-sm leading-none sidebar-logo-text">
              ArduinoLab
            </p>
            <p className="text-[10px] font-semibold sidebar-logo-sub">
              Learn Electronics
            </p>
          </div>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            title="Close sidebar"
            aria-label="Close sidebar"
            className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer sidebar-close-btn"
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
          <p className="text-xs font-bold mt-1 sidebar-mascot-txt-primary">
            Keep it up! 🎉
          </p>
        ) : (
          <p className="text-xs font-bold mt-1 sidebar-mascot-txt-muted">
            Let's build things!
          </p>
        )}
      </div>

      {/* ── Navigation — everything scrolls together, including Profile/Sign out ── */}
      <nav
        ref={navRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 pb-4 space-y-4"
      >
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-black uppercase tracking-widest px-2 mb-1 sidebar-section-label">
              {section.label}
            </p>
            <div>
              {section.items.map(({ icon: Icon, label, path }) => {
                const isActive = location.pathname === path ||
                  (path !== "/" && location.pathname.startsWith(path));
                return (
                  <Link
                    key={path}
                    to={path}
                    id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={onClose}
                    className={`duo-nav-item ${isActive ? "active" : ""}`}
                  >
                    <Icon size={18} className="flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="flex-1 truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest px-2 mb-1 sidebar-section-label">
            Account
          </p>
          <div>
            <Link
              to="/profile"
              onClick={onClose}
              className={`duo-nav-item ${isProfileActive ? "active" : ""}`}
            >
              <User size={18} strokeWidth={isProfileActive ? 2.5 : 2} className="flex-shrink-0" />
              <span className="flex-1 truncate">Profile</span>
            </Link>

            {user ? (
              <button
                onClick={async () => { await signOut(); navigate("/auth"); onClose?.(); }}
                className="duo-nav-item w-full text-left sidebar-signout-btn"
              >
                <LogOut size={18} className="flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => { navigate("/auth"); onClose?.(); }}
                className="clay-btn clay-btn-primary w-full mt-1 sidebar-signin-btn"
              >
                <LogIn size={16} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>
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
