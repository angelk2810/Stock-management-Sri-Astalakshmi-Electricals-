
import React from 'react';

// A map of color names to CSS-compatible color values from the system.
const colorMap: Record<string, string> = {
  // Wiring & Cables
  'Red': '#c8102E',           // A strong, standard red
  'Black': '#212121',         // A deep, matte-like black
  'Green': '#008751',         // Rich, standard green
  'Yellow': '#fcc300',       // Vibrant, clear yellow
  'Blue': '#0057b7',           // Standard electrical blue
  'Pink': '#ffc0cb',           // A standard, clear pink
  
  // Fans
  'Metallic': 'linear-gradient(145deg, #e0e0e0, #b0b0b0)', // Silver metallic gradient
  'Pearl': '#fdf6e8',          // Pearly, slightly warm off-white

  // Lighting
  'Cool White': '#f0f8ff',    // AliceBlue - a very subtle cool tint
  'Warm White': '#fffaf0',    // FloralWhite - a very subtle warm tint
  'Natural White': '#f5f5f5', // WhiteSmoke - neutral off-white

  // Common Colors
  'White': '#ffffff',
  'Brown': '#8d6e63',         // A mid-tone, natural brown
};

// A list of colors that are light and need a border to be visible on a light background.
const lightColors = ['#fdf6e8', '#f0f8ff', '#fffaf0', '#f5f5f5', '#ffffff', '#ffc0cb'];

// List of finishes that are not colors and should not have a visual indicator.
const nonVisualFinishNames = ['Matte'];

/**
 * A reusable component to display a small, circular color swatch next to a color name.
 */
export const ColorIndicator: React.FC<{ colorName: string }> = ({ colorName }) => {
  // Return null for non-visual finishes to avoid showing a fallback color dot.
  if (!colorName || nonVisualFinishNames.includes(colorName)) {
    return null;
  }
  
  // Find the color value from the map, or fallback to a neutral gray for undefined colors.
  const colorValue = colorMap[colorName] || '#9ca3af'; 
  const isGradient = colorValue.startsWith('linear-gradient');

  // Logic to handle both solid colors and gradients for styling.
  const needsBorder = !isGradient && lightColors.includes(colorValue);
  const styleProps = isGradient 
    ? { background: colorValue } 
    : { backgroundColor: colorValue };

  return (
    <span
      className={`inline-block w-3 h-3 rounded-full mr-2 shrink-0 ${needsBorder ? 'border border-slate-300' : ''}`}
      style={styleProps}
      title={colorName}
    />
  );
};
