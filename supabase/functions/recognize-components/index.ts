import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KNOWN_COMPONENTS = [
  "Arduino Uno", "Arduino Nano", "Arduino Mega", "ESP32", "ESP8266",
  "Temperature Sensor (DHT11)", "Temperature Sensor (DHT22)", "Ultrasonic Sensor (HC-SR04)",
  "PIR Motion Sensor", "Photoresistor (LDR)", "IR Sensor", "Soil Moisture Sensor",
  "Sound Sensor", "Rain Sensor", "BMP180 (Pressure)",
  "Servo Motor (SG90)", "DC Motor", "Stepper Motor", "Buzzer", "Relay Module", "Water Pump",
  "16x2 LCD", "OLED Display (0.96\")", "7-Segment Display", "LED Strip (WS2812B)", "LED Matrix 8x8",
  "HC-05 Bluetooth", "NRF24L01 (RF)", "SIM800L (GSM)", "LoRa Module",
  "LED (Red)", "LED (Green)", "LED (Blue)", "RGB LED",
  "Resistor (220Ω)", "Resistor (1kΩ)", "Resistor (10kΩ)",
  "Capacitor 100µF", "Push Button", "Potentiometer", "Transistor BC547",
  "Motor Driver (L298N)", "RFID RC522", "RTC DS3231", "SD Card Module", "I2C Hub",
  "Battery Holder", "9V Battery", "Voltage Regulator (LM7805)",
  "Breadboard", "Jumper Wires", "USB Cable", "Soldering Iron",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a component recognition engine for Arduino/electronics projects. Given a user's pasted text (shopping cart, project guide, parts list, etc.), extract all electronic components mentioned and map them to the closest match from this known list:\n\n${KNOWN_COMPONENTS.join(", ")}\n\nOnly return components from this list. If a component doesn't match anything, skip it. Be smart about aliases (e.g. "DHT11" → "Temperature Sensor (DHT11)", "servo" → "Servo Motor (SG90)", "ultrasonic" → "Ultrasonic Sensor (HC-SR04)", "LDR" → "Photoresistor (LDR)").`
          },
          { role: "user", content: text }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_components",
              description: "Extract recognized Arduino/electronics components from the text",
              parameters: {
                type: "object",
                properties: {
                  components: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of recognized component names from the known list"
                  }
                },
                required: ["components"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_components" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Recognition failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      // Filter to only known components
      const valid = (parsed.components || []).filter((c: string) => KNOWN_COMPONENTS.includes(c));
      return new Response(JSON.stringify({ components: [...new Set(valid)] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ components: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recognize-components error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
