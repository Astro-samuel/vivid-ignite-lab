import { Link } from "react-router-dom";
import { Zap, BookOpen, Trophy, Package, ArrowRight, Cpu, Star, Clock, Lightbulb, Code, Rocket } from "lucide-react";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion } from "framer-motion";

const featuredProjects = [
  { emoji: "💡", title: "LED Blink Tutorial", desc: "The classic 'Hello World' of Arduino — make an LED blink!", difficulty: "beginner", time: "15 mins", xp: 50, id: 1 },
  { emoji: "🌡️", title: "Temperature Monitor", desc: "Read temperature data and display it on your computer.", difficulty: "beginner", time: "30 mins", xp: 75, id: 2 },
  { emoji: "🤖", title: "Servo Motor Control", desc: "Control servo motors for precise angular movements.", difficulty: "intermediate", time: "45 mins", xp: 100, id: 3 },
  { emoji: "🌈", title: "RGB LED Mixer", desc: "Mix colors with an RGB LED and potentiometers.", difficulty: "beginner", time: "30 mins", xp: 80, id: 4 },
];

const quickActions = [
  { icon: Zap, title: "Generate Project", desc: "Let AI create a custom project based on your components", path: "/generate", accent: "var(--primary)" },
  { icon: Lightbulb, title: "Think Bigger", desc: "Get innovative project ideas that push boundaries", path: "/think-bigger", accent: "var(--purple)" },
  { icon: Trophy, title: "Achievements", desc: "Track your progress and earn badges", path: "/achievements", accent: "var(--secondary)" },
  { icon: Package, title: "Starter Kits", desc: "Browse pre-configured component kits", path: "/kits", accent: "var(--success)" },
];

const howItWorks = [
  { step: "1", icon: Cpu, title: "Add Components", desc: "Tell us what Arduino components you have in your toolkit.", accent: "var(--primary)" },
  { step: "2", icon: Zap, title: "Generate Projects", desc: "AI creates custom projects tailored to your skill level.", accent: "var(--purple)" },
  { step: "3", icon: Code, title: "Build & Learn", desc: "Follow step-by-step instructions with code and simulation.", accent: "var(--success)" },
  { step: "4", icon: Rocket, title: "Level Up", desc: "Earn XP, unlock achievements, and tackle harder projects.", accent: "var(--secondary)" },
];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cls =
    difficulty === "beginner" ? "badge-beginner"
    : difficulty === "intermediate" ? "badge-intermediate"
    : "badge-advanced";
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${cls}`}>{difficulty}</span>;
}

export default function Index() {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative px-8 pt-16 pb-20 overflow-hidden" style={{ background: "hsl(var(--sidebar-background))" }}>
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, hsl(var(--purple) / 0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, hsl(var(--primary) / 0.03) 0%, transparent 40%)",
            }}
          />

          <div className="relative max-w-3xl mx-auto text-center">
            <FadeInView>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border text-sm font-medium"
                style={{ background: "hsl(var(--purple) / 0.06)", borderColor: "hsl(var(--purple) / 0.15)", color: "hsl(var(--purple))" }}
              >
                <Zap size={14} /> AI-Powered Arduino Learning Platform
              </div>
            </FadeInView>

            <FadeInView delay={0.1}>
              <h1 className="font-black mb-6 leading-tight" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}>
                <span style={{ color: "hsl(var(--foreground))" }}>Build Amazing</span>
                <br />
                <span className="gradient-text-hero">
                  Arduino Projects
                </span>
              </h1>
            </FadeInView>

            <FadeInView delay={0.2}>
              <p className="text-base mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                Tell us what components you have, and our AI will generate custom Arduino projects
                tailored to your skill level. Learn, build, and level up!
              </p>
            </FadeInView>

            <FadeInView delay={0.3}>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/components">
                  <button
                    className="px-7 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-200 hover:translate-y-[-1px]"
                    style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 2px 12px hsl(var(--primary) / 0.2)" }}
                  >
                    <Cpu size={16} /> Add My Components
                  </button>
                </Link>
                <Link to="/catalog">
                  <button
                    className="px-7 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border transition-all duration-200 hover:translate-y-[-1px] hover:bg-white/5"
                    style={{ borderColor: "hsl(var(--purple) / 0.3)", color: "hsl(var(--purple))" }}
                  >
                    <BookOpen size={16} /> Browse Projects
                  </button>
                </Link>
              </div>
            </FadeInView>

            {/* Stats */}
            <FadeInView delay={0.4}>
              <div className="flex gap-12 justify-center mt-16">
                {[
                  { value: "50+", label: "Projects", accent: "var(--primary)" },
                  { value: "100+", label: "Components", accent: "var(--purple)" },
                  { value: "AI", label: "Powered", accent: "var(--secondary)" },
                ].map(({ value, label, accent }) => (
                  <div key={label} className="text-center">
                    <p className="font-black text-3xl" style={{ color: `hsl(${accent})` }}>{value}</p>
                    <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
                  </div>
                ))}
              </div>
            </FadeInView>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-8 py-14">
          <div className="max-w-5xl mx-auto">
            <FadeInView>
              <h2 className="text-xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }}>Quick Actions</h2>
              <p className="mb-8 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Jump into action with these shortcuts</p>
            </FadeInView>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map(({ icon: Icon, title, desc, path, accent }) => (
                <motion.div key={path} variants={staggerItem}>
                  <Link to={path}>
                    <MotionCard
                      className="rounded-xl p-5 h-full cursor-pointer group border"
                      style={{ background: `hsl(${accent} / 0.04)`, borderColor: `hsl(${accent} / 0.1)` }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105"
                        style={{ background: `hsl(${accent} / 0.08)`, border: `1px solid hsl(${accent} / 0.15)` }}
                      >
                        <Icon size={18} style={{ color: `hsl(${accent})` }} />
                      </div>
                      <h3 className="font-bold text-sm mb-1.5" style={{ color: "hsl(var(--foreground))" }}>{title}</h3>
                      <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>{desc}</p>
                      <span className="text-xs font-semibold flex items-center gap-1 transition-all duration-200 group-hover:gap-2" style={{ color: `hsl(${accent})` }}>
                        Get Started <ArrowRight size={12} />
                      </span>
                    </MotionCard>
                  </Link>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-8 py-14" style={{ background: "hsl(var(--sidebar-background))" }}>
          <div className="max-w-5xl mx-auto">
            <FadeInView className="text-center mb-10">
              <p className="text-xs font-semibold mb-2" style={{ color: "hsl(var(--purple))" }}>How It Works</p>
              <h2 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>From Components to Complete Projects</h2>
            </FadeInView>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map(({ step, icon: Icon, title, desc, accent }) => (
                <motion.div key={step} variants={staggerItem} className="text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: `hsl(${accent} / 0.06)`, border: `1px solid hsl(${accent} / 0.12)` }}
                  >
                    <Icon size={22} style={{ color: `hsl(${accent})` }} />
                  </div>
                  <div
                    className="text-xs font-bold mb-2 inline-block px-2 py-0.5 rounded-full"
                    style={{ background: `hsl(${accent} / 0.08)`, color: `hsl(${accent})` }}
                  >
                    Step {step}
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: "hsl(var(--foreground))" }}>{title}</h3>
                  <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{desc}</p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="px-8 py-14">
          <div className="max-w-5xl mx-auto">
            <FadeInView>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "hsl(var(--secondary))" }}>Featured</p>
                  <h2 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>Popular Projects to Get Started</h2>
                </div>
                <Link to="/catalog">
                  <button className="px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 hover:translate-y-[-1px]" style={{ borderColor: "hsl(var(--primary) / 0.2)", color: "hsl(var(--primary))" }}>
                    View All
                  </button>
                </Link>
              </div>
            </FadeInView>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProjects.map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <Link to={`/project/${p.id}`}>
                    <MotionCard
                      className="rounded-xl border p-5 cursor-pointer group"
                      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    >
                      <div className="text-3xl mb-3">{p.emoji}</div>
                      <h3 className="font-bold text-sm mb-1.5" style={{ color: "hsl(var(--foreground))" }}>{p.title}</h3>
                      <p className="text-xs mb-3 line-clamp-2" style={{ color: "hsl(var(--muted-foreground))" }}>{p.desc}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <DifficultyBadge difficulty={p.difficulty} />
                      </div>
                      <div className="flex items-center justify-between text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <span className="flex items-center gap-1"><Clock size={11} /> {p.time}</span>
                        <span className="font-bold" style={{ color: "hsl(var(--secondary))" }}>+{p.xp} XP</span>
                      </div>
                      <div
                        className="w-full py-2 rounded-lg text-xs font-bold text-center transition-all duration-200 group-hover:translate-y-[-1px]"
                        style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                      >
                        Start Project
                      </div>
                    </MotionCard>
                  </Link>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-8 py-16" style={{ background: "hsl(var(--sidebar-background))" }}>
          <FadeInView className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3" style={{ color: "hsl(var(--foreground))" }}>Ready to Start Building?</h2>
            <p className="text-sm mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>
              Add your components and let AI create the perfect project for you.
            </p>
            <Link to="/generate">
              <button
                className="px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto transition-all duration-200 hover:translate-y-[-1px]"
                style={{ background: "hsl(var(--purple))", color: "hsl(var(--foreground))", boxShadow: "0 2px 12px hsl(var(--purple) / 0.2)" }}
              >
                <Zap size={16} /> Generate Your First Project
              </button>
            </Link>
          </FadeInView>
        </section>
      </div>
    </Layout>
  );
}
