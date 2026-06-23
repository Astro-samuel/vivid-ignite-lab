import { useState, useRef, useEffect, useMemo } from "react";
import { User, Camera, Edit3, Save, Star, Zap, Trophy, CheckCircle, Flame, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserProjects } from "@/hooks/useUserProjects";
import { calculateSkillProgress } from "@/lib/skillMapping";

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
  const xpBarRef = useRef<HTMLDivElement>(null);
  const skillRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const completedProjectIds = useMemo(
    () => projects.filter((p) => p.status === "completed").map((p) => p.project_id),
    [projects]
  );
  const skillProgress = useMemo(() => calculateSkillProgress(completedProjectIds), [completedProjectIds]);
  const xpPercent = (profile.xp / profile.maxXP) * 100;


  useEffect(() => {
    if (xpBarRef.current) {
      xpBarRef.current.style.width = `${xpPercent}%`;
    }
  }, [xpPercent]);

  useEffect(() => {
    skillProgress.forEach((skill) => {
      const el = skillRefs.current[skill.name];
      if (el) {
        el.style.width = `${skill.percent}%`;
      }
    });
  }, [skillProgress]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            name: data.display_name || "",
            username: data.username || "",
            bio: "",
            level: data.level || 1,
            xp: data.total_xp || 0,
            maxXP: (data.level || 1) >= 3 ? 1000 : (data.level || 1) >= 2 ? 500 : 200,
            streak: data.streak_days || 0,
            projectsCompleted: data.projects_completed || 0,
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

    if (user) {
      await supabase
        .from("profiles")
        .update({
          display_name: editData.name,
          username: editData.username,
        })
        .eq("id", user.id);
    }

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const stats = [
    { icon: Trophy, label: "Projects", value: profile.projectsCompleted, color: "text-amber-500", border: "border-amber-200", bg: "bg-amber-50" },
    { icon: Flame, label: "Streak", value: profile.streak, color: "text-rose-500", border: "border-rose-200", bg: "bg-rose-50" },
    { icon: Star, label: "Level", value: profile.level, color: "text-violet-500", border: "border-violet-200", bg: "bg-violet-50" },
    { icon: Zap, label: "XP Total", value: profile.xp, color: "text-indigo-500", border: "border-indigo-200", bg: "bg-indigo-50" },
  ];

  return (
    <Layout>
      <div className="px-6 py-8 max-w-3xl mx-auto">
        {/* Header */}
        <FadeInView className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-b-4 border-indigo-200 flex items-center justify-center text-2xl shadow-sm">
            👤
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-display text-indigo-950">My Profile</h1>
            <p className="text-sm font-semibold text-slate-400">Manage your avatar, username and view statistics</p>
          </div>
        </FadeInView>

        {/* Profile Card */}
        <div className="bg-white border-2 border-b-4 border-slate-100 rounded-3xl p-8 mb-6 shadow-sm">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-4 border-slate-100 shadow-inner ${avatarPreview ? "bg-transparent" : "profile-avatar-gradient"}`}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-extrabold text-white">
                    {profile.name.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                title="Upload Avatar"
                aria-label="Upload Avatar"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-500 border-2 border-indigo-700 text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm"
              >
                <Camera size={14} className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" title="Upload Avatar file" aria-label="Upload Avatar file" onChange={handleAvatarUpload} />
            </div>

            {/* Level badge */}
            <div className="px-4 py-1 bg-violet-50 border-2 border-b-4 border-violet-200 text-violet-600 font-extrabold rounded-full text-xs font-display">
              Level {profile.level} Maker
            </div>
          </div>

          {/* Profile info */}
          {editing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="display-name-input" className="text-xs font-bold text-slate-400 mb-1.5 block">Display Name</label>
                <input
                  id="display-name-input"
                  placeholder="Display Name"
                  title="Display Name"
                  value={editData.name}
                  onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
                />
              </div>
              <div>
                <label htmlFor="username-input" className="text-xs font-bold text-slate-400 mb-1.5 block">Username</label>
                <input
                  id="username-input"
                  placeholder="Username"
                  title="Username"
                  value={editData.username}
                  onChange={(e) => setEditData((p) => ({ ...p, username: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
                />
              </div>
              <div>
                <label htmlFor="bio-input" className="text-xs font-bold text-slate-400 mb-1.5 block">Bio</label>
                <textarea
                  id="bio-input"
                  placeholder="Bio"
                  title="Bio"
                  value={editData.bio}
                  onChange={(e) => setEditData((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 border-2 border-b-4 border-indigo-700 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Save size={14} /> Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 border-2 border-b-4 border-slate-200 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-slate-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-indigo-950 mb-0.5">{profile.name || "Maker"}</h2>
              <p className="text-sm font-bold text-indigo-600 mb-3">@{profile.username || "username"}</p>
              <p className="text-sm font-semibold text-slate-400 mb-6 max-w-sm mx-auto">{profile.bio || "No biography added yet. Click edit profile to tell other builders about yourself!"}</p>
              <button
                onClick={() => {
                  setEditing(true);
                  setEditData({ name: profile.name, username: profile.username, bio: profile.bio });
                }}
                className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 border-2 border-b-4 border-indigo-200 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-indigo-600 transition-all flex items-center gap-2 mx-auto"
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* XP Bar */}
        <div className="bg-white border-2 border-b-4 border-slate-100 rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-extrabold font-display text-indigo-950 text-sm">XP Progress</span>
            <span className="text-sm font-extrabold text-indigo-600">
              {profile.xp} / {profile.maxXP} XP
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              ref={xpBarRef}
              className="h-full rounded-full bg-indigo-500 transition-all duration-700"
            />
          </div>
          <p className="text-xs font-bold text-slate-400 mt-2">
            {profile.maxXP - profile.xp} XP needed to reach Level {profile.level + 1}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map(({ icon: Icon, label, value, color, border, bg }) => (
            <div
              key={label}
              className={`bg-white border-2 border-b-4 ${border} rounded-2xl p-5 text-center shadow-sm hover:translate-y-[-1px] transition-all`}
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-extrabold font-display text-indigo-950">{value}</p>
              <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Skill Progress */}
        <div className="bg-white border-2 border-b-4 border-slate-100 rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-extrabold font-display text-indigo-950 mb-4">Skill Progress</h3>
          <div className="space-y-4">
            {skillProgress.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-extrabold text-indigo-950">{skill.name}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border skill-badge-${skill.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    {skill.level}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    ref={(el) => { skillRefs.current[skill.name] = el; }}
                    className={`h-full rounded-full transition-all duration-700 skill-bar-${skill.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mastery</span>
                  <span className="text-xs font-bold text-slate-400">{skill.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak section - clickable */}
        <div
          className="bg-white border-2 border-b-4 border-slate-100 rounded-3xl p-6 shadow-sm cursor-pointer hover:border-rose-400/50 group transition-all"
          onClick={() => navigate("/achievements")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border-2 border-b-4 border-rose-100 flex items-center justify-center text-xl shadow-sm">
                🔥
              </div>
              <div>
                <p className="font-extrabold text-indigo-950 text-sm">{profile.streak} Day Streak!</p>
                <p className="text-xs font-semibold text-slate-400">Keep building every day to unlock badges</p>
              </div>
            </div>
            <div className="flex items-center gap-1 transition-all group-hover:translate-x-1 text-rose-500">
              <span className="text-xs font-bold uppercase tracking-wider">View Streak</span>
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 px-5 py-3 rounded-2xl bg-emerald-500 border-2 border-b-4 border-emerald-700 text-white flex items-center gap-2 font-extrabold z-50 shadow-md"
          >
            <CheckCircle size={16} /> Profile Saved!
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
