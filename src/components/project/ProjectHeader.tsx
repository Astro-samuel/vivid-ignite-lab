import { ArrowLeft, Clock, Zap, Share2, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast as sonnerToast } from "sonner";
import { ProjectItem } from "@/data/projectsData";

interface ProjectHeaderProps {
  project: ProjectItem;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export default function ProjectHeader({ project, isWishlisted, onToggleWishlist }: ProjectHeaderProps) {
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      sonnerToast.success("Copied project link to clipboard!");
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner": return "bg-success/15 text-success border-success/30";
      case "intermediate": return "bg-secondary/15 text-secondary border-secondary/30";
      default: return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    }
  };

  return (
    <div className="mb-8">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 text-xs font-semibold mb-6 transition-all hover:-translate-x-1"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        <ArrowLeft size={14} /> Back to Catalog
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-4xl p-3 rounded-2xl border bg-card border-border shadow-sm"
          >
            {project.emoji}
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-1">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              {project.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleWishlist}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isWishlisted
                ? "bg-red-500/15 text-red-500 border-red-500/30"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Heart size={14} className={isWishlisted ? "fill-red-500" : ""} />
            {isWishlisted ? "Saved" : "Save"}
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border bg-card text-muted-foreground border-border hover:text-foreground text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-border/60">
        <span className={`text-xs px-3 py-1 rounded-full font-bold border capitalize ${getDifficultyColor(project.difficulty)}`}>
          {project.difficulty}
        </span>
        <span className="text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 bg-muted/60 text-muted-foreground border border-border">
          <Clock size={12} /> {project.time}
        </span>
        <span className="text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 bg-primary/15 text-primary border border-primary/30">
          <Zap size={12} /> +{project.xp} XP Reward
        </span>
      </div>
    </div>
  );
}
