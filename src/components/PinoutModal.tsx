import { X, Cpu, Zap, Radio, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PinoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PinoutModal({ isOpen, onClose }: PinoutModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border-2 border-b-4 border-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center text-primary font-black">
                <Cpu size={20} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold font-display text-foreground">
                  Arduino Uno / Nano Pinout Guide
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Quick pin mapping reference for circuit wiring
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Pinout Guide"
              className="p-2 rounded-xl bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Grid of Pin Categories */}
          <div className="space-y-4">
            {/* Digital & PWM Pins */}
            <div className="p-4 rounded-2xl bg-background border-2 border-border">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-primary" />
                <h3 className="font-extrabold text-sm text-foreground">Digital &amp; PWM Pins (0 – 13)</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3 font-semibold">
                Digital I/O pins configured using <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">pinMode(pin, INPUT/OUTPUT)</code>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="font-extrabold text-primary font-mono">PWM Pins (~3, ~5, ~6, ~9, ~10, ~11)</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    Supports pulse width modulation via <code className="font-mono">analogWrite(pin, 0-255)</code> for dimming LEDs or driving motors.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="font-extrabold text-foreground font-mono">Pin 13 (Built-in LED)</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    Connected to onboard LED. Ideal for quick code test blinks without external wiring.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border sm:col-span-2">
                  <span className="font-extrabold text-warning font-mono">Pins 0 (RX) &amp; 1 (TX)</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    Hardware Serial communication. Avoid connecting components here during code upload to prevent interference.
                  </p>
                </div>
              </div>
            </div>

            {/* Analog Input Pins */}
            <div className="p-4 rounded-2xl bg-background border-2 border-border">
              <div className="flex items-center gap-2 mb-2">
                <Radio size={16} className="text-secondary" />
                <h3 className="font-extrabold text-sm text-foreground">Analog Inputs (A0 – A5)</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3 font-semibold">
                Reads analog voltage levels (0V to 5V) returning 10-bit integer values from 0 to 1023 using <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">analogRead(pin)</code>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="font-extrabold text-secondary font-mono">A0 – A3 (Sensors)</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    Photoresistors, thermistors, potentiometers, sound &amp; moisture sensors.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border">
                  <span className="font-extrabold text-secondary font-mono">A4 (SDA) &amp; A5 (SCL)</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    I2C communication bus pins for LCD screens, OLED displays, and RTC modules.
                  </p>
                </div>
              </div>
            </div>

            {/* Power & Ground */}
            <div className="p-4 rounded-2xl bg-background border-2 border-border">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={16} className="text-success" />
                <h3 className="font-extrabold text-sm text-foreground">Power &amp; Ground Rail</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-success/10 border border-success/30 rounded-xl">
                  <span className="font-black text-success font-mono block text-sm">5V</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Main Power</span>
                </div>
                <div className="p-2 bg-success/10 border border-success/30 rounded-xl">
                  <span className="font-black text-success font-mono block text-sm">3.3V</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Low-Voltage Sensor</span>
                </div>
                <div className="p-2 bg-card border border-border rounded-xl">
                  <span className="font-black text-foreground font-mono block text-sm">GND</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">Common Ground</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-xl text-xs transition-all"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
