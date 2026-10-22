import React, {
  useState, useEffect, useRef, useCallback,
} from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { TokenTable, type TokenGroup } from "./shared/TokenTable";
import {
  Zap, Shield, BarChart2, TrendingUp, Package,
  Check, ArrowRight,
} from "lucide-react";

function useDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

/* ══════════════════════════════════════════════════════════
   1. GRADIENT ANIMATION BACKGROUND
   Inspiração: Aceternity Background Gradient Animation
   Blobs animados de cor que criam atmosfera orgânica
══════════════════════════════════════════════════════════ */

/* 10 slots de trajetória — cada cor selecionada ocupa um slot */
const BLOB_SLOTS = [
  { w: 620, h: 620, top: "0%",   left: "0%",   x: ["0%","28%","-18%","0%"],   y: ["0%","22%","42%","0%"],    dur: 18 },
  { w: 520, h: 520, top: "-10%", left: "55%",  x: ["55%","30%","68%","55%"],   y: ["-10%","38%","6%","-10%"], dur: 23 },
  { w: 560, h: 560, top: "50%",  left: "-12%", x: ["-12%","42%","14%","-12%"], y: ["50%","8%","68%","50%"],   dur: 16 },
  { w: 360, h: 360, top: "55%",  left: "65%",  x: ["65%","18%","78%","65%"],   y: ["55%","78%","18%","55%"],  dur: 21 },
  { w: 460, h: 460, top: "25%",  left: "25%",  x: ["25%","-22%","48%","25%"],  y: ["25%","58%","-12%","25%"], dur: 19 },
  { w: 420, h: 420, top: "5%",   left: "-28%", x: ["-28%","58%","8%","-28%"],  y: ["5%","48%","78%","5%"],    dur: 25 },
  { w: 500, h: 500, top: "45%",  left: "48%",  x: ["48%","8%","68%","48%"],    y: ["45%","18%","68%","45%"],  dur: 14 },
  { w: 320, h: 320, top: "75%",  left: "18%",  x: ["18%","68%","-12%","18%"],  y: ["75%","8%","38%","75%"],   dur: 22 },
  { w: 480, h: 480, top: "8%",   left: "75%",  x: ["75%","48%","88%","75%"],   y: ["8%","38%","28%","8%"],    dur: 17 },
  { w: 380, h: 380, top: "-18%", left: "38%",  x: ["38%","78%","18%","38%"],   y: ["-18%","28%","58%","-18%"],dur: 20 },
];

/* Paleta dark — swatches visíveis + cor do blob correspondente */
type PaletteEntry = { id: string; group: "Graphite" | "Crimson"; label: string; display: string; blob: string };

const DARK_PALETTE: PaletteEntry[] = [
  { id: "g900", group: "Graphite", label: "G-900", display: "#131A27", blob: "rgba(19,26,39,0.90)"   },
  { id: "g800", group: "Graphite", label: "G-800", display: "#1C2333", blob: "rgba(28,35,51,0.85)"   },
  { id: "g700", group: "Graphite", label: "G-700", display: "#283043", blob: "rgba(40,48,67,0.80)"   },
  { id: "g600", group: "Graphite", label: "G-600", display: "#374155", blob: "rgba(55,65,85,0.68)"   },
  { id: "g500", group: "Graphite", label: "G-500", display: "#495669", blob: "rgba(73,86,105,0.58)"  },
  { id: "c950", group: "Crimson",  label: "C-950", display: "#220505", blob: "rgba(34,5,5,0.82)"     },
  { id: "c900", group: "Crimson",  label: "C-900", display: "#3A0909", blob: "rgba(58,9,9,0.72)"     },
  { id: "c700", group: "Crimson",  label: "C-700", display: "#8C1B1B", blob: "rgba(139,27,27,0.52)"  },
  { id: "c500", group: "Crimson",  label: "C-500", display: "#B82828", blob: "rgba(184,40,40,0.38)"  },
  { id: "c400", group: "Crimson",  label: "C-400", display: "#D44D4D", blob: "rgba(212,77,77,0.26)"  },
];

/* Paleta light */
const LIGHT_PALETTE: PaletteEntry[] = [
  { id: "white", group: "Graphite", label: "White",  display: "#FFFFFF", blob: "rgba(255,255,255,1.00)" },
  { id: "g50",   group: "Graphite", label: "G-50",   display: "#EDF0F5", blob: "rgba(237,240,245,0.95)" },
  { id: "g100",  group: "Graphite", label: "G-100",  display: "#D6DCE6", blob: "rgba(214,220,230,0.90)" },
  { id: "g200",  group: "Graphite", label: "G-200",  display: "#B3BDD0", blob: "rgba(179,189,208,0.82)" },
  { id: "g300",  group: "Graphite", label: "G-300",  display: "#8898B0", blob: "rgba(136,152,176,0.62)" },
  { id: "g400",  group: "Graphite", label: "G-400",  display: "#627288", blob: "rgba(98,114,136,0.48)"  },
  { id: "c50",   group: "Crimson",  label: "C-50",   display: "#FDF2F2", blob: "rgba(253,242,242,1.00)" },
  { id: "c100",  group: "Crimson",  label: "C-100",  display: "#F5C6C6", blob: "rgba(245,198,198,0.78)" },
  { id: "c200",  group: "Crimson",  label: "C-200",  display: "#E88080", blob: "rgba(232,128,128,0.38)" },
  { id: "c400l", group: "Crimson",  label: "Primary", display: "#D44D4D", blob: "rgba(212,77,77,0.22)"  },
];

const DEFAULT_DARK  = ["g700", "c900", "g800", "c700"];
const DEFAULT_LIGHT = ["g50", "c50", "g100", "c200"];
const MAX_BLOBS = 8;

/* Core blob renderer — aceita array dinâmico de cores */
function GradientAnimBg({
  dark, blobColors, children,
}: { dark: boolean; blobColors: string[]; children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: dark ? "#0D1119" : "#FFFFFF" }}>
      {BLOB_SLOTS.slice(0, blobColors.length).map((slot, i) => (
        <motion.div key={i}
          style={{
            position: "absolute",
            width: slot.w, height: slot.h,
            borderRadius: "50%",
            background: blobColors[i],
            filter: "blur(90px)",
            top: slot.top, left: slot.left,
          }}
          animate={{ x: slot.x, y: slot.y }}
          transition={{ duration: slot.dur, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
        />
      ))}
      <div style={{ position: "relative", zIndex: 10, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

/* Color swatch button */
function Swatch({
  entry, active, disabled, onToggle,
}: { entry: PaletteEntry; active: boolean; disabled: boolean; onToggle: () => void }) {
  const isWhite = entry.display === "#FFFFFF";
  return (
    <button
      onClick={onToggle}
      title={`${entry.label}${active ? " — clique para remover" : disabled ? " — máximo atingido" : " — clique para adicionar"}`}
      style={{
        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
        background: entry.display,
        border: active
          ? "2.5px solid #D44D4D"
          : isWhite
            ? "2px solid rgba(0,0,0,0.18)"
            : "2px solid rgba(255,255,255,0.10)",
        boxShadow: active ? "0 0 0 1px rgba(212,77,77,0.40)" : "none",
        cursor: disabled && !active ? "not-allowed" : "pointer",
        opacity: disabled && !active ? 0.35 : 1,
        transform: active ? "scale(1.20)" : "scale(1)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        position: "relative",
      }}
    >
      {active && (
        <span style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.5rem", color: isWhite ? "#D44D4D" : "#fff",
          fontWeight: 900, userSelect: "none",
        }}>✓</span>
      )}
    </button>
  );
}

/* Painel de controle inline — vive dentro do card, fora do preview */
function GradientControls({
  dark, activeIds, onToggle,
}: { dark: boolean; activeIds: string[]; onToggle: (id: string) => void }) {
  const palette    = dark ? DARK_PALETTE : LIGHT_PALETTE;
  const graphite   = palette.filter(e => e.group === "Graphite");
  const crimson    = palette.filter(e => e.group === "Crimson");
  const maxReached = activeIds.length >= MAX_BLOBS;

  return (
    <div className="px-5 py-4 border-b border-border flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
          Cores dos blobs
        </span>
        <span className={`text-[0.625rem] font-bold px-2 py-0.5 rounded-full ${
          maxReached
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
        }`}>
          {activeIds.length}/{MAX_BLOBS} ativas
        </span>
      </div>

      {/* Groups */}
      {[
        { label: "Graphite", entries: graphite },
        { label: "Crimson",  entries: crimson  },
      ].map(({ label, entries }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-[0.625rem] font-bold uppercase tracking-[0.06em] text-muted-foreground/60 w-12 shrink-0">
            {label}
          </span>
          <div className="flex gap-2 flex-wrap">
            {entries.map(e => (
              <Swatch key={e.id} entry={e}
                active={activeIds.includes(e.id)}
                disabled={maxReached && !activeIds.includes(e.id)}
                onToggle={() => onToggle(e.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Card dedicado para o Gradient Animation — combina preview + controles + docs */
function GradientAnimCard() {
  const dark = useDarkMode();

  const [activeIds, setActiveIds] = useState<string[]>(() =>
    dark ? DEFAULT_DARK : DEFAULT_LIGHT
  );
  const [tab, setTab] = useState<"spec" | "usage">("spec");

  useEffect(() => {
    setActiveIds(dark ? DEFAULT_DARK : DEFAULT_LIGHT);
  }, [dark]);

  const palette = dark ? DARK_PALETTE : LIGHT_PALETTE;
  const blobColors = activeIds
    .map(id => palette.find(e => e.id === id)?.blob)
    .filter(Boolean) as string[];

  const toggle = useCallback((id: string) => {
    setActiveIds(prev => {
      if (prev.includes(id)) return prev.length > 1 ? prev.filter(x => x !== id) : prev;
      if (prev.length >= MAX_BLOBS) return prev;
      return [...prev, id];
    });
  }, []);

  const name        = "Gradient Animation";
  const description = "Blobs de cor que se movem criando atmosfera orgânica. Selecione até 8 cores da paleta graphite + crimson diretamente abaixo.";
  const technique   = "motion/react blobs (divs circulares com filter: blur) animados em loop com repeatType 'mirror'. 10 slots de trajetória pré-definidos. Selecione e combine cores da paleta livremente — cada cor ativa ocupa um slot.";
  const tags: EffectTag[] = ["Animado"];
  const components  = ["Hero section", "Login page", "Splash screen", "Landing de produto"];
  const useWhen     = [
    "Hero de produto com tom premium e visual imersivo.",
    "Quando quer criar energia sem usar elementos decorativos.",
    "Pages de conversão de alto valor (Enterprise, Custom pricing).",
  ];
  const avoidWhen   = [
    "Conteúdo muito denso — o movimento compete com a leitura.",
    "Uso em múltiplas seções — reservar apenas para o hero.",
    "Marca que prioriza austeridade absoluta.",
  ];

  return (
    <div className="rounded-[20px] border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
      {/* Preview — limpo, sem overlay */}
      <div className="h-80 relative overflow-hidden">
        <GradientAnimPreview dark={dark} blobColors={blobColors} />
      </div>

      {/* Controles de cor — entre preview e docs */}
      <GradientControls dark={dark} activeIds={activeIds} onToggle={toggle} />

      {/* Info — igual ao EffectCard padrão */}
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3 justify-between">
          <div>
            <h3 className="text-[0.9375rem] font-black text-foreground tracking-[-0.025em]">{name}</h3>
            <p className="text-[0.8125rem] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end shrink-0">
            {tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-[5px] text-[0.5625rem] font-bold uppercase tracking-wide whitespace-nowrap"
                style={{ background: tagColors[t].bg, color: tagColors[t].color }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-[10px] bg-muted w-fit">
          {(["spec", "usage"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-[8px] text-[0.75rem] font-semibold transition-colors
                ${tab === t ? "bg-card text-foreground" : "text-muted-foreground"}`}>
              {t === "spec" ? "Técnica" : "Quando usar"}
            </button>
          ))}
        </div>

        {tab === "spec" && (
          <div className="space-y-3">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Implementação</p>
              <p className="text-[0.8125rem] text-foreground/80 mt-0.5 leading-relaxed">{technique}</p>
            </div>
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Componentes compatíveis</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {components.map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-[5px] bg-muted text-[0.75rem] text-foreground/80">{c}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "usage" && (
          <div className="space-y-3">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em]" style={{ color: "#4fb57b" }}>✓ Utilizar quando</p>
              <ul className="mt-1.5 space-y-1">
                {useWhen.map((w, i) => (
                  <li key={i} className="text-[0.8125rem] text-muted-foreground flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#4fb57b" }} />{w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-destructive">✕ Evitar quando</p>
              <ul className="mt-1.5 space-y-1">
                {avoidWhen.map((w, i) => (
                  <li key={i} className="text-[0.8125rem] text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive shrink-0 mt-0.5 text-[0.75rem]">✕</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Preview puro — sem controles, só o efeito */
function GradientAnimPreview({ dark, blobColors }: { dark: boolean; blobColors: string[] }) {
  return (
    <GradientAnimBg dark={dark} blobColors={blobColors}>
      <HeroContent dark={dark} />
    </GradientAnimBg>
  );
}

/* ══════════════════════════════════════════════════════════
   2. CANVAS REVEAL EFFECT
   Inspiração: Aceternity Canvas Reveal Effect
   Cards: hover revela canvas animado de dots coloridos
══════════════════════════════════════════════════════════ */

type RGB = [number, number, number];

type CanvasPreset = { id: string; label: string; swatches: string[]; colors: RGB[] };

const CANVAS_PRESETS: CanvasPreset[] = [
  { id: "crimson",  label: "Crimson",  swatches: ["#D44D4D","#B82828","#E88080"], colors: [[212,77,77],[184,40,40],[232,128,128]] },
  { id: "graphite", label: "Graphite", swatches: ["#374155","#627288","#B3BDD0"], colors: [[55,65,85],[73,86,105],[136,152,176]] },
  { id: "ember",    label: "Ember",    swatches: ["#FF6B35","#F59E0B","#D44D4D"], colors: [[255,107,53],[245,158,11],[212,77,77]] },
  { id: "aurora",   label: "Aurora",   swatches: ["#0EA5E9","#10B981","#A855F7"], colors: [[14,165,233],[16,185,129],[168,85,247]] },
  { id: "rose",     label: "Rose",     swatches: ["#F43F5E","#FB7185","#E11D48"], colors: [[244,63,94],[251,113,133],[225,29,72]] },
];

const DOT_SIZES = [
  { id: "xs", label: "XP", px: 2 },
  { id: "sm", label: "P",  px: 4 },
  { id: "md", label: "M",  px: 6 },
  { id: "lg", label: "G",  px: 10 },
];

const ANIM_SPEEDS = [
  { id: "slow",   label: "Lenta",  val: 2 },
  { id: "normal", label: "Normal", val: 4 },
  { id: "fast",   label: "Rápida", val: 8 },
];

/* Animated dot canvas — monta via AnimatePresence no hover do card */
function CanvasRevealEffect({
  colors = [[212, 77, 77]] as RGB[],
  dotSize = 4,
  animationSpeed = 4,
}: {
  colors?: RGB[];
  dotSize?: number;
  animationSpeed?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (!W || !H) return;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const CELL  = dotSize * 5;
    const cols  = Math.ceil(W / CELL);
    const rows  = Math.ceil(H / CELL);
    const n     = cols * rows;
    const phases = new Float32Array(n).map(() => Math.random() * Math.PI * 2);
    const cIdx   = new Uint8Array(n).map(() => Math.floor(Math.random() * colors.length));
    const speed  = animationSpeed * 0.018;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += speed;
      const gap = Math.max(1, Math.round(CELL * 0.12));
      for (let i = 0; i < n; i++) {
        const a = Math.max(0, Math.sin(t + phases[i]));
        if (a < 0.02) continue;
        const r_ = Math.floor(i / cols);
        const c_ = i % cols;
        const [rr, gg, bb] = colors[cIdx[i]];
        ctx.globalAlpha = a * 0.92;
        ctx.fillStyle   = `rgb(${rr},${gg},${bb})`;
        ctx.fillRect(c_ * CELL + gap, r_ * CELL + gap, dotSize, dotSize);
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [colors, dotSize, animationSpeed]);

  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
  );
}

/* Corner "+" icon */
function CornerIcon({ pos }: { pos: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth="1.5" stroke="currentColor"
      style={{ position: "absolute", width: 20, height: 20, color: "rgba(255,255,255,0.25)", ...Object.fromEntries(pos.split(" ").map(p => [p === "top" ? "top" : p === "bottom" ? "bottom" : p === "left" ? "left" : "right", -10])) }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
}

/* Single reveal card */
type RevealCardDef = { icon: React.ReactNode; title: string; bg: string };

function RevealCardItem({
  card, colors, dotSize, animationSpeed,
}: {
  card: RevealCardDef;
  colors: RGB[];
  dotSize: number;
  animationSpeed: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", height: 300,
        background: card.bg,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", cursor: "pointer",
      }}
    >
      {/* Corner icons */}
      {[{top:-10,left:-10},{bottom:-10,left:-10},{top:-10,right:-10},{bottom:-10,right:-10}].map((s,i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth="1.5" stroke="currentColor"
          style={{ position:"absolute", width:20, height:20, color:"rgba(255,255,255,0.22)", ...s }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
        </svg>
      ))}

      {/* Canvas reveal — aparece no hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <CanvasRevealEffect colors={colors} dotSize={dotSize} animationSpeed={animationSpeed} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 24px" }}>
        <motion.div
          animate={{ y: hovered ? -16 : 0, opacity: hovered ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}
        >
          {card.icon}
        </motion.div>
        <motion.h3
          animate={{ y: hovered ? -6 : 8, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.25 }}
        >
          {card.title}
        </motion.h3>
      </div>
    </div>
  );
}

/* Card dedicado com controles de cor, tamanho e velocidade */
function CanvasRevealCard() {
  const dark = useDarkMode();
  const [presetId,  setPresetId]  = useState("crimson");
  const [dotSizeId, setDotSizeId] = useState("sm");
  const [speedId,   setSpeedId]   = useState("normal");
  const [tab,       setTab]       = useState<"spec" | "usage">("spec");

  const preset   = CANVAS_PRESETS.find(p => p.id === presetId)!;
  const dotOpt   = DOT_SIZES.find(s => s.id === dotSizeId)!;
  const speedOpt = ANIM_SPEEDS.find(s => s.id === speedId)!;

  const ctrl = dark ? "rgba(255,255,255,0.07)" : "rgba(19,26,39,0.08)";
  const idle = dark ? "#8898B0" : "#627288";
  const tags: EffectTag[] = ["Interativo", "Canvas"];

  const demoCards: RevealCardDef[] = [
    { title: "Segurança",      icon: <Shield     style={{ width:38, height:38, color:"rgba(255,255,255,0.45)" }} />, bg: "#0D1119" },
    { title: "Performance",    icon: <Zap        style={{ width:38, height:38, color:"rgba(255,255,255,0.45)" }} />, bg: "#131A27" },
    { title: "Escalabilidade", icon: <TrendingUp style={{ width:38, height:38, color:"rgba(255,255,255,0.45)" }} />, bg: "#1C2333" },
  ];

  return (
    <div className="rounded-[20px] border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>

      {/* Preview — 3 cards lado a lado */}
      <div className="grid grid-cols-3">
        {demoCards.map(card => (
          <RevealCardItem
            key={card.title}
            card={card}
            colors={preset.colors}
            dotSize={dotOpt.px}
            animationSpeed={speedOpt.val}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="border-t border-border bg-card px-5 py-3.5 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Cores</span>
          <div className="flex flex-wrap gap-1.5">
            {CANVAS_PRESETS.map(p => (
              <button key={p.id} onClick={() => setPresetId(p.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[0.6875rem] font-semibold transition-all"
                style={{
                  border: `1.5px solid ${presetId === p.id ? "#D44D4D" : ctrl}`,
                  background: presetId === p.id ? "rgba(212,77,77,0.08)" : "transparent",
                  color: presetId === p.id ? "#D44D4D" : idle,
                }}>
                <span className="flex gap-0.5">
                  {p.swatches.map(hex => (
                    <span key={hex} style={{ width:7, height:7, borderRadius:2, background:hex, display:"inline-block" }} />
                  ))}
                </span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Tamanho</span>
          <div className="flex gap-1">
            {DOT_SIZES.map(s => (
              <button key={s.id} onClick={() => setDotSizeId(s.id)}
                className="w-9 py-1.5 rounded-[7px] text-[0.6875rem] font-bold transition-all"
                style={{
                  border: `1.5px solid ${dotSizeId === s.id ? "#D44D4D" : ctrl}`,
                  background: dotSizeId === s.id ? "rgba(212,77,77,0.08)" : "transparent",
                  color: dotSizeId === s.id ? "#D44D4D" : idle,
                }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Velocidade</span>
          <div className="flex gap-1">
            {ANIM_SPEEDS.map(s => (
              <button key={s.id} onClick={() => setSpeedId(s.id)}
                className="px-3 py-1.5 rounded-[7px] text-[0.6875rem] font-semibold transition-all"
                style={{
                  border: `1.5px solid ${speedId === s.id ? "#D44D4D" : ctrl}`,
                  background: speedId === s.id ? "rgba(212,77,77,0.08)" : "transparent",
                  color: speedId === s.id ? "#D44D4D" : idle,
                }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3 justify-between">
          <div>
            <h3 className="text-[0.9375rem] font-black text-foreground tracking-[-0.025em]">Canvas Reveal</h3>
            <p className="text-[0.8125rem] text-muted-foreground mt-0.5 leading-relaxed">
              Passe o mouse sobre os cards. Dots coloridos animados preenchem o card no hover — ícone sobe e título aparece.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end shrink-0">
            {tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-[5px] text-[0.5625rem] font-bold uppercase tracking-wide whitespace-nowrap"
                style={{ background: tagColors[t].bg, color: tagColors[t].color }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-[10px] bg-muted w-fit">
          {(["spec", "usage"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-[8px] text-[0.75rem] font-semibold transition-colors ${tab === t ? "bg-card text-foreground" : "text-muted-foreground"}`}>
              {t === "spec" ? "Técnica" : "Quando usar"}
            </button>
          ))}
        </div>

        {tab === "spec" && (
          <div className="space-y-3">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Implementação</p>
              <p className="text-[0.8125rem] text-foreground/80 mt-0.5 leading-relaxed">
                Canvas 2D com grid de dots — cada dot tem uma <code className="text-primary text-[0.6875rem]">phase</code> aleatória numa onda seno, criando pulsação independente. <code className="text-primary text-[0.6875rem]">AnimatePresence</code> monta/desmonta o canvas no hover com fade. Conteúdo usa <code className="text-primary text-[0.6875rem]">motion.div</code> para o slide do título.
              </p>
            </div>
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Componentes compatíveis</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {["Feature cards", "Pricing cards", "Testimonials", "Showcase de produto"].map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-[5px] bg-muted text-[0.75rem] text-foreground/80">{c}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "usage" && (
          <div className="space-y-3">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em]" style={{ color: "#4fb57b" }}>✓ Utilizar quando</p>
              <ul className="mt-1.5 space-y-1">
                {["Cards de features ou diferenciais de produto.", "Seções de exploração onde o usuário tem tempo.", "Quando quer criar um wow moment sem distração."].map((w, i) => (
                  <li key={i} className="text-[0.8125rem] text-muted-foreground flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#4fb57b" }} />{w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-destructive">✕ Evitar quando</p>
              <ul className="mt-1.5 space-y-1">
                {["Mobile — hover não existe em touch.", "Cards com muita informação interna.", "Contextos com preferência por menos movimento."].map((w, i) => (
                  <li key={i} className="text-[0.8125rem] text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive shrink-0 mt-0.5 text-[0.75rem]">✕</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   3. VORTEX
   Inspiração: Aceternity Vortex
   Partículas que spiralam a partir do centro
══════════════════════════════════════════════════════════ */

type VortexParticle = {
  angle: number; radius: number; speed: number;
  rotSpeed: number; size: number; color: string;
  opacity: number; maxRadius: number; trail: { x: number; y: number }[];
};

function VortexBg({ dark, children }: { dark: boolean; children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (W === 0 || H === 0) return;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cx = W / 2, cy = H / 2;
    const MAX_R = Math.min(W, H) * 0.5;

    const darkColors = ["#283043","#374155","#D44D4D","#495669","#1C2333","#E88080","#627288"];
    const lightColors = ["#B3BDD0","#8898B0","#D44D4D","#627288","#D6DCE6","#E88080","#374155"];
    const palette = dark ? darkColors : lightColors;

    const makeP = (): VortexParticle => {
      const angle = Math.random() * Math.PI * 2;
      return {
        angle,
        radius: Math.random() * 8,
        speed: 0.4 + Math.random() * 0.9,
        rotSpeed: (0.012 + Math.random() * 0.02) * (Math.random() > 0.3 ? 1 : -1),
        size: 0.8 + Math.random() * 2,
        color: palette[Math.floor(Math.random() * palette.length)],
        opacity: 0.5 + Math.random() * 0.5,
        maxRadius: MAX_R * (0.3 + Math.random() * 0.7),
        trail: [],
      };
    };

    const N = 140;
    const particles: VortexParticle[] = Array.from({ length: N }, makeP);

    // clear once
    ctx.fillStyle = dark ? "#0D1119" : "#FFFFFF";
    ctx.fillRect(0, 0, W, H);

    const draw = () => {
      // fade trail
      ctx.fillStyle = dark ? "rgba(13,17,25,0.18)" : "rgba(255,255,255,0.18)";
      ctx.fillRect(0, 0, W, H);

      for (const p of particles) {
        p.angle += p.rotSpeed;
        p.radius += p.speed * 0.25;

        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius * 0.55;

        const fade = Math.min(1, p.radius / 15) * Math.max(0, 1 - p.radius / p.maxRadius);
        ctx.globalAlpha = p.opacity * fade;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.radius >= p.maxRadius) Object.assign(p, makeP());
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [dark]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   4. BACKGROUND LINES
   Inspiração: Aceternity Background Lines
   Linhas horizontais com segmentos brilhantes que percorrem o background
══════════════════════════════════════════════════════════ */

const bgLinesStyle = `
  @keyframes bgl-travel {
    from { stroke-dashoffset: 1200; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes bgl-pulse {
    0%, 100% { opacity: 0; }
    40%, 60%  { opacity: 1; }
  }
`;

function BackgroundLinesBg({ dark, children }: { dark: boolean; children: React.ReactNode }) {
  const COUNT = 28;
  const base = dark ? "#0D1119" : "#FFFFFF";
  const lineStroke = dark ? "rgba(55,65,85,0.28)" : "rgba(179,189,208,0.40)";
  const glowStroke = dark ? "rgba(212,77,77,0.55)" : "rgba(212,77,77,0.40)";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: base }}>
      <svg
        aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{bgLinesStyle}</style>
        </defs>

        {Array.from({ length: COUNT }, (_, i) => {
          const yPct = ((i + 0.5) / COUNT) * 100;
          const dur  = 5 + (i % 6) * 1.2;
          const del  = (i * 0.55) % 7;
          const pulDur = 3 + (i % 4) * 0.8;
          const pulDel  = (i * 0.4) % 4;
          const glowW = 1.5 + (i % 3) * 0.5;
          return (
            <g key={i}>
              {/* base line */}
              <line
                x1="0" y1={`${yPct}%`} x2="100%" y2={`${yPct}%`}
                stroke={lineStroke} strokeWidth="0.5"
              />
              {/* traveling glow */}
              <line
                x1="0" y1={`${yPct}%`} x2="100%" y2={`${yPct}%`}
                stroke={glowStroke} strokeWidth={glowW}
                strokeDasharray="60 1200"
                style={{
                  animation: `bgl-travel ${dur}s ${del}s linear infinite, bgl-pulse ${pulDur}s ${pulDel}s ease-in-out infinite`,
                }}
              />
            </g>
          );
        })}
      </svg>

      <div style={{ position: "relative", zIndex: 10, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   5. WOBBLE CARD
   Inspiração: Aceternity Wobble Card
   Card com perspectiva 3D que inclina ao passar o mouse + spotlight crimson
══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   CONTEÚDO DOS PREVIEWS
══════════════════════════════════════════════════════════ */

function HeroContent({ dark }: { dark: boolean }) {
  const c = dark ? "#E4E9F0" : "#131A27";
  const m = dark ? "#627288" : "#8898B0";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", padding: 24 }}>
      <div style={{ maxWidth: 280 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 99, border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(19,26,39,0.15)"}`, marginBottom: 14 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "#D44D4D", display: "inline-block" }} />
          <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: dark ? "rgba(255,255,255,0.6)" : "#627288", textTransform: "uppercase", letterSpacing: "0.06em" }}>v2.0 disponível</span>
        </div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 900, color: c, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 10 }}>
          A plataforma para<br />times que entregam.
        </h1>
        <p style={{ fontSize: "0.8125rem", color: m, lineHeight: 1.6, marginBottom: 18 }}>
          Deploy, observabilidade e monitoramento em um só lugar.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, background: "#D44D4D", color: "#fff", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
            Começar agora <ArrowRight style={{ width: 12, height: 12 }} />
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(19,26,39,0.15)"}`, background: "transparent", color: dark ? "#8898B0" : "#627288", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
            Ver demo
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsContent({ dark }: { dark: boolean }) {
  const m = dark ? "#627288" : "#8898B0";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", padding: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, maxWidth: 300, width: "100%" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: dark ? "#E4E9F0" : "#131A27", letterSpacing: "-0.025em", textAlign: "center", lineHeight: 1.2 }}>
          Hover para revelar<br />o que está abaixo.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, width: "100%" }}>
          {[{ v: "99.9%", l: "Uptime" }, { v: "50ms", l: "Latência" }, { v: "10k+", l: "Clientes" }].map(s => (
            <div key={s.l} style={{ textAlign: "center", padding: "10px 6px", borderRadius: 10, background: dark ? "rgba(19,26,39,0.60)" : "rgba(255,255,255,0.70)", backdropFilter: "blur(8px)", border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(19,26,39,0.08)"}` }}>
              <div style={{ fontSize: "1rem", fontWeight: 900, color: "#D44D4D" }}>{s.v}</div>
              <div style={{ fontSize: "0.5625rem", color: m }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VortexContent({ dark }: { dark: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 99, background: dark ? "rgba(212,77,77,0.15)" : "rgba(212,77,77,0.10)", border: `1px solid rgba(212,77,77,0.25)`, marginBottom: 14 }}>
          <Zap style={{ width: 12, height: 12, color: "#D44D4D" }} />
          <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "#D44D4D", textTransform: "uppercase", letterSpacing: "0.07em" }}>Processamento</span>
        </div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: dark ? "#E4E9F0" : "#131A27", letterSpacing: "-0.025em", lineHeight: 1.2, marginBottom: 8 }}>
          1M+ eventos<br />por segundo.
        </h2>
        <p style={{ fontSize: "0.75rem", color: dark ? "#627288" : "#8898B0" }}>
          Infraestrutura distribuída com zero downtime.
        </p>
      </div>
    </div>
  );
}

function LinesContent({ dark }: { dark: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", padding: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
        <p style={{ fontSize: "0.5625rem", fontWeight: 700, color: dark ? "#495669" : "#8898B0", textTransform: "uppercase", letterSpacing: "0.07em" }}>Integrações</p>
        {[
          { icon: Shield, label: "GitHub Actions", status: "Ativo" },
          { icon: BarChart2, label: "Datadog", status: "Ativo" },
          { icon: Package, label: "Docker Hub", status: "Configurando" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: dark ? "rgba(19,26,39,0.70)" : "rgba(255,255,255,0.80)", backdropFilter: "blur(8px)", border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(19,26,39,0.08)"}` }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: dark ? "rgba(212,77,77,0.15)" : "rgba(212,77,77,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <item.icon style={{ width: 14, height: 14, color: "#D44D4D" }} />
            </div>
            <span style={{ flex: 1, fontSize: "0.75rem", fontWeight: 600, color: dark ? "#E4E9F0" : "#131A27" }}>{item.label}</span>
            <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: item.status === "Ativo" ? "#4fb57b" : dark ? "#627288" : "#8898B0" }}>● {item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   EFFECT CARD — wrapper de documentação para cada efeito
══════════════════════════════════════════════════════════ */

type EffectTag = "Animado" | "Interativo" | "Canvas" | "SVG" | "3D";

type EffectDef = {
  id: string;
  name: string;
  tags: EffectTag[];
  description: string;
  technique: string;
  components: string[];
  useWhen: string[];
  avoidWhen: string[];
  previewDark: React.ReactNode;
  previewLight: React.ReactNode;
};

const tagColors: Record<EffectTag, { bg: string; color: string }> = {
  "Animado":    { bg: "rgba(96,165,250,0.12)",   color: "#60a5fa" },
  "Interativo": { bg: "rgba(167,139,250,0.12)",   color: "#a78bfa" },
  "Canvas":     { bg: "rgba(251,191,36,0.12)",    color: "#f59e0b" },
  "SVG":        { bg: "rgba(34,197,94,0.12)",     color: "#22c55e" },
  "3D":         { bg: "rgba(251,113,133,0.12)",   color: "#fb7185" },
};

function EffectCard({ ef }: { ef: EffectDef }) {
  const dark = useDarkMode();
  const [tab, setTab] = useState<"spec" | "usage">("spec");
  const preview = dark ? ef.previewDark : ef.previewLight;

  return (
    <div className="rounded-[20px] border border-border bg-card overflow-hidden"
      style={{ boxShadow: "var(--shadow-md)" }}>
      {/* Interactive preview */}
      <div className="h-80 relative overflow-hidden">
        {preview}
      </div>

      {/* Info */}
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3 justify-between">
          <div>
            <h3 className="text-[0.9375rem] font-black text-foreground tracking-[-0.025em]">{ef.name}</h3>
            <p className="text-[0.8125rem] text-muted-foreground mt-0.5 leading-relaxed">{ef.description}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end shrink-0">
            {ef.tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-[5px] text-[0.5625rem] font-bold uppercase tracking-wide whitespace-nowrap"
                style={{ background: tagColors[t].bg, color: tagColors[t].color }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-[10px] bg-muted w-fit">
          {(["spec", "usage"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-[8px] text-[0.75rem] font-semibold transition-colors
                ${tab === t ? "bg-card text-foreground" : "text-muted-foreground"}`}>
              {t === "spec" ? "Técnica" : "Quando usar"}
            </button>
          ))}
        </div>

        {tab === "spec" && (
          <div className="space-y-3">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Implementação</p>
              <p className="text-[0.8125rem] text-foreground/80 mt-0.5 leading-relaxed">{ef.technique}</p>
            </div>
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Componentes compatíveis</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {ef.components.map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-[5px] bg-muted text-[0.75rem] text-foreground/80">{c}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "usage" && (
          <div className="space-y-3">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em]" style={{ color: "#4fb57b" }}>✓ Utilizar quando</p>
              <ul className="mt-1.5 space-y-1">
                {ef.useWhen.map((w, i) => (
                  <li key={i} className="text-[0.8125rem] text-muted-foreground flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#4fb57b" }} />{w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-destructive">✕ Evitar quando</p>
              <ul className="mt-1.5 space-y-1">
                {ef.avoidWhen.map((w, i) => (
                  <li key={i} className="text-[0.8125rem] text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive shrink-0 mt-0.5 text-[0.75rem]">✕</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   EFFECT DEFINITIONS
══════════════════════════════════════════════════════════ */

/* Gradient Animation e Canvas Reveal são renderizados via cards dedicados — não entram neste array */
const effects: EffectDef[] = [
  {
    id: "vortex",
    name: "Vortex",
    tags: ["Animado", "Canvas"],
    description: "Partículas emergem do centro e espiralam para fora com movimento orgânico contínuo. Transmite energia, velocidade e escala.",
    technique: "Canvas 2D com sistema de partículas: cada uma tem angle, radius, rotSpeed e maxRadius independentes. RAF loop move partículas em espiral elíptica. Trail fade com fillRect semi-transparente sobre o canvas.",
    components: ["Hero de produto de alto processamento", "Background de loading", "Splash screen de produto técnico"],
    useWhen: [
      "Produto de infraestrutura, streaming de dados ou alta performance.",
      "Momentos de loading onde a espera deve ser visualmente engajante.",
      "Conferências e demos ao vivo.",
    ],
    avoidWhen: [
      "Produto de consumo ou B2C não-técnico.",
      "Uso em background de formulários — distrai demais.",
      "Devices com CPU limitada em produção (fallback necessário).",
    ],
    previewDark: <VortexBg dark={true}><VortexContent dark={true} /></VortexBg>,
    previewLight: <VortexBg dark={false}><VortexContent dark={false} /></VortexBg>,
  },
  {
    id: "bg-lines",
    name: "Background Lines",
    tags: ["Animado", "SVG"],
    description: "Linhas horizontais paralelas com segmentos crimson viajando continuamente. Evoca fluxo de dados, pipelines e infraestrutura.",
    technique: "SVG com pares de <line>: base (stroke 0.5px, opacidade baixa) + glow (strokeDasharray com segmento curto animado via stroke-dashoffset). Dois @keyframes independentes: travel (deslocamento linear) + pulse (opacidade sinusoidal).",
    components: ["Hero de produto de dados", "Seção de integrações", "Feature background de pipeline/CI"],
    useWhen: [
      "Produto de dados, ETL, CI/CD ou monitoramento.",
      "Quando quer comunicar 'fluxo contínuo' sem uma ilustração explícita.",
      "Seção de integrações ou conectividade.",
    ],
    avoidWhen: [
      "Produto de consumo — linhas remetem a ferramentas técnicas.",
      "Uso em páginas com muitas cores — o glow crimson vai conflitar.",
      "Seção de pricing — o fundo é muito 'ativo' para comparação de planos.",
    ],
    previewDark: <BackgroundLinesBg dark={true}><LinesContent dark={true} /></BackgroundLinesBg>,
    previewLight: <BackgroundLinesBg dark={false}><LinesContent dark={false} /></BackgroundLinesBg>,
  },
];

/* ══════════════════════════════════════════════════════════
   TOKENS
══════════════════════════════════════════════════════════ */

const bgTokenGroups: TokenGroup[] = [
  {
    group: "Gradient Animation — cores dos blobs",
    tokens: [
      { name: "--graphite-700", description: "Blob base dark",         light: "#283043", dark: "#283043", isColor: true },
      { name: "--crimson-900",  description: "Blob accent dark",        light: "#3A0909", dark: "#3A0909", isColor: true },
      { name: "--graphite-100", description: "Blob base light",         light: "#D6DCE6", isColor: true },
      { name: "--crimson-50",   description: "Blob accent light",       light: "#FDF2F2", isColor: true },
    ],
  },
  {
    group: "Canvas Reveal — grade de quadrados",
    tokens: [
      { name: "--graphite-900",  description: "Cor da célula dark (tom 1)", light: "#131A27", dark: "#131A27", isColor: true },
      { name: "--graphite-800",  description: "Cor da célula dark (tom 2)", light: "#1C2333", dark: "#1C2333", isColor: true },
      { name: "--graphite-700",  description: "Cor da célula dark (tom 3)", light: "#283043", dark: "#283043", isColor: true },
      { name: "--graphite-200",  description: "Cor da célula light",        light: "#B3BDD0", isColor: true },
    ],
  },
  {
    group: "Background Lines — linhas e glow",
    tokens: [
      { name: "--graphite-600",  description: "Cor das linhas base dark",   light: "#374155", dark: "#374155", isColor: true },
      { name: "--graphite-200",  description: "Cor das linhas base light",  light: "#B3BDD0", isColor: true },
      { name: "--primary",       description: "Glow dos segmentos viajantes",light: "#D44D4D", dark: "#D44D4D", isColor: true },
    ],
  },
  {
    group: "Vortex — partículas",
    tokens: [
      { name: "--graphite-700",  description: "Partícula base dark",          light: "#283043", dark: "#283043", isColor: true },
      { name: "--primary",       description: "Partícula accent (crimson)",    light: "#D44D4D", dark: "#D44D4D", isColor: true },
      { name: "--graphite-200",  description: "Partícula base light",          light: "#B3BDD0", isColor: true },
    ],
  },
];

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════ */

export function BackgroundsShowcase() {
  return (
    <div className="space-y-14">

      {/* Intro */}
      <div className="space-y-4">
        <p className="text-[0.9375rem] text-muted-foreground leading-relaxed max-w-2xl">
          Quatro padrões animados e interativos para backgrounds — cada um com personalidade visual distinta, adaptados para a paleta graphite + crimson do Design System.
          Os previews respondem ao dark/light mode do site — use o toggle no topo da página para alternar.
          Todos os previews são interativos: passe o mouse para sentir os efeitos em tempo real.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {(Object.entries(tagColors) as [EffectTag, { bg: string; color: string }][]).map(([tag, style]) => (
            <span key={tag} className="px-2.5 py-1 rounded-[6px] text-[0.6875rem] font-semibold"
              style={{ background: style.bg, color: style.color }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Gradient Animation — card dedicado com controles */}
      <section id="gradient-anim-bg">
        <GradientAnimCard />
      </section>

      {/* Canvas Reveal — card dedicado com controles de cor e tamanho */}
      <section id="canvas-reveal-bg">
        <CanvasRevealCard />
      </section>

      {/* Vortex + Background Lines em grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {effects.map(ef => (
          <section key={ef.id} id={`${ef.id}-bg`}>
            <EffectCard ef={ef} />
          </section>
        ))}
      </div>

      {/* Usage guide */}
      <section id="section-backgrounds" className="space-y-4">
        <div>
          <h2 className="text-[1.125rem] font-black text-foreground tracking-[-0.025em]">Guia de composição</h2>
          <p className="text-[0.8125rem] text-muted-foreground mt-0.5">Como combinar os efeitos em uma landing page.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "SaaS técnico (dark-first)",
              steps: [
                { step: "Hero", bg: "#1C2333", label: "Gradient Animation ou Dot Matrix Canvas" },
                { step: "Features", bg: "#131A27", label: "Background Lines (integrações)" },
                { step: "Pricing", bg: "#0D1119", label: "Wobble Card para plano recomendado" },
                { step: "CTA final", bg: "#131A27", label: "Vortex ou fundo sólido com CTA" },
              ],
            },
            {
              title: "Produto de dados (dark)",
              steps: [
                { step: "Hero", bg: "#0D1119", label: "Vortex — transmite escala" },
                { step: "Dashboard", bg: "#1C2333", label: "Canvas Reveal sobre screenshot" },
                { step: "Integrations", bg: "#131A27", label: "Background Lines (pipelines)" },
                { step: "Conversion", bg: "#0D1119", label: "Wobble Card + CTA crimson" },
              ],
            },
            {
              title: "Produto consumer (light-first)",
              steps: [
                { step: "Hero", bg: "#EDF0F5", label: "Gradient Animation light" },
                { step: "Features", bg: "#FFFFFF", label: "Background Lines suave" },
                { step: "Social proof", bg: "#ECF0F5", label: "Wobble Card em branco" },
                { step: "CTA", bg: "#131A27", label: "Inversão dark + CTA primário" },
              ],
            },
          ].map(guide => (
            <div key={guide.title} className="rounded-[14px] border border-border bg-card p-4 space-y-3"
              style={{ boxShadow: "var(--shadow-xs)" }}>
              <p className="text-[0.8125rem] font-bold text-foreground">{guide.title}</p>
              {guide.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-[0.5625rem] text-muted-foreground/40 w-3 text-right mt-0.5 shrink-0">{i + 1}</span>
                  <div className="flex-1 flex items-start gap-2">
                    <div className="h-3.5 w-3.5 rounded-[3px] mt-0.5 shrink-0" style={{ background: s.bg, border: "1px solid rgba(255,255,255,0.10)" }} />
                    <div>
                      <span className="text-[0.5625rem] font-bold text-muted-foreground uppercase tracking-wide">{s.step}: </span>
                      <span className="text-[0.6875rem] text-muted-foreground">{s.label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Tokens */}
      <section id="backgrounds-tokens" className="space-y-5">
        <div>
          <h2 className="text-[1.125rem] font-black text-foreground tracking-[-0.025em]">Tokens</h2>
          <p className="text-[0.8125rem] text-muted-foreground mt-0.5">CSS custom properties que constroem os 5 padrões de background do sistema.</p>
        </div>
        <TokenTable groups={bgTokenGroups} />
      </section>

    </div>
  );
}
