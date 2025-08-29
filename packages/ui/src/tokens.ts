import tokens from '../tokens/tokens.json';

export type DesignTokens = typeof tokens;

export type Spacing = keyof typeof tokens.spacing;
export type Radius = keyof typeof tokens.radius;
export type FontSize = keyof typeof tokens.typography.fontSize;
export type FontWeight = keyof typeof tokens.typography.fontWeight;
export type LineHeight = keyof typeof tokens.typography.lineHeight;
export type Shadow = keyof typeof tokens.shadows;
export type ColorScale = keyof typeof tokens.colors.gray;
export type BrandColor = keyof typeof tokens.colors.brand;
export type StatusColor = keyof typeof tokens.colors.status;
export type SemanticColor = keyof typeof tokens.colors.semantic;

export { tokens };
