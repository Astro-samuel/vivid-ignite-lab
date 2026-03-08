import { Trophy } from "lucide-react";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";

export default function AchievementsPage() {
  return (
    <Layout>
      <div className="px-8 py-10 max-w-4xl mx-auto">
        <FadeInView className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={24} className="text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
          </div>
          <p className="text-muted-foreground">Track your progress and earn badges</p>
        </FadeInView>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy size={48} className="text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No achievements yet</h2>
          <p className="text-muted-foreground">Complete projects to start earning badges and XP!</p>
        </div>
      </div>
    </Layout>
  );
}
