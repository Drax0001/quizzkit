import { z } from "zod";

/**
 * The shape every vertical's domain.config.ts must satisfy. This is the
 * single source of truth for what "a domain config" is — see
 * docs/multi-domain-playbook.md before adding a field here.
 */
export const domainConfigSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    logoUrl: z.string().min(1),
  }),
  theme: z.object({
    // Matches the next/font import used in app/layout.tsx — font swaps are
    // a two-line change (config + the import), see the playbook.
    fontDisplayLabel: z.string(),
    fontBodyLabel: z.string(),
    // oklch() color strings, same variable names shadcn/ui already reads
    // in app/globals.css — swapping these is the entire reskin.
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  terminology: z.object({
    orgUnit: z.string(), // "Agency" / "Class" / "Clinic" / "Studio"
    memberId: z.string(), // "Employee ID" / "Student ID" / "Patient ID"
    resultLabel: z.string(), // "Results" / "Report card"
  }),
  taxonomySeed: z
    .array(
      z.object({
        name: z.string().min(1),
        icon: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .min(1),
  aiPersona: z.string().min(1),
  features: z.object({
    duels: z.boolean(),
    forum: z.boolean(),
    courses: z.boolean(),
    customQuizBuilder: z.boolean(),
    survivalMode: z.boolean(),
    practiceMode: z.boolean(),
    excelImport: z.boolean(),
    aiGeneration: z.boolean(),
    messaging: z.boolean(),
  }),
  owners: z.array(z.email()).min(1),
  pwa: z.object({
    shortName: z.string().min(1),
    themeColor: z.string().min(1),
    backgroundColor: z.string().min(1),
  }),
});

export type DomainConfig = z.infer<typeof domainConfigSchema>;
