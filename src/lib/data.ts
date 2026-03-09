export const bigIdeas = [
  {
    id: 1, emoji: "🛸", title: "Autonomous Drone Navigation System",
    desc: "Build a drone that autonomously maps indoor environments using LIDAR and computer vision, creating real-time 3D maps.",
    tags: ["LIDAR", "Computer Vision", "IMU", "ESP32"], level: "Expert", impact: "Revolutionary",
  },
  {
    id: 2, emoji: "🧬", title: "Biometric Smart Home Hub",
    desc: "Create a home automation system that recognizes residents by fingerprint and voice, auto-adjusting lighting, temperature, and security.",
    tags: ["Fingerprint Sensor", "Voice Recognition", "Smart Home", "Raspberry Pi"], level: "Advanced", impact: "Life-Changing",
  },
  {
    id: 3, emoji: "🌊", title: "Ocean Pollution Monitor Buoy",
    desc: "Deploy a self-powered floating sensor that tracks water quality, pH, temperature, and sends data via LoRa to a cloud dashboard.",
    tags: ["pH Sensor", "LoRa", "Solar Panel", "GPS"], level: "Advanced", impact: "Environmental",
  },
  {
    id: 4, emoji: "🧠", title: "Brain-Computer Interface Prototype",
    desc: "Build a basic EEG headset that reads brainwave patterns and controls a simple game using neural signals.",
    tags: ["EEG Sensor", "Signal Processing", "BLE", "ML"], level: "Expert", impact: "Future Tech",
  },
  {
    id: 5, emoji: "🌿", title: "AI-Powered Vertical Farm",
    desc: "Design an automated vertical farm that uses machine learning to optimize nutrient levels, lighting schedules, and harvesting.",
    tags: ["pH Sensor", "Grow Lights", "Camera", "AI"], level: "Advanced", impact: "Sustainable",
  },
];

export const impactColors: Record<string, string> = {
  Revolutionary: "#FF1493",
  "Life-Changing": "#B744FF",
  Environmental: "#00FF88",
  "Future Tech": "#00F5FF",
  Sustainable: "#00FF88",
};
