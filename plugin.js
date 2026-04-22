/**
 * Thymer Indent Rainbow Plugin
 * 
 * Adds rainbow-colored vertical indent guides to Thymer's editor.
 * Each indentation level gets a unique color, similar to how IDEs color
 * matching brackets or indent guides at different nesting levels.
 * 
 * Features:
 * - Rainbow-colored vertical indent lines
 * - Enhanced visibility on hover
 * - Smooth color transitions
 * - Command palette toggle for different color schemes
 */

class Plugin extends AppPlugin {
    onLoad() {
        this.isUnloaded = false;
        
        // Keep track of resources to clean up later
        this.cleanupMethods = [];
        this.styleElement = null;

        // Storage keys for persisting settings
        const STORAGE_KEY = 'indent-rainbow-scheme';
        const WIDTH_KEY = 'indent-rainbow-width';
        const ACTIVE_WIDTH_KEY = 'indent-rainbow-active-width';
        const OPACITY_KEY = 'indent-rainbow-opacity';
        const ENABLED_KEY = 'indent-rainbow-enabled';
        const THREADING_MODE_KEY = 'indent-rainbow-threading-mode';
        const BULLETS_ENABLED_KEY = 'indent-rainbow-bullets-enabled';
        const TOGGLES_ENABLED_KEY = 'indent-rainbow-toggles-enabled';

        // Color schemes for different tastes
        const colorSchemes = {
            rainbow: {
                name: 'Rainbow',
                colors: [
                    '#ff5f5f',  // Red
                    '#ffbd2e',  // Orange
                    '#feca57',  // Yellow
                    '#28c940',  // Green
                    '#00d0ff',  // Blue
                    '#5856d6',  // Indigo
                    '#ff2d55',  // Pink
                    '#af52de',  // Purple
                ]
            },
            ocean: {
                name: 'Ocean',
                colors: [
                    '#0077b6',  // Deep blue
                    '#00b4d8',  // Bright cyan
                    '#48cae4',  // Light cyan
                    '#90e0ef',  // Pale cyan
                    '#ade8f4',  // Ice blue
                    '#caf0f8',  // Lightest cyan
                    '#023e8a',  // Navy
                    '#0096c7',  // Medium blue
                ]
            },
            sunset: {
                name: 'Sunset',
                colors: [
                    '#ff6b6b',  // Coral red
                    '#ff8e53',  // Warm orange
                    '#feca57',  // Golden yellow
                    '#ff9ff3',  // Pink
                    '#f368e0',  // Magenta
                    '#ff6b81',  // Rose
                    '#ee5a24',  // Burnt orange
                    '#ff4757',  // Bright red
                ]
            },
            forest: {
                name: 'Forest',
                colors: [
                    '#2d6a4f',  // Deep forest
                    '#40916c',  // Forest green
                    '#52b788',  // Fresh green
                    '#74c69d',  // Light green
                    '#95d5b2',  // Pale green
                    '#b7e4c7',  // Mint
                    '#1b4332',  // Dark forest
                    '#d8f3dc',  // Lightest green
                ]
            },
            neon: {
                name: 'Neon',
                colors: [
                    '#ff00ff',  // Magenta
                    '#00ffff',  // Cyan
                    '#ff00aa',  // Hot pink
                    '#00ff88',  // Neon green
                    '#ffff00',  // Yellow
                    '#ff6600',  // Orange
                    '#aa00ff',  // Purple
                    '#00aaff',  // Electric blue
                ]
            },
            monochrome: {
                name: 'Monochrome',
                colors: [
                    '#6b7280',  // Gray 500
                    '#9ca3af',  // Gray 400
                    '#d1d5db',  // Gray 300
                    '#4b5563',  // Gray 600
                    '#374151',  // Gray 700
                    '#e5e7eb',  // Gray 200
                    '#1f2937',  // Gray 800
                    '#f3f4f6',  // Gray 100
                ]
            },
            Soot: {
                name: 'Soot',
                colors: [
                    '#8c5a36',  // Toasted Oak
                    '#5a6b6a',  // Sage/Lichen
                    '#a65d5d',  // Dried Rose
                    '#7a7369',  // Wet Bark
                    '#8c7d6b',  // Driftwood
                    '#6b7280',  // Slate Ash
                    '#b3924d',  // Old Gold
                    '#4a5c5c',  // Deep Spruce
                ]
            },
            Amber: {
                name: 'Amber',
                colors: [
                    '#ffdd00',  // Gold
                    '#ffbf00',  // Amber
                    '#df910b',  // Dark Amber
                    '#ca6c00',  // Light Amber
                    '#ff7f00',  // Medium Amber
                    '#b3924d',  // Old Gold
                ]
            }
        };

        // Get saved scheme or default to rainbow
        let currentScheme = localStorage.getItem(STORAGE_KEY) || 'rainbow';
        if (!colorSchemes[currentScheme]) {
            currentScheme = 'rainbow';
        }

        // Get saved settings or defaults
        let savedWidth = parseInt(localStorage.getItem(WIDTH_KEY));
        let currentWidth = isNaN(savedWidth) ? 1 : savedWidth;
        
        let savedActiveWidth = parseInt(localStorage.getItem(ACTIVE_WIDTH_KEY));
        let activeWidth = isNaN(savedActiveWidth) ? 2 : savedActiveWidth;
        
        let currentOpacity = parseFloat(localStorage.getItem(OPACITY_KEY)) || 0.3;
        let isEnabled = localStorage.getItem(ENABLED_KEY) !== 'false'; // default true
        let threadingMode = localStorage.getItem(THREADING_MODE_KEY) || 'staircase'; // 'staircase' or 'stretched'
        let isBulletsEnabled = localStorage.getItem(BULLETS_ENABLED_KEY) !== 'false'; // default true
        let isTogglesEnabled = localStorage.getItem(TOGGLES_ENABLED_KEY) !== 'false'; // default true

        // Opacity presets
        const opacityPresets = {
            subtle: { name: 'Subtle', value: 0.2 },
            normal: { name: 'Normal', value: 0.3 },
            bold: { name: 'Bold', value: 0.45 }
        };

        // Static stylesheet — injected once for the plugin's lifetime.
        // Colors are applied via JS-written CSS custom properties (--ir-level-N, --ir-color)
        // so scheme / opacity / width changes never regenerate the sheet.
        const STATIC_CSS = `
/* Thymer Indent Rainbow */

/* Settings vars — updated by JS, never by regenerating the sheet */
:root {
    --bt-line-width: 1px;
    --bt-line-opacity: 0.3;
    --bt-line-opacity-hover: 0.8;
    --bt-transition-duration: 0.15s;
}

/* CRITICAL: Provide fallback values for Thymer's inline calc() expressions. */
.listitem-indentline {
    --line-height: 26px;
    --checkbox-size: 23.5px;
    --bullet-size: 10px;
}

/* Color applied via JS per-line as --ir-color */
body.ir-enabled .listitem-indentline {
    background-color: var(--ir-color, transparent) !important;
    border-color: var(--ir-color, transparent) !important;
}

/* Base styling for indent lines */
body.ir-enabled .listitem-indentline {
    transition: opacity var(--bt-transition-duration) ease,
                filter var(--bt-transition-duration) ease,
                background-color var(--bt-transition-duration) ease,
                border-color var(--bt-transition-duration) ease !important;
    opacity: var(--bt-line-opacity) !important;
    min-width: var(--bt-line-width) !important;
    width: var(--bt-line-width) !important;
    transform-origin: top;
}

/* Minimum height safety net */
body.ir-enabled .listitem-task .listitem-indentline,
body.ir-enabled .listitem-ulist .listitem-indentline,
body.ir-enabled .listitem-olist .listitem-indentline {
    min-height: 20px !important;
}

/* Global horizontal nudge (~1pt) so guides sit centered under bullets/numbers/
   checkboxes. Applied uniformly across all item types (including headings,
   which lack the listitem-text/task/ulist/olist classes) so per-level
   spacing stays uniform. Tweak --ir-align-nudge to fine-tune. */
:root {
    --ir-align-nudge: 1.5px;
}

/* Base: nudge applies to every indent line (catches headings + text + task). */
body.ir-enabled .listitem-indentline {
    transform: translateX(calc(-2px + var(--ir-align-nudge))) !important;
}

/* Align bullet indent line with text/heading guides, then apply the global
   nudge. Bullet items sit 6.75px left of text items of the same level. */
body.ir-enabled .listitem-ulist .listitem-indentline {
    transform: translateX(calc(5px + var(--ir-align-nudge))) !important;
}

/* Align numbered-list indent line with text/heading guides, then apply the
   global nudge. Numbered items sit 2.63px right of text items of same level. */
body.ir-enabled .listitem-olist .listitem-indentline {
    transform: translateX(calc(-3.5px + var(--ir-align-nudge))) !important;
}

/* Ensure indent lines are visible for all item types */
body.ir-enabled .listitem-text .listitem-indentline,
body.ir-enabled .listitem-task .listitem-indentline,
body.ir-enabled .listitem-ulist .listitem-indentline,
body.ir-enabled .listitem-olist .listitem-indentline {
    display: block !important;
    visibility: visible !important;
}

/* Highlight on hover */
body.ir-enabled .listitem:hover > .line-div > .listitem-indentline,
body.ir-enabled .listitem:hover > .line-check-div ~ .line-div > .listitem-indentline,
body.ir-enabled .listitem:hover > .line-bullet-div ~ .line-div > .listitem-indentline,
body.ir-enabled .listitem:hover > .line-number-div ~ .line-div > .listitem-indentline {
    opacity: var(--bt-line-opacity-hover) !important;
    filter: brightness(1.2) !important;
}

/* Enhanced hover for threading path */
body.ir-enabled .listitem:hover .line-div .listitem-indentline {
    filter: brightness(1.1);
}

/* Highlight on focus (cursor position) */
body.ir-enabled .bt-focused > .line-div > .listitem-indentline,
body.ir-enabled .bt-focused > .line-check-div ~ .line-div > .listitem-indentline,
body.ir-enabled .bt-focused > .line-bullet-div ~ .line-div > .listitem-indentline,
body.ir-enabled .bt-focused > .line-number-div ~ .line-div > .listitem-indentline {
    opacity: 1 !important;
    filter: brightness(1.3) drop-shadow(0 0 2px currentColor) !important;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
    body.ir-enabled .listitem-indentline {
        filter: brightness(1.1);
    }
}

body.ir-enabled.dark .listitem-indentline,
body.ir-enabled [data-theme="dark"] .listitem-indentline {
    filter: brightness(1.1);
}

/* =====================================================
   Workflowy-style outline: bullets + disclosure carets
   (gated by body.bt-bullets and body.bt-toggles)
   ===================================================== */

/* .bt-marker is an inline-flex wrapper injected as the first child of
   each .listitem. It holds .bt-caret + .bt-bullet. The wrapper spans the
   parent's full line-box height (1lh, with fallback) so flex centering
   puts each child on the text's vertical midline — regardless of
   heading/body font size. */
body.ir-enabled .bt-marker {
    display: none;
    box-sizing: border-box;
    align-items: center;
    justify-content: flex-start;
    gap: 2px;
    /* Anchor marker to the FIRST line of the row. We set BOTH:
       - align-self: baseline   -> for when .listitem is a flex
         container (the common case in Thymer): the marker becomes a
         flex item and aligns its baseline to the container's first
         baseline, which is the first text line's baseline.
       - vertical-align: baseline -> for when the marker is laid out
         inline (non-flex fallback). Inline-flex's baseline is the
         baseline of its first flex child, so caret + bullet sit on
         the surrounding text's baseline.
       Together these pin the marker to the first line across
       headings, body, and wrapped rows without relying on line-height
       heuristics. */
    align-self: baseline;
    vertical-align: baseline;
    /* Fine-tune nudge: align-self: baseline lifts the marker slightly
       above the native bullet column because the caret/bullet's own
       baseline (fixed-size icons) sits above the text x-height. A
       small 0.15em downward translate scales with font-size so
       headings and body both land on the native bullet row. Tweak
       --bt-marker-nudge to shift if Thymer's text metrics change. */
    --bt-marker-nudge: .25em;
    transform: translateY(var(--bt-marker-nudge));
    user-select: none;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
}

/* Show the marker wrapper whenever either feature is enabled. */
body.ir-enabled.bt-bullets .bt-marker,
body.ir-enabled.bt-toggles .bt-marker {
    display: inline-flex;
}

/* ---------- Caret (disclosure chevron) ---------- */

body.ir-enabled .bt-caret {
    display: none;
    width: 18px;
    height: 18px;
    align-items: center;
    justify-content: left;
    font-size: 14px;           /* Tabler chevrons read better a bit bigger */
    line-height: 1;
    color: currentColor;
    opacity: 0;
    cursor: pointer;
    transition: opacity 0.12s ease, transform 0.12s ease;
    flex-shrink: 0;
    transform-origin: center;
    /* 1px visual nudge so the chevron's center lines up with the
       rainbow indent guide that sits at the row's margin-left. Uses
       transform (not margin) so sibling layout (.bt-bullet column) is
       unaffected. */
    transform: translateX(1px);
}

/* Reserve space for the caret on every row (visible or not) so bullets
   stay in a consistent column. Only show the glyph when bt-toggles AND
   bt-has-children. The glyph itself comes from Tabler Icons via the
   .ti.ti-chevron-down / .ti-chevron-right classes we add in JS; Thymer
   already loads the Tabler font so the ::before content is supplied by
   Thymer's own stylesheet, keeping us visually in lock-step with the
   native link-menu chevrons. */
body.ir-enabled.bt-toggles .bt-marker > .bt-caret {
    display: inline-flex;
}
body.ir-enabled.bt-toggles .listitem.bt-has-children > .bt-marker > .bt-caret {
    opacity: 0.55;
}
body.ir-enabled.bt-toggles .listitem.bt-has-children > .bt-marker > .bt-caret:hover {
    opacity: 0.95;
}

/* ---------- Bullet (clickable dot) ---------- */

body.ir-enabled .bt-bullet {
    display: none;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    position: relative;
}

body.ir-enabled.bt-bullets .bt-marker > .bt-bullet {
    display: inline-flex;
}

body.ir-enabled .bt-bullet::after {
    content: '';
    display: block;
    box-sizing: border-box;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid rgba(128, 128, 128, 0.55);
    background: currentColor;
    background-clip: padding-box;
    opacity: 0.45;
    transition: opacity 0.15s ease, transform 0.15s ease,
                box-shadow 0.15s ease, border-color 0.15s ease;
}

body.ir-enabled .bt-bullet:hover::after {
    opacity: 0.95;
    border-color: rgba(128, 128, 128, 0.85);
    transform: scale(1.35);
    box-shadow: 0 0 0 3px rgba(128, 128, 128, 0.18);
}

body.ir-enabled .bt-bullet:active::after {
    transform: scale(1.1);
}

/* Parent rows get a hollow bullet (ring) when carets are NOT shown, so the
   user can still visually tell the row has children. When carets ARE shown
   (bt-toggles), keep the solid bullet since the caret carries the signal. */
body.ir-enabled.bt-bullets:not(.bt-toggles) .listitem.bt-has-children > .bt-marker > .bt-bullet::after {
    background: transparent;
    border: 1.5px solid rgba(128, 128, 128, 0.65);
    opacity: 0.75;
}

@media (prefers-color-scheme: dark) {
    body.ir-enabled .bt-bullet::after {
        border-color: rgba(180, 180, 180, 0.45);
    }
    body.ir-enabled .bt-bullet:hover::after {
        border-color: rgba(200, 200, 200, 0.75);
    }
}

body.ir-enabled.dark .bt-bullet::after,
body.ir-enabled [data-theme="dark"] .bt-bullet::after {
    border-color: rgba(180, 180, 180, 0.45);
}

/* ---------- Native marker interaction ---------- */

/* When PR bullets are on, hide Thymer's native ulist bullet so our PR bullet
   is the sole marker for ulist rows. Native olist numbers and task checkboxes
   stay visible as siblings to the RIGHT of .bt-marker (left of text). */
body.ir-enabled.bt-bullets .listitem-ulist > .line-bullet-div {
    display: none !important;
}

/* ---------- Collapse hiding ---------- */

body.ir-enabled.bt-toggles .listitem.bt-collapsed > .listitem,
body.ir-enabled.bt-toggles .listitem.bt-collapsed .listitem {
    display: none !important;
}

/* ---------- Zoom start line (visual subtle style) ---------- */
body.ir-enabled .listitem.bt-zoom-start-line > .line-div {
    padding-left: 4px;
    box-sizing: border-box;
}

/* ---------- Hover-menu adjustments when our caret is active ----------
     1. Hide the native collapse/expand chevrons in .link-menu (our
        .bt-caret is the single collapse affordance).
     2. Replace the fold-icon SVG inside .item-drag-handle with a dots
        glyph, so the drag/options affordance is visually obvious and
        the click zone lands directly on what the user sees. (Force-
        showing .link-menu-action-options doesn't work because Thymer's
        action handlers only fire when the link-menu is activated by
        a real drag-handle hover; clicks on a CSS-revealed options
        button are no-ops.) ---------- */
/* Hide native collapse/expand from the link-menu whenever our in-row
   .bt-caret is active (body.bt-toggles). The row caret is the single
   collapse affordance — regardless of whether bullets are also on.
   Caret-only popup reads [drag-handle][zoom] (54pt). Both-on popup
   reads [drag-handle] only (27pt; zoom is also hidden when bullets
   are on — see rule below), leaving the in-row .bt-caret unobstructed
   to the right of the popup. */
body.ir-enabled.bt-toggles .link-menu .link-menu-action-collapse,
body.ir-enabled.bt-toggles .link-menu .link-menu-action-expand {
    display: none !important;
}

/* Hide the native link-menu zoom arrow when our Workflowy bullets are
   active — clicking the bullet already zooms, so ↗ in the hover menu
   is redundant. Gated on bt-bullets so disabling the bullet setting
   restores the native zoom affordance. */
body.ir-enabled.bt-bullets .link-menu .link-menu-action-zoom {
    display: none !important;
}

/* Replace the drag-handle's fold-icon SVG with a dots glyph. We use
   flex layout on the handle itself to center the ::after, instead of
   position: absolute + inset: 0. Flex only changes how CHILDREN are
   laid out; it does NOT touch the handle's own positioning scheme
   (Thymer keeps its position: absolute), so the hover menu continues
   to follow the cursor. display: none on the SVG removes it from the
   flex flow so the ::after is the sole centered child. */
body.ir-enabled.bt-toggles .item-drag-handle,
body.ir-enabled.bt-bullets .item-drag-handle {
    display: flex !important;
    align-items: center;
    justify-content: center;
}

/* Pin the drag-handle popup to the FIRST line of wrapped rows (mirrors
   the .bt-marker alignment fix). Thymer positions .item-drag-handle
   absolutely and centers it vertically on the listitem's full box, so
   on wrapped rows the circle floats between lines. Overriding top to
   (1lh - 30px) / 2 lands the 27px circle's vertical center on the
   first-line midline regardless of row height. bottom: auto prevents
   Thymer's bottom-anchor from fighting our top. */
body.ir-enabled.bt-toggles .item-drag-handle,
body.ir-enabled.bt-bullets .item-drag-handle {
    /* Pin the circle to the row's FIRST text baseline, matching where
       .bt-marker's caret + bullet land. We measure from the top of
       the row: 'top: calc(.5em - 13.5px)' puts the circle's vertical
       center on the baseline of the first line's em-box (approx.
       text baseline), regardless of the row's total height on
       wrapped rows. 1em resolves to the listitem's own font-size, so
       headings and body text both line up. */
    top: calc(1em - 13.5px) !important;
    bottom: auto !important;
}
body.ir-enabled.bt-toggles .item-drag-handle .handle-fold-icon,
body.ir-enabled.bt-bullets .item-drag-handle .handle-fold-icon {
    display: none;
}
body.ir-enabled.bt-toggles .item-drag-handle::after,
body.ir-enabled.bt-bullets .item-drag-handle::after {
    content: " ";              
    font-size: 18px;
    line-height: 1;
    color: currentColor;
    opacity: 0.55;
    pointer-events: none;      /* clicks pass through to .item-drag-handle */
    letter-spacing: 1px;
}
body.ir-enabled.bt-toggles .item-drag-handle:hover::after,
body.ir-enabled.bt-bullets .item-drag-handle:hover::after {
    opacity: 0.95;
}

/* Uniform 27px slots for every .link-menu component. Thymer's native
   popup is 81pt wide with three components (zoom ↗, collapse/expand ∨,
   drag-handle ○) — exactly 27pt per slot. By pinning each component
   to 27px here, the popup naturally renders at 27 / 54 / 81pt based
   on how many children are visible (collapse/expand/zoom get hidden
   individually elsewhere, never the popup itself). This replaces the
   previous transform-shift hacks that tried to reposition the drag-
   handle visually — unnecessary once each slot has a predictable
   width and the drag-handle is ordered first (see below). */
body.ir-enabled .link-menu > .link-menu-action-zoom,
body.ir-enabled .link-menu > .link-menu-action-collapse,
body.ir-enabled .link-menu > .link-menu-action-expand,
body.ir-enabled .link-menu > .item-drag-handle {
    flex: 0 0 27px !important;
    width: 27px !important;
    min-width: 27px !important;
    max-width: 27px !important;
    box-sizing: border-box;
}

/* Square up the drag-handle so its native dotted border wraps a 27x27
   circle that fills the slot. Previously the width override made the
   slot 27px wide while the native height was smaller, producing an
   oval whose hit-zone (full 27px slot) did not visually match the
   narrower dotted ring — so hovering the empty slot edge was firing
   the drag/options menu while hovering the visible ring looked inert.
   Matching width to height ties the hit-zone to what the user sees.
   The drag-handle is placed first in DOM order by a MutationObserver
   (see link-menu observer below) — CSS 'order' appeared to desync
   Thymer's hit-zone from the visible ring in some states, so we do
   a real reparent instead. */
body.ir-enabled.bt-toggles .link-menu > .item-drag-handle,
body.ir-enabled.bt-bullets .link-menu > .item-drag-handle {
    height: 27px !important;
}

/* Both-on: shift ONLY the drag-handle (the visible circle) 27px to the
   left using 'position: relative; left: -27px'. 'left' (unlike
   'transform') updates offsetLeft / layout origin, so both the visible
   ring AND its hover/click hit-zone move together. The '.link-menu'
   wrapper stays at its natural 27pt width and original position, so
   Thymer's own popup anchoring is untouched. Scoped to both-on only;
   single-feature/native states are unchanged. */
/* Shrink the .link-menu container's pointer/layout footprint to the
   27pt drag-handle slot so the rest of the popup's box doesn't cover
   and steal clicks from the in-row .bt-caret. overflow: visible lets
   the drag-handle's left/transform offsets paint outside the shrunk
   container. pointer-events: none on the container + auto on the
   drag-handle keeps the circle interactive while letting clicks on
   the caret column pass through to .bt-caret underneath. */
body.ir-enabled.bt-toggles.bt-bullets .link-menu {
    width: 27px !important;
    min-width: 27px !important;
    max-width: 27px !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
    pointer-events: none !important;
    background: transparent !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
}
/* Kill any pseudo-element chrome (dashed outlines, highlight rings,
   etc.) the native stylesheet draws on .link-menu so only the
   drag-handle's own circle remains visible in both-on. */
body.ir-enabled.bt-toggles.bt-bullets .link-menu::before,
body.ir-enabled.bt-toggles.bt-bullets .link-menu::after {
    content: none !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}
body.ir-enabled.bt-toggles.bt-bullets .link-menu > .item-drag-handle {
    pointer-events: auto !important;
    position: relative !important;
    left: -27px !important;
    /* Visual-only nudge: the hit-zone (set by 'left' above) is correct, but the painted ring sits ~20px too far right. transform shifts paint without touching layout, so the hit-zone stays put while the circle visually aligns with the drag-gutter. */
    transform: translateX(0px) !important;
}
`;

        // Write the palette for the current scheme as --ir-level-N root vars.
        const applySchemeVars = (schemeName) => {
            const colors = colorSchemes[schemeName].colors;
            const root = document.documentElement.style;
            colors.forEach((color, i) => root.setProperty(`--ir-level-${i}`, color));
            root.setProperty('--ir-level-count', colors.length);
        };

        // Update CSS vars for width / opacity without touching the stylesheet.
        const applySettingVars = () => {
            const root = document.documentElement.style;
            root.setProperty('--bt-line-width', `${currentWidth}px`);
            root.setProperty('--bt-line-opacity', currentOpacity);
            root.setProperty('--bt-line-opacity-hover', Math.min(currentOpacity + 0.5, 0.9));
        };

        // Persist settings to localStorage (only called on user change).
        const saveSettings = () => {
            localStorage.setItem(STORAGE_KEY, currentScheme);
            localStorage.setItem(WIDTH_KEY, currentWidth);
            localStorage.setItem(ACTIVE_WIDTH_KEY, activeWidth);
            localStorage.setItem(OPACITY_KEY, currentOpacity);
            localStorage.setItem(ENABLED_KEY, isEnabled);
            localStorage.setItem(THREADING_MODE_KEY, threadingMode);
            localStorage.setItem(BULLETS_ENABLED_KEY, isBulletsEnabled);
            localStorage.setItem(TOGGLES_ENABLED_KEY, isTogglesEnabled);
        };

        // Toggle the ir-enabled body class which gates all our CSS rules.
        const applyEnabledState = () => {
            document.body.classList.toggle('ir-enabled', isEnabled);
            document.body.classList.toggle('bt-bullets', isEnabled && isBulletsEnabled);
            document.body.classList.toggle('bt-toggles', isEnabled && isTogglesEnabled);
        };

        // Inject the static stylesheet once.
        this.styleElement = this.ui.injectCSS(STATIC_CSS);
        applySchemeVars(currentScheme);
        applySettingVars();
        applyEnabledState();

        // =====================================================
        // Focus Tracking via .listitem-with-caret
        // =====================================================
        // Thymer marks the listitem containing the caret with the class
        // `listitem-with-caret`. We watch for that class toggle to resolve
        // the focused item — no transform parsing, no hit-tests, no key
        // or click listeners.

        let currentFocusedItem = null;
        let rafPending = false;
        let activeHighlights = []; // Cache highlight elements for faster cleanup

        const cleanHighlights = () => {
            while (activeHighlights.length > 0) {
                const h = activeHighlights.pop();
                if (h.parentElement) h.parentElement.removeChild(h);
            }
        };

        // Helper to find thread parents (moved out of updateFocusedItem to save memory)
        const getParents = (startNode) => {
            const parents = [];
            if (!startNode) return parents;

            // Try nested structure first (Logseq or alternative Thymer structure)
            let current = startNode.parentElement;
            let foundNestedParents = false;
            while (current) {
                const closestListitem = current.closest('.listitem');
                if (closestListitem) {
                    parents.push(closestListitem);
                    foundNestedParents = true;
                    current = closestListitem.parentElement;
                } else {
                    break;
                }
            }
            if (foundNestedParents) return parents;

            // Try flat structure fallback using TreeWalker ( Thymer uses margin-left on lines )
            const getIndentLevel = (el) => {
                for (let i = 0; i < el.children.length; i++) {
                    const child = el.children[i];
                    if (child.style && child.style.marginLeft) return parseInt(child.style.marginLeft) || 0;
                }
                if (el.style && el.style.marginLeft) return parseInt(el.style.marginLeft) || 0;
                return 0;
            };

            let currentIndent = getIndentLevel(startNode);
            if (currentIndent <= 0) return parents;

            try {
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
                    acceptNode: (el) => (el.classList && el.classList.contains('listitem')) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
                });
                walker.currentNode = startNode;
                let prev = walker.previousNode();
                while (prev && currentIndent > 0) {
                    const prevIndent = getIndentLevel(prev);
                    if (prevIndent < currentIndent) {
                        parents.push(prev);
                        currentIndent = prevIndent;
                    }
                    prev = walker.previousNode();
                }
            } catch (e) {
                // Ignore errors
            }
            return parents;
        };

        // =====================================================
        // Focus tracking — resolves focused listitem from class marker
        // =====================================================

        const updateFocusedItem = (node) => {
            if (this.isUnloaded) return;
            rafPending = false;

            if (!node) {
                node = document.querySelector('.listitem-with-caret');
            }

            // --- READ PHASE --- (Avoid layout thrashing)
            const highlightData = [];

            if (node && document.body.contains(node) && node.offsetParent !== null) {
                const parents = getParents(node);

                if (parents.length > 0) {
                    const targetLineDiv = node.querySelector('.line-div') || node;
                    const targetRect = targetLineDiv.getBoundingClientRect();

                    // Resolve effective single-line height to anchor arm to first wrap line.
                    let lineHeight = 0;
                    if (targetLineDiv && targetLineDiv.nodeType === 1) {
                        const lh = parseFloat(getComputedStyle(targetLineDiv).lineHeight);
                        if (!isNaN(lh) && lh > 0) lineHeight = lh;
                    }
                    if (!lineHeight) {
                        const rootLh = parseFloat(
                            getComputedStyle(document.documentElement).getPropertyValue('--line-height')
                        );
                        lineHeight = !isNaN(rootLh) && rootLh > 0 ? rootLh : 26;
                    }

                    if (targetRect.height > 0) {
                        for (let index = 0; index < parents.length; index++) {
                            const p = parents[index];
                            const targetPointNode = threadingMode === 'staircase'
                                ? (index === 0 ? node : parents[index - 1])
                                : node;

                            const tLineDiv = targetPointNode.querySelector('.line-div') || targetPointNode;
                            const tRect = tLineDiv.getBoundingClientRect();
                            if (tRect.height === 0) continue;

                            // Anchor to the first visual line so wrapped items
                            // still point at their prefix (bullet/check/number).
                            const firstLineH = Math.min(tRect.height, lineHeight);
                            const tY = tRect.top + (firstLineH / 2);

                            const pIndent = p.querySelector('.listitem-indentline');
                            const pLine = pIndent ? pIndent.parentElement : null;

                            if (pLine && pIndent && pIndent.parentElement) {
                                const pRect = pIndent.getBoundingClientRect();
                                const pContainerRect = pIndent.parentElement.getBoundingClientRect();

                                const h = tY - pRect.top;

                                let armEndX = tRect.left - 5;
                                for (let ci = 0; ci < targetPointNode.children.length; ci++) {
                                    const ch = targetPointNode.children[ci];
                                    if (ch.style && ch.style.marginLeft && parseInt(ch.style.marginLeft) > 0) {
                                        armEndX = ch.getBoundingClientRect().left;
                                        break;
                                    }
                                }
                                const w = Math.max(14, armEndX - pRect.left);

                                if (h > 0 && pRect.height > 0) {
                                    highlightData.push({
                                        parent: pIndent.parentElement,
                                        top: (pRect.top - pContainerRect.top),
                                        left: (pRect.left - pContainerRect.left),
                                        width: w,
                                        height: h,
                                        color: getComputedStyle(pIndent).backgroundColor
                                    });
                                }
                            }
                        }
                    }
                }
            }

            // --- WRITE PHASE ---
            if (node !== currentFocusedItem) {
                if (currentFocusedItem) currentFocusedItem.classList.remove('bt-focused');
                if (node) node.classList.add('bt-focused');
                currentFocusedItem = node;
            }

            for (let i = 0; i < highlightData.length; i++) {
                const data = highlightData[i];
                let highlight;
                if (i < activeHighlights.length) {
                    highlight = activeHighlights[i];
                    if (highlight.parentElement !== data.parent) {
                        highlight.parentElement?.removeChild(highlight);
                        data.parent.appendChild(highlight);
                    }
                } else {
                    highlight = document.createElement('div');
                    highlight.className = 'bt-active-highlight';
                    data.parent.appendChild(highlight);
                    activeHighlights.push(highlight);
                }
                highlight.style.position = 'absolute';
                highlight.style.top = `${data.top}px`;
                highlight.style.left = `${data.left}px`;
                highlight.style.width = `${data.width}px`;
                highlight.style.height = `${data.height}px`;
                highlight.style.borderLeft = `${activeWidth}px solid ${data.color}`;
                highlight.style.borderBottom = `${activeWidth}px solid ${data.color}`;
                highlight.style.borderBottomLeftRadius = '6px';
                highlight.style.boxSizing = 'border-box';
                highlight.style.backgroundColor = 'transparent';
                highlight.style.zIndex = '10';
                highlight.style.pointerEvents = 'none';
                highlight.style.opacity = '1';
                highlight.style.filter = `brightness(1.5) drop-shadow(0 0 3px ${data.color})`;
            }

            while (activeHighlights.length > highlightData.length) {
                const h = activeHighlights.pop();
                if (h.parentElement) h.parentElement.removeChild(h);
            }
        };

        // Resolved once here (earlier than its original site) because the
        // caret-class observer below now scopes to this container too.
        const editorContainer = document.querySelector('.editor-wrapper, .page-content, #editor') || document.body;

        // Track the active RAF id so unload can cancel it (S8).
        let focusedItemRafId = 0;
        const scheduleUpdate = (node) => {
            if (rafPending) return;
            rafPending = true;
            focusedItemRafId = requestAnimationFrame(() => updateFocusedItem(node));
        };

        // Watch for the .listitem-with-caret class toggle inside the editor.
        const setupCaretClassObserver = () => {
            if (this.isUnloaded) return;

            const observer = new MutationObserver((mutations) => {
                if (this.isUnloaded) return;
                for (const m of mutations) {
                    if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
                    const el = m.target;
                    if (!(el instanceof Element)) continue;
                    if (!el.classList.contains('listitem')) continue;
                    if (el.classList.contains('listitem-with-caret')) {
                        scheduleUpdate(el);
                        return;
                    }
                    // Class removed from the previously focused item —
                    // trigger a re-resolve; may find another item or null.
                    if (el === currentFocusedItem) {
                        scheduleUpdate(null);
                        return;
                    }
                }
            });

            observer.observe(editorContainer, {
                subtree: true,
                attributes: true,
                attributeFilter: ['class'],
            });
            this.cleanupMethods.push(() => observer.disconnect());

            // Initial resolve.
            scheduleUpdate(null);
        };

        setupCaretClassObserver();

        // =====================================================
        // JS-driven coloring — all item types via --ir-color var
        // =====================================================

        const INDENT_STEP = 30;

        const colorIndentLine = (item) => {
            const indentLine = item.querySelector('.listitem-indentline');
            if (!indentLine) return;

            const lineDiv = item.querySelector('.line-div');
            // S2: zero-alloc empty-check. Walk childNodes directly instead
            // of Array.from(...).some(...) which allocates per call.
            let isEmpty;
            if (lineDiv) {
                isEmpty = true;
                for (const n of lineDiv.childNodes) {
                    if (n.nodeType === 1 && n.classList
                        && (n.classList.contains('listitem-indentline')
                            || n.classList.contains('bt-active-highlight'))) continue;
                    const txt = n.textContent;
                    if (txt && txt.trim().length > 0) { isEmpty = false; break; }
                }
            } else {
                isEmpty = !(item.textContent || '').trim();
            }

            if (isEmpty) {
                indentLine.style.setProperty('display', 'none', 'important');
                indentLine.dataset.btEmpty = '1';
            } else if (indentLine.dataset.btEmpty) {
                indentLine.style.removeProperty('display');
                delete indentLine.dataset.btEmpty;
            }

            let marginLeft = 0;
            for (let i = 0; i < item.children.length; i++) {
                const child = item.children[i];
                if (child.style && child.style.marginLeft) {
                    const ml = parseInt(child.style.marginLeft) || 0;
                    if (ml >= 0) { marginLeft = ml; break; }
                }
            }
            if (marginLeft === 0 && item.style && item.style.marginLeft) {
                marginLeft = parseInt(item.style.marginLeft) || 0;
            }

            const level = Math.max(0, Math.floor(marginLeft / INDENT_STEP));
            indentLine.style.setProperty('--ir-color', `var(--ir-level-${level})`, 'important');
            indentLine.dataset.btManaged = '1';
        };

        const clearListColors = () => {
            const lines = document.querySelectorAll('.listitem-indentline[data-bt-managed], .listitem-indentline[data-bt-empty]');
            for (const line of lines) {
                line.style.removeProperty('--ir-color');
                line.style.removeProperty('display');
                delete line.dataset.btManaged;
                delete line.dataset.btEmpty;
            }
        };

        const applyListColors = (items) => {
            if (!isEnabled) return;
            for (const item of items) colorIndentLine(item);
        };

        let listColorRafPending = false;
        let pendingItems = new Set();

        const scheduleListColorUpdate = (items) => {
            if (items) items.forEach(i => pendingItems.add(i));
            if (!listColorRafPending) {
                listColorRafPending = true;
                listColorRafId = requestAnimationFrame(() => {
                    listColorRafPending = false;
                    if (this.isUnloaded) return;
                    const toProcess = pendingItems.size > 0
                        ? [...pendingItems]
                        : [...document.querySelectorAll('.listitem')];
                    pendingItems.clear();
                    applyListColors(toProcess);
                });
            }
        };

        // =====================================================
        // Win 2: Scoped mutation observer — editor container only
        // (editorContainer is declared near the top of onLoad so the
        //  caret-class observer can share the same scope.)
        // =====================================================

        // Track the active RAF id so unload can cancel it (S8).
        let listColorRafId = 0;

        const listColorObserver = new MutationObserver((mutations) => {
            const affected = new Set();
            for (const m of mutations) {
                if (m.type === 'childList') {
                    for (const node of m.addedNodes) {
                        if (node.nodeType !== 1) continue;
                        if (node.classList.contains('listitem')) {
                            affected.add(node);
                        } else if (node.querySelector) {
                            node.querySelectorAll('.listitem').forEach(n => affected.add(n));
                        }
                    }
                } else if (m.type === 'attributes') {
                    const li = m.target.closest?.('.listitem');
                    if (li) affected.add(li);
                }
            }
            if (affected.size > 0) {
                scheduleListColorUpdate(affected);
            } else {
                scheduleListColorUpdate(null);
            }
        });

        listColorObserver.observe(editorContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        this.cleanupMethods.push(() => {
            listColorObserver.disconnect();
            clearListColors();
        });

        scheduleListColorUpdate(null);

        // =====================================================
        // Workflowy-style outline: bullets + disclosure carets
        //   (1) .bt-marker wrapper injected as first child of every .listitem
        //   (2) Disclosure carets on parents (bt-has-children)
        //   (3) Collapse via .bt-collapsed (CSS hides descendants)
        //   (4) Bullet click → zoom; caret click → toggle collapse
        // =====================================================

        const EDITOR_SELECTORS = '.editor-wrapper, .page-content, #editor';
        const INDENT_CARRIER_SELECTOR = '.line-check-div, .line-bullet-div, .line-number-div, .line-div';

        // Scan ALL direct children of a .listitem for the first one with
        // inline style.marginLeft. Thymer parks indent on whichever leftmost
        // marker container a row has (check-div / bullet-div / number-div /
        // line-div), so we must not enumerate specific classes — that's the
        // bug pr-1 had for nested olists.
        const getItemIndent = (li) => {
            if (!li) return 0;
            // After marker injection, .bt-marker holds the indent (transferred).
            const marker = li.firstElementChild;
            if (marker && marker.classList?.contains('bt-marker') && marker.style.marginLeft) {
                return parseInt(marker.style.marginLeft) || 0;
            }
            for (let i = 0; i < li.children.length; i++) {
                const c = li.children[i];
                if (c.classList?.contains('bt-marker')) continue;
                if (c.style && c.style.marginLeft) {
                    const v = parseInt(c.style.marginLeft) || 0;
                    if (v) return v;
                }
            }
            if (li.style && li.style.marginLeft) {
                return parseInt(li.style.marginLeft) || 0;
            }
            return 0;
        };

        // Guard flag so mutations WE make while injecting don't re-trigger
        // our own observer callback infinitely.
        let outlineMutating = false;

        // If the caret currently sits at listitem offset 0 (i.e. BEFORE our
        // injected marker), forward it to the start of the next sibling so
        // typing begins inside the text area rather than to the left of the
        // bullet. Called from two places:
        //   - selectionchange listener (covers clicks / arrow navigation)
        //   - injectMarker right after insertBefore (covers the Enter-
        //     to-create-new-row case, where the caret is placed BEFORE the
        //     marker DOM-wise via a pure mutation that doesn't re-fire
        //     selectionchange)
        let cursorForwardBusy = false;
        const forwardCursorPastMarker = (li) => {
            if (cursorForwardBusy) return;
            const sel = window.getSelection && window.getSelection();
            if (!sel || !sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            if (!range.collapsed) return;
            if (range.startOffset !== 0) return;
            const node = range.startContainer;
            if (!node || node.nodeType !== 1) return;
            // If a specific li was passed, only act when that's the container.
            if (li && node !== li) return;
            if (!node.classList || !node.classList.contains('listitem')) return;
            const marker = node.firstElementChild;
            if (!marker || !marker.classList.contains('bt-marker')) return;
            const target = marker.nextElementSibling;
            if (!target) return;
            cursorForwardBusy = true;
            try {
                const newRange = document.createRange();
                newRange.selectNodeContents(target);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
            } finally {
                cursorForwardBusy = false;
            }
        };

        // Inject (or re-sync) the .bt-marker wrapper as the first child of
        // a .listitem. Transfers the marginLeft off whichever native child
        // currently holds it onto .bt-marker so indentation flow is
        // preserved without absolute positioning.
        const injectMarker = (li) => {
            if (!li || !li.classList || !li.classList.contains('listitem')) return;
            let marker = li.firstElementChild;
            if (marker && marker.classList.contains('bt-marker')) {
                // Marker already present — re-sync indent in case Thymer
                // moved marginLeft back to a native child.
                for (let i = 1; i < li.children.length; i++) {
                    const c = li.children[i];
                    if (c.style && c.style.marginLeft) {
                        marker.style.marginLeft = c.style.marginLeft;
                        marker.dataset.btFromClass = c.className || '';
                        c.style.marginLeft = '';
                        break;
                    }
                }
                return;
            }
            marker = document.createElement('span');
            marker.className = 'bt-marker';
            marker.setAttribute('contenteditable', 'false');
            marker.setAttribute('aria-hidden', 'true');
            const caret = document.createElement('span');
            // `ti ti-chevron-down` gives us the same glyph Thymer's native
            // link-menu collapse button uses. `updateCaretIcon` swaps to
            // `ti-chevron-right` when the row is collapsed.
            caret.className = 'bt-caret ti ti-chevron-down';
            caret.setAttribute('contenteditable', 'false');
            caret.setAttribute('aria-hidden', 'true');
            const bullet = document.createElement('span');
            bullet.className = 'bt-bullet';
            bullet.setAttribute('contenteditable', 'false');
            bullet.setAttribute('aria-hidden', 'true');
            marker.appendChild(caret);
            marker.appendChild(bullet);

            // Transfer marginLeft from the first indent-carrying native child.
            for (let i = 0; i < li.children.length; i++) {
                const c = li.children[i];
                if (c.style && c.style.marginLeft) {
                    marker.style.marginLeft = c.style.marginLeft;
                    marker.dataset.btFromClass = c.className || '';
                    c.style.marginLeft = '';
                    break;
                }
            }
            outlineMutating = true;
            li.insertBefore(marker, li.firstElementChild);
            outlineMutating = false;
            // The caret may have been sitting at listitem offset 0 just
            // before the insert (newly-created empty row case). After the
            // insert, offset 0 now points before our marker. Forward it.
            forwardCursorPastMarker(li);
            // Retry on the next frame: Thymer sometimes re-anchors the
            // selection back to listitem[0] after we forward it (post-Enter
            // cursor placement runs on its own rAF). Retrying once after
            // Thymer's pass settles catches that race. The cursorForwardBusy
            // guard inside the helper prevents unnecessary work if the
            // cursor has already moved somewhere valid.
            requestAnimationFrame(() => forwardCursorPastMarker(li));
        };

        // Remove our marker and restore the marginLeft to the native child
        // whose class we remembered when we transferred from it.
        const removeMarker = (li) => {
            if (!li) return;
            const marker = li.firstElementChild;
            if (!marker || !marker.classList?.contains('bt-marker')) return;
            const restoredTo = marker.dataset.btFromClass;
            const ml = marker.style.marginLeft;
            outlineMutating = true;
            if (ml && restoredTo) {
                // Restore to the first matching-class child if it's still there.
                for (let i = 1; i < li.children.length; i++) {
                    const c = li.children[i];
                    if (c.className === restoredTo) {
                        c.style.marginLeft = ml;
                        break;
                    }
                }
            }
            marker.remove();
            outlineMutating = false;
        };

        // Synchronously classify a parent row as has-children / not, given
        // the presence of a deeper-indented next sibling in document order.
        const updateHasChildrenFor = (li) => {
            if (!li || !li.classList?.contains('listitem')) return;
            const myIndent = getItemIndent(li);
            // Look ahead in document order (flat-DOM model) for the next
            // .listitem; if it's indented deeper, this row has children.
            let walker = li;
            let hasChild = false;
            while (walker) {
                const next = walker.nextElementSibling
                    || (walker.parentElement && walker.parentElement !== document.body
                        ? walker.parentElement.nextElementSibling : null);
                if (!next) break;
                if (next.classList && next.classList.contains('listitem')) {
                    const nextIndent = getItemIndent(next);
                    hasChild = nextIndent > myIndent;
                    break;
                }
                // Skip non-listitem siblings (e.g., editor chrome).
                walker = next;
                if (walker.querySelector) {
                    const firstLi = walker.querySelector('.listitem');
                    if (firstLi) {
                        const nextIndent = getItemIndent(firstLi);
                        hasChild = nextIndent > myIndent;
                        break;
                    }
                }
            }
            // S4: skip no-op class changes to avoid unnecessary style
            // invalidation.
            const currently = li.classList.contains('bt-has-children');
            if (hasChild && !currently) li.classList.add('bt-has-children');
            else if (!hasChild && currently) li.classList.remove('bt-has-children');
        };

        // Find the `.listitem` that is the logical parent of `li` by walking
        // backwards in the flat DOM order until we find a `.listitem` with
        // strictly smaller indent. Used for the sync has-children path.
        // S3: `allItems` (optional) lets a batch caller hand in a single
        // pre-scanned NodeList/Array so we don't run
        // document.querySelectorAll('.listitem') once per added row.
        const findParentListItem = (li, allItems) => {
            if (!li) return null;
            const myIndent = getItemIndent(li);
            if (myIndent === 0) return null;
            const all = allItems || document.querySelectorAll('.listitem');
            let found = null;
            for (let i = 0; i < all.length; i++) {
                if (all[i] === li) {
                    for (let j = i - 1; j >= 0; j--) {
                        const prev = all[j];
                        if (getItemIndent(prev) < myIndent) { found = prev; break; }
                    }
                    break;
                }
            }
            return found;
        };

        // Full-document annotation pass (RAF-debounced). Injects markers on
        // any rows missing one and recomputes bt-has-children for every row.
        const annotateAll = () => {
            const items = Array.from(document.querySelectorAll('.listitem'));
            if (!isEnabled || (!isBulletsEnabled && !isTogglesEnabled)) {
                // Strip everything if disabled.
                for (const li of items) {
                    removeMarker(li);
                    li.classList.remove('bt-has-children', 'bt-collapsed', 'bt-zoom-start-line');
                    if (li.style.display === 'none') li.style.display = '';
                }
                return items;
            }
            for (const li of items) injectMarker(li);
            // Flat-pass has-children: compare each row's indent to next row's.
            // S4: cache the previous iteration's indent so we call
            // getItemIndent once per row (instead of twice), and skip
            // classList.add/remove when the state already matches.
            let curIndent = items.length ? getItemIndent(items[0]) : 0;
            for (let i = 0; i < items.length; i++) {
                const cur = items[i];
                const next = items[i + 1];
                const nextIndent = next ? getItemIndent(next) : -1;
                const hasChild = !!next && nextIndent > curIndent;
                const currently = cur.classList.contains('bt-has-children');
                if (hasChild && !currently) cur.classList.add('bt-has-children');
                else if (!hasChild && currently) cur.classList.remove('bt-has-children');
                curIndent = nextIndent;
            }
            return items;
        };

        // Swap the Tabler Icons class on the caret so its glyph matches
        // the row's collapse state (down = expanded, right = collapsed).
        // Thymer's own stylesheet supplies the ::before content for these
        // classes, keeping us visually identical to the native chevrons.
        const updateCaretIcon = (li) => {
            if (!li || !li.classList?.contains('listitem')) return;
            const marker = li.firstElementChild;
            if (!marker || !marker.classList?.contains('bt-marker')) return;
            const caret = marker.firstElementChild;
            if (!caret || !caret.classList?.contains('bt-caret')) return;
            const collapsed = li.classList.contains('bt-collapsed');
            const wantDown = !collapsed;
            const hasDown = caret.classList.contains('ti-chevron-down');
            const hasRight = caret.classList.contains('ti-chevron-right');
            if (wantDown && !hasDown) {
                caret.classList.remove('ti-chevron-right');
                caret.classList.add('ti-chevron-down');
            } else if (!wantDown && !hasRight) {
                caret.classList.remove('ti-chevron-down');
                caret.classList.add('ti-chevron-right');
            }
        };

        // Hide descendants of any .bt-collapsed row. Flat DOM model: walk
        // forward until we hit a row at the same-or-lower indent, hiding
        // everything in between.
        const applyCollapseState = (items) => {
            items = items || Array.from(document.querySelectorAll('.listitem'));
            // First pass: clear any row we previously hid + resync caret icons.
            for (const li of items) {
                if (li.dataset.btHiddenByCollapse === '1') {
                    li.style.display = '';
                    delete li.dataset.btHiddenByCollapse;
                }
                updateCaretIcon(li);
            }
            if (!isEnabled || !isTogglesEnabled) return;
            for (let i = 0; i < items.length; i++) {
                const cur = items[i];
                if (!cur.classList.contains('bt-collapsed')) continue;
                const baseIndent = getItemIndent(cur);
                for (let j = i + 1; j < items.length; j++) {
                    const next = items[j];
                    if (getItemIndent(next) <= baseIndent) break;
                    if (next.style.display !== 'none') {
                        next.style.display = 'none';
                        next.dataset.btHiddenByCollapse = '1';
                    }
                }
            }
        };

        let outlineRafPending = false;
        let outlineRafId = 0;
        const runOutlinePass = () => {
            outlineRafPending = false;
            if (this.isUnloaded) return;
            const items = annotateAll();
            applyCollapseState(items);
        };
        const scheduleOutlinePass = () => {
            if (outlineRafPending) return;
            outlineRafPending = true;
            outlineRafId = requestAnimationFrame(runOutlinePass);
        };

        // ---------- Synchronous observer path (native-feel) ----------
        // MutationObserver callbacks run as microtasks BEFORE the next paint.
        // For added .listitem nodes we do the marker injection + an
        // immediate bt-has-children toggle on the parent synchronously, so
        // the new row and its parent caret show up in the same frame.
        const SYNC_INJECT_CAP = 24; // fall back to RAF above this many
        let zoomStartLineGuid = null;

        const applyZoomStartLineStyle = (zoomGuid) => {
            document.querySelectorAll('.listitem.bt-zoom-start-line').forEach(li => {
                li.classList.remove('bt-zoom-start-line');
            });
            zoomStartLineGuid = zoomGuid || null;
            if (!zoomGuid) return;
            const li = document.querySelector(`.listitem[data-guid="${CSS.escape(zoomGuid)}"]`);
            if (li) li.classList.add('bt-zoom-start-line');
        };

        const outlineObserver = new MutationObserver((mutations) => {
            if (outlineMutating) return;
            if (!isEnabled || (!isBulletsEnabled && !isTogglesEnabled)) return;

            const addedListItems = [];
            let sawStructuralChange = false;
            let sawIndentChange = false;

            for (const m of mutations) {
                if (m.type === 'childList') {
                    // Ignore additions to/from our own marker subtree.
                    if (m.target && m.target.classList?.contains('bt-marker')) continue;
                    for (const n of m.addedNodes) {
                        if (n.nodeType !== 1) continue;
                        if (n.classList?.contains('bt-marker')) continue;
                        if (n.classList?.contains('listitem')) {
                            addedListItems.push(n);
                            sawStructuralChange = true;
                        } else if (n.querySelectorAll) {
                            const kids = n.querySelectorAll('.listitem');
                            if (kids.length) {
                                kids.forEach(k => addedListItems.push(k));
                                sawStructuralChange = true;
                            }
                        }
                    }
                    if (!sawStructuralChange) {
                        for (const n of m.removedNodes) {
                            if (n.nodeType !== 1) continue;
                            if (n.classList?.contains('listitem')
                                || (n.querySelector && n.querySelector('.listitem'))) {
                                sawStructuralChange = true;
                                break;
                            }
                        }
                    }
                } else if (m.type === 'attributes' && m.attributeName === 'style') {
                    const t = m.target;
                    if (!t || !t.classList) continue;
                    if (t.classList.contains('bt-marker')) continue;
                    if (t.id === 'virtualinput-wrapper') continue;
                    if (t.classList.contains('line-check-div')
                        || t.classList.contains('line-bullet-div')
                        || t.classList.contains('line-number-div')
                        || t.classList.contains('line-div')) {
                        sawIndentChange = true;
                    }
                }
            }

            // Synchronous path: inject markers + toggle parent has-children
            // for a small number of added rows — typical Enter keystroke.
            if (addedListItems.length > 0 && addedListItems.length <= SYNC_INJECT_CAP) {
                outlineMutating = true;
                try {
                    for (const li of addedListItems) injectMarker(li);
                    // S3: scan once for the whole batch instead of once per
                    // added row inside findParentListItem.
                    const allListItems = document.querySelectorAll('.listitem');
                    for (const li of addedListItems) {
                        const parent = findParentListItem(li, allListItems);
                        if (parent) updateHasChildrenFor(parent);
                        // Newly-added rows start with no children of their own.
                        if (li.classList.contains('bt-has-children')) {
                            li.classList.remove('bt-has-children');
                        }
                    }
                } finally {
                    outlineMutating = false;
                }
            } else if (addedListItems.length > SYNC_INJECT_CAP) {
                sawStructuralChange = true;
            }

            // Indent-change or large-batch → RAF-debounced full pass.
            if (sawStructuralChange || sawIndentChange) {
                scheduleOutlinePass();
            }
            // Also reapply zoom-start-line if it was in the added batch.
            if (zoomStartLineGuid) {
                const still = document.querySelector(`.listitem[data-guid="${CSS.escape(zoomStartLineGuid)}"]`);
                if (still && !still.classList.contains('bt-zoom-start-line')) {
                    still.classList.add('bt-zoom-start-line');
                }
            }
        });

        const outlineTarget = document.querySelector(EDITOR_SELECTORS) || document.body;
        outlineObserver.observe(outlineTarget, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });

        // Initial batch pass at load. The two delayed passes catch rows
        // that Thymer inserts after our observer is attached but before
        // the editor has fully populated. IDs captured so unload can
        // cancel them (S5).
        scheduleOutlinePass();
        const outlineInitTimeout1 = setTimeout(scheduleOutlinePass, 250);
        const outlineInitTimeout2 = setTimeout(scheduleOutlinePass, 1000);
        this.cleanupMethods.push(() => {
            clearTimeout(outlineInitTimeout1);
            clearTimeout(outlineInitTimeout2);
            // Cancel any pending RAFs so their callbacks don't fire
            // post-unload (S8).
            if (focusedItemRafId) cancelAnimationFrame(focusedItemRafId);
            if (listColorRafId) cancelAnimationFrame(listColorRafId);
            if (outlineRafId) cancelAnimationFrame(outlineRafId);
        });

        this.cleanupMethods.push(() => outlineObserver.disconnect());
        this.cleanupMethods.push(() => {
            // Strip all injected markers and outline classes on unload.
            document.querySelectorAll('.listitem').forEach(li => {
                removeMarker(li);
                li.classList.remove('bt-has-children', 'bt-collapsed', 'bt-zoom-start-line');
                if (li.dataset.btHiddenByCollapse === '1') {
                    li.style.display = '';
                    delete li.dataset.btHiddenByCollapse;
                }
            });
            document.body.classList.remove('bt-bullets', 'bt-toggles');
        });

        // ----- link-menu drag-handle DOM reorder -----
        // When Thymer injects a .link-menu hover popup, move .item-drag-handle
        // to be the FIRST child so the drag circle renders on the left. We use
        // a real reparent (not CSS `order`) because in some states Thymer's
        // hit-zone appears to key off DOM order, producing a hotzone that sits
        // between visible icons rather than on the circle.
        const reorderLinkMenu = (linkMenu) => {
            if (!linkMenu || !linkMenu.querySelector) return;
            const handle = linkMenu.querySelector(':scope > .item-drag-handle');
            if (!handle) return;
            if (linkMenu.firstElementChild === handle) return;
            linkMenu.insertBefore(handle, linkMenu.firstElementChild);
        };
        const linkMenuObserver = new MutationObserver((mutations) => {
            if (this.isUnloaded) return;
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (!(node instanceof Element)) continue;
                    if (node.classList && node.classList.contains('link-menu')) {
                        reorderLinkMenu(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('.link-menu').forEach(reorderLinkMenu);
                    }
                }
            }
        });
        linkMenuObserver.observe(outlineTarget, { childList: true, subtree: true });
        // Reorder any .link-menu nodes already present at load.
        outlineTarget.querySelectorAll('.link-menu').forEach(reorderLinkMenu);
        this.cleanupMethods.push(() => linkMenuObserver.disconnect());

        // ---------- GUID resolution + zoom ----------
        // Resolve the GUID of a .listitem. Try data-guid attrs first, then
        // fall back to index-in-flattened-record-tree.
        const resolveLineItemGuid = async (li) => {
            if (!li) return null;
            const attrCandidates = [
                'data-guid', 'data-lineitem-guid', 'data-line-item-guid',
                'data-item-guid', 'data-id', 'id'
            ];
            for (const attr of attrCandidates) {
                const val = li.getAttribute(attr);
                if (val && val.length >= 12) return val;
            }
            try {
                const panel = this.ui.getActivePanel && this.ui.getActivePanel();
                const record = panel && panel.getActiveRecord
                    ? panel.getActiveRecord() : null;
                if (!record || typeof record.getLineItems !== 'function') return null;
                const rootItems = await record.getLineItems();
                if (!rootItems || rootItems.length === 0) return null;
                const flatten = (arr) => {
                    const out = [];
                    for (const it of arr) {
                        out.push(it);
                        const ch = it.children;
                        if (ch && ch.length) out.push(...flatten(ch));
                    }
                    return out;
                };
                const flat = flatten(rootItems);
                const allDomItems = Array.from(document.querySelectorAll('.listitem'));
                const idx = allDomItems.indexOf(li);
                if (idx >= 0 && idx < flat.length && typeof flat[idx].getGuid === 'function') {
                    return flat[idx].getGuid();
                }
            } catch (err) {
                console.warn('[indent-rainbow] GUID resolution failed:', err);
            }
            return null;
        };

        const waitMs = (ms) => new Promise(r => setTimeout(r, ms));
        const lineItemGuid = (it) => (it && typeof it.getGuid === 'function' ? it.getGuid() : it?.guid);

        const findLineItemByGuid = (items, g) => {
            if (!items || !g) return null;
            for (const it of items) {
                if (lineItemGuid(it) === g) return it;
                const ch = it.children;
                if (ch && ch.length) {
                    const found = findLineItemByGuid(ch, g);
                    if (found) return found;
                }
            }
            return null;
        };

        const findLineItemByGuidAsync = async (items, g) => {
            if (!items || !g) return null;
            const direct = findLineItemByGuid(items, g);
            if (direct) return direct;
            for (const it of items) {
                let ch = it.children;
                if (ch == null && typeof it.getChildren === 'function') {
                    try { ch = await it.getChildren(); } catch { ch = null; }
                }
                if (ch && ch.length) {
                    const found = await findLineItemByGuidAsync(ch, g);
                    if (found) return found;
                }
            }
            return null;
        };

        const syncLineZoomContext = () => {
            const panel = this.ui.getActivePanel && this.ui.getActivePanel();
            if (!panel || typeof panel.getNavigation !== 'function') {
                this.lineZoomRootGuid = null;
                return;
            }
            const nav = panel.getNavigation() || {};
            const record = panel.getActiveRecord && panel.getActiveRecord();
            const rg = record && typeof record.getGuid === 'function' ? record.getGuid() : null;
            const rid = nav.rootId || null;
            if (!rid || !rg) { this.lineZoomRootGuid = null; return; }
            this.lineZoomRootGuid = (rid !== rg) ? rid : null;
        };

        const isLineUnderZoomSubtree = async (record, lineGuid, zoomGuid) => {
            if (!record || !lineGuid || !zoomGuid) return false;
            if (lineGuid === zoomGuid) return true;
            let roots;
            try { roots = await record.getLineItems(); } catch { return false; }
            let cur = await findLineItemByGuidAsync(roots, lineGuid);
            if (!cur) return false;
            for (let depth = 0; depth < 500; depth++) {
                const g = lineItemGuid(cur);
                if (g === zoomGuid) return true;
                if (typeof cur.getParent !== 'function') return false;
                const p = await cur.getParent();
                if (!p) return false;
                if (typeof p.getLineItems === 'function') return false;
                cur = p;
            }
            return false;
        };

        const resolveRecordForIndent = (panel, pageRecordGuid) => {
            let r = panel && typeof panel.getActiveRecord === 'function'
                ? panel.getActiveRecord() : null;
            if (r && typeof r.getLineItems === 'function') return r;
            const freshPanel = this.ui.getActivePanel && this.ui.getActivePanel();
            if (freshPanel && typeof freshPanel.getActiveRecord === 'function') {
                r = freshPanel.getActiveRecord();
                if (r && typeof r.getLineItems === 'function') return r;
            }
            if (pageRecordGuid && this.data && typeof this.data.getRecord === 'function') {
                r = this.data.getRecord(pageRecordGuid);
                if (r && typeof r.getLineItems === 'function') return r;
            }
            return null;
        };

        const getVisibleEditorListItems = () => {
            const editor = document.querySelector(EDITOR_SELECTORS) || document.body;
            return Array.from(editor.querySelectorAll('.listitem')).filter(
                li => li.offsetParent !== null && li.style.display !== 'none'
            );
        };

        const getDomLinePlainText = (li) => {
            const lineDiv = li.querySelector(':scope > .line-div') || li.querySelector('.line-div');
            if (!lineDiv) return '';
            const clone = lineDiv.cloneNode(true);
            clone.querySelectorAll('.bt-marker, .bt-bullet, .bt-caret, .listitem-indentline').forEach(el => el.remove());
            return clone.textContent
                .replace(/\u200b/g, '')
                .replace(/\u00a0/g, ' ')
                .replace(/[\uFEFF\u2060]/g, '')
                .trim();
        };

        const lineDomLooksEmpty = (li) => {
            const t = getDomLinePlainText(li);
            if (!t.length) return true;
            const lower = t.toLowerCase();
            if (lower === 'new line' || lower === 'type here' || lower === 'empty') return true;
            return false;
        };

        const pickEmptyRootLineForZoom = (zoomGuid) => {
            const visibleItems = getVisibleEditorListItems();
            if (!visibleItems.length) return null;
            const forZoomGuid = visibleItems.filter(
                li => li.getAttribute('data-guid') === zoomGuid
            );
            if (forZoomGuid.length === 1 && lineDomLooksEmpty(forZoomGuid[0]) &&
                !forZoomGuid[0].classList.contains('listitem-task')) {
                return forZoomGuid[0];
            }
            const indents = visibleItems.map(li => getItemIndent(li));
            const minIndent = Math.min(...indents);
            const atRoot = visibleItems.filter(li =>
                getItemIndent(li) === minIndent && !li.classList.contains('listitem-task')
            );
            if (!atRoot.length) return null;
            const matchZoom = atRoot.find(li => li.getAttribute('data-guid') === zoomGuid);
            const firstRoot = matchZoom || atRoot[0];
            if (!lineDomLooksEmpty(firstRoot)) return null;
            return firstRoot;
        };

        const dispatchEditorKey = (key) => {
            const keyCode = key === 'Tab' ? 9 : (key === 'Home' ? 36 : 0);
            if (!keyCode) return;
            const code = key === 'Tab' ? 'Tab' : 'Home';
            const mk = (type) => new KeyboardEvent(type, {
                key, code, keyCode, which: keyCode,
                bubbles: true, cancelable: true, composed: true,
            });
            const target = document.querySelector('.editor-wrapper, .page-content, #editor, body');
            if (!target) return;
            target.dispatchEvent(mk('keydown'));
            target.dispatchEvent(mk('keypress'));
            target.dispatchEvent(mk('keyup'));
        };

        const childCountForGuid = async (record, guid) => {
            try {
                const roots = await record.getLineItems();
                const item = await findLineItemByGuidAsync(roots, guid);
                if (!item) return -1;
                let kids = item.children;
                if (kids == null && typeof item.getChildren === 'function') {
                    try { kids = await item.getChildren(); } catch { kids = null; }
                }
                return kids ? kids.length : 0;
            } catch { return -1; }
        };

        const lastChildGuidForZoom = async (record, zoomGuid) => {
            try {
                const roots = await record.getLineItems();
                const item = await findLineItemByGuidAsync(roots, zoomGuid);
                if (!item) return null;
                let kids = item.children;
                if (kids == null && typeof item.getChildren === 'function') {
                    try { kids = await item.getChildren(); } catch { kids = null; }
                }
                if (!kids || !kids.length) return null;
                return lineItemGuid(kids[kids.length - 1]);
            } catch { return null; }
        };

        const syncNavToItem = async (panel, guid) => {
            if (!panel || typeof panel.navigateTo !== 'function') return;
            try {
                const r = panel.navigateTo({ itemGuid: guid, highlight: false });
                if (r && typeof r.then === 'function') await r;
                if (typeof this.ui.setActivePanel === 'function') {
                    try { this.ui.setActivePanel(panel); } catch {}
                }
            } catch {}
        };

        // Try API-only paths to indent an empty zoomed line UNDER the zoom
        // target so it becomes the zoom's first child: already-has-children
        // → nav to first child; empty root line → move it under zoom;
        // else try to insert a new child.
        const indentEmptyZoomViaApi = async (panel, zoomGuid, pageRecordGuid) => {
            const DBG = '[indent-rainbow][zoom-indent]';
            if (!panel || !zoomGuid) return false;

            const tryCreateChildUnderZoom = async (record, zoomItem, zGuid) => {
                const insertSteps = [];
                if (typeof zoomItem.insertChildAt === 'function') {
                    insertSteps.push(() => zoomItem.insertChildAt(0, ''));
                }
                if (typeof zoomItem.appendChild === 'function') {
                    insertSteps.push(() => zoomItem.appendChild(''));
                }
                if (typeof record.insertFromMarkdown === 'function') {
                    insertSteps.push((p) => record.insertFromMarkdown('- ', p, null));
                    insertSteps.push((p) => record.insertFromMarkdown('* ', p, null));
                }
                for (const step of insertSteps) {
                    try {
                        let r2;
                        try { r2 = await record.getLineItems(); } catch { continue; }
                        const parent = await findLineItemByGuidAsync(r2, zGuid) || zoomItem;
                        const n0 = await childCountForGuid(record, zGuid);
                        if (n0 < 0) continue;
                        const ok = await step(parent);
                        if (ok === false) continue;
                        await waitMs(280);
                        const n1 = await childCountForGuid(record, zGuid);
                        if (n1 > n0) {
                            const g = await lastChildGuidForZoom(record, zGuid);
                            if (g) return g;
                        }
                    } catch (e) {
                        console.debug(`${DBG} insert variant failed`, e);
                    }
                }
                return null;
            };

            for (let attempt = 0; attempt < 8; attempt++) {
                if (attempt > 0) await waitMs(350);
                let record = resolveRecordForIndent(panel, pageRecordGuid);
                if (!record) { await waitMs(300); record = resolveRecordForIndent(panel, pageRecordGuid); }
                if (!record || typeof record.getLineItems !== 'function') continue;

                let roots;
                try { roots = await record.getLineItems(); } catch { continue; }
                if (!roots || !roots.length) continue;

                let zoomItem = await findLineItemByGuidAsync(roots, zoomGuid);
                if (!zoomItem) continue;

                let children = zoomItem.children;
                if (children == null && typeof zoomItem.getChildren === 'function') {
                    try { children = await zoomItem.getChildren(); } catch { children = null; }
                }
                if (children && children.length > 0) {
                    const firstGuid = lineItemGuid(children[0]);
                    if (firstGuid) {
                        await syncNavToItem(panel, firstGuid);
                        await waitMs(60);
                        dispatchEditorKey('Home');
                        applyZoomStartLineStyle(firstGuid);
                        return true;
                    }
                }

                const emptyRootForMove = pickEmptyRootLineForZoom(zoomGuid);
                if (emptyRootForMove) {
                    const domGuid = emptyRootForMove.getAttribute('data-guid');
                    if (domGuid && domGuid !== zoomGuid) {
                        try {
                            try { roots = await record.getLineItems(); } catch {}
                            let lineToMove = await findLineItemByGuidAsync(roots, domGuid);
                            let zoomRef = await findLineItemByGuidAsync(roots, zoomGuid);
                            if (lineToMove && zoomRef && typeof lineToMove.move === 'function') {
                                const moved = await lineToMove.move(zoomRef, null);
                                if (moved != null) {
                                    await waitMs(120);
                                    await syncNavToItem(panel, domGuid);
                                    await waitMs(60);
                                    dispatchEditorKey('Home');
                                    applyZoomStartLineStyle(domGuid);
                                    return true;
                                }
                                if (typeof lineToMove.getParent === 'function') {
                                    const parent = await lineToMove.getParent();
                                    if (parent && lineItemGuid(parent) === zoomGuid) {
                                        await syncNavToItem(panel, domGuid);
                                        await waitMs(60);
                                        dispatchEditorKey('Home');
                                        applyZoomStartLineStyle(domGuid);
                                        return true;
                                    }
                                }
                            }
                        } catch (e) {
                            console.debug(`${DBG} move() failed:`, e);
                        }
                    }
                }

                try {
                    const newGuid = await tryCreateChildUnderZoom(record, zoomItem, zoomGuid);
                    if (newGuid) {
                        await waitMs(150);
                        await syncNavToItem(panel, newGuid);
                        await waitMs(60);
                        dispatchEditorKey('Home');
                        applyZoomStartLineStyle(newGuid);
                        return true;
                    }
                } catch (e) {
                    console.debug(`${DBG} tryCreateChildUnderZoom failed:`, e);
                }
            }
            return false;
        };

        const maybeIndentEmptyZoomedLine = async (panel, zoomGuid, pageRecordGuid) => {
            let domReady = false;
            for (let wait = 0; wait < 6; wait++) {
                await waitMs(wait === 0 ? 400 : 250);
                const items = getVisibleEditorListItems();
                if (items.length > 0) { domReady = true; break; }
            }
            if (!domReady) return;
            if (await indentEmptyZoomViaApi(panel, zoomGuid, pageRecordGuid)) return;
            if (this.ui && typeof this.ui.showToaster === 'function') {
                this.ui.showToaster({
                    message: 'Could not add a nested line automatically — use Tab in the editor to indent.',
                    type: 'warning',
                    duration: 2500
                });
            }
        };

        // zoom-in: (1) first navigate to record root if we're already zoomed
        // elsewhere, (2) then navigate with rootId = the target guid. The
        // setActivePanel call after each navigateTo is what flips the view.
        const zoomToItem = async (li) => {
            const guid = li.getAttribute('data-guid') || await resolveLineItemGuid(li);
            if (!guid) {
                if (this.ui && typeof this.ui.showToaster === 'function') {
                    this.ui.showToaster({
                        message: 'Could not resolve item to zoom into',
                        type: 'warning',
                        duration: 1500
                    });
                }
                return;
            }
            const panel = this.ui.getActivePanel && this.ui.getActivePanel();
            if (!panel || typeof panel.navigateTo !== 'function') return;
            const currentNav = (typeof panel.getNavigation === 'function'
                ? panel.getNavigation() : null) || {};
            const record = panel.getActiveRecord && panel.getActiveRecord();
            const recordGuid = (record && typeof record.getGuid === 'function'
                ? record.getGuid() : null) || currentNav.rootId || null;
            const pageRecordGuid = record && typeof record.getGuid === 'function'
                ? record.getGuid() : null;
            const workspaceGuid = currentNav.workspaceGuid
                || (typeof this.getWorkspaceGuid === 'function' ? this.getWorkspaceGuid() : null);
            if (!recordGuid) return;

            const type = currentNav.type || 'edit_panel';
            const doNav = async (p, nav) => {
                const r = p.navigateTo(nav);
                if (r && typeof r.then === 'function') await r;
                if (typeof this.ui.setActivePanel === 'function') {
                    try { this.ui.setActivePanel(p); } catch {}
                }
            };

            try {
                if (currentNav.rootId !== recordGuid) {
                    await doNav(panel, { type, rootId: recordGuid, workspaceGuid });
                    await waitMs(350);
                }
                await doNav(panel, { type, rootId: guid, workspaceGuid });
                await waitMs(50);
                syncLineZoomContext();
                const afterZoom = typeof panel.getNavigation === 'function'
                    ? panel.getNavigation() : {};
                if (afterZoom && afterZoom.rootId === guid) {
                    void maybeIndentEmptyZoomedLine(panel, guid, pageRecordGuid);
                    return;
                }
                await doNav(panel, { itemGuid: guid, highlight: true });
            } catch (err) {
                console.warn('[indent-rainbow] zoom failed:', err);
            }
        };

        // Unified click handler on the editor container (capture phase).
        const outlineClickHandler = (e) => {
            if (!isEnabled) return;
            const target = e.target;
            if (!target || !target.closest) return;

            const bullet = target.closest('.bt-bullet');
            if (bullet && isBulletsEnabled) {
                const li = bullet.closest('.listitem');
                if (li) {
                    e.preventDefault();
                    e.stopPropagation();
                    zoomToItem(li);
                    return;
                }
            }

            const caret = target.closest('.bt-caret');
            if (caret && isTogglesEnabled) {
                const li = caret.closest('.listitem');
                if (li && li.classList.contains('bt-has-children')) {
                    e.preventDefault();
                    e.stopPropagation();
                    li.classList.toggle('bt-collapsed');
                    applyCollapseState();
                }
                return;
            }
        };

        outlineTarget.addEventListener('click', outlineClickHandler, true);
        this.cleanupMethods.push(() => {
            outlineTarget.removeEventListener('click', outlineClickHandler, true);
        });

        // Cursor-placement guard. See forwardCursorPastMarker above — this
        // listener covers the click / arrow-navigation path. The new-row
        // path is handled inline in injectMarker. Single shared helper so
        // behaviour stays consistent across both entry points.
        const onSelectionChange = () => {
            if (!isEnabled || (!isTogglesEnabled && !isBulletsEnabled)) return;
            forwardCursorPastMarker();
        };
        document.addEventListener('selectionchange', onSelectionChange);
        this.cleanupMethods.push(() => {
            document.removeEventListener('selectionchange', onSelectionChange);
        });

        // Line-item created hook: when a new line is created while zoomed
        // and it's not under the zoom subtree, move it under the zoom root
        // so Enter-to-create works correctly inside a zoom.
        syncLineZoomContext();
        const handleLineItemCreatedForZoom = async (ev) => {
            if (!ev || ev.eventName !== 'lineitem.created') return;
            if (this._zoomReparentBusy) return;
            const zoomGuid = this.lineZoomRootGuid;
            if (!zoomGuid) return;
            const newGuid = ev.lineItemGuid;
            if (!newGuid || newGuid === zoomGuid) return;
            const panel = this.ui.getActivePanel && this.ui.getActivePanel();
            const record = panel && panel.getActiveRecord && panel.getActiveRecord();
            if (!record || typeof record.getLineItems !== 'function') return;
            if (ev.recordGuid && typeof record.getGuid === 'function'
                && record.getGuid() !== ev.recordGuid) return;
            const parentGuid = ev.parentGuid != null ? ev.parentGuid : null;
            if (parentGuid) {
                const under = await isLineUnderZoomSubtree(record, parentGuid, zoomGuid);
                if (under) return;
            }
            let roots;
            try { roots = await record.getLineItems(); } catch { return; }
            const newItem = await findLineItemByGuidAsync(roots, newGuid);
            const zoomItem = await findLineItemByGuidAsync(roots, zoomGuid);
            if (!newItem || !zoomItem) return;
            if (typeof newItem.move !== 'function') return;
            this._zoomReparentBusy = true;
            try {
                await newItem.move(zoomItem, null);
                await waitMs(60);
                if (panel && typeof panel.navigateTo === 'function') {
                    try { panel.navigateTo({ itemGuid: newGuid, highlight: false }); } catch {}
                }
            } catch (err) {
                console.warn('[indent-rainbow] zoom reparent failed:', err);
            } finally {
                this._zoomReparentBusy = false;
            }
        };

        if (typeof this.on === 'function') {
            this.on('lineitem.created', handleLineItemCreatedForZoom);
            this.cleanupMethods.push(() => {
                if (typeof this.off === 'function') {
                    try { this.off('lineitem.created', handleLineItemCreatedForZoom); } catch {}
                }
            });
        }

        // Ensure closed-over DOM references are released on unload
        let statusBarItem = null;
        this.cleanupMethods.push(() => {
            currentFocusedItem = null;
            activeHighlights.length = 0;
            statusBarItem = null;
        });

        const updateSettings = (newSettings) => {
            if (newSettings.currentScheme !== undefined) currentScheme = newSettings.currentScheme;
            if (newSettings.currentWidth !== undefined) currentWidth = parseInt(newSettings.currentWidth);
            if (newSettings.activeWidth !== undefined) activeWidth = parseInt(newSettings.activeWidth);
            if (newSettings.currentOpacity !== undefined) currentOpacity = parseFloat(newSettings.currentOpacity);
            if (newSettings.isEnabled !== undefined) isEnabled = newSettings.isEnabled;
            if (newSettings.threadingMode !== undefined) threadingMode = newSettings.threadingMode;
            if (newSettings.isBulletsEnabled !== undefined) isBulletsEnabled = !!newSettings.isBulletsEnabled;
            if (newSettings.isTogglesEnabled !== undefined) isTogglesEnabled = !!newSettings.isTogglesEnabled;
            if (newSettings.currentScheme !== undefined) applySchemeVars(currentScheme);
            applySettingVars();
            applyEnabledState();
            saveSettings();
            if (isEnabled) {
                scheduleListColorUpdate(null);
            } else {
                clearListColors();
            }
            // Re-sync outline markers / classes when toggles change (or the
            // master switch flips). Disabled-state teardown is handled by
            // annotateAll() itself.
            if (newSettings.isBulletsEnabled !== undefined
                || newSettings.isTogglesEnabled !== undefined
                || newSettings.isEnabled !== undefined) {
                // If disabling toggles, clear any collapsed rows first so
                // hidden descendants come back immediately.
                if (newSettings.isTogglesEnabled !== undefined && !isTogglesEnabled) {
                    document.querySelectorAll('.listitem.bt-collapsed').forEach(el => {
                        el.classList.remove('bt-collapsed');
                    });
                }
                scheduleOutlinePass();
            }
            if (!isEnabled) this.lineZoomRootGuid = null;
            if (statusBarItem && typeof statusBarItem.setTooltip === 'function') {
                statusBarItem.setTooltip(`Indent Rainbow – ${colorSchemes[currentScheme]?.name ?? currentScheme}`);
            }
        };

        // Register the panel type
        this.ui.registerCustomPanelType("indent-rainbow-settings", (panel) => {
            this.renderSettingsUI(panel, {
                colorSchemes, opacityPresets,
                getSettings: () => ({
                    currentScheme, currentWidth, activeWidth, currentOpacity,
                    isEnabled, threadingMode, isBulletsEnabled, isTogglesEnabled
                }),
                updateSettings,
                createIcon: (name) => this.ui.createIcon(name)
            });
        });

        // Add a status bar button (icon only; theme name is in the tooltip)
        statusBarItem = this.ui.addStatusBarItem({
            icon: "paint",
            tooltip: `Indent Rainbow – ${colorSchemes[currentScheme]?.name ?? currentScheme}`,
            onClick: async () => {
                const newPanel = await this.ui.createPanel();
                if (newPanel) {
                    newPanel.navigateToCustomType("indent-rainbow-settings");
                }
            }
        });

        // Add a command to the Command Palette
        this.ui.addCommandPaletteCommand({
            label: "Indent Rainbow: Settings",
            icon: "paint",
            onSelected: async () => {
                const newPanel = await this.ui.createPanel();
                if (newPanel) {
                    newPanel.navigateToCustomType("indent-rainbow-settings");
                }
            }
        });

    }

    onUnload() {
        this.isUnloaded = true;

        if (this.cleanupMethods) {
            this.cleanupMethods.forEach(cleanupFn => {
                try { cleanupFn(); } catch (e) {
                    console.warn('Failed to clean up plugin resource:', e);
                }
            });
            this.cleanupMethods = [];
        }

        document.querySelectorAll('.bt-active-highlight').forEach(el => el.remove());
        document.querySelectorAll('.bt-focused').forEach(el => el.classList.remove('bt-focused'));
        document.body.classList.remove('ir-enabled', 'bt-bullets', 'bt-toggles');

        if (this.styleElement) {
            this.styleElement.remove();
            this.styleElement = null;
        }
    }

    renderSettingsUI(panel, api) {
        const settings = api.getSettings();
        const element = panel.getElement();
        if (!element) return;

        element.innerHTML = ''; // Clear previous content

        // Add styles using theme variables
        const style = document.createElement('style');
        style.textContent = `
            .ir-settings * { box-sizing: border-box; }
            .ir-settings { 
                --ir-accent: var(--theme-accent, var(--button-primary-bg-color, var(--cmdpal-selected-bg-color, var(--color-primary-400, #3b82f6))));
                --ir-accent-subtle: var(--theme-accent-subtle, rgba(59, 130, 246, 0.15));
                --ir-text: var(--theme-text-primary, var(--color-text-100, #fff));
                --ir-text-secondary: var(--theme-text-secondary, var(--color-text-500, #888));
                --ir-bg: var(--theme-background-secondary, var(--color-bg-700, #1e1e2e));
                --ir-border: var(--theme-border, var(--color-bg-500, #333));
                --ir-input-bg: var(--input-bg-color, var(--theme-background-primary, var(--color-bg-800, #111)));
                --ir-panel-bg: var(--theme-background-primary, var(--color-bg-800, #111));
                --ir-panel-border: color-mix(in srgb, var(--ir-border) 78%, transparent);
                --ir-soft-bg: color-mix(in srgb, var(--ir-bg) 82%, var(--ir-panel-bg));
                
                padding: 24px 24px 40px; 
                max-width: 760px; 
                margin: 0 auto; 
                font-family: var(--font-m, var(--font-primary, inherit)); 
                color: var(--ir-text);
                line-height: 1.5;
            }
            .ir-header { 
                margin-bottom: 20px; 
                padding-bottom: 8px; 
            }
            .ir-title { 
                margin: 0; 
                display: flex; 
                align-items: center; 
                gap: 10px; 
                font-size: 1.35em; 
                font-weight: 650; 
                color: var(--ir-text); 
            }
            .ir-title svg,
            .ir-card h3 svg {
                color: var(--ir-accent);
            }
            .ir-header-copy {
                margin: 10px 0 0;
                max-width: 560px;
                font-size: 0.95em;
                color: var(--ir-text-secondary);
            }
            .ir-card { 
                padding: 18px 18px 8px; 
                border-radius: 14px; 
                border: 1px solid var(--ir-panel-border); 
                background: var(--ir-soft-bg); 
                margin-bottom: 16px; 
                box-shadow: none; 
            }
            .ir-card h3 { 
                margin-top: 0; 
                margin-bottom: 6px; 
                display: flex; 
                align-items: center; 
                gap: 8px; 
                font-size: 1em; 
                font-weight: 600; 
                color: var(--ir-text); 
            }
            .ir-card-copy {
                margin: 0 0 16px;
                font-size: 0.9em;
                color: var(--ir-text-secondary);
            }
            .ir-row { 
                display: flex; 
                align-items: flex-start; 
                gap: 16px;
                justify-content: space-between; 
                margin-bottom: 16px; 
            }
            .ir-row:last-child { margin-bottom: 0; }
            .ir-label-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
            .ir-label-group strong { font-weight: 600; color: var(--ir-text); }
            .ir-subtitle { font-size: 0.9em; color: var(--ir-text-secondary); opacity: 0.9; }
            .ir-control {
                width: min(280px, 44%);
                flex-shrink: 0;
            }
            .ir-slider-control {
                width: min(320px, 48%);
                flex-shrink: 0;
            }
            .ir-input { 
                width: 100%; 
                min-height: 38px;
                padding: 8px 12px; 
                border-radius: 10px; 
                border: 1px solid var(--ir-panel-border); 
                background: var(--ir-input-bg); 
                color: var(--ir-text); 
                font-family: inherit; 
                font-size: 0.95em;
                transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s; 
                cursor: pointer;
            }
            .ir-input:hover {
                background: color-mix(in srgb, var(--ir-input-bg) 92%, var(--ir-accent-subtle));
            }
            .ir-input:focus { 
                outline: none; 
                border-color: var(--ir-accent) !important; 
                box-shadow: 0 0 0 2px var(--ir-accent-subtle); 
            }
            .ir-checkbox { 
                width: 22px; 
                height: 22px; 
                accent-color: var(--ir-accent) !important; 
                cursor: pointer; 
                border-radius: 6px;
                background-color: var(--ir-input-bg) !important;
                border: 2px solid var(--ir-border);
                appearance: auto; /* Fallback to native themed if possible */
                -webkit-appearance: checkbox;
            }
            .ir-range { 
                width: 100%; 
                cursor: pointer; 
                margin-top: 10px; 
                height: 6px;
                border-radius: 3px;
                background: color-mix(in srgb, var(--ir-border) 70%, transparent) !important;
                appearance: none;
                -webkit-appearance: none;
                outline: none;
            }
            .ir-range::-webkit-slider-thumb {
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: var(--ir-accent) !important;
                cursor: pointer;
                appearance: none;
                -webkit-appearance: none;
                margin-top: -7px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                border: 2px solid var(--ir-bg);
            }
            .ir-range::-moz-range-thumb {
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: var(--ir-accent) !important;
                cursor: pointer;
                border: 2px solid var(--ir-bg);
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .ir-val-text { 
                font-weight: 700; 
                color: var(--ir-accent); 
                background: var(--ir-accent-subtle);
                padding: 3px 10px;
                border-radius: 999px;
                font-size: 0.85em;
                min-width: 52px;
                text-align: center;
            }
            .ir-slider-meta {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }
            .ir-swatch-row {
                display: flex;
                gap: 6px;
                margin-top: 8px;
                flex-wrap: wrap;
            }
            .ir-swatch {
                width: 14px;
                height: 14px;
                border-radius: 999px;
                border: 1px solid color-mix(in srgb, var(--ir-panel-bg) 55%, transparent);
                box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
            }
            .ir-preview {
                padding: 16px 18px 14px;
                border-radius: 14px;
                border: 1px solid var(--ir-panel-border);
                background: var(--ir-panel-bg);
                margin-bottom: 16px;
            }
            .ir-preview-label {
                font-size: 0.78em;
                font-weight: 600;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                color: var(--ir-text-secondary);
                margin-bottom: 10px;
            }
            .ir-preview-canvas {
                position: relative;
                height: 116px;
                border-radius: 8px;
                background: color-mix(in srgb, var(--ir-soft-bg) 60%, transparent);
                overflow: hidden;
            }
            .ir-preview-canvas.ir-preview-disabled {
                opacity: 0.35;
            }
            .ir-preview-row {
                position: absolute;
                left: 0; right: 0;
                height: 26px;
                display: flex;
                align-items: center;
            }
            .ir-preview-bar {
                position: absolute;
                top: 0;
                bottom: 0;
                border-radius: 999px;
                transition: width 0.15s, opacity 0.15s, background-color 0.15s;
            }
            .ir-preview-text {
                position: absolute;
                left: 0;
                right: 0;
                padding-left: 10px;
                font-size: 0.8em;
                color: var(--ir-text-secondary);
                opacity: 0.5;
                white-space: nowrap;
                overflow: hidden;
                pointer-events: none;
            }
            .ir-preview-arm {
                position: absolute;
                border-bottom-left-radius: 6px;
                box-sizing: border-box;
                pointer-events: none;
                transition: border-width 0.15s, border-color 0.15s;
            }
            .ir-preview-legend {
                margin-top: 8px;
                font-size: 0.82em;
                color: var(--ir-text-secondary);
                opacity: 0.75;
            }
            @media (max-width: 720px) {
                .ir-settings {
                    padding: 18px 16px 32px;
                }
                .ir-row {
                    flex-direction: column;
                    align-items: stretch;
                }
                .ir-control,
                .ir-slider-control {
                    width: 100%;
                }
            }
        `;
        element.appendChild(style);

        const container = document.createElement('div');
        container.className = 'ir-settings';

        // Header
        const header = document.createElement('div');
        header.className = 'ir-header';
        const title = document.createElement('h2');
        title.className = 'ir-title';
        title.appendChild(api.createIcon('paint'));
        title.appendChild(document.createTextNode(' Indent Rainbow Settings'));
        header.appendChild(title);
        const headerCopy = document.createElement('p');
        headerCopy.className = 'ir-header-copy';
        headerCopy.textContent = 'Tune the guide colors and active thread styling to match how you like hierarchy to feel in Thymer.';
        header.appendChild(headerCopy);
        container.appendChild(header);

        const createField = (titleText, subtitleText, controlElement, extraElement = null, controlClassName = 'ir-control') => {
            const row = document.createElement('div');
            row.className = 'ir-row';
            const label = document.createElement('div');
            label.className = 'ir-label-group';
            const strong = document.createElement('strong');
            strong.textContent = titleText;
            label.appendChild(strong);
            if (subtitleText) {
                const subtitle = document.createElement('div');
                subtitle.className = 'ir-subtitle';
                subtitle.textContent = subtitleText;
                label.appendChild(subtitle);
            }
            if (extraElement) {
                label.appendChild(extraElement);
            }
            const controlWrap = document.createElement('div');
            controlWrap.className = controlClassName;
            controlWrap.appendChild(controlElement);
            row.appendChild(label);
            row.appendChild(controlWrap);
            return row;
        };

        const setSchemeSwatches = (schemeName, containerElement) => {
            containerElement.innerHTML = '';
            (api.colorSchemes[schemeName]?.colors || []).slice(0, 8).forEach((color) => {
                const swatch = document.createElement('span');
                swatch.className = 'ir-swatch';
                swatch.style.backgroundColor = color;
                containerElement.appendChild(swatch);
            });
        };

        const formatWidthValue = (value) => value === 0 ? 'Hidden' : `${value}px`;

        // Shared local settings state — mutated by every control, drives renderPreview
        const currentSettings = Object.assign({}, settings);

        // -------------------------------------------------------
        // Live preview
        // -------------------------------------------------------
        const previewCard = document.createElement('div');
        previewCard.className = 'ir-preview';
        const previewLabel = document.createElement('div');
        previewLabel.className = 'ir-preview-label';
        previewLabel.textContent = 'Live Preview';
        previewCard.appendChild(previewLabel);
        const previewCanvas = document.createElement('div');
        previewCanvas.className = 'ir-preview-canvas';
        previewCard.appendChild(previewCanvas);
        const previewLegend = document.createElement('div');
        previewLegend.className = 'ir-preview-legend';
        previewLegend.textContent = 'Updates live as you adjust settings below.';
        previewCard.appendChild(previewLegend);
        container.appendChild(previewCard);

        const PREVIEW_ROWS = 4;
        const ROW_H = 26;
        const INDENT_STEP = 24;
        const BASE_LEFT = 12;

        const renderPreview = (s) => {
            previewCanvas.innerHTML = '';
            previewCanvas.classList.toggle('ir-preview-disabled', !s.isEnabled);

            const colors = api.colorSchemes[s.currentScheme]?.colors || [];
            const barWidth = Math.max(0, s.currentWidth);
            const opacity = parseFloat(s.currentOpacity);

            // Draw 4 nested rows
            for (let i = 0; i < PREVIEW_ROWS; i++) {
                const marginLeft = i * INDENT_STEP + BASE_LEFT;
                const top = i * ROW_H + Math.floor((116 - PREVIEW_ROWS * ROW_H) / 2);
                const color = colors[i % colors.length] || '#888';

                const row = document.createElement('div');
                row.className = 'ir-preview-row';
                row.style.top = `${top}px`;

                // Vertical bar
                const bar = document.createElement('div');
                bar.className = 'ir-preview-bar';
                bar.style.left = `${marginLeft}px`;
                bar.style.width = `${barWidth}px`;
                bar.style.backgroundColor = color;
                bar.style.opacity = opacity;
                row.appendChild(bar);

                // Placeholder text line
                const txt = document.createElement('div');
                txt.className = 'ir-preview-text';
                txt.style.paddingLeft = `${marginLeft + barWidth + 10}px`;
                txt.textContent = i === 0 ? 'Top level item' : i === 1 ? '  Nested item' : i === 2 ? '    Deeper nesting' : '      Active item ←';
                row.appendChild(txt);

                previewCanvas.appendChild(row);
            }

            // Draw active threading arm(s) from row 0/1/2 down to row 3
            const activeWidth = Math.max(0, parseInt(s.activeWidth, 10));
            if (activeWidth > 0) {
                const deepIdx = PREVIEW_ROWS - 1;
                const deepTop = deepIdx * ROW_H + Math.floor((116 - PREVIEW_ROWS * ROW_H) / 2);
                const deepLeft = deepIdx * INDENT_STEP + BASE_LEFT;

                const startIdxes = s.threadingMode === 'staircase'
                    ? [0, 1, 2]   // arm from each ancestor
                    : [0];        // one long arm from the top

                for (const si of startIdxes) {
                    const srcTop = si * ROW_H + Math.floor((116 - PREVIEW_ROWS * ROW_H) / 2);
                    const srcLeft = si * INDENT_STEP + BASE_LEFT;
                    const srcColor = colors[si % colors.length] || '#888';

                    const armTargetTop = s.threadingMode === 'staircase' && si < PREVIEW_ROWS - 1
                        ? (si + 1) * ROW_H + Math.floor((116 - PREVIEW_ROWS * ROW_H) / 2) + ROW_H / 2
                        : deepTop + ROW_H / 2;

                    const armH = armTargetTop - srcTop;
                    const armW = (s.threadingMode === 'staircase'
                        ? (si + 1) * INDENT_STEP + BASE_LEFT
                        : deepLeft) - srcLeft + activeWidth;

                    if (armH <= 0 || armW <= 0) continue;

                    const arm = document.createElement('div');
                    arm.className = 'ir-preview-arm';
                    arm.style.top = `${srcTop}px`;
                    arm.style.left = `${srcLeft}px`;
                    arm.style.width = `${armW}px`;
                    arm.style.height = `${armH}px`;
                    arm.style.borderLeft = `${activeWidth}px solid ${srcColor}`;
                    arm.style.borderBottom = `${activeWidth}px solid ${srcColor}`;
                    arm.style.filter = `brightness(1.5) drop-shadow(0 0 3px ${srcColor})`;
                    arm.style.opacity = '1';
                    previewCanvas.appendChild(arm);
                }
            }
        };

        renderPreview(currentSettings);

        // -------------------------------------------------------
        // General Card
        // -------------------------------------------------------
        const genCard = document.createElement('div');
        genCard.className = 'ir-card';
        const genTitle = document.createElement('h3');
        genTitle.appendChild(api.createIcon('paint'));
        genTitle.appendChild(document.createTextNode(' Appearance'));
        genCard.appendChild(genTitle);
        const genCopy = document.createElement('p');
        genCopy.className = 'ir-card-copy';
        genCopy.textContent = 'Set the overall look of the guide rails shown throughout the editor.';
        genCard.appendChild(genCopy);

        // Scheme Select
        const schemeSelect = document.createElement('select');
        schemeSelect.className = 'ir-input cursor-pointer';
        Object.keys(api.colorSchemes).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = api.colorSchemes[key].name;
            opt.selected = currentSettings.currentScheme === key;
            schemeSelect.appendChild(opt);
        });
        const schemeSwatches = document.createElement('div');
        schemeSwatches.className = 'ir-swatch-row';
        setSchemeSwatches(currentSettings.currentScheme, schemeSwatches);
        schemeSelect.addEventListener('change', (e) => {
            currentSettings.currentScheme = e.target.value;
            setSchemeSwatches(e.target.value, schemeSwatches);
            api.updateSettings({ currentScheme: e.target.value });
            renderPreview(currentSettings);
        });
        genCard.appendChild(createField('Color Scheme', 'Choose the palette used for nested indent levels.', schemeSelect, schemeSwatches));

        // Opacity Select
        const opacitySelect = document.createElement('select');
        opacitySelect.className = 'ir-input cursor-pointer';
        Object.keys(api.opacityPresets).forEach(key => {
            const opt = document.createElement('option');
            opt.value = api.opacityPresets[key].value;
            opt.textContent = api.opacityPresets[key].name;
            opt.selected = currentSettings.currentOpacity == api.opacityPresets[key].value;
            opacitySelect.appendChild(opt);
        });
        opacitySelect.addEventListener('change', (e) => {
            currentSettings.currentOpacity = parseFloat(e.target.value);
            api.updateSettings({ currentOpacity: e.target.value });
            renderPreview(currentSettings);
        });
        genCard.appendChild(createField('Opacity', 'Keep guides subtle or make them easier to pick out while scanning.', opacitySelect));

        // Line Width Slider
        const widthGroup = document.createElement('div');
        const widthRow = document.createElement('div');
        widthRow.className = 'ir-slider-meta';
        const widthVal = document.createElement('span');
        widthVal.className = 'ir-val-text';
        widthVal.textContent = formatWidthValue(currentSettings.currentWidth);
        const widthHint = document.createElement('span');
        widthHint.className = 'ir-subtitle';
        widthHint.textContent = 'Thickness of the standard guide line';
        widthRow.appendChild(widthHint);
        widthRow.appendChild(widthVal);
        widthGroup.appendChild(widthRow);
        const widthSlider = document.createElement('input');
        widthSlider.type = 'range';
        widthSlider.className = 'ir-range';
        widthSlider.min = '0';
        widthSlider.max = '4';
        widthSlider.step = '1';
        widthSlider.value = currentSettings.currentWidth;
        widthSlider.addEventListener('input', (e) => {
            currentSettings.currentWidth = parseInt(e.target.value, 10);
            widthVal.textContent = formatWidthValue(currentSettings.currentWidth);
            api.updateSettings({ currentWidth: e.target.value });
            renderPreview(currentSettings);
        });
        widthGroup.appendChild(widthSlider);
        genCard.appendChild(createField('Line Width', 'Adjust the default indent guide weight used across the page.', widthGroup, null, 'ir-slider-control'));

        container.appendChild(genCard);

        // Threading Card
        const threadCard = document.createElement('div');
        threadCard.className = 'ir-card';
        const threadTitle = document.createElement('h3');
        threadTitle.appendChild(api.createIcon('target'));
        threadTitle.appendChild(document.createTextNode(' Active Threading'));
        threadCard.appendChild(threadTitle);
        const threadCopy = document.createElement('p');
        threadCopy.className = 'ir-card-copy';
        threadCopy.textContent = 'Control how the currently focused path is emphasized while you navigate through nested content.';
        threadCard.appendChild(threadCopy);

        // Threading Style Select
        const threadStyleSelect = document.createElement('select');
        threadStyleSelect.className = 'ir-input cursor-pointer';
        const optStaircase = document.createElement('option');
        optStaircase.value = 'staircase';
        optStaircase.textContent = 'Staircase (Follows indentation path)';
        optStaircase.selected = currentSettings.threadingMode === 'staircase';
        threadStyleSelect.appendChild(optStaircase);
        const optStretched = document.createElement('option');
        optStretched.value = 'stretched';
        optStretched.textContent = 'Stretched (Direct line from parent)';
        optStretched.selected = currentSettings.threadingMode === 'stretched';
        threadStyleSelect.appendChild(optStretched);
        threadStyleSelect.addEventListener('change', (e) => {
            currentSettings.threadingMode = e.target.value;
            api.updateSettings({ threadingMode: e.target.value });
            renderPreview(currentSettings);
        });
        threadCard.appendChild(createField('Threading Style', 'Choose whether the active path steps through each level or stretches directly to the current line.', threadStyleSelect));

        // Active Thread Width Slider
        const aWidthGroup = document.createElement('div');
        const aWidthRow = document.createElement('div');
        aWidthRow.className = 'ir-slider-meta';
        const aWidthVal = document.createElement('span');
        aWidthVal.className = 'ir-val-text';
        aWidthVal.textContent = formatWidthValue(currentSettings.activeWidth);
        const aWidthHint = document.createElement('span');
        aWidthHint.className = 'ir-subtitle';
        aWidthHint.textContent = 'Thickness of the focused thread highlight';
        aWidthRow.appendChild(aWidthHint);
        aWidthRow.appendChild(aWidthVal);
        aWidthGroup.appendChild(aWidthRow);
        const aWidthSlider = document.createElement('input');
        aWidthSlider.type = 'range';
        aWidthSlider.className = 'ir-range';
        aWidthSlider.min = '0';
        aWidthSlider.max = '4';
        aWidthSlider.step = '1';
        aWidthSlider.value = currentSettings.activeWidth;
        aWidthSlider.addEventListener('input', (e) => {
            currentSettings.activeWidth = parseInt(e.target.value, 10);
            aWidthVal.textContent = formatWidthValue(currentSettings.activeWidth);
            api.updateSettings({ activeWidth: e.target.value });
            renderPreview(currentSettings);
        });
        aWidthGroup.appendChild(aWidthSlider);
        threadCard.appendChild(createField('Active Thread Width', 'Set how strongly the currently focused hierarchy path stands out.', aWidthGroup, null, 'ir-slider-control'));

        container.appendChild(threadCard);

        // -------------------------------------------------------
        // Outline Card (Workflowy-style bullets + carets)
        // -------------------------------------------------------
        const outlineCard = document.createElement('div');
        outlineCard.className = 'ir-card';
        const outlineTitle = document.createElement('h3');
        outlineTitle.appendChild(api.createIcon('list'));
        outlineTitle.appendChild(document.createTextNode(' Outline'));
        outlineCard.appendChild(outlineTitle);
        const outlineCopy = document.createElement('p');
        outlineCopy.className = 'ir-card-copy';
        outlineCopy.textContent = 'Add Workflowy-style bullets (click to zoom into a row) and disclosure chevrons (click to collapse rows with sub-items).';
        outlineCard.appendChild(outlineCopy);

        const bulletsCheckbox = document.createElement('input');
        bulletsCheckbox.type = 'checkbox';
        bulletsCheckbox.className = 'ir-checkbox';
        bulletsCheckbox.checked = !!currentSettings.isBulletsEnabled;
        bulletsCheckbox.addEventListener('change', (e) => {
            currentSettings.isBulletsEnabled = e.target.checked;
            api.updateSettings({ isBulletsEnabled: e.target.checked });
        });
        outlineCard.appendChild(createField(
            'Workflowy Bullets',
            'Click a bullet to zoom into that row. Headings, text, and list items all get bullets.',
            bulletsCheckbox
        ));

        const togglesCheckbox = document.createElement('input');
        togglesCheckbox.type = 'checkbox';
        togglesCheckbox.className = 'ir-checkbox';
        togglesCheckbox.checked = !!currentSettings.isTogglesEnabled;
        togglesCheckbox.addEventListener('change', (e) => {
            currentSettings.isTogglesEnabled = e.target.checked;
            api.updateSettings({ isTogglesEnabled: e.target.checked });
        });
        outlineCard.appendChild(createField(
            'Disclosure Chevrons',
            'Show a chevron on rows that have sub-items; click to collapse / expand.',
            togglesCheckbox
        ));

        container.appendChild(outlineCard);

        element.appendChild(container);
    }
}
