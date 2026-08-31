import { domain } from "@/config/domain.config";

// Renders the domain's brand color tokens as an override stylesheet. Uses
// !important deliberately and narrowly: it's the one place in the app that
// is allowed to win the cascade, so a fork's colors apply regardless of how
// app/globals.css (shadcn-managed, updated by `npx shadcn diff`) orders its
// own rules. See docs/multi-domain-playbook.md.
export function ThemeTokens() {
  const toDeclarations = (tokens: Record<string, string>) =>
    Object.entries(tokens)
      .map(([key, value]) => `--${key}: ${value} !important;`)
      .join(" ");

  const css = `
    :root { ${toDeclarations(domain.theme.light)} }
    @media (prefers-color-scheme: dark) {
      :root { ${toDeclarations(domain.theme.dark)} }
    }
  `;

  // Server-controlled config, not user input — safe to inline.
  return (
    <style id="domain-theme-tokens" dangerouslySetInnerHTML={{ __html: css }} />
  );
}
