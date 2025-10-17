# 🎨 FlowLens Icon Guide

## Icon Requirements for VS Code Marketplace

Your extension needs a **128x128 pixel PNG icon** for the VS Code Marketplace.

### Requirements:
- **Format**: PNG
- **Size**: 128x128 pixels
- **Name**: `icon.png`
- **Location**: `/images/icon.png`
- **Background**: Transparent or solid color
- **Quality**: High resolution, clear at small sizes

---

## Design Suggestions for FlowLens

Since FlowLens is about **flow, context, and sessions**, consider these design concepts:

### 🌀 Concept 1: Flow Symbol
- A circular flow/swirl symbol
- Represents continuous flow and context
- Use purple (#7C3AED) as your brand color
- Simple, modern, and recognizable

### 📸 Concept 2: Lens/Camera
- A stylized lens or camera shutter
- Represents "capturing" sessions
- Clean lines, minimal design
- Works well at small sizes

### 🔄 Concept 3: Restore Symbol
- Curved arrow or refresh icon
- Represents restoring context
- Combined with document/file symbols
- Implies "going back" to where you were

### 💡 Concept 4: Combined Elements
- Lens shape with flow lines
- Purple gradient for depth
- Clean, professional appearance

---

## Quick Ways to Create Your Icon

### Option 1: Use Figma (Free)
1. Go to [Figma.com](https://figma.com)
2. Create a new file with 128x128 frame
3. Design your icon
4. Export as PNG @ 1x

### Option 2: Use Canva (Free)
1. Go to [Canva.com](https://canva.com)
2. Create custom 128x128 design
3. Use shapes and icons
4. Download as PNG

### Option 3: Use AI (Quick)
1. Use DALL-E, Midjourney, or similar
2. Prompt: "minimal flat icon for VS Code extension about flow and productivity, purple, 128x128"
3. Save as PNG

### Option 4: Hire a Designer (Fiverr/99designs)
- Budget: $5-$50
- Quick turnaround (1-2 days)
- Professional result

---

## Brand Colors to Use

Based on your website:
- **Primary Purple**: `#7C3AED`
- **Dark Background**: `#1e1e1e`
- **Light Accent**: `#10B981` (green)

---

## Example Icon Prompt for AI

> "Create a minimal, modern icon for a VS Code extension called FlowLens. 
> The icon should feature a stylized lens or circular flow symbol in purple (#7C3AED). 
> Clean, professional design suitable for developer tools. 
> Flat design style, 128x128 pixels, transparent background."

---

## Testing Your Icon

Before publishing:
1. View at 16x16 pixels (smallest size in VS Code)
2. View in both light and dark themes
3. Ensure it's recognizable and not too detailed
4. Check contrast and readability

---

## Once You Have Your Icon

1. Save it as `icon.png` in this `/images/` directory
2. The `package.json` is already configured to use it
3. You're ready to publish!

**Current Status**: ⚠️ You need to create `icon.png` before publishing

