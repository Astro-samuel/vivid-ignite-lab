import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import { allProjectsData, ProjectItem } from "@/data/projectsData";
import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectComponentsList from "@/components/project/ProjectComponentsList";
import ProjectInstructions from "@/components/project/ProjectInstructions";
import ProjectCodeSection from "@/components/project/ProjectCodeSection";
import ArduinoSetupGuide from "@/components/ArduinoSetupGuide";
import { useAuth } from "@/contexts/AuthContext";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    // 1. Check generated projects from localStorage
    const savedGenerated = localStorage.getItem("activeGeneratedProject");
    if (savedGenerated) {
      try {
        const parsed = JSON.parse(savedGenerated);
        if (String(parsed.id) === String(id)) {
          setProject({
            id: parsed.id,
            emoji: parsed.emoji || "🚀",
            title: parsed.title,
            desc: parsed.description || parsed.desc,
            difficulty: parsed.difficulty || "beginner",
            time: parsed.time || "30 mins",
            xp: parsed.xp || 100,
            components: parsed.components || [],
            instructions: parsed.instructions || ["Assemble components as outlined.", "Upload sketch code to Arduino board."],
            basicCode: parsed.basicCode || parsed.code || "// Basic sketch code",
            optimizedCode: parsed.optimizedCode || parsed.code || "// Optimized sketch code",
          });
          return;
        }
      } catch {
        // Fallback to static catalog
      }
    }

    // 2. Fallback to static catalog dataset
    const found = allProjectsData.find((p) => String(p.id) === String(id));
    if (found) {
      setProject(found);
    } else if (allProjectsData.length > 0) {
      // Default to first project if ID match not found
      setProject(allProjectsData[0]);
    }
  }, [id]);

  useEffect(() => {
    if (!project) return;
    try {
      const key = user?.id ? `wishlist_${user.id}` : "wishlist";
      const saved = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      setIsWishlisted(saved.includes(project.title));
    } catch {
      setIsWishlisted(false);
    }
  }, [project, user?.id]);

  const toggleWishlist = () => {
    if (!project) return;
    try {
      const key = user?.id ? `wishlist_${user.id}` : "wishlist";
      const current = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      let updated: string[];
      if (current.includes(project.title)) {
        updated = current.filter(item => item !== project.title);
        setIsWishlisted(false);
      } else {
        updated = [...current, project.title];
        setIsWishlisted(true);
      }
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  if (!project) {
    return (
      <Layout>
        <div className="px-8 py-20 text-center">
          <p className="text-muted-foreground mb-4">Loading project details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <FadeInView>
          <ProjectHeader
            project={project}
            isWishlisted={isWishlisted}
            onToggleWishlist={toggleWishlist}
          />
        </FadeInView>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FadeInView delay={0.1}>
              <ProjectCodeSection
                basicCode={project.basicCode}
                optimizedCode={project.optimizedCode}
                projectTitle={project.title}
              />
            </FadeInView>

            <FadeInView delay={0.2}>
              <ProjectInstructions instructions={project.instructions} />
            </FadeInView>
          </div>

          <div className="space-y-6">
            <FadeInView delay={0.15}>
              <ProjectComponentsList components={project.components} />
            </FadeInView>

            <FadeInView delay={0.25}>
              <ArduinoSetupGuide />
            </FadeInView>
          </div>
        </div>
      </div>
    </Layout>
  );
}
