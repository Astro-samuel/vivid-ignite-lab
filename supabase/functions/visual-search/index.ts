import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function authenticateRequest(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

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
    const user = await authenticateRequest(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { image } = await req.json();
    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "No image provided" }), {
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
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an electronics component identification expert. Given an image of an electronic component or circuit board, identify all visible components and map them to the closest match from this known list:\n\n${KNOWN_COMPONENTS.join(", ")}\n\nOnly return components from this list. Be smart about visual identification — look at board shape, chip markings, color, size, pin count, and any printed text. If you cannot identify a component with confidence, include your best guess with a note.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify all electronic components visible in this image. Map each to the closest match from the known components list." },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "identify_components",
              description: "Return identified electronic components from the image",
              parameters: {
                type: "object",
                properties: {
                  components: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Component name from the known list" },
                        confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence level of identification" }
                      },
                      required: ["name", "confidence"],
                      additionalProperties: false
                    },
                    description: "List of identified components"
                  }
                },
                required: ["components"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "identify_components" } },
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
      return new Response(JSON.stringify({ error: "Visual recognition failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data2 = await response.json();
    const toolCall = data2.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      const valid = (parsed.components || []).filter((c: any) => KNOWN_COMPONENTS.includes(c.name));
      return new Response(JSON.stringify({ components: valid }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ components: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("visual-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
