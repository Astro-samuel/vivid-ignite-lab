// Maps each project ID to the skills it teaches
// Skills: Electronics Basics, Programming, Sensors & Actuators, IoT & Connectivity, Robotics

export const SKILL_NAMES = [
  "Electronics Basics",
  "Programming",
  "Sensors & Actuators",
  "IoT & Connectivity",
  "Robotics",
] as const;

export type SkillName = (typeof SKILL_NAMES)[number];

export const SKILL_COLORS: Record<SkillName, string> = {
  "Electronics Basics": "#00F5FF",
  "Programming": "#00FF88",
  "Sensors & Actuators": "#FFD700",
  "IoT & Connectivity": "#B744FF",
  "Robotics": "#FF1493",
};

// Each project maps to 1-3 skills it develops
// Covers: Catalog projects (1-23), Generator projects (101-308), Think Bigger (101-110)
export const PROJECT_SKILLS: Record<number, SkillName[]> = {
  // === CATALOG: Beginner ===
  1:  ["Electronics Basics", "Programming"],                    // LED Blink Tutorial
  2:  ["Sensors & Actuators", "Programming"],                   // Temperature Monitor
  4:  ["Electronics Basics", "Programming"],                    // RGB LED Mixer
  6:  ["Electronics Basics", "Programming"],                    // Music Synthesizer
  12: ["Programming", "Electronics Basics"],                    // Joystick Game
  13: ["Electronics Basics"],                                   // Traffic Light Simulator
  14: ["Electronics Basics", "Programming"],                    // Piano Keys
  15: ["Electronics Basics", "Sensors & Actuators"],            // Night Light

  // === CATALOG: Intermediate ===
  3:  ["Robotics", "Programming"],                              // Servo Motor Control
  5:  ["IoT & Connectivity", "Programming"],                    // Bluetooth Controller
  7:  ["Sensors & Actuators", "Programming"],                   // Plant Watering Bot
  8:  ["Programming", "Electronics Basics"],                    // Digital Lock System
  11: ["Programming", "Sensors & Actuators"],                   // OLED Dashboard
  16: ["Programming", "Electronics Basics"],                    // Reaction Timer
  17: ["Sensors & Actuators", "Programming"],                   // Digital Compass
  18: ["Sensors & Actuators", "Programming"],                   // IR Remote Decoder

  // === CATALOG: Advanced ===
  9:  ["Robotics", "Sensors & Actuators", "Programming"],       // Obstacle Avoidance Car
  10: ["Robotics", "Sensors & Actuators"],                      // Solar Tracker
  19: ["IoT & Connectivity", "Programming", "Electronics Basics"], // Smart Home Hub
  20: ["Robotics", "Sensors & Actuators", "Programming"],       // Line Following Robot
  21: ["Sensors & Actuators", "IoT & Connectivity", "Programming"], // Weather Station
  22: ["Robotics", "Programming"],                              // Robotic Arm
  23: ["Electronics Basics", "Sensors & Actuators"],            // Battery Monitor
  24: ["Electronics Basics", "Programming"],                    // Electronic Dice
  25: ["Sensors & Actuators", "Electronics Basics"],            // Clap Switch
  26: ["Sensors & Actuators", "Electronics Basics"],            // Motion Detection Alarm
  27: ["Sensors & Actuators", "Electronics Basics"],            // Laser Tripwire
  28: ["Sensors & Actuators", "Robotics"],                      // Ultrasonic Radar Scanner
  29: ["Sensors & Actuators", "Programming"],                   // Theremin Synthesizer
  30: ["IoT & Connectivity", "Sensors & Actuators"],            // GPS Tracker

  // === GENERATOR: Beginner ===
  101: ["Electronics Basics", "Sensors & Actuators"],            // Smart LED Mood Lamp
  102: ["Sensors & Actuators", "Programming"],                   // Smart Plant Watering
  103: ["Programming", "Electronics Basics"],                    // Joystick LED Matrix
  104: ["Electronics Basics"],                                   // Traffic Light Controller
  105: ["Electronics Basics", "Programming"],                    // Button Piano
  106: ["Electronics Basics", "Sensors & Actuators"],            // Automatic Night Light
  107: ["Electronics Basics", "Programming"],                    // Electronic Dice
  108: ["Electronics Basics", "Programming"],                    // Countdown Timer
  109: ["Electronics Basics", "Programming"],                    // Rainbow LED Fader
  110: ["Sensors & Actuators", "Electronics Basics"],            // Clap Switch

  // === GENERATOR: Intermediate ===
  201: ["Sensors & Actuators", "IoT & Connectivity"],            // Weather Station Dashboard
  202: ["IoT & Connectivity", "Programming", "Robotics"],        // RFID Door Lock
  203: ["Robotics", "Sensors & Actuators", "Programming"],       // Line-Following Robot
  204: ["Sensors & Actuators", "Programming"],                   // IR Remote Decoder
  205: ["Programming", "Electronics Basics"],                    // Reaction Time Game
  206: ["Sensors & Actuators", "Programming"],                   // Digital Compass
  207: ["Sensors & Actuators", "Electronics Basics"],            // Laser Tripwire Alarm
  208: ["Programming", "IoT & Connectivity"],                    // Data Logger to SD Card
  209: ["Sensors & Actuators", "Electronics Basics"],            // Motion Detection Alarm
  210: ["Programming", "Electronics Basics"],                    // Serial LCD Menu System

  // === GENERATOR: Advanced ===
  301: ["Sensors & Actuators", "Programming"],                   // Theremin Music Synthesizer
  302: ["IoT & Connectivity", "Sensors & Actuators"],            // Wireless Sensor Network
  303: ["IoT & Connectivity", "Programming", "Electronics Basics"], // Smart Home Controller
  304: ["Robotics", "Programming"],                              // Robotic Arm with IK
  305: ["Sensors & Actuators", "Robotics"],                      // Ultrasonic Radar Scanner
  306: ["Sensors & Actuators", "Programming"],                   // Audio Spectrum Analyzer
  307: ["Electronics Basics", "Sensors & Actuators"],            // Power Consumption Monitor
  308: ["Robotics", "Sensors & Actuators", "Programming"],       // Gesture-Controlled Robot
};

/**
 * Given a list of completed project IDs, calculate skill progress.
 * Returns a map of skill name → { completed: number, total: number, percent: number, level: string }
 */
export function calculateSkillProgress(completedProjectIds: number[]) {
  // Count how many projects teach each skill (total possible)
  const skillTotals: Record<SkillName, number> = {} as any;
  const skillCompleted: Record<SkillName, number> = {} as any;

  for (const name of SKILL_NAMES) {
    skillTotals[name] = 0;
    skillCompleted[name] = 0;
  }

  for (const [pidStr, skills] of Object.entries(PROJECT_SKILLS)) {
    const pid = Number(pidStr);
    for (const skill of skills) {
      skillTotals[skill]++;
      if (completedProjectIds.includes(pid)) {
        skillCompleted[skill]++;
      }
    }
  }

  return SKILL_NAMES.map((name) => {
    const total = skillTotals[name];
    const completed = skillCompleted[name];
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const level =
      percent >= 80 ? "Advanced" :
      percent >= 40 ? "Intermediate" :
      percent > 0 ? "Beginner" : "Not Started";

    return {
      name,
      color: SKILL_COLORS[name],
      completed,
      total,
      percent,
      level,
    };
  });
}
