import { useState } from "react";
import { Lightbulb, Zap, RefreshCw, Loader2, ArrowRight, Plane, Fingerprint, Waves, Brain, Leaf, Radio, Music, Scan, Shield, Network } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
  drone: Plane,
  biometric: Fingerprint,
  ocean: Waves,
  brain: Brain,
  farm: Leaf,
  sat: Radio,
  guitar: Music,
  diffraction: Scan,
  glove: Shield,
  mesh: Network
};

const allBigIdeas = [
  { id: 1, iconKey: "drone", title: "Autonomous Drone Navigation System", desc: "Build a drone that autonomously maps indoor environments using LIDAR and computer vision, creating real-time 3D maps.", tags: ["LIDAR", "Computer Vision", "IMU", "ESP32"], level: "Expert", impact: "Revolutionary" },
  { id: 2, iconKey: "biometric", title: "Biometric Smart Home Hub", desc: "Create a home automation system that recognizes residents by fingerprint and voice, auto-adjusting lighting, temperature, and security.", tags: ["Fingerprint Sensor", "Voice Recognition", "Smart Home", "Raspberry Pi"], level: "Advanced", impact: "Life-Changing" },
  { id: 3, iconKey: "ocean", title: "Ocean Pollution Monitor Buoy", desc: "Deploy a self-powered floating sensor that tracks water quality, pH, temperature, and sends data via LoRa to a cloud dashboard.", tags: ["pH Sensor", "LoRa", "Solar Panel", "GPS"], level: "Advanced", impact: "Environmental" },
  { id: 4, iconKey: "brain", title: "Brain-Computer Interface Prototype", desc: "Build a basic EEG headset that reads brainwave patterns and controls a simple game using neural signals.", tags: ["EEG Sensor", "Signal Processing", "BLE", "ML"], level: "Expert", impact: "Future Tech" },
  { id: 5, iconKey: "farm", title: "AI-Powered Vertical Farm", desc: "Design an automated vertical farm that uses machine learning to optimize nutrient levels, lighting schedules, and harvesting.", tags: ["pH Sensor", "Grow Lights", "Camera", "AI"], level: "Advanced", impact: "Sustainable" },
  { id: 6, iconKey: "sat", title: "CubeSat Ground Station", desc: "Build a ground station to track and communicate with amateur CubeSats using SDR and antenna tracking.", tags: ["SDR", "Antenna", "Stepper Motor", "GPS"], level: "Expert", impact: "Revolutionary" },
  { id: 7, iconKey: "guitar", title: "AI Guitar Effects Pedal", desc: "Create a real-time audio effects processor using DSP and machine learning for custom guitar tones.", tags: ["DAC", "ADC", "DSP", "ESP32"], level: "Advanced", impact: "Life-Changing" },
  { id: 8, iconKey: "diffraction", title: "DIY Spectrometer", desc: "Build a spectrometer to analyze the chemical composition of materials using light diffraction.", tags: ["Photodiode", "Stepper Motor", "OLED", "3D Print"], level: "Advanced", impact: "Environmental" },
  { id: 9, iconKey: "glove", title: "Exoskeleton Assist Glove", desc: "Design a servo-powered glove that amplifies grip strength for rehabilitation or heavy lifting.", tags: ["Servo", "Flex Sensor", "IMU", "3D Print"], level: "Expert", impact: "Future Tech" },
  { id: 10, iconKey: "mesh", title: "Mesh Network Communicator", desc: "Build a decentralized mesh network using LoRa modules for off-grid text communication.", tags: ["LoRa", "OLED", "Battery", "ESP32"], level: "Advanced", impact: "Sustainable" },
];

// Impact is flavor metadata, not a functional state — per the "No Rainbow Rule" it no longer
// gets a different hue per sibling badge. It reads as neutral text; "level" carries the one
// accent this card needs.

export default function ThinkBiggerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState(() => {
    const shuffled = [...allBigIdeas].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  });

  const regenerate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const shuffled = [...allBigIdeas].sort(() => Math.random() - 0.5);
    setIdeas(shuffled.slice(0, 5));
    setLoading(false);
  };

  return (
    <Layout>
      <div className="px-8 py-10 max-w-4xl mx-auto">
        <FadeInView className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border text-sm font-medium" style={{ background: "hsl(var(--primary-light))", borderColor: "hsl(var(--primary) / 0.3)", color: "hsl(var(--primary))" }}>
            <Lightbulb size={14} /> Think Bigger
          </div>
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Push The <span className="shimmer-text">Boundaries</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto text-muted-foreground">
            Ambitious projects that challenge your skills and could actually change the world.
          </p>
          <button onClick={regenerate} disabled={loading} className="mt-6 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 px-6 py-3 text-sm font-bold flex items-center gap-2 mx-auto transition-all">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {loading ? "Generating..." : "New Ideas"}
          </button>
        </FadeInView>

        <div className="space-y-5">
          {ideas.map((idea) => {
            const IconComponent = iconMap[idea.iconKey] || Lightbulb;
            return (
              <motion.div key={idea.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <MotionCard className="card-neon p-6 cursor-pointer group">
                  <div className="flex gap-5">
                    <div className="p-3 rounded-xl bg-[hsl(var(--background-hover))] border border-border text-muted-foreground self-start group-hover:text-foreground transition-colors">
                      <IconComponent size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-lg text-foreground">{idea.title}</h3>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: "hsl(var(--primary-light))", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}>{idea.level}</span>
                          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-card text-muted-foreground border border-border">{idea.impact}</span>
                        </div>
                      </div>
                      <p className="text-sm mb-4 text-muted-foreground">{idea.desc}</p>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {idea.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-lg bg-[hsl(var(--background-hover))] text-muted-foreground border border-border">{tag}</span>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            localStorage.setItem("activeGeneratedProject", JSON.stringify({ id: 100 + idea.id, title: idea.title, description: idea.desc, difficulty: idea.level.toLowerCase() === "expert" ? "advanced" : idea.level.toLowerCase(), time: "120+ mins", xp: 500, components: idea.tags, source: "think-bigger" }));
                            navigate(`/project/${100 + idea.id}`);
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 group-hover:gap-3"
                          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 0 12px hsl(var(--primary) / 0.25)" }}
                        >
                          <Zap size={14} /> Start Building <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </MotionCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
