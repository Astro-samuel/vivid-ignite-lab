import { Link, useNavigate } from "react-router-dom";
import { Zap, BookOpen, Trophy, Package, ArrowRight, Cpu, Star, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import heroBg from "@/assets/hero-bg.jpg";

const featuredProjects = [
  { icon: "💡", title: "LED Blink Tutorial", desc: "The classic 'Hello World' of Arduino – make an LED blink!", difficulty: "beginner", time: "15 mins", xp: 50 },
  { icon: "🌡️", title: "Temperature Monitor", desc: "Read temperature data and display it on your computer.", difficulty: "beginner", time: "30 mins", xp: 75 },
  { icon: "🤖", title: "Servo Motor Control", desc: "Control servo motors for precise movements.", difficulty: "intermediate", time: "45 mins", xp: 100 },
  { icon: "🌈", title: "RGB LED Mixer", desc: "Mix colors with an RGB LED and potentiometers.", difficulty: "beginner", time: "30 mins", xp: 80 },
];

const quickActions = [
  { icon: Zap, title: "Generate Project", desc: "Let AI create a custom project based on your components", path: "/generate", color: "#00F5FF", bg: "rgba(0,245,255,0.08)", border: "rgba(0,245,255,0.2)" },
  { icon: Star, title: "Think Bigger", desc: "Get innovative project ideas that push boundaries", path: "/think-bigger", color: "#B744FF", bg: "rgba(183,68,255,0.08)", border: "rgba(183,68,255,0.2)" },
  { icon: Trophy, title: "Achievements", desc: "Track your progress and earn badges", path: "/achievements", color: "#FFD700", bg: "rgba(255,215,0,0.08)", border: "rgba(255,215,0,0.2)" },
  { icon: Package, title: "Starter Kits", desc: "Browse pre-configured component kits", path: "/kits", color: "#00FF88", bg: "rgba(0,255,136,0.08)", border: "rgba(0,255,136,0.2)" },
];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles =
    difficulty === "beginner"
      ? { background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }
      : difficulty === "intermediate"
      ? { background: "rgba(255,165,0,0.15)", color: "#FFA500", border: "1px solid rgba(255,165,0,0.3)" }
      : { background: "rgba(183,68,255,0.15)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.3)" };
  return <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize" style={styles}>{difficulty}</span>;
}

export default function Index() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative px-8 pt-16 pb-20 overflow-hidden" style={{ background: "hsl(229, 48%, 10%)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(0,245,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(183,68,255,0.06) 0%, transparent 50%)" }} />

          <div className="relative max-w-4xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border text-sm font-medium"
              style={{ background: "rgba(0,245,255,0.08)", borderColor: "rgba(0,245,255,0.3)", color: "#00F5FF" }}
            >
              <Zap size={14} /> AI-Powered Arduino Innovation Platform <Zap size={14} />
            </div>

            <h1 className="font-black mb-6 leading-tight" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
              <span className="gradient-text-teal">Build Amazing</span>
              <br />
              <span style={{ color: "#FFFFFF" }}>Arduino Projects</span>
            </h1>

            <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: "#A0AED9" }}>
              Tell us what components you have, and our AI will generate custom Arduino projects
              tailored to your skill level. Learn, build, and level up!
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/components">
                <button
                  className="px-8 py-3.5 rounded-2xl text-base font-bold flex items-center gap-2 transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}
                >
                  <Cpu size={18} /> Add My Components
                </button>
              </Link>
              <Link to="/catalog">
                <button
                  className="px-8 py-3.5 rounded-2xl text-base font-bold flex items-center gap-2 border transition-all hover:scale-105 hover:bg-white/5"
                  style={{ borderColor: "rgba(183,68,255,0.5)", color: "#B744FF" }}
                >
                  <BookOpen size={18} /> Browse Projects
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 justify-center mt-14">
              {[
                { value: "50+", label: "Projects", color: "#00F5FF" },
                { value: "100+", label: "Components", color: "#B744FF" },
                { value: "AI", label: "Powered", color: "#FFD700" },
              ].map(({ value, label, color }) => (
                <div key={label} className="text-center">
                  <p className="font-black text-4xl font-orbitron" style={{ color }}>{value}</p>
                  <p className="text-sm mt-1" style={{ color: "#A0AED9" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#FFFFFF" }}>Quick Actions</h2>
            <p className="mb-8 text-sm" style={{ color: "#A0AED9" }}>Jump into action with these shortcuts</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map(({ icon: Icon, title, desc, path, color, bg, border }) => (
                <Link key={path} to={path}>
                  <div
                    className="rounded-2xl p-5 h-full cursor-pointer group border transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: bg, borderColor: border }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ background: `${color}22`, border: `1px solid ${color}44` }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <h3 className="font-bold text-base mb-2" style={{ color: "#FFFFFF" }}>{title}</h3>
                    <p className="text-sm mb-4" style={{ color: "#A0AED9" }}>{desc}</p>
                    <span className="text-sm font-semibold flex items-center gap-1 transition-all group-hover:gap-2" style={{ color }}>
                      Get Started <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="px-8 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#FFD700" }}>Featured Projects</p>
                <h2 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>Popular Projects to Get Started</h2>
              </div>
              <Link to="/catalog">
                <button className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:scale-105" style={{ borderColor: "rgba(0,245,255,0.4)", color: "#00F5FF" }}>
                  View All
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProjects.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl border p-5 cursor-pointer group transition-all hover:-translate-y-1"
                  style={{ background: "hsl(229, 45%, 16%)", borderColor: "hsl(229, 42%, 28%)" }}
                >
                  <div className="text-3xl mb-3 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{p.icon}</div>
                  <h3 className="font-bold mb-2" style={{ color: "#FFFFFF" }}>{p.title}</h3>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: "#A0AED9" }}>{p.desc}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <DifficultyBadge difficulty={p.difficulty} />
                  </div>
                  <div className="flex items-center justify-between text-xs mb-4" style={{ color: "#A0AED9" }}>
                    <span className="flex items-center gap-1"><Clock size={11} /> {p.time}</span>
                    <span className="font-bold" style={{ color: "#FFD700" }}>+{p.xp} XP</span>
                  </div>
                  <button
                    onClick={() => navigate("/ide")}
                    className="w-full py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", color: "#0A0E27", boxShadow: "0 0 12px rgba(0,245,255,0.25)" }}
                  >
                    Start This Project
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
