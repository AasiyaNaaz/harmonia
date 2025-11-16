import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sun,
  Moon,
  Palette,
  Volume2,
  VolumeX,
  Zap,
  Sliders,
} from "lucide-react";
import React from "react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

// =====================================
// MAIN COMPONENT
// =====================================

export default function SettingsModal({
  open,
  onClose,
  darkMode,
  setDarkMode,
}: SettingsModalProps) {
  // Persistent states
  const fonts = ["Oxanium", "Montserrat", "Poppins", "Orbitron", "Space Grotesk"];

  const [font, setFont] = React.useState<string>(
    localStorage.getItem("harmonica-font") || "Oxanium"
  );

  const [accent, setAccent] = React.useState<string>(
    localStorage.getItem("harmonica-accent") || "#ff4ecb"
  );

  const [bgStyle, setBgStyle] = React.useState<string>(
    localStorage.getItem("harmonica-bg") || "default"
  );

  const [blurStrength, setBlurStrength] = React.useState<string>(
    localStorage.getItem("harmonica-blur") || "soft"
  );

  const [shadowStyle, setShadowStyle] = React.useState<string>(
    localStorage.getItem("harmonica-shadow") || "default"
  );

  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(
    localStorage.getItem("harmonica-sound") === "true"
  );

  const [motionDisabled, setMotionDisabled] = React.useState<boolean>(
    localStorage.getItem("harmonica-reduce-motion") === "true"
  );

  const [layout, setLayout] = React.useState<string>(
    localStorage.getItem("harmonica-layout") || "comfortable"
  );

  const [devMode, setDevMode] = React.useState<boolean>(
    localStorage.getItem("harmonica-dev") === "true"
  );

  // =====================================
  // APPLY PERSISTENT SETTINGS TO SYSTEM
  // =====================================

  const playClick = () => {
    if (!soundEnabled) return;
    const audio = new Audio("/ui-click.mp3");
    audio.volume = 0.4;
    audio.play();
  };

  React.useEffect(() => {
    document.documentElement.style.setProperty("--harmonica-font", font);
    localStorage.setItem("harmonica-font", font);
  }, [font]);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--harmonica-accent", accent);
    localStorage.setItem("harmonica-accent", accent);
  }, [accent]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-bg-style", bgStyle);
    localStorage.setItem("harmonica-bg", bgStyle);
  }, [bgStyle]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-blur", blurStrength);
    localStorage.setItem("harmonica-blur", blurStrength);
  }, [blurStrength]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-shadow", shadowStyle);
    localStorage.setItem("harmonica-shadow", shadowStyle);
  }, [shadowStyle]);

  React.useEffect(() => {
    localStorage.setItem("harmonica-sound", soundEnabled ? "true" : "false");
  }, [soundEnabled]);

  React.useEffect(() => {
    localStorage.setItem(
      "harmonica-reduce-motion",
      motionDisabled ? "true" : "false"
    );
    document.documentElement.setAttribute(
      "data-reduce-motion",
      motionDisabled ? "true" : "false"
    );
  }, [motionDisabled]);

  React.useEffect(() => {
    localStorage.setItem("harmonica-layout", layout);
    document.documentElement.setAttribute("data-layout", layout);
  }, [layout]);

  React.useEffect(() => {
    localStorage.setItem("harmonica-dev", devMode ? "true" : "false");
    document.documentElement.setAttribute("data-dev", devMode ? "true" : "false");
  }, [devMode]);

  // =====================================
  // RENDER
  // =====================================

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dim background */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
            className="
              fixed right-0 top-0 h-full w-[380px] z-[100]
              bg-black/40 dark:bg-black/60
              backdrop-blur-2xl border-l border-white/10
              shadow-[0_0_25px_rgba(255,255,255,0.15)]
              p-6 flex flex-col text-white overflow-y-auto
            "
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Settings</h2>
              <button onClick={onClose}>
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* ===== APPEARANCE ===== */}
            <Section title="Appearance" icon={<Palette className="h-4 w-4" />}>
              <ToggleRow
                label="Theme"
                value={darkMode ? "Dark" : "Light"}
                icon={darkMode ? <Moon /> : <Sun />}
                onClick={() => {
                  playClick();
                  setDarkMode(!darkMode);
                }}
              />

              <Dropdown
                label="Font"
                value={font}
                options={fonts}
                onChange={(v: string) => {
                  playClick();
                  setFont(v);
                }}
              />

              <ColorRow
                label="Accent"
                selected={accent}
                colors={["#ff4ecb", "#00e0ff", "#ffe960", "#ff914d", "#8b5cf6"]}
                onPick={(c: string) => {
                  playClick();
                  setAccent(c);
                }}
              />

              <Dropdown
                label="Background Style"
                value={bgStyle}
                options={["default", "cosmic", "noise", "gradient", "solid"]}
                onChange={(v: string) => {
                  playClick();
                  setBgStyle(v);
                }}
              />

              <Dropdown
                label="UI Blur"
                value={blurStrength}
                options={["none", "soft", "heavy"]}
                onChange={(v: string) => {
                  playClick();
                  setBlurStrength(v);
                }}
              />

              <Dropdown
                label="Shadow Style"
                value={shadowStyle}
                options={["minimal", "default", "glow"]}
                onChange={(v: string) => {
                  playClick();
                  setShadowStyle(v);
                }}
              />
            </Section>

            {/* ===== SOUND ===== */}
            <Section title="Sound" icon={<Volume2 className="h-4 w-4" />}>
              <ToggleRow
                label="UI Sounds"
                value={soundEnabled ? "On" : "Off"}
                icon={soundEnabled ? <Volume2 /> : <VolumeX />}
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  playClick();
                }}
              />
            </Section>

            {/* ===== MOTION ===== */}
            <Section title="Motion & Performance" icon={<Zap className="h-4 w-4" />}>
              <ToggleRow
                label="Reduce Motion"
                value={motionDisabled ? "Enabled" : "Disabled"}
                onClick={() => {
                  playClick();
                  setMotionDisabled(!motionDisabled);
                }}
              />

              <Dropdown
                label="Layout Density"
                value={layout}
                options={["comfortable", "compact", "ultra-compact"]}
                onChange={(v: string) => {
                  playClick();
                  setLayout(v);
                }}
              />
            </Section>

            {/* ===== DEV MODE ===== */}
            <Section title="Developer Mode" icon={<Sliders className="h-4 w-4" />}>
              <ToggleRow
                label="Developer Options"
                value={devMode ? "On" : "Off"}
                onClick={() => {
                  playClick();
                  setDevMode(!devMode);
                }}
              />
            </Section>

            <div className="py-4 text-center opacity-50 text-xs">
              Harmonica • Advanced Settings Panel
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 opacity-80">
        {icon}
        <h3 className="text-sm">{title.toUpperCase()}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

function ToggleRow({ label, value, icon, onClick }: ToggleRowProps) {
  return (
    <div
      className="
        flex items-center justify-between
        bg-white/5 p-3 rounded-lg border border-white/10
        cursor-pointer hover:bg-white/10 transition
      "
      onClick={onClick}
    >
      <span>{label}</span>
      <div className="flex items-center gap-2 opacity-90">
        {icon} {value}
      </div>
    </div>
  );
}

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function Dropdown({ label, value, options, onChange }: DropdownProps) {
  return (
    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
      <span className="block mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full bg-black/40 text-white p-2 rounded 
          border border-white/10 focus:outline-none
        "
      >
        {options.map((option) => (
          <option key={option} value={option} className="text-black">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ColorRowProps {
  label: string;
  selected: string;
  colors: string[];
  onPick: (color: string) => void;
}

function ColorRow({ label, selected, colors, onPick }: ColorRowProps) {
  return (
    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
      <span className="block mb-2">{label}</span>
      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onPick(c)}
            className={`
              h-7 w-7 rounded-full border
              ${selected === c ? "border-white" : "border-white/30"}
            `}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}
