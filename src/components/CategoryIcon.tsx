import {
  Layers, Package, Zap, Star, Globe, Shield, Award, Download, Sparkles, Heart,
  Image as ImageIcon, Type, Camera, Palette, Box, Code,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Layers, Package, Zap, Star, Globe, Shield, Award, Download, Sparkles, Heart,
  Image: ImageIcon, Type, Camera, Palette, Box, Code,
};

// Brand-style colored gradients per category slug — tailwind-safe arbitrary values
const palette: { from: string; to: string; ring: string }[] = [
  { from: "#FF6B6B", to: "#EE0979", ring: "#FF6B6B" }, // pink/red
  { from: "#4FACFE", to: "#00F2FE", ring: "#4FACFE" }, // blue
  { from: "#43E97B", to: "#38F9D7", ring: "#43E97B" }, // green
  { from: "#FA709A", to: "#FEE140", ring: "#FA709A" }, // peach
  { from: "#7F7FD5", to: "#91EAE4", ring: "#7F7FD5" }, // purple/cyan
  { from: "#FDBB2D", to: "#FF6A00", ring: "#FDBB2D" }, // orange (brand)
  { from: "#30CFD0", to: "#330867", ring: "#30CFD0" }, // teal/indigo
  { from: "#A8EDEA", to: "#FED6E3", ring: "#FF8FB1" }, // soft
];

function hashSlug(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

interface Props {
  slug: string;
  iconName?: string | null;
  size?: number; // px
  className?: string;
}

export default function CategoryIcon({ slug, iconName, size = 72, className = "" }: Props) {
  const Icon = iconMap[iconName || ""] || Layers;
  const c = palette[hashSlug(slug) % palette.length];

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl shadow-lg ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`,
        boxShadow: `0 10px 24px -8px ${c.ring}55`,
      }}
    >
      {/* glossy highlight */}
      <div
        className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 55%)" }}
      />
      {/* soft inner ring */}
      <div className="absolute inset-1 rounded-xl border border-white/20 pointer-events-none" />
      <Icon style={{ width: size * 0.42, height: size * 0.42 }} className="relative text-white drop-shadow-md" strokeWidth={2.25} />
    </div>
  );
}
