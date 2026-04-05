/**
 * Unified white + purple product theme for injected design HTML portals.
 * Reference: primary #6200EE, secondary #8166C9, neutral #F8F9FA.
 * Variables match app `index.css` tokens so `bg-background`, `bg-primary`, etc. inherit correctly.
 */
export const brandPortalPalette: Record<string, string> = {
  "--background": "#f8f9fa",
  "--foreground": "#1c1b1f",
  "--card": "#ffffff",
  "--card-foreground": "#1c1b1f",
  "--primary": "#6200ee",
  "--primary-foreground": "#ffffff",
  "--secondary": "#f0ebf9",
  "--secondary-foreground": "#4a4458",
  "--muted": "#ece6f4",
  "--muted-foreground": "#625b71",
  "--accent": "#ede7f6",
  "--accent-foreground": "#6200ee",
  "--border": "#e7e0ef",
  "--ring": "#6200ee",
  "--color-primary": "#6200ee",
  "--color-secondary": "#8166c9",
  "--color-background-light": "#f8f9fa",
  "--color-background-dark": "#1a1428",
}

/** @deprecated Use brandPortalPalette — kept for existing imports */
export const purplePortalPalette = brandPortalPalette

/** @deprecated Was orange “quantum”; all portals now share brand purple */
export const quantumPalette = brandPortalPalette

/** @deprecated Use brandPortalPalette */
export const deepPurplePalette = brandPortalPalette

/** @deprecated Use brandPortalPalette */
export const technicalOrangePalette = brandPortalPalette

/** @deprecated Use brandPortalPalette */
export const violetTechnicalPalette = brandPortalPalette

/** @deprecated Use brandPortalPalette */
export const projectStatusPurplePalette = brandPortalPalette

/** @deprecated Use brandPortalPalette */
export const securityVioletPalette = brandPortalPalette
