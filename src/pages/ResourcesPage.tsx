import { BookOpen, Youtube, FileCode, Globe, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import { motion } from "framer-motion";

interface Resource {
  title: string;
  description: string;
  url: string;
  category: "docs" | "videos" | "libraries" | "community";
}

const resources: Resource[] = [
  // Official Docs
  { title: "Arduino Official Documentation", description: "Complete reference for all Arduino functions, boards, and libraries", url: "https://docs.arduino.cc/", category: "docs" },
  { title: "Arduino Language Reference", description: "Full programming language reference for all Arduino functions and syntax", url: "https://www.arduino.cc/reference/en/", category: "docs" },
  // Video Tutorials
  { title: "Arduino Getting Started", description: "YouTube search for beginner video tutorials to start your Arduino journey", url: "https://www.youtube.com/results?search_query=arduino+getting+started+tutorial", category: "videos" },
  { title: "Advanced Arduino Projects", description: "Complex project walkthroughs for intermediate learners looking to level up", url: "https://www.youtube.com/results?search_query=advanced+arduino+projects", category: "videos" },
  // Code Libraries
  { title: "Arduino Library Manager", description: "Browse and install community libraries directly from the Arduino IDE", url: "https://www.arduino.cc/reference/en/libraries/", category: "libraries" },
  { title: "GitHub Arduino Libraries", description: "Official Arduino libraries repository with source code and documentation", url: "https://github.com/arduino-libraries", category: "libraries" },
  // Community
  { title: "Arduino Forums", description: "Get help and share projects with the global Arduino community", url: "https://forum.arduino.cc/", category: "community" },
  { title: "Arduino Project Hub", description: "Browse thousands of community-submitted projects with full tutorials", url: "https://projecthub.arduino.cc/", category: "community" },
];

const categoryConfig = {
  docs: { label: "Official Docs", icon: BookOpen, color: "hsl(var(--primary))", bg: "hsl(var(--primary) / 0.08)", border: "hsl(var(--primary) / 0.25)" },
  videos: { label: "Video Tutorials", icon: Youtube, color: "hsl(var(--destructive))", bg: "hsl(var(--destructive) / 0.08)", border: "hsl(var(--destructive) / 0.25)" },
  libraries: { label: "Code Libraries", icon: FileCode, color: "hsl(var(--success))", bg: "hsl(var(--success) / 0.08)", border: "hsl(var(--success) / 0.25)" },
  community: { label: "Community", icon: Globe, color: "hsl(var(--purple))", bg: "hsl(var(--purple) / 0.08)", border: "hsl(var(--purple) / 0.25)" },
};

const categories = ["docs", "videos", "libraries", "community"] as const;

export default function ResourcesPage() {
  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <FadeInView>
          <h1 className="text-3xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
            <span className="gradient-text-teal">📚 Resources</span>
          </h1>
          <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Quick reference hub for official Arduino resources, community platforms, and learning materials.
          </p>
        </FadeInView>

        <div className="space-y-8">
          {categories.map((cat, catIdx) => {
            const config = categoryConfig[cat];
            const Icon = config.icon;
            const catResources = resources.filter(r => r.category === cat);

            return (
              <FadeInView key={cat} delay={catIdx * 0.1}>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: config.bg, border: `1px solid ${config.border}` }}
                  >
                    <Icon size={16} style={{ color: config.color }} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: config.color }}>{config.label}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catResources.map((resource, i) => (
                    <motion.a
                      key={i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl p-5 border transition-all group cursor-pointer"
                      style={{
                        background: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                      }}
                      whileHover={{
                        borderColor: config.color,
                        scale: 1.01,
                      }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIdx * 0.1 + i * 0.05 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3
                            className="font-bold text-sm mb-1 transition-colors"
                            style={{ color: "hsl(var(--foreground))" }}
                          >
                            {resource.title}
                          </h3>
                          <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                            {resource.description}
                          </p>
                        </div>
                        <ExternalLink
                          size={14}
                          className="flex-shrink-0 mt-0.5 transition-colors"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </FadeInView>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
