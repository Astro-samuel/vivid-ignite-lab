const Bone = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div
    className={`rounded-lg animate-pulse ${className}`}
    style={{ background: "hsl(var(--muted))", ...style }}
  />
);

export default function ProjectSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      {/* Top bar skeleton */}
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <Bone className="w-8 h-8 rounded-full" />
        <Bone className="w-40 h-5" />
        <div className="ml-auto flex gap-2">
          <Bone className="w-20 h-8 rounded-xl" />
          <Bone className="w-20 h-8 rounded-xl" />
        </div>
      </div>

      <div className="px-6 py-6 max-w-6xl mx-auto">
        {/* Title area */}
        <div className="flex items-center gap-3 mb-6">
          <Bone className="w-10 h-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Bone className="w-64 h-6" />
            <Bone className="w-96 h-4" />
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-6">
          <Bone className="w-20 h-6 rounded-full" />
          <Bone className="w-24 h-6 rounded-full" />
          <Bone className="w-16 h-6 rounded-full" />
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - instructions */}
          <div className="space-y-4">
            <Bone className="w-full h-10 rounded-xl" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl p-4 space-y-2" style={{ border: "1px solid hsl(var(--border))" }}>
                <Bone className="w-3/4 h-4" />
                <Bone className="w-full h-3" />
                <Bone className="w-2/3 h-3" />
              </div>
            ))}
          </div>

          {/* Right column - code editor */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Bone className="w-24 h-9 rounded-xl" />
              <Bone className="w-24 h-9 rounded-xl" />
            </div>
            <Bone className="w-full h-72 rounded-xl" />
            <div className="flex gap-2">
              <Bone className="w-28 h-9 rounded-xl" />
              <Bone className="w-28 h-9 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
