import { domainConfigSchema, type DomainConfig } from "./domain-schema";

/**
 * This is the ONE file a fork edits to become a new quiz app. Everything
 * downstream — theme, taxonomy, AI persona, PWA manifest, which optional
 * modules are mounted — reads from here. See docs/multi-domain-playbook.md.
 *
 * This default instance is a neutral demo, deliberately not tied to any
 * vertical — replace every field below when you fork.
 */
const config = {
  brand: {
    name: "Quizkit",
    tagline: "Swap this file, ship a new quiz app.",
    logoUrl: "/icons/icon-512.png",
  },
  theme: {
    fontDisplayLabel: "Geist",
    fontBodyLabel: "Geist",
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      primary: "oklch(0.52 0.17 260)",
      "primary-foreground": "oklch(0.98 0 0)",
      accent: "oklch(0.7 0.15 200)",
      "accent-foreground": "oklch(0.15 0 0)",
    },
    dark: {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      primary: "oklch(0.75 0.14 260)",
      "primary-foreground": "oklch(0.145 0 0)",
      accent: "oklch(0.78 0.13 200)",
      "accent-foreground": "oklch(0.145 0 0)",
    },
  },
  terminology: {
    orgUnit: "Group",
    memberId: "Member ID",
    resultLabel: "Results",
  },
  taxonomySeed: [
    { name: "Science", icon: "🔬" },
    { name: "History", icon: "🏛️" },
    { name: "Geography", icon: "🌍" },
  ],
  aiPersona:
    "You are a friendly, precise quizmaster. Write clear multiple-choice " +
    "questions with exactly one correct answer and a short explanation.",
  features: {
    duels: true,
    forum: false,
    courses: false,
    customQuizBuilder: true,
    survivalMode: true,
    practiceMode: true,
    excelImport: true,
    aiGeneration: true,
    messaging: false,
  },
  owners: ["jleminky@gmail.com"],
  pwa: {
    shortName: "Quizkit",
    themeColor: "#5B4FC7",
    backgroundColor: "#ffffff",
  },
} satisfies DomainConfig;

export const domain: DomainConfig = domainConfigSchema.parse(config);
