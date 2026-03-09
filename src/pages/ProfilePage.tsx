import { useState, useRef, useEffect } from "react";
import { User, Camera, Edit3, Save, Star, Zap, Trophy, CheckCircle, Flame, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserProjects } from "@/hooks/useUserProjects";

interface UserProfile {
  name: string;
  username: string;
  bio: string;
  level: number;
  xp: number;
  maxXP: number;
  streak: number;
  projectsCompleted: number;
  avatar: string | null;
}

const emptyProfile: UserProfile = {
  name: "",
  username: "",
  bio: "",
  level: 1,
  xp: 0,
  maxXP: 200,
  streak: 0,
  projectsCompleted: 0,
  avatar: null,
};

const skillProgress = [
  { name: "Electronics Basics", level: "Beginner", percent: 0, color: "#00F5FF" },
  { name: "Programming", level: "Beginner", percent: 0, color: "#00FF88" },
  { name: "Sensors & Actuators", level: "Beginner", percent: 0, color: "#FFD700" },
  { name: "IoT & Connectivity", level: "Beginner", percent: 0, color: "#B744FF" },
  { name: "Robotics", level: "Beginner", percent: 0, color: "#FF1493" },
];

const recentActivity: { icon: string; text: string; time: string; color: string }[] = [];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useUserProjects();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", username: "", bio: "" });
  const [savedToast, setSavedToast] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load profile from database
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        const completedCount = projects.filter(p => p.status === "completed").length;
        const totalXp = projects.filter(p => p.status === "completed").reduce((s, p) => s + (p.xp || 0), 0);
        setProfile({
          name: data.display_name || "",
          username: data.username || "",
          bio: "",
          level: data.level || 1,
          xp: totalXp || data.total_xp || 0,
          maxXP: (data.level || 1) * 200,
          streak: data.streak_days || 0,
          projectsCompleted: completedCount || data.projects_completed || 0,
          avatar: data.avatar_url || null,
        });
        setEditData({
          name: data.display_name || "",
          username: data.username || "",
          bio: "",
        });
      }
    });
  }, [user, projects]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setAvatarPreview(url);
        setProfile((prev) => ({ ...prev, avatar: url }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setProfile((prev) => ({ ...prev, ...editData }));
    setEditing(false);

    // Persist to database
    if (user) {
      await supabase.from("profiles").update({
        display_name: editData.name,
        username: editData.username,
      }).eq("id", user.id);
    }

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const xpPercent = (profile.xp / profile.maxXP) * 100;

  const stats = [
    { icon: Trophy, label: "Projects", value: profile.projectsCompleted, color: "#FFD700" },
    { icon: Flame, label: "Day Streak", value: profile.streak, color: "#FF4500" },
    { icon: Star, label: "Level", value: profile.level, color: "#B744FF" },
    { icon: Zap, label: "Total XP", value: "245", color: "#00F5FF" },
  ];

  return (
    <Layout>
      <div className="px-8 py-10 max-w-3xl mx-auto">
        {/* Header */}
        <FadeInView className="flex items-center gap-3 mb-8">
          <User size={22} style={{ color: "#00F5FF" }} />
          <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>My Profile</h1>
        </FadeInView>

        {/* Profile Card */}
        <div
          className="rounded-2xl p-8 border mb-5"
          style={{ background: "hsl(229, 45%, 14%)", borderColor: "rgba(0,245,255,0.2)" }}
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background: avatarPreview ? "transparent" : "linear-gradient(135deg, #00F5FF, #B744FF)",
                  boxShadow: "0 0 30px rgba(0,245,255,0.3)",
                  border: "3px solid rgba(0,245,255,0.5)",
                }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold" style={{ color: "#0A0E27" }}>
                    {profile.name.charAt(0)}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", boxShadow: "0 0 10px rgba(0,245,255,0.4)" }}
              >
                <Camera size={14} style={{ color: "#0A0E27" }} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Level badge */}
            <div
              className="px-4 py-1.5 rounded-full text-sm font-bold font-orbitron"
              style={{ background: "linear-gradient(135deg, rgba(183,68,255,0.2), rgba(123,47,255,0.1))", color: "#B744FF", border: "1px solid rgba(183,68,255,0.4)" }}
            >
              Level {profile.level} Maker
            </div>
          </div>

          {/* Profile info */}
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#A0AED9" }}>Display Name</label>
                <input
                  value={editData.name}
                  onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "hsl(229, 42%, 20%)", border: "1px solid rgba(0,245,255,0.3)", color: "#FFFFFF" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#A0AED9" }}>Username</label>
                <input
                  value={editData.username}
                  onChange={(e) => setEditData((p) => ({ ...p, username: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "hsl(229, 42%, 20%)", border: "1px solid rgba(0,245,255,0.3)", color: "#FFFFFF" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#A0AED9" }}>Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                  style={{ background: "hsl(229, 42%, 20%)", border: "1px solid rgba(0,245,255,0.3)", color: "#FFFFFF" }}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="btn-neon-teal flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2">
                  <Save size={14} /> Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ border: "1px solid hsl(229, 42%, 28%)", color: "#A0AED9" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1" style={{ color: "#FFFFFF" }}>{profile.name}</h2>
              <p className="text-sm mb-3" style={{ color: "#00F5FF" }}>@{profile.username}</p>
              <p className="text-sm mb-6" style={{ color: "#A0AED9" }}>{profile.bio}</p>
              <button
                onClick={() => { setEditing(true); setEditData({ name: profile.name, username: profile.username, bio: profile.bio }); }}
                className="btn-neon-outline-teal px-5 py-2 text-sm font-semibold flex items-center gap-2 mx-auto"
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* XP Bar */}
        <div
          className="rounded-2xl p-5 border mb-5"
          style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm" style={{ color: "#FFFFFF" }}>XP Progress</span>
            <span className="text-sm font-bold" style={{ color: "#00F5FF" }}>{profile.xp} / {profile.maxXP} XP</span>
          </div>
          <div className="progress-neon h-3">
            <div className="progress-neon-fill" style={{ width: `${xpPercent}%`, height: "100%" }} />
          </div>
          <p className="text-xs mt-2" style={{ color: "#A0AED9" }}>
            {profile.maxXP - profile.xp} XP needed to reach Level {profile.level + 1}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="stat-card text-center">
              <Icon size={22} style={{ color }} className="mx-auto mb-2" />
              <p className="text-2xl font-bold font-orbitron" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "#A0AED9" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Skill Progress */}
        <div
          className="rounded-2xl p-5 border mb-5"
          style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
        >
          <h3 className="font-bold mb-4" style={{ color: "#FFFFFF" }}>Skill Progress</h3>
          <div className="space-y-4">
            {skillProgress.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: "#E0E7FF" }}>{skill.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: `${skill.color}18`,
                      color: skill.color,
                      border: `1px solid ${skill.color}33`,
                    }}
                  >
                    {skill.level}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(229, 42%, 22%)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${skill.percent}%`,
                      background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`,
                      boxShadow: `0 0 8px ${skill.color}66`,
                    }}
                  />
                </div>
                <p className="text-xs mt-1 text-right" style={{ color: "#A0AED9" }}>{skill.percent}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-2xl p-5 border mb-5"
          style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
        >
          <h3 className="font-bold mb-4" style={{ color: "#FFFFFF" }}>Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{act.icon}</span>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: "#E0E7FF" }}>{act.text}</p>
                  <p className="text-xs" style={{ color: "#A0AED9" }}>{act.time}</p>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ background: act.color }} />
              </div>
            ))}
          </div>
        </div>

        {/* Streak section - clickable */}
        <div
          className="rounded-2xl p-5 border cursor-pointer transition-all hover:border-orange-500/50 group"
          style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
          onClick={() => navigate("/achievements")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(255,69,0,0.15)" }}>
                🔥
              </div>
              <div>
                <p className="font-bold" style={{ color: "#FFFFFF" }}>{profile.streak} Day Streak!</p>
                <p className="text-xs" style={{ color: "#A0AED9" }}>Keep building every day</p>
              </div>
            </div>
            <div className="flex items-center gap-1 transition-all group-hover:translate-x-1" style={{ color: "#FF4500" }}>
              <span className="text-sm font-semibold">View Challenges</span>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {savedToast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold z-50" style={{ background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}>
            <CheckCircle size={16} /> ✓ Profile Saved!
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
