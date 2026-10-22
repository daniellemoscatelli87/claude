import React from "react";
import { TokenTable, type TokenGroup } from "./shared/TokenTable";

const graphiteScale = [
  { name: "50",  var: "--graphite-50",  hex: "#EDF0F5" },
  { name: "100", var: "--graphite-100", hex: "#D6DCE6" },
  { name: "200", var: "--graphite-200", hex: "#B3BDD0" },
  { name: "300", var: "--graphite-300", hex: "#8898B0" },
  { name: "400", var: "--graphite-400", hex: "#627288" },
  { name: "500", var: "--graphite-500", hex: "#495669" },
  { name: "600", var: "--graphite-600", hex: "#374155" },
  { name: "700", var: "--graphite-700", hex: "#283043" },
  { name: "800", var: "--graphite-800", hex: "#1C2333" },
  { name: "900", var: "--graphite-900", hex: "#131A27" },
  { name: "950", var: "--graphite-950", hex: "#0D1119" },
];

const crimsonScale = [
  { name: "50",  hex: "#FDF2F2" },
  { name: "100", hex: "#F9DADA" },
  { name: "200", hex: "#F3B3B3" },
  { name: "300", hex: "#E88080" },
  { name: "400", hex: "#D44D4D" },
  { name: "500", hex: "#B82828" },
  { name: "600", hex: "#8C1B1B" },
  { name: "700", hex: "#6D1313" },
  { name: "800", hex: "#520E0E" },
  { name: "900", hex: "#3A0909" },
  { name: "950", hex: "#220505" },
];

const semanticColors = [
  { name: "Background",       token: "--background",        swatch: "bg-background",       text: "text-foreground" },
  { name: "Surface (Card)",   token: "--card",              swatch: "bg-card",             text: "text-card-foreground" },
  { name: "Foreground",       token: "--foreground",        swatch: "bg-foreground",       text: "text-background" },
  { name: "Muted",            token: "--muted-foreground",  swatch: "bg-muted-foreground", text: "text-background" },
  { name: "Primary",          token: "--primary",           swatch: "bg-primary",          text: "text-primary-foreground" },
  { name: "Border",           token: "--border",            swatch: "bg-border",           text: "text-foreground" },
  { name: "Success",          token: "--success",           swatch: "bg-success",          text: "text-white" },
  { name: "Warning",          token: "--warning",           swatch: "bg-warning",          text: "text-white" },
  { name: "Error",            token: "--error",             swatch: "bg-error",            text: "text-white" },
  { name: "Info",             token: "--info",              swatch: "bg-info",             text: "text-white" },
];

const typeScaleItems = [
  { label: "Display",     size: "text-[3.5rem]",  weight: "font-bold",     tracking: "tracking-[-0.04em]", sample: "Display Heading" },
  { label: "H1",          size: "text-[2.5rem]",  weight: "font-bold",     tracking: "tracking-[-0.03em]", sample: "Heading One" },
  { label: "H2",          size: "text-[2rem]",    weight: "font-bold",     tracking: "tracking-[-0.025em]",sample: "Heading Two" },
  { label: "H3",          size: "text-[1.5rem]",  weight: "font-semibold", tracking: "tracking-[-0.02em]", sample: "Heading Three" },
  { label: "H4",          size: "text-[1.25rem]", weight: "font-semibold", tracking: "tracking-[-0.015em]",sample: "Heading Four" },
  { label: "H5",          size: "text-[1.125rem]",weight: "font-semibold", tracking: "tracking-[-0.01em]", sample: "Heading Five" },
  { label: "H6",          size: "text-[1rem]",    weight: "font-semibold", tracking: "",                   sample: "Heading Six" },
  { label: "Body Large",  size: "text-[1.125rem]",weight: "font-normal",   tracking: "",                   sample: "Large body text for emphasis and lead paragraphs." },
  { label: "Body",        size: "text-[1rem]",    weight: "font-normal",   tracking: "",                   sample: "Standard body text used for most content and descriptions." },
  { label: "Small",       size: "text-[0.875rem]",weight: "font-normal",   tracking: "",                   sample: "Small text for secondary info and meta details." },
  { label: "Caption",     size: "text-[0.75rem]", weight: "font-normal",   tracking: "tracking-[0.01em]",  sample: "Caption text used for labels and fine print." },
  { label: "Label",       size: "text-[0.875rem]",weight: "font-medium",   tracking: "",                   sample: "Form label and UI element label" },
  { label: "Button",      size: "text-[0.9375rem]",weight:"font-semibold", tracking: "tracking-[-0.01em]", sample: "Button Label" },
];

const radiusScale = [
  { name: "XS — 6px",   value: "6px",   cls: "rounded-[6px]" },
  { name: "SM — 8px",   value: "8px",   cls: "rounded-[8px]" },
  { name: "MD — 12px",  value: "12px",  cls: "rounded-[12px]" },
  { name: "LG — 16px",  value: "16px",  cls: "rounded-[16px]" },
  { name: "XL — 24px",  value: "24px",  cls: "rounded-[24px]" },
  { name: "2XL — 32px", value: "32px",  cls: "rounded-[32px]" },
  { name: "Full",       value: "9999px",cls: "rounded-full" },
];

const spacingScale = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];

const shadowTokens = [
  { name: "shadow-xs",  label: "Subtle",    css: "0 1px 2px rgba(13,17,25,0.05)" },
  { name: "shadow-sm",  label: "Small",     css: "0 1px 3px rgba(13,17,25,0.07), 0 2px 6px rgba(13,17,25,0.05)" },
  { name: "shadow",     label: "Default",   css: "0 2px 6px rgba(13,17,25,0.07), 0 6px 20px rgba(13,17,25,0.05)" },
  { name: "shadow-md",  label: "Medium",    css: "0 4px 12px rgba(13,17,25,0.08), 0 12px 36px rgba(13,17,25,0.06)" },
  { name: "shadow-lg",  label: "Large",     css: "0 8px 24px rgba(13,17,25,0.09), 0 24px 64px rgba(13,17,25,0.07)" },
  { name: "shadow-xl",  label: "XL",        css: "0 16px 48px rgba(13,17,25,0.10), 0 40px 96px rgba(13,17,25,0.08)" },
];

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-foreground mb-1">{title}</h2>
      {description && <p className="text-[0.9375rem] text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h3 className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function FoundationShowcase() {
  return (
    <div className="space-y-16">

      {/* ── COLORS ── */}
      <section id="colors">
        <SectionHeader title="Color Palette" description="A cold graphite gray system with subtle blue undertones paired with a burnt crimson accent." />

        <SubSection title="Graphite Scale">
          <div className="grid grid-cols-11 gap-1.5">
            {graphiteScale.map((c) => (
              <div key={c.name} className="flex flex-col gap-1.5">
                <div
                  className="h-14 rounded-[8px] border border-border/40"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[0.6875rem] font-medium text-muted-foreground text-center">{c.name}</span>
                <span className="text-[0.625rem] text-muted-foreground/70 text-center font-mono">{c.hex}</span>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Crimson Scale">
          <div className="grid grid-cols-11 gap-1.5">
            {crimsonScale.map((c) => (
              <div key={c.name} className="flex flex-col gap-1.5">
                <div
                  className="h-14 rounded-[8px] border border-border/40"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[0.6875rem] font-medium text-muted-foreground text-center">{c.name}</span>
                <span className="text-[0.625rem] text-muted-foreground/70 text-center font-mono">{c.hex}</span>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Semantic Tokens">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {semanticColors.map((c) => (
              <div key={c.name} className="flex flex-col gap-2">
                <div className={`h-12 rounded-[10px] border border-border/40 ${c.swatch}`} />
                <div>
                  <div className="text-[0.8125rem] font-medium text-foreground">{c.name}</div>
                  <div className="text-[0.6875rem] text-muted-foreground font-mono">{c.token}</div>
                </div>
              </div>
            ))}
          </div>
        </SubSection>
      </section>

      {/* ── TYPOGRAPHY ── */}
      <section id="typography">
        <SectionHeader title="Typography" description="Plus Jakarta Sans — a modern rounded geometric sans-serif optimized for dashboards and enterprise UIs." />

        <div className="bg-card rounded-[16px] border border-border overflow-hidden" style={{ boxShadow: "var(--shadow)" }}>
          {typeScaleItems.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-baseline gap-6 px-6 py-4 ${i < typeScaleItems.length - 1 ? "border-b border-border/60" : ""}`}
            >
              <div className="w-24 shrink-0">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{item.label}</span>
              </div>
              <div className={`${item.size} ${item.weight} ${item.tracking} text-foreground leading-tight flex-1 truncate`}>
                {item.sample}
              </div>
              <div className="shrink-0 hidden md:flex gap-3 text-[0.6875rem] text-muted-foreground/70 font-mono">
                <span>{item.size.replace("text-[", "").replace("]", "")}</span>
                <span>{item.weight.replace("font-", "")}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SPACING ── */}
      <section id="spacing">
        <SectionHeader title="Spacing Scale" description="8-point grid system with 4px base unit. Consistent spacing creates rhythm and visual harmony." />

        <div className="space-y-3">
          {spacingScale.map((sp) => (
            <div key={sp} className="flex items-center gap-4">
              <span className="w-12 text-right text-[0.8125rem] font-mono text-muted-foreground shrink-0">{sp}px</span>
              <div
                className="bg-primary/80 rounded-[4px] h-5"
                style={{ width: `${sp * 2}px`, minWidth: "4px" }}
              />
              <span className="text-[0.75rem] text-muted-foreground/70">--space-{sp / 4}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── RADIUS ── */}
      <section id="radius">
        <SectionHeader title="Border Radius" description="Modern rounded corners. Larger radii for cards and dialogs; smaller for inline elements." />

        <div className="flex flex-wrap gap-6">
          {radiusScale.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-3">
              <div
                className={`w-20 h-20 border-2 border-primary/60 bg-primary/10 ${r.cls}`}
              />
              <div className="text-center">
                <div className="text-[0.8125rem] font-medium text-foreground">{r.name.split(" — ")[0]}</div>
                <div className="text-[0.6875rem] text-muted-foreground font-mono">{r.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHADOWS ── */}
      <section id="shadows">
        <SectionHeader title="Shadow System" description="Diffused floating shadows for light mode. Ambient depth shadows for dark mode." />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {shadowTokens.map((s) => (
            <div key={s.name} className="flex flex-col gap-3">
              <div
                className="h-20 bg-card rounded-[12px]"
                style={{ boxShadow: s.css }}
              />
              <div>
                <div className="text-[0.875rem] font-medium text-foreground">{s.label}</div>
                <div className="text-[0.75rem] text-muted-foreground font-mono">--{s.name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tokens Reference ── */}
      <section id="colors-tokens" className="space-y-5">
        <SectionHeader title="Tokens" description="All semantic CSS custom properties. Copy any token name and use it in var(--token-name)." />
        <TokenTable groups={foundationTokenGroups} />
      </section>
    </div>
  );
}

const foundationTokenGroups: TokenGroup[] = [
  {
    group: "Brand",
    tokens: [
      { name: "--primary",            description: "Brand accent — crimson",          light: "#D44D4D", dark: "#D44D4D", isColor: true },
      { name: "--primary-foreground", description: "Text on primary",                 light: "#FFFFFF", dark: "#FFFFFF", isColor: true },
      { name: "--primary-muted",      description: "Tinted primary background",       light: "rgba(212,77,77,0.10)", dark: "rgba(212,77,77,0.15)", isColor: true },
    ],
  },
  {
    group: "Background & Surface",
    tokens: [
      { name: "--background",      description: "Page background",           light: "#ECF0F5",              dark: "#0D1119",              isColor: true },
      { name: "--foreground",      description: "Primary text",              light: "#131A27",              dark: "#E4E9F0",              isColor: true },
      { name: "--muted-foreground",description: "Secondary / label text",    light: "#627288",              dark: "#8898B0",              isColor: true },
      { name: "--card",            description: "Card surface",              light: "#FFFFFF",              dark: "rgba(19,26,39,0.75)",  isColor: true },
      { name: "--card-foreground", description: "Text on card",              light: "#131A27",              dark: "#E4E9F0",              isColor: true },
      { name: "--popover",         description: "Popover / tooltip surface", light: "#FFFFFF",              dark: "rgba(19,26,39,0.95)",  isColor: true },
      { name: "--muted",           description: "Subtle background",        light: "#E8EDF3",              dark: "rgba(40,48,67,0.60)", isColor: true },
      { name: "--accent",          description: "Hover background",         light: "#E8EDF3",              dark: "rgba(40,48,67,0.60)", isColor: true },
      { name: "--secondary",       description: "Secondary button surface", light: "#E4E9F0",              dark: "rgba(40,48,67,0.80)", isColor: true },
    ],
  },
  {
    group: "Semantic Colors",
    tokens: [
      { name: "--success",         description: "Positive / confirmed",     light: "#4fb57b", dark: "#22C55E", isColor: true },
      { name: "--warning",         description: "Caution / pending",        light: "#e5a94e", dark: "#f5b320", isColor: true },
      { name: "--error",           description: "Error / danger",           light: "#D44D4D", dark: "#D44D4D", isColor: true },
      { name: "--info",            description: "Informational",            light: "#448abc", dark: "#3B82F6", isColor: true },
      { name: "--destructive",     description: "Destructive action",       light: "#D44D4D", dark: "#D44D4D", isColor: true },
      { name: "--violet",          description: "Accent purple",            light: "#ba69dc", dark: "#eb6cff", isColor: true },
      { name: "--orange",          description: "Accent orange",            light: "#fa9852", dark: "#ff8833", isColor: true },
    ],
  },
  {
    group: "Border & Ring",
    tokens: [
      { name: "--border",       description: "Default border",          light: "rgba(19,26,39,0.09)",  dark: "rgba(255,255,255,0.07)", isColor: true },
      { name: "--border-strong",description: "Emphasized border",       light: "rgba(19,26,39,0.16)",  dark: "rgba(255,255,255,0.12)", isColor: true },
      { name: "--ring",         description: "Focus ring / outline",    light: "rgba(212,77,77,0.35)", dark: "rgba(212,77,77,0.40)",   isColor: true },
    ],
  },
  {
    group: "Charts",
    tokens: [
      { name: "--chart-1", description: "Series 1 — crimson",  light: "#D44D4D", dark: "#D44D4D", isColor: true },
      { name: "--chart-2", description: "Series 2 — graphite", light: "#495669", dark: "#627288", isColor: true },
      { name: "--chart-3", description: "Series 3",            light: "#8898B0", dark: "#495669", isColor: true },
      { name: "--chart-4", description: "Series 4",            light: "#B3BDD0", dark: "#374155", isColor: true },
      { name: "--chart-5", description: "Series 5",            light: "#D6DCE6", dark: "#283043", isColor: true },
    ],
  },
  {
    group: "Shape",
    tokens: [
      { name: "--radius",    description: "Base border radius",    light: "0.75rem",                   dark: undefined },
      { name: "--radius-sm", description: "Small radius (card)",   light: "calc(0.75rem - 4px)",        dark: undefined },
      { name: "--radius-md", description: "Medium radius",         light: "0.75rem",                   dark: undefined },
      { name: "--radius-lg", description: "Large radius (dialog)", light: "calc(0.75rem + 4px)",        dark: undefined },
      { name: "--radius-xl", description: "XL radius (hero card)", light: "calc(0.75rem + 12px)",       dark: undefined },
    ],
  },
  {
    group: "Elevation",
    tokens: [
      { name: "--shadow-xs", description: "Surface lift (inputs)",  light: "0 1px 2px …",             dark: "0 1px 2px (darker)" },
      { name: "--shadow-sm", description: "Cards, dropdowns",       light: "0 1px 3px …",             dark: "0 1px 3px (darker)" },
      { name: "--shadow",    description: "Default elevation",      light: "0 2px 6px …",             dark: "0 2px 8px (darker)" },
      { name: "--shadow-md", description: "Popover, modals",       light: "0 4px 12px …",            dark: "0 4px 16px (darker)" },
      { name: "--shadow-lg", description: "Large panel",           light: "0 8px 24px …",            dark: "0 8px 32px (darker)" },
      { name: "--shadow-xl", description: "Full-page overlays",    light: "0 16px 48px …",           dark: "0 16px 64px (darker)" },
    ],
  },
  {
    group: "Typography",
    tokens: [
      { name: "--font-sans",           description: "UI typeface",          light: "Plus Jakarta Sans" },
      { name: "--font-mono",           description: "Code typeface",        light: "JetBrains Mono" },
      { name: "--font-weight-normal",  description: "Regular weight",       light: "400" },
      { name: "--font-weight-medium",  description: "Medium weight",        light: "500" },
      { name: "--font-weight-semibold",description: "Semibold weight",      light: "600" },
      { name: "--font-weight-bold",    description: "Bold weight",          light: "700" },
    ],
  },
];
