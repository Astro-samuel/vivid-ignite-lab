import { useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, GraduationCap, LayoutDashboard, BookOpen, Cpu, Package, Zap,
  Trophy, User, LogOut, LogIn, Terminal, MessageSquareHeart, PlusCircle,
  Bot, AlertTriangle, BarChart3, Lightbulb, X, Braces, Library,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navSections = [
  {
    label: "Learn",
    items: [
      { icon: Home,            label: "Home",         path: "/" },
      { icon: GraduationCap,   label: "Learn",        path: "/learn" },
      { icon: LayoutDashboard, label: "Dashboard",    path: "/dashboard" },
      { icon: Trophy,          label: "Achievements", path: "/achievements" },
    ],
  },
  {
    label: "Build",
    items: [
      { icon: BookOpen, label: "Catalog",       path: "/catalog" },
      { icon: Cpu,      label: "My Components", path: "/components" },
      { icon: Package,  label: "Kits",          path: "/kits" },
      { icon: Zap,      label: "Generate",      path: "/generate" },
      { icon: Terminal, label: "IDE",           path: "/ide" },
    ],
  },
  {
    label: "Reference",
    items: [
      { icon: Braces,        label: "Snippets",     path: "/snippets" },
      { icon: AlertTriangle, label: "Error DB",     path: "/errors" },
      { icon: BarChart3,     label: "Insights",     path: "/insights" },
      { icon: Lightbulb,     label: "Think Bigger", path: "/think-bigger" },
      { icon: Library,       label: "Resources",    path: "/resources" },
    ],
  },
  {
    label: "More",
    items: [
      { icon: MessageSquareHeart, label: "Feedback",       path: "/feedback" },
      { icon: PlusCircle,         label: "Submit Project", path: "/submit-project" },
      { icon: Bot,                label: "AI Settings",    path: "/ai-settings" },
    ],
  },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

/** Logo mark: a chip footprint on a green tile with a thick edge. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect y="2" width="32" height="30" rx="9" fill="hsl(96 100% 30%)" />
      <rect width="32" height="29" rx="9" fill="hsl(96 98% 40%)" />
      <circle cx="16" cy="14.5" r="5" stroke="#fff" strokeWidth="3" />
      <path d="M3.5 14.5h7.5M21 14.5h7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
export default function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    if (savedScroll && navRef.current) {
      navRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    sessionStorage.setItem("sidebar-scroll", e.currentTarget.scrollTop.toString());
  };

  const isProfileActive = location.pathname === "/profile";

  const sidebarContent = (
    <aside className="flex flex-col h-full overflow-hidden select-none sidebar-aside" aria-label="Primary">
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0 sidebar-header">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg"
          aria-label="ArduinoLab home"
        >
          <LogoMark />
          <div>
            <p className="text-[26px] leading-none sidebar-logo-text">arduinolab</p>
          </div>
        </Link>
        {mobile && (
          <button
            onClick={onClose}
            title="Close navigation"
            aria-label="Close navigation"
            className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer sidebar-close-btn"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav
        ref={navRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 pt-5 pb-6 space-y-6"
      >
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="silk px-4 mb-2 sidebar-section-label">{section.label}</p>
            <div>
              {section.items.map(({ icon: Icon, label, path }) => {
                const isActive =
                  location.pathname === path ||
                  (path !== "/" && location.pathname.startsWith(path));
                return (
                  <Link
                    key={path}
                    to={path}
                    id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`duo-nav-item ${isActive ? "active" : ""}`}
                  >
                    <Icon size={22} strokeWidth={2.25} className="flex-shrink-0" />
                    <span className="flex-1 truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="silk px-4 mb-2 sidebar-section-label">Account</p>
          <div>
            <Link
              to="/profile"
              onClick={onClose}
              aria-current={isProfileActive ? "page" : undefined}
              className={`duo-nav-item ${isProfileActive ? "active" : ""}`}
            >
              <User size={22} strokeWidth={2.25} className="flex-shrink-0" />
              <span className="flex-1 truncate">Profile</span>
            </Link>

            {user ? (
              <button
                onClick={async () => { await signOut(); navigate("/auth"); onClose?.(); }}
                className="duo-nav-item w-full text-left sidebar-signout-btn"
              >
                <LogOut size={22} strokeWidth={2.25} className="flex-shrink-0" />
                <span>Sign out</span>
              </button>
            ) : (
              <button
                onClick={() => { navigate("/auth"); onClose?.(); }}
                className="clay-btn clay-btn-primary w-full mt-2 sidebar-signin-btn"
              >
                <LogIn size={16} />
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );

  if (mobile) return sidebarContent;

  return <div className="hidden md:flex flex-shrink-0">{sidebarContent}</div>;
}
