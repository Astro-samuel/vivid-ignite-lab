import { useState } from "react";
import { BookOpen, ExternalLink, Star, Search, Filter, ChevronDown } from "lucide-react";
import Layout from "@/components/Layout";

type Category = "all" | "arduino" | "electronics" | "programming" | "iot" | "robotics";
type Level = "all" | "beginner" | "intermediate" | "advanced";

interface Book {
  title: string;
  author: string;
  description: string;
  category: Category;
  level: Level;
  rating: number;
  link: string;
  free: boolean;
  coverColor: string;
}

const books: Book[] = [
  {
    title: "Getting Started with Arduino",
    author: "Massimo Banzi & Michael Shiloh",
    description: "The official Arduino guide. Covers the basics of electronics, programming, and building your first projects with Arduino.",
    category: "arduino",
    level: "beginner",
    rating: 4.5,
    link: "https://store.arduino.cc/products/getting-started-with-arduino-4th-edition",
    free: false,
    coverColor: "#00F5FF",
  },
  {
    title: "Arduino Cookbook",
    author: "Michael Margolis",
    description: "Over 200 recipes for solving common problems with Arduino. Great reference for sensors, motors, displays, and communication.",
    category: "arduino",
    level: "intermediate",
    rating: 4.7,
    link: "https://www.oreilly.com/library/view/arduino-cookbook-3rd/9781491903513/",
    free: false,
    coverColor: "#FFD700",
  },
  {
    title: "Programming Arduino: Getting Started with Sketches",
    author: "Simon Monk",
    description: "Learn C/C++ programming specifically for Arduino. Covers variables, loops, functions, arrays, and libraries step by step.",
    category: "programming",
    level: "beginner",
    rating: 4.4,
    link: "https://www.mhprofessional.com/programming-arduino-9781264676989-usa",
    free: false,
    coverColor: "#00FF88",
  },
  {
    title: "Practical Electronics for Inventors",
    author: "Paul Scherz & Simon Monk",
    description: "The bible of electronics. Comprehensive guide covering circuits, components, digital logic, microcontrollers, and more.",
    category: "electronics",
    level: "intermediate",
    rating: 4.8,
    link: "https://www.mhprofessional.com/practical-electronics-for-inventors-fourth-edition-9781259587542-usa",
    free: false,
    coverColor: "#B744FF",
  },
  {
    title: "Make: Electronics",
    author: "Charles Platt",
    description: "Hands-on introduction to electronics with experiments. Learn by doing — from basic circuits to transistors and ICs.",
    category: "electronics",
    level: "beginner",
    rating: 4.6,
    link: "https://www.makershed.com/products/make-electronics-3rd-edition",
    free: false,
    coverColor: "#FF1493",
  },
  {
    title: "Arduino Project Handbook",
    author: "Mark Geddes",
    description: "25 step-by-step Arduino projects with full wiring diagrams, code, and explanations. Perfect for hands-on learners.",
    category: "arduino",
    level: "beginner",
    rating: 4.3,
    link: "https://nostarch.com/arduino-project-handbook",
    free: false,
    coverColor: "#FFA500",
  },
  {
    title: "The Art of Electronics",
    author: "Paul Horowitz & Winfield Hill",
    description: "The definitive electronics textbook. Covers analog and digital design in depth — used in university courses worldwide.",
    category: "electronics",
    level: "advanced",
    rating: 4.9,
    link: "https://artofelectronics.net/",
    free: false,
    coverColor: "#00D4FF",
  },
  {
    title: "Internet of Things with Arduino Cookbook",
    author: "Marco Schwartz",
    description: "Build IoT projects with Arduino. Covers WiFi, Bluetooth, MQTT, cloud platforms, and connected sensor networks.",
    category: "iot",
    level: "intermediate",
    rating: 4.2,
    link: "https://www.packtpub.com/product/internet-of-things-with-arduino-cookbook/9781785286582",
    free: false,
    coverColor: "#00F5FF",
  },
  {
    title: "Arduino Robotics",
    author: "John-David Warren, Josh Adams & Harald Molle",
    description: "Build autonomous robots with Arduino. Covers motor control, sensors, navigation algorithms, and robot chassis design.",
    category: "robotics",
    level: "intermediate",
    rating: 4.1,
    link: "https://link.springer.com/book/10.1007/978-1-4302-3184-4",
    free: false,
    coverColor: "#FFD700",
  },
  {
    title: "Arduino Programming in 24 Hours",
    author: "Richard Blum",
    description: "Fast-paced guide to Arduino programming with clear examples. Great for those who want to learn quickly and efficiently.",
    category: "programming",
    level: "beginner",
    rating: 4.0,
    link: "https://www.informit.com/store/arduino-programming-in-24-hours-sams-teach-yourself-9780672337123",
    free: false,
    coverColor: "#00FF88",
  },
  {
    title: "Electronics All-in-One For Dummies",
    author: "Doug Lowe",
    description: "Beginner-friendly overview of electronics fundamentals. Covers DC/AC circuits, soldering, digital electronics, and Arduino basics.",
    category: "electronics",
    level: "beginner",
    rating: 4.2,
    link: "https://www.wiley.com/en-us/Electronics+All-in-One+For+Dummies-p-9781119822110",
    free: false,
    coverColor: "#B744FF",
  },
  {
    title: "Arduino Official Docs & Tutorials",
    author: "Arduino Team",
    description: "Free official tutorials, language reference, and project guides from Arduino. The best starting point for any beginner.",
    category: "arduino",
    level: "beginner",
    rating: 4.6,
    link: "https://docs.arduino.cc/",
    free: true,
    coverColor: "#00F5FF",
  },
  {
    title: "All About Circuits – Textbook",
    author: "Tony R. Kuphaldt",
    description: "Free, open-source electronics textbook covering DC, AC, semiconductors, and digital circuits in six volumes.",
    category: "electronics",
    level: "beginner",
    rating: 4.5,
    link: "https://www.allaboutcircuits.com/textbook/",
    free: true,
    coverColor: "#00FF88",
  },
  {
    title: "Learn Arduino on Adafruit",
    author: "Adafruit Industries",
    description: "Free tutorials and guides for Arduino and electronics. Covers sensors, displays, motors, and full project walkthroughs.",
    category: "arduino",
    level: "beginner",
    rating: 4.4,
    link: "https://learn.adafruit.com/category/learn-arduino",
    free: true,
    coverColor: "#FFD700",
  },
];

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All Topics" },
  { value: "arduino", label: "Arduino" },
  { value: "electronics", label: "Electronics" },
  { value: "programming", label: "Programming" },
  { value: "iot", label: "IoT" },
  { value: "robotics", label: "Robotics" },
];

const levels: { value: Level; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [level, setLevel] = useState<Level>("all");

  const filtered = books.filter((b) => {
    if (category !== "all" && b.category !== category) return false;
    if (level !== "all" && b.level !== level) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
            <span className="gradient-text-teal">📚 Resources</span>
          </h1>
          <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Curated books, textbooks, and free guides on Arduino, electronics, and embedded programming.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
            <input
              type="text"
              placeholder="Search books or authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
              style={{
                background: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={
                    category === c.value
                      ? { background: "rgba(0,245,255,0.15)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.4)" }
                      : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1.5">
            {levels.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  level === l.value
                    ? { background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)" }
                    : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                }
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
          <span>{filtered.length} resource{filtered.length !== 1 ? "s" : ""} found</span>
          <span>•</span>
          <span>{filtered.filter((b) => b.free).length} free</span>
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((book, i) => (
            <a
              key={i}
              href={book.link}
              target="_blank"
              rel="noopener noreferrer"
              className="card-neon p-5 flex flex-col gap-4 group"
            >
              {/* Book visual */}
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-20 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${book.coverColor}22, ${book.coverColor}44)`,
                    border: `1px solid ${book.coverColor}55`,
                  }}
                >
                  <BookOpen size={20} style={{ color: book.coverColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold text-sm leading-tight group-hover:underline"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    {book.title}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {book.author}
                  </p>
                </div>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--foreground-secondary, 228 60% 90%))" }}>
                {book.description}
              </p>

              {/* Tags & rating */}
              <div className="flex items-center justify-between mt-auto pt-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`badge-${book.level} px-2 py-0.5 rounded-full text-xs font-medium`}
                  >
                    {book.level.charAt(0).toUpperCase() + book.level.slice(1)}
                  </span>
                  {book.free && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.4)" }}
                    >
                      Free
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} fill="#FFD700" style={{ color: "#FFD700" }} />
                  <span className="text-xs font-semibold" style={{ color: "#FFD700" }}>{book.rating}</span>
                </div>
              </div>

              {/* External link hint */}
              <div className="flex items-center gap-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                <ExternalLink size={10} />
                <span className="group-hover:underline">View resource →</span>
              </div>
            </a>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen size={40} className="mx-auto mb-4" style={{ color: "hsl(var(--muted-foreground))" }} />
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              No resources match your filters. Try adjusting your search.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
