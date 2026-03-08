import { Link } from "react-router-dom";
import { Zap, BookOpen, Trophy, Package, ArrowRight, Cpu, Star, Clock, Lightbulb, Code, Rocket } from "lucide-react";
import Layout from "@/components/Layout";
import InteractiveArduinoBoard from "@/components/InteractiveArduinoBoard";

const featuredProjects = [
  { emoji: "💡", title: "LED Blink Tutorial", desc: "The classic 'Hello World' of Arduino — make an LED blink!", difficulty: "beginner", time: "15 mins", xp: 50, id: 1 },
  { emoji: "🌡️", title: "Temperature Monitor", desc: "Read temperature data and display it on your computer.", difficulty: "beginner", time: "30 mins", xp: 75, id: 2 },
  { emoji: "🤖", title: "Servo Motor Control", desc: "Control servo motors for precise angular movements.", difficulty: "intermediate", time: "45 mins", xp: 100, id: 3 },
  { emoji: "🌈", title: "RGB LED Mixer", desc: "Mix colors with an RGB LED and potentiometers.", difficulty: "beginner", time: "30 mins", xp: 80, id: 4 },
];

const quickActions = [
  { icon: Zap, title: "Generate Project", desc: "Let AI create a custom project based on your components", path: "/generate", color: "#00F5FF", bg: "rgba(0,245,255,0.06)", border: "rgba(0,245,255,0.15)" },
  { icon: Lightbulb, title: "Think Bigger", desc: "Get innovative project ideas that push boundaries", path: "/think-bigger", color: "#B744FF", bg: "rgba(183,68,255,0.06)", border: "rgba(183,68,255,0.15)" },
  { icon: Trophy, title: "Achievements", desc: "Track your progress and earn badges", path: "/achievements", color: "#FFD700", bg: "rgba(255,215,0,0.06)", border: "rgba(255,215,0,0.15)" },
  { icon: Package, title: "Starter Kits", desc: "Browse pre-configured component kits", path: "/kits", color: "#00FF88", bg: "rgba(0,255,136,0.06)", border: "rgba(0,255,136,0.15)" },
];

const howItWorks = [
  { step: "1", icon: Cpu, title: "Add Components", desc: "Tell us what Arduino components you have in your toolkit.", color: "#00F5FF" },
  { step: "2", icon: Zap, title: "Generate Projects", desc: "AI creates custom projects tailored to your skill level.", color: "#B744FF" },
  { step: "3", icon: Code, title: "Build & Learn", desc: "Follow step-by-step instructions with code and simulation.", color: "#00FF88" },
  { step: "4", icon: Rocket, title: "Level Up", desc: "Earn XP, unlock achievements, and tackle harder projects.", color: "#FFD700" },
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
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative px-8 pt-16 pb-20 overflow-hidden" style={{ background: "hsl(232, 48%, 6%)" }}>
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(183,68,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0,245,255,0.05) 0%, transparent 40%)",
            }}
          />

          <div className="relative max-w-3xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border text-sm font-medium"
              style={{ background: "rgba(183,68,255,0.08)", borderColor: "rgba(183,68,255,0.25)", color: "#B744FF" }}
            >
              <Zap size={14} /> AI-Powered Arduino Learning Platform
            </div>

            <h1 className="font-black mb-6 leading-tight" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}>
              <span style={{ color: "#FFFFFF" }}>Build Amazing</span>
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #00F5FF, #B744FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Arduino Projects
              </span>
            </h1>

            <p className="text-base mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "#A0AED9" }}>
              Tell us what components you have, and our AI will generate custom Arduino projects
              tailored to your skill level. Learn, build, and level up!
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/components">
                <button
                  className="px-7 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,245,255,0.3)" }}
                >
                  <Cpu size={16} /> Add My Components
                </button>
              </Link>
              <Link to="/catalog">
                <button
                  className="px-7 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border transition-all hover:scale-105 hover:bg-white/5"
                  style={{ borderColor: "rgba(183,68,255,0.4)", color: "#B744FF" }}
                >
                  <BookOpen size={16} /> Browse Projects
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 justify-center mt-16">
              {[
                { value: "50+", label: "Projects", color: "#00F5FF" },
                { value: "100+", label: "Components", color: "#B744FF" },
                { value: "AI", label: "Powered", color: "#FFD700" },
              ].map(({ value, label, color }) => (
                <div key={label} className="text-center">
                  <p className="font-black text-3xl" style={{ color }}>{value}</p>
                  <p className="text-xs mt-1" style={{ color: "#A0AED9" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-8 py-14">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold mb-1" style={{ color: "#FFFFFF" }}>Quick Actions</h2>
            <p className="mb-8 text-sm" style={{ color: "#A0AED9" }}>Jump into action with these shortcuts</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map(({ icon: Icon, title, desc, path, color, bg, border }) => (
                <Link key={path} to={path}>
                  <div
                    className="rounded-xl p-5 h-full cursor-pointer group border transition-all hover:-translate-y-1"
                    style={{ background: bg, borderColor: border }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ background: `${color}15`, border: `1px solid ${color}33` }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>
                    <h3 className="font-bold text-sm mb-1.5" style={{ color: "#FFFFFF" }}>{title}</h3>
                    <p className="text-xs mb-3" style={{ color: "#A0AED9" }}>{desc}</p>
                    <span className="text-xs font-semibold flex items-center gap-1 transition-all group-hover:gap-2" style={{ color }}>
                      Get Started <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-8 py-14" style={{ background: "hsl(232, 48%, 6%)" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold mb-2" style={{ color: "#B744FF" }}>How It Works</p>
              <h2 className="text-xl font-bold" style={{ color: "#FFFFFF" }}>From Components to Complete Projects</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map(({ step, icon: Icon, title, desc, color }) => (
                <div key={step} className="text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: `${color}12`, border: `1px solid ${color}30` }}
                  >
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div
                    className="text-xs font-bold mb-2 inline-block px-2 py-0.5 rounded-full"
                    style={{ background: `${color}15`, color }}
                  >
                    Step {step}
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: "#FFFFFF" }}>{title}</h3>
                  <p className="text-xs" style={{ color: "#A0AED9" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="px-8 py-14">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#FFD700" }}>Featured</p>
                <h2 className="text-xl font-bold" style={{ color: "#FFFFFF" }}>Popular Projects to Get Started</h2>
              </div>
              <Link to="/catalog">
                <button className="px-4 py-2 rounded-lg text-xs font-semibold border transition-all hover:scale-105" style={{ borderColor: "rgba(0,245,255,0.3)", color: "#00F5FF" }}>
                  View All
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProjects.map((p) => (
                <Link key={p.id} to={`/project/${p.id}`}>
                  <div
                    className="rounded-xl border p-5 cursor-pointer group transition-all hover:-translate-y-1"
                    style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 24%)" }}
                  >
                    <div className="text-3xl mb-3">{p.emoji}</div>
                    <h3 className="font-bold text-sm mb-1.5" style={{ color: "#FFFFFF" }}>{p.title}</h3>
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: "#A0AED9" }}>{p.desc}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <DifficultyBadge difficulty={p.difficulty} />
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3" style={{ color: "#A0AED9" }}>
                      <span className="flex items-center gap-1"><Clock size={11} /> {p.time}</span>
                      <span className="font-bold" style={{ color: "#FFD700" }}>+{p.xp} XP</span>
                    </div>
                    <div
                      className="w-full py-2 rounded-lg text-xs font-bold text-center transition-all group-hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", color: "#0A0E27" }}
                    >
                      Start Project
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-8 py-16" style={{ background: "hsl(232, 48%, 6%)" }}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#FFFFFF" }}>Ready to Start Building?</h2>
            <p className="text-sm mb-8" style={{ color: "#A0AED9" }}>
              Add your components and let AI create the perfect project for you.
            </p>
            <Link to="/generate">
              <button
                className="px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #B744FF, #FF1493)", color: "#FFFFFF", boxShadow: "0 0 25px rgba(183,68,255,0.3)" }}
              >
                <Zap size={16} /> Generate Your First Project
              </button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
