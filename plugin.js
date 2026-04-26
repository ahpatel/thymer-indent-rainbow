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

        // =====================================================
        // Thymer-DOM contract (single source of truth).
        // -----------------------------------------------------
        // Every class/id below belongs to Thymer's own DOM, not
        // ours. They are referenced throughout this plugin by
        // literal string in querySelector/classList calls and in
        // CSS rules. If Thymer renames any of them, search for
        // the literal here and grep the file for the same string.
        // This block is documentation only — changing a value
        // here does NOT propagate to the selectors below; it's
        // kept as a reference so a future developer has one place
        // to learn which class names are part of the Thymer
        // integration contract.
        //
        //   .listitem              each outline row (li analogue).
        //   .listitem-text         plain text row.
        //   .listitem-task         task (checkbox) row.
        //   .listitem-ulist        unordered-list row.
        //   .listitem-olist        ordered-list (numbered) row.
        //   .listitem-with-caret   row that currently owns the
        //                          Thymer caret (cursor). Only
        //                          one such row at a time; watched
        //                          via MutationObserver to drive
        //                          active-threading highlight.
        //   .listitem-indentline   the vertical indent guide at
        //                          the left edge of every row.
        //                          We paint these with the rainbow
        //                          colours.
        //
        //   .line-div              the text-bearing inner div of
        //                          a listitem. Holds the editable
        //                          content (and .listitem-indentline
        //                          as a child).
        //   .line-bullet-div       native ulist bullet column;
        //                          hidden when bt-bullets is on.
        //   .line-check-div        native task checkbox column.
        //   .line-number-div       native olist number column.
        //
        //   .link-menu             hover popup anchored to a row;
        //                          contains .item-drag-handle and
        //                          native zoom / collapse buttons.
        //   .item-drag-handle      the floating circle we restyle
        //                          as the drag/options affordance.
        //   .handle-fold-icon      Thymer's inner SVG inside
        //                          .item-drag-handle (we hide it
        //                          and replace with a dots glyph).
        //   .link-menu-action-collapse, .link-menu-action-expand,
        //   .link-menu-action-zoom
        //                          native action buttons in the
        //                          link-menu; we hide them when
        //                          our in-row caret/bullet is
        //                          providing the same affordance.
        //
        //   #virtualinput-wrapper  Thymer's hidden input element
        //                          that actually receives all
        //                          keystrokes. DOM caret lives
        //                          here, NOT in the visible
        //                          editor — so contenteditable
        //                          cursor manipulation does not
        //                          affect user-visible typing.
        //   .editor-wrapper,
        //   .page-content,
        //   #editor                fallback scopes used to find
        //                          the editor container.
        //
        //   .bt-marker, .bt-caret, .bt-bullet, .bt-has-children,
        //   .bt-active-highlight
        //                          OUR injected classes (prefix
        //                          `bt-`). Safe to rename if we
        //                          update all call sites.
        // =====================================================

        // Storage keys for persisting settings
        const STORAGE_KEY = 'indent-rainbow-scheme';
        const WIDTH_KEY = 'indent-rainbow-width';
        const ACTIVE_WIDTH_KEY = 'indent-rainbow-active-width';
        const OPACITY_KEY = 'indent-rainbow-opacity';
        const ENABLED_KEY = 'indent-rainbow-enabled';
        const THREADING_MODE_KEY = 'indent-rainbow-threading-mode';
        const BULLETS_ENABLED_KEY = 'indent-rainbow-bullets-enabled';
        const TOGGLES_ENABLED_KEY = 'indent-rainbow-toggles-enabled';
        const BULLET_COLOR_MODE_KEY = 'indent-rainbow-bullet-color-mode';
        const HOVER_FRAME_KEY = 'indent-rainbow-hover-frame';
        const REMEMBER_FOLDS_KEY = 'indent-rainbow-remember-folds';
        const HIDE_EMPTY_MARKERS_KEY = 'indent-rainbow-hide-empty-markers';
        // Global set of lineItem guids that the user has collapsed.
        // Single key; guids are globally unique across records, so per-record
        // keying isn't needed.
        const FOLDED_SET_KEY = 'ir-folded-v1';
        // Hidden debug flag — set localStorage['ir-folded-debug'] = '1' to
        // get timing + warning logs during restore.
        const FOLDED_DEBUG_KEY = 'ir-folded-debug';

        // Color schemes for different tastes
        const colorSchemes = {
            native: {
                name: 'Native (Thymer Default)',
                // Single muted slate repeated across all levels — matches
                // the look of Thymer's native indent guides: uniform, low-
                // saturation, depth conveyed by position alone. Pair with
                // a lower opacity (e.g. 0.3–0.5) for the subtlest result.
                colors: [
                    '#5a6168',
                    '#5a6168',
                    '#5a6168',
                    '#5a6168',
                    '#5a6168',
                    '#5a6168',
                    '#5a6168',
                    '#5a6168',
                ]
            },
            rainbow: {
                name: 'Rainbow',
                colors: [
                    '#ff5f5f',  // Red
                    '#ed8e09',  // Orange
                    '#ffda46',  // Yellow
                    '#19a62e',  // Green
                    '#0080ff',  // Blue
                    '#5856d6',  // Indigo
                    '#f6647f',  // Pink
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

        // Clamp helper — defensive against malformed localStorage values
        // (hand-edited, corrupted, or from older plugin versions). Without
        // this, a bad persisted value could produce absurd line widths or
        // out-of-range opacities until the user opens settings.
        const clampNum = (n, lo, hi, fallback) => {
            const v = Number(n);
            if (!Number.isFinite(v)) return fallback;
            if (v < lo) return lo;
            if (v > hi) return hi;
            return v;
        };

        // Get saved scheme or default to rainbow
        let currentScheme = localStorage.getItem(STORAGE_KEY) || 'rainbow';
        if (!colorSchemes[currentScheme]) {
            currentScheme = 'rainbow';
        }

        // Get saved settings or defaults. Widths support 0.5 step (0..4);
        // opacity is 0..1. parseFloat preserves the fraction; clampNum
        // uses Number() which also preserves it.
        let currentWidth = clampNum(
            parseFloat(localStorage.getItem(WIDTH_KEY)), 0, 4, 1);
        // activeWidth supports fractional values (0.5 step) so users can
        // pick a hairline-thin focus highlight. clampNum uses Number()
        // which preserves the fraction.
        let activeWidth = clampNum(
            parseFloat(localStorage.getItem(ACTIVE_WIDTH_KEY)), 0, 4, 2);
        let currentOpacity = clampNum(
            parseFloat(localStorage.getItem(OPACITY_KEY)), 0, 1, 0.3);

        let isEnabled = localStorage.getItem(ENABLED_KEY) !== 'false'; // default true
        // Only two valid modes — guard against malformed values.
        const savedThreadingMode = localStorage.getItem(THREADING_MODE_KEY);
        let threadingMode = (savedThreadingMode === 'stretched') ? 'stretched' : 'staircase';
        let isBulletsEnabled = localStorage.getItem(BULLETS_ENABLED_KEY) !== 'false'; // default true
        let isTogglesEnabled = localStorage.getItem(TOGGLES_ENABLED_KEY) !== 'false'; // default true
        let isHoverFrameEnabled = localStorage.getItem(HOVER_FRAME_KEY) !== 'false'; // default true
        let isRememberFoldsEnabled = localStorage.getItem(REMEMBER_FOLDS_KEY) !== 'false'; // default true
        let isHideEmptyMarkersEnabled = localStorage.getItem(HIDE_EMPTY_MARKERS_KEY) !== 'false'; // default true
        // Tri-state bullet color mode — 'neutral' | 'hover' | 'always'.
        // Default 'always' so new installs see rainbow-colored bullets; existing
        // users with nothing persisted get the same default on first load.
        const savedBulletColorMode = localStorage.getItem(BULLET_COLOR_MODE_KEY);
        let bulletColorMode = (savedBulletColorMode === 'neutral'
            || savedBulletColorMode === 'hover'
            || savedBulletColorMode === 'always')
            ? savedBulletColorMode
            : 'always';

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
   spacing stays uniform. Tweak --ir-align-nudge to fine-tune.

   --ir-bullet-shift is a second, mode-dependent nudge that's 0 by default
   and becomes a negative value when bt-bullets is on, so the rainbow guide
   (and any downstream active-thread arm, which derives from the indent
   line's bounding rect) shifts left to sit directly under the bullet
   instead of under the caret/chevron. */
:root {
    --ir-align-nudge: 1.5px;
    --ir-bullet-shift: 0px;
}

/* When Workflowy bullets are enabled, move every rainbow guide left so it
   tracks the bullet's x-position rather than the caret's. 20px matches the
   caret-to-bullet distance in .bt-marker (caret 18px + 2px gap, with both
   elements centered within their column). */
body.ir-enabled.bt-bullets {
    --ir-bullet-shift: -10px;
}

/* Both-on mode adds 5pt of margin-right on .bt-marker so row text
   clears the hover frame's right edge. That margin also pushes the
   downstream indent-line to the right, so compensate here with an
   additional 5pt of leftward shift to keep the guides under the
   bullets / numbers / chevrons.
   The 4.5pt rightward bump (-5pt + 4.5pt = -0.5pt net) lands the
   guides directly under the bullet/number column after the
   icon-cluster's 2px-left shift; without it the lines were drifting
   left of the bullets. */
body.ir-enabled.bt-bullets.bt-toggles {
    --ir-bullet-shift: calc(-10px - 0.5pt);
}

/* Toggles-only mode (chevrons enabled, bullets disabled): the indent
   line falls just left of the chevron's center. A 1pt rightward nudge
   centers the line on the chevron's vertical axis. Distinct from the
   bt-bullets variants -- those compensate for a moved bullet column
   the user is looking at; here the chevron IS the visual landmark. */
body.ir-enabled.bt-toggles:not(.bt-bullets) {
    --ir-bullet-shift: 1pt;
}

/* Base: nudge applies to every indent line (catches headings + text + task). */
body.ir-enabled .listitem-indentline {
    transform: translateX(calc(-2px + var(--ir-align-nudge) + var(--ir-bullet-shift))) !important;
}

/* Align bullet indent line with text/heading guides, then apply the global
   nudge. Bullet items sit 6.75px left of text items of the same level. */
body.ir-enabled .listitem-ulist .listitem-indentline {
    transform: translateX(calc(5px + var(--ir-align-nudge) + var(--ir-bullet-shift))) !important;
}

/* Align numbered-list indent line with text/heading guides, then apply the
   global nudge. Numbered items sit 2.63px right of text items of same level. */
body.ir-enabled .listitem-olist .listitem-indentline {
    transform: translateX(calc(-3.5px + var(--ir-align-nudge) + var(--ir-bullet-shift))) !important;
}

/* Ensure indent lines are visible for all item types */
body.ir-enabled .listitem-text .listitem-indentline,
body.ir-enabled .listitem-task .listitem-indentline,
body.ir-enabled .listitem-ulist .listitem-indentline,
body.ir-enabled .listitem-olist .listitem-indentline {
    display: block !important;
    visibility: visible !important;
}

/* When the user drags the guide-width slider to 0 ("Hidden"), the
   width:0 on .listitem-indentline isn't sufficient on its own because
   the display: block !important above, combined with Thymer's own
   inline padding / background rules, still leave a 1px sliver visible.
   Toggled by applySettingVars() when currentWidth === 0. */
body.ir-enabled.ir-guides-hidden .listitem-indentline {
    display: none !important;
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
    /* Sit above .bt-active-highlight (z-index: 10) so the caret/bullet
       aren't hidden behind the active-thread arm when the guide crosses
       directly under the marker. */
    z-index: 11;
}

/* Show the marker wrapper whenever either feature is enabled. */
body.ir-enabled.bt-bullets .bt-marker,
body.ir-enabled.bt-toggles .bt-marker {
    display: inline-flex;
}

/* ---------- Cursor-placement spike (cursor-misplacement-fix-fd1558) ----------
   Pull .bt-marker out of the listitem's inline content flow so Thymer's
   virtual cursor at "row offset 0" lands at the start of actual text
   (right of bullet column) instead of inside / before the marker. We
   reserve space for the marker via padding-left on the listitem so the
   text content visually shifts right of the absolutely-positioned
   marker.

   Premise: Thymer maps model offset -> screen pixel via
   Range.getBoundingClientRect(). If true, range(listitem, 0) collapses
   onto the listitem's content edge (post-padding) and the cursor
   renders at correct text position.

   If the spike fails (cursor still mis-positioned), revert this block
   and the matching .bt-skip-panel override below. JS layer is
   intentionally untouched so revert is a single git operation. */
body.ir-enabled.bt-bullets .listitem,
body.ir-enabled.bt-toggles .listitem {
    position: relative;
    padding-left: 36px;
}
body.ir-enabled.bt-bullets .bt-marker,
body.ir-enabled.bt-toggles .bt-marker {
    position: absolute;
    /* --bt-indent mirrors Thymer's native marginLeft from the row's
       indent-carrier child (set by syncIndentVar in JS). Falls back
       to 0 for unindented rows. The marker tracks hierarchy depth via
       this var instead of via marginLeft on the listitem, which kept
       Thymer's native cursor position from desyncing on Tab. */
    left: var(--bt-indent, 0px);
    top: 0;
    /* Span the first text line so inline-flex align-items:center
       puts caret + bullet on the row's first-line midline regardless
       of font-size (body, headings, embeds). Replaces the previous
       align-self:baseline + transform:translateY nudge that worked
       only when the marker was inline-flex in the listitem's flow. */
    height: 1lh;
    /* Pin width to the reserved padding zone so caret+bullet keep a
       stable column even on rows where the inline-flex would
       otherwise shrink-wrap (e.g. leaf rows where caret is hidden,
       producing a partial collapse + visual stack). */
    width: 36px;
    /* Override the inline-flow translateY(.25em) nudge from the
       earlier .bt-marker rule (still active because rule order /
       specificity match). With top:0 + height:1lh + flex centering,
       no translation is needed. The heading-row align-self:center
       override likewise becomes a no-op (absolute ignores align-self). */
    transform: none;
}
/* ---------- end cursor-placement spike ---------- */

/* Both-on mode: wrap [drag-circle | chevron | bullet] in a soft
   rectangle on row hover. Drawn as a ::before pseudo-element on
   .bt-marker, inflated to the left by 30px so it visually encloses
   the drag circle (which Thymer positions inside .link-menu at
   left:-54px, i.e. just left of the marker). Pointer-transparent so
   it never steals fold/drag clicks; z-index:-1 keeps caret/bullet
   rendering on top.
   .bt-drag-hover is added to the listitem by JS when the mouse is
   over the drag-handle — necessary because .link-menu isn't a DOM
   descendant of .listitem, so plain .listitem:hover drops while the
   mouse is on the drag circle. */
/* Reserve breathing room after the marker in both-on mode so the row
   text doesn't sit under the hover frame's right edge when it paints. */
body.ir-enabled.bt-bullets.bt-toggles .bt-marker {
    margin-right: 5pt;
}
/* Shift the caret+bullet cluster 2px (= ~2pt user) left within the
   marker so the gap between the in-row icons and the drag-handle
   reads visually even with the gap between caret and bullet. The
   drag-handle's left:-67px override + this shift together place the
   drag-handle's slot right edge 4px from the caret's left edge,
   matching the 2px caret-to-bullet gap (with 2px of slot padding
   accounting for the rest). transform on each child instead of on
   the marker so the absolute ::before hover frame is unaffected. */
body.ir-enabled.bt-bullets.bt-toggles .bt-marker > .bt-caret,
body.ir-enabled.bt-bullets.bt-toggles .bt-marker > .bt-bullet {
    transform: translateX(-2px);
}
body.ir-enabled.bt-bullets.bt-toggles .bt-marker::before {
    content: "";
    position: absolute;
    /* Match Thymer's native link-menu popup dimensions (~83pt wide,
       28pt tall) and its pill silhouette so the both-on cluster reads
       as a first-class UI affordance. Height is set via symmetric
       top/bottom insets that land 28pt total around the marker
       midline; width is driven by extending the left inset so the
       drag circle (at left:-24px) falls inside. */
    /* Pin the rectangle to a FIXED 28pt height anchored on the marker's
       vertical midline -- matches Thymer's native link-menu popup
       height exactly. Previously sized via -3pt/-3.25pt insets off the
       marker box; that worked when the marker was inline-flex (sized to
       its 18px icon content) but inflated to ~30px after the marker
       grew to height:1lh (~22px text line-height) in the cursor spike.
       Explicit height + center-anchor keeps the frame at 28pt
       regardless of marker box size. 14pt = half of 28 (centers the
       rectangle on the marker midline).
       Left inset (-44pt) reaches across the gutter to wrap the drag
       circle (left:-90px relative to link-menu, which Thymer anchors
       at the listitem's content edge -- i.e. 36px right of the marker
       after our padding-left:36 reserves the marker zone). Right inset
       (-3pt) keeps the original 4.75pt visual margin past the bullet. */
    top: calc(50% - 15px);
    bottom: auto;
    height: 30px;
    /* -35px lands 4px left of the drag-handle's slot left edge
       (drag-handle slot now at marker.left - 31 after we tightened
       its left:-90 to -67). 4px wraps the visible ring with even
       padding to match the right side. */
    left: -35px;
    right: -4px;
    border-radius: 4pt;
    background: transparent;
    border: 1px solid transparent;
    pointer-events: none;
    z-index: -1;
    transition: background-color 0.12s ease, border-color 0.12s ease;
}
/* Hover-frame paint is suppressed while the user is interacting via
   keyboard. Thymer hides its native popup when the cursor moves with
   keyboard shortcuts; mirror that on our hover frame so a stale
   :hover state from before the keystroke doesn't leave the frame
   painted on a row the user is no longer focused on visually.
   bt-keyboard-active is toggled on body by the keyboard listener
   below (added on keydown, cleared on the next mousemove).
   bt-drag-hover stays unconditional -- if the user is dragging,
   they're using the mouse, so the frame should always paint. */
body.ir-enabled.bt-bullets.bt-toggles.ir-hover-frame:not(.bt-keyboard-active) .listitem:hover > .bt-marker::before,
body.ir-enabled.bt-bullets.bt-toggles.ir-hover-frame .listitem.bt-drag-hover > .bt-marker::before {
    /* Paint an opaque fill that's *darker* than the page bg so the
       rectangle reads as a recessed surface (matches Thymer's native
       hover popup on dark themes). Start from --ir-marker-knockout-bg
       (the theme-tracked page bg with fallback chain) and mix in a bit
       of black. Previously mixed with currentColor, but on dark themes
       currentColor is light text → the rectangle ended up LIGHTER than
       the page, the opposite of what we want. */
    background: color-mix(in srgb,
        var(--ir-marker-knockout-bg) 50%,
        #000 15%);
    border-color: color-mix(in srgb, currentColor 28%, transparent);
}

/* Heading rows (H1–H6) lack the listitem-text/task/ulist/olist classes
   (see Thymer-DOM contract block at the top). Their native text is
   taller than the fixed-size caret/bullet icons, so the default
   baseline-anchored marker with 0.25em translateY sits visibly above
   the heading's optical midline — most noticeable on H1.

   Fix: for heading rows, center the marker on the row's cross-axis
   instead of aligning it to the text baseline, and drop the baseline
   compensation translate. Result: caret + bullet sit at the vertical
   midpoint of the heading row at any heading size. */
body.ir-enabled .listitem:not(.listitem-text):not(.listitem-task):not(.listitem-ulist):not(.listitem-olist) > .bt-marker {
    align-self: center;
    vertical-align: middle;
    /* Cursor-placement fix: marker is now position: absolute. Its
       intrinsic 1lh height inherits the listitem's body line-height,
       which is shorter than the heading text's line-height — so the
       default top:0 + height:1lh combo lands the caret/bullet near
       the heading's TOP, not its midline. Center via 50%/translateY
       and let the marker auto-size to its caret+bullet content. Only
       safe for single-line rows (headings don't wrap), so this rule
       must stay scoped to heading rows; do NOT promote to body rows
       which can wrap. */
    top: 50% !important;
    height: auto !important;
    transform: translateY(-50%) !important;
}

/* Embed rows (image cards, link previews, video/iframe embeds,
   attachments) also lack the text/task/ulist/olist classes, so the
   heading-center rule above catches them. With a tall embed, the
   marker + hover frame end up at the vertical midpoint of the
   whole card instead of on the first-line area where the user
   expects to click for fold/drag. Detect any row that contains a
   media descendant and restore the first-line baseline behavior.

   !important is required here because the heading-center rule chains
   four :not() pseudos (specificity 0,5,0) while :has() inherits only
   its most-specific argument's specificity (max 0,1,1 for element
   selectors). Without !important the heading rule wins the cascade. */
body.ir-enabled .listitem:has(img) > .bt-marker,
body.ir-enabled .listitem:has(video) > .bt-marker,
body.ir-enabled .listitem:has(iframe) > .bt-marker,
body.ir-enabled .listitem:has(picture) > .bt-marker,
body.ir-enabled .listitem:has(canvas) > .bt-marker,
body.ir-enabled .listitem:has([class*="embed"]) > .bt-marker,
body.ir-enabled .listitem:has([class*="card"]) > .bt-marker,
body.ir-enabled .listitem:has([class*="attachment"]) > .bt-marker,
body.ir-enabled .listitem:has([class*="preview"]) > .bt-marker {
    align-self: baseline !important;
    vertical-align: baseline !important;
    transform: translateY(var(--bt-marker-nudge)) !important;
}

/* Knockout disc behind the caret and bullet so the rainbow active-thread
   arm visually passes BEHIND the marker and resumes on the other side,
   instead of cutting through the chevron glyph or parent-bullet ring.
   Pulls the page background via a fallback chain so it tracks theme. */
body.ir-enabled {
    --ir-marker-knockout-bg: var(--theme-background-primary,
        var(--color-bg-800, var(--editor-bg, #111)));
}

/* Bullet: disc is the element's own background. Bullet is already
   geometrically centered (16px box, 8px centered dot) so no nudge needed.
   The caret intentionally has NO knockout — it sits above the active
   thread line via .bt-marker's z-index: 11, with a transparent background
   so the line reads through behind the chevron rather than being
   interrupted by a misaligned disc. */
body.ir-enabled.bt-bullets .bt-marker > .bt-bullet {
    background-color: var(--ir-marker-knockout-bg);
    border-radius: 50%;
}

/* ---------- Caret (disclosure chevron) ---------- */

body.ir-enabled .bt-caret {
    display: none;
    width: 18px;
    height: 18px;
    /* Icon-font centering trick: inline-grid + place-items: center +
       line-height: 0. Flex centering previously misaligned the chevron
       because align-items centers the *line-box*, not the glyph itself —
       Tabler's baseline + ascent metrics pushed the drawn glyph several
       pixels off the caret's center. Zero line-height collapses those
       inline metrics so grid's place-items positions the glyph by its
       actual drawn box. place-items is applied via the display rule
       below so it only takes effect when the caret is visible. */
    font-size: 18px;
    line-height: 0;
    color: currentColor;
    opacity: 0;
    cursor: pointer;
    transition: opacity 0.12s ease;
    flex-shrink: 0;
    /* Tabler's chevron is a single-weight icon font, so font-weight has
       no effect. Use a text stroke to thicken the drawn glyph. */
    -webkit-text-stroke: 1px currentColor;
    text-stroke: 1px currentColor;
}

/* Reserve space for the caret on every row (visible or not) so bullets
   stay in a consistent column. Only show the glyph when bt-toggles AND
   bt-has-children. The glyph itself comes from Tabler Icons via the
   .ti.ti-chevron-down / .ti-chevron-right classes we add in JS; Thymer
   already loads the Tabler font so the ::before content is supplied by
   Thymer's own stylesheet, keeping us visually in lock-step with the
   native link-menu chevrons. */
body.ir-enabled.bt-toggles .bt-marker > .bt-caret {
    display: inline-grid;
    place-items: center;
}
/* Force the Tabler ::before glyph to render as a zero-metrics block so
   its em-box is collapsed; grid's place-items then centers the glyph
   by its inked dimensions instead of its baseline position. Only
   applies in the Tabler-fallback render path (before the first
   link-menu observation captures the native chevron clone). */
body.ir-enabled .bt-caret.ti::before {
    display: block;
    line-height: 1;
}
/* Native-clone render path: when .bt-caret holds a cloned native
   chevron node as its child (set by setCaretChevron), make the clone
   fill the wrapper and inherit the wrapper's color / opacity. The
   clone keeps its own native classes (.link-menu-action-collapse, ti,
   ti-chevron-down, etc.), so its glyph renders via the same icon-font
   stack Thymer uses in the popup. pointer-events: none ensures clicks
   reach the wrapper, which is what triggerNativeFold listens on. */
body.ir-enabled .bt-caret > * {
    width: 100% !important;
    height: 100% !important;
    display: inline-grid !important;
    place-items: center !important;
    color: inherit !important;
    font-size: inherit !important;
    pointer-events: none !important;
    /* Strip native button chrome so the clone is just the glyph. */
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
}
body.ir-enabled .bt-caret > *::before {
    display: block;
    line-height: 1;
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

/* --bt-bullet-fill is the effective color used for the bullet's solid dot,
   the parent inner-dot, and the collapsed halo. Defaults to currentColor so
   Neutral mode renders exactly like the original design; mode-gated rules
   below swap it for var(--bt-bullet-color) (the row's level color, written
   per-listitem by colorIndentLine). */
body.ir-enabled .bt-bullet {
    --bt-bullet-fill: currentColor;
}

body.ir-enabled .bt-bullet::after {
    content: '';
    display: block;
    box-sizing: border-box;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid rgba(128, 128, 128, 0.55);
    background: var(--bt-bullet-fill);
    background-clip: padding-box;
    opacity: 0.45;
    transition: opacity 0.15s ease, transform 0.15s ease,
                box-shadow 0.15s ease, border-color 0.15s ease;
}

/* Rainbow-always mode: bullet fill always uses the row's indent-level color. */
body.ir-enabled.ir-bullets-always .bt-bullet {
    --bt-bullet-fill: var(--bt-bullet-color, currentColor);
}

/* Rainbow-on-hover mode: bullet stays uniform at rest, takes the level
   color whenever the mouse is anywhere on the row, the cursor is on the
   row (.bt-focused), OR the row is an ancestor of the focused row
   (.bt-thread-parent) — so the full active-thread path stays tinted.
   Scoped to the row's own bullet via the direct descendant marker so
   hovering a parent doesn't tint its children. */
body.ir-enabled.ir-bullets-hover .listitem:hover > .bt-marker > .bt-bullet,
body.ir-enabled.ir-bullets-hover .listitem.bt-focused > .bt-marker > .bt-bullet,
body.ir-enabled.ir-bullets-hover .listitem.bt-thread-parent > .bt-marker > .bt-bullet {
    --bt-bullet-fill: var(--bt-bullet-color, currentColor);
}

/* The focused (active) row's bullet always takes its level color, even
   in "neutral" mode and even when the row is a childless leaf. Neutral
   mode otherwise leaves bullets uniform gray; this single exception
   makes the cursor's current line visually findable at a glance. */
body.ir-enabled .listitem.bt-focused > .bt-marker > .bt-bullet {
    --bt-bullet-fill: var(--bt-bullet-color, currentColor);
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

/* Differentiate collapsable rows: parents get a Workflowy-style
   ring-with-inner-dot, leaves keep the plain solid dot. Applies whenever
   bullets are enabled, regardless of carets — the ring gives a quick
   visual cue that the row has children even when carets aren't the
   primary affordance. The inner dot is drawn with an inset box-shadow
   so we don't need a second pseudo-element. */
body.ir-enabled.bt-bullets .listitem.bt-has-children > .bt-marker > .bt-bullet::after {
    background: transparent;
    border: 1.5px solid rgba(128, 128, 128, 0.65);
    box-shadow: inset 0 0 0 2.5px var(--bt-bullet-fill);
    opacity: 0.75;
}
body.ir-enabled.bt-bullets .listitem.bt-has-children > .bt-marker > .bt-bullet:hover::after {
    box-shadow: inset 0 0 0 2.5px var(--bt-bullet-fill);
}

/* Collapsed parents: add an outer halo behind the bullet so it's obvious
   content is hidden. Combines with the inset inner-dot from the parent
   rule above (comma-separated box-shadows stack). The halo is derived
   from --bt-bullet-fill via color-mix so it tracks the bullet's color
   in all modes: in Neutral it's a text-toned wash, in Hover/Always it
   naturally tints toward the row's indent-level color. Slightly bumps
   opacity so a collapsed row reads as "active / has hidden state"
   rather than dimmed. */
body.ir-enabled.bt-bullets .listitem.bt-has-children.bt-collapsed > .bt-marker > .bt-bullet::after {
    box-shadow:
        inset 0 0 0 2.5px var(--bt-bullet-fill),
        0 0 0 2.5px color-mix(in srgb, var(--bt-bullet-fill) 35%, transparent);
    opacity: 0.95;
}
body.ir-enabled.bt-bullets .listitem.bt-has-children.bt-collapsed > .bt-marker > .bt-bullet:hover::after {
    box-shadow:
        inset 0 0 0 2.5px var(--bt-bullet-fill),
        0 0 0 2px color-mix(in srgb, var(--bt-bullet-fill) 50%, transparent);
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

/* Collapse visibility is delegated to Thymer's native fold mechanism
   (triggered from our .bt-caret click via the native link-menu action).
   This plugin no longer hides descendant rows itself — doing so broke
   arrow-key navigation because Thymer's editor model still treated the
   hidden rows as valid cursor targets. The .bt-collapsed class on a
   row is retained purely as a styling hook (chevron glyph + collapsed
   bullet halo). */

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
   to the right of the popup.

   Scoped via JS-tagged .bt-row-menu (set by tagRowMenu in onLinkMenuAdded
   and the per-menu observer) so inline page-link popups (which share the
   .link-menu class but anchor to a link, not a row) keep their native
   action buttons intact. Descendant matching survives Thymer wrapping
   the drag-handle in newer builds. */
body.ir-enabled.bt-toggles .link-menu.bt-row-menu .link-menu-action-collapse,
body.ir-enabled.bt-toggles .link-menu.bt-row-menu .link-menu-action-expand {
    display: none !important;
}

/* Hide the native link-menu zoom arrow when our Workflowy bullets are
   active — clicking the bullet already zooms, so ↗ in the hover menu
   is redundant. Gated on bt-bullets so disabling the bullet setting
   restores the native zoom affordance.

   Scoped via JS-tagged .bt-row-menu so we ONLY hide the zoom on the
   row-level link-menu (the one with the drag circle). Page-link inline
   popups (the floating pill that appears when hovering an inline page
   link with → | / ↗ buttons) reuse the .link-menu class but lack a
   drag-handle — without this scope our rule was killing the useful
   'Open / Open in other panel' affordance on page links. */
body.ir-enabled.bt-bullets .link-menu.bt-row-menu .link-menu-action-zoom {
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
   Thymer's bottom-anchor from fighting our top.

   NOTE: This rule is a FALLBACK. The canonical alignment is now set
   by alignDragHandleToFirstLine() in JS, which measures the anchored
   row's first-line midline against the .link-menu's actual top (see
   linkMenuObserver). JS is needed because Thymer positions .link-menu
   differently for last-in-hierarchy wrapped rows (popup centered on
   the full row box, not its top) — pure CSS can't recover from that
   since we don't know the delta statically. JS inline top naturally
   wins over this calc. */
body.ir-enabled.bt-toggles .item-drag-handle,
body.ir-enabled.bt-bullets .item-drag-handle {
    /* Pin the circle to the row's FIRST text baseline, matching where
       .bt-marker's caret + bullet land. We measure from the top of
       the row: 'top: calc(.5em - 13.5px)' puts the circle's vertical
       center on the baseline of the first line's em-box (approx.
       text baseline), regardless of the row's total height on
       wrapped rows. 1em resolves to the listitem's own font-size, so
       headings and body text both line up. */
    top: calc(1em - 14.5px) !important;
    /* -24px previously produced an 11pt gap between the circle and
       the chevron; +5pt rightward (≈ 6.67px) closes that gap to the
       intended 6pt, matching the chevron↔bullet spacing. */
    left: calc(-24px - 3.25pt) !important;
    bottom: auto !important;
    /* Stack above .bt-marker (z-index: 11) so the both-on hover
       rectangle's opaque ::before (painted as part of bt-marker's
       stacking context) doesn't cover the drag circle. */
    z-index: 12 !important;
}
body.ir-enabled.bt-toggles .item-drag-handle .handle-fold-icon,
body.ir-enabled.bt-bullets .item-drag-handle .handle-fold-icon {
    display: none;
}
/* No inner glyph — match native drag circle (dashed ring, empty
   interior). The ::after remains declared so Thymer's own fold-icon
   SVG stays hidden via display:none above without anything else
   jumping in to fill the circle. */
body.ir-enabled.bt-toggles .item-drag-handle::after,
body.ir-enabled.bt-bullets .item-drag-handle::after {
    content: none;
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
body.ir-enabled .link-menu.bt-row-menu .link-menu-action-zoom,
body.ir-enabled .link-menu.bt-row-menu .link-menu-action-collapse,
body.ir-enabled .link-menu.bt-row-menu .link-menu-action-expand,
body.ir-enabled .link-menu.bt-row-menu .item-drag-handle {
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
body.ir-enabled.bt-toggles .link-menu.bt-row-menu .item-drag-handle,
body.ir-enabled.bt-bullets .link-menu.bt-row-menu .item-drag-handle {
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
body.ir-enabled.bt-toggles.bt-bullets .link-menu.bt-row-menu {
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
   drag-handle's own circle remains visible in both-on. Same
   .bt-row-menu scope so inline page-link popups keep their native
   pill chrome (background, border, shadow). */
body.ir-enabled.bt-toggles.bt-bullets .link-menu.bt-row-menu::before,
body.ir-enabled.bt-toggles.bt-bullets .link-menu.bt-row-menu::after {
    content: none !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}
body.ir-enabled.bt-toggles.bt-bullets .link-menu.bt-row-menu .item-drag-handle {
    pointer-events: auto !important;
    position: relative !important;
    /* Shift the drag circle all the way to the LEFT of the chevron.
       27px = one drag-handle slot (gets us over the bullet/chevron
       column); another 27px clears the full .bt-marker (caret 18px +
       gap 2px + bullet ~18px + padding/border ~4px). Tune if the
       rectangle's padding in the both-on marker rule changes. */
    /* Was -54px before the cursor-placement spike. With the listitem
       now reserving 36px of padding-left for the absolute marker, the
       link-menu (which Thymer anchors to the listitem's content edge,
       i.e. AFTER our padding) sits 36px further right than it used to.
       Adding another -36px (-54 - 36 = -90) keeps the drag circle in
       the same drag-gutter column it occupied with the inline marker.
       Tune in tandem if the listitem padding-left changes.
       Bumped from -90 to -67 so the drag-handle's slot right edge
       lands 4px left of the bt-caret's left edge (which is at
       marker.left - 2px after the icon-cluster's 2px-left shift; see
       the .bt-caret/.bt-bullet rule). 4px = 2px slot-padding +
       2px visual gap, matching the gap between caret and bullet so
       all three icons read as one evenly-spaced cluster. */
    left: -67px !important;
    /* Visual-only nudge: the hit-zone (set by 'left' above) is correct, but the painted ring sits ~20px too far right. transform shifts paint without touching layout, so the hit-zone stays put while the circle visually aligns with the drag-gutter. */
    transform: translateX(0px) !important;
}

/* ---------- Skip-panel scope ----------
   Panels whose type is not 'edit_panel' (e.g. search results, overview,
   custom panels) get the .bt-skip-panel class applied to their root
   element by refreshPanelScope() via this.ui.getPanels(). These rules
   neutralize our plugin visuals inside that subtree WITHOUT refactoring
   the 80+ body-level rules above. Marker DOM is never injected there in
   the first place; these rules cover any transient .listitem rendering
   between a panel's creation and our refreshPanelScope pass.
*/
.bt-skip-panel .bt-marker { display: none !important; }
/* Spike paired override: zero out the cursor-placement padding-left
   inside skip-panels so search / overview / custom panels keep their
   native layout. */
.bt-skip-panel .listitem { padding-left: 0 !important; }
.bt-skip-panel .listitem-indentline {
    background: none !important;
    opacity: 0 !important;
    box-shadow: none !important;
    filter: none !important;
    border: none !important;
}

/* ---------- Touch / mobile safety ----------
   Scoped strictly behind @media (hover: none) / (pointer: coarse) so
   desktop + hybrid mouse-equipped touchscreens are unaffected. These
   rules address three mobile-specific issues:

   1. Sticky :hover after tap. Mobile browsers apply :hover to the last
      tapped element until the user taps somewhere else. Our hover
      frame (a dark rectangle painted via .bt-marker::before) and the
      indentline brightness bumps therefore get stuck. Suppress them
      outright on no-hover devices so taps don't leave visual residue.

   2. Tap targets. .bt-caret (18x18) and .bt-bullet (16x16) are well
      below Apple HIG (44x44) and Material (48x48) minimums. Expand
      their hit-zone on coarse pointers via transparent padding +
      compensating negative margin so layout is unchanged but the
      tappable box reaches ~32px in the inline axis.

   3. Bullet-color "hover" mode is inert on touch (the trigger never
      fires). Fall back to the "always" behavior so users who picked
      Hover on desktop still get colored bullets when they pick up
      the same workspace on a phone / tablet. */
@media (hover: none) {
    /* Suppress the hover frame + brightness hovers that would
       otherwise stick after a tap. */
    body.ir-enabled.bt-bullets.bt-toggles.ir-hover-frame .listitem:hover > .bt-marker::before {
        background: transparent !important;
        border-color: transparent !important;
    }
    body.ir-enabled .listitem:hover > .line-div > .listitem-indentline,
    body.ir-enabled .listitem:hover > .line-check-div ~ .line-div > .listitem-indentline,
    body.ir-enabled .listitem:hover > .line-bullet-div ~ .line-div > .listitem-indentline,
    body.ir-enabled .listitem:hover > .line-number-div ~ .line-div > .listitem-indentline {
        opacity: var(--bt-line-opacity) !important;
        filter: none !important;
    }
    body.ir-enabled .listitem:hover .line-div .listitem-indentline {
        filter: none;
    }
    body.ir-enabled.bt-toggles .listitem.bt-has-children > .bt-marker > .bt-caret:hover {
        opacity: 0.55;
    }
    body.ir-enabled .bt-bullet:hover::after {
        opacity: 0.75;
        border-color: rgba(128, 128, 128, 0.55);
        transform: none;
    }
    /* "Hover" bullet-color mode has no trigger on touch. Fall back to
       the "always" behavior so users still get colored bullets. */
    body.ir-enabled.ir-bullets-hover .bt-bullet {
        --bt-bullet-fill: var(--bt-bullet-color, currentColor);
    }
}

@media (pointer: coarse) {
    /* Expand tap targets without shifting layout. Padding grows the
       hit-zone; compensating negative margin cancels the space change. */
    body.ir-enabled .bt-caret,
    body.ir-enabled .bt-bullet {
        padding: 8px 6px;
        margin: -8px -6px;
    }
}

/* ---------- Hide markers on blank lines ----------
   When body.ir-hide-empty-markers is active, any .listitem tagged
   with .bt-empty (written by colorIndentLine when the row's text
   content is blank) fades out its bullet and fold caret. We use
   opacity (not display/visibility) so the marker slot stays
   occupied — layout doesn't jump the moment the user types the
   first character — and so we can animate the transition.

   Fade behavior: slow fade-out (1.5s) once the row loses both
   hover and focus, fast fade-in (0.15s) when the row is hovered
   or the text cursor lands in it. This mirrors the "recently
   active" hint pattern and keeps the UI calm while still letting
   the user reach for the bullet/caret when they need it. The
   hover frame itself is unaffected. */
body.ir-enabled.ir-hide-empty-markers .listitem.bt-empty > .bt-marker > .bt-bullet,
body.ir-enabled.ir-hide-empty-markers .listitem.bt-empty > .bt-marker > .bt-caret {
    opacity: 0;
    transition: opacity 1.5s ease-out;
}
body.ir-enabled.ir-hide-empty-markers .listitem.bt-empty:hover > .bt-marker > .bt-bullet,
body.ir-enabled.ir-hide-empty-markers .listitem.bt-empty.bt-focused > .bt-marker > .bt-bullet {
    opacity: 1;
    transition: opacity 0.15s ease-in;
}
/* Caret's rest opacity on parent rows is 0.55 (see the main caret
   rule); match that on the restored state so the fade-in lands at
   the same visual weight it would have in a non-blank row. */
body.ir-enabled.ir-hide-empty-markers .listitem.bt-empty:hover > .bt-marker > .bt-caret,
body.ir-enabled.ir-hide-empty-markers .listitem.bt-empty.bt-focused > .bt-marker > .bt-caret {
    opacity: 0.55;
    transition: opacity 0.15s ease-in;
}

/* ---------- Print stylesheet ----------
   Suppress all plugin-injected visuals when printing. The native
   document content (text, lists, headings) remains; only our markers,
   indent guides, and active-thread highlights are hidden so printed
   output matches Thymer's default look. */
@media print {
    body.ir-enabled .bt-marker,
    body.ir-enabled .listitem-indentline,
    body.ir-enabled .bt-active-highlight {
        display: none !important;
    }
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
            // When width is 0, toggle a class so CSS can fully hide the
            // guide. Just zeroing width isn't enough — Thymer's inline
            // padding, a leftover border, or our own display: block
            // !important override keep a sliver visible.
            document.body.classList.toggle('ir-guides-hidden', currentWidth === 0);
            document.body.classList.toggle('ir-hide-empty-markers', isHideEmptyMarkersEnabled);
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
            localStorage.setItem(BULLET_COLOR_MODE_KEY, bulletColorMode);
            localStorage.setItem(HOVER_FRAME_KEY, isHoverFrameEnabled);
            localStorage.setItem(REMEMBER_FOLDS_KEY, isRememberFoldsEnabled);
            localStorage.setItem(HIDE_EMPTY_MARKERS_KEY, isHideEmptyMarkersEnabled);
        };

        // Toggle the ir-enabled body class which gates all our CSS rules.
        // Also sets exactly one of ir-bullets-neutral / -hover / -always so
        // the CSS can pick the right --bt-bullet-fill override.
        const applyEnabledState = () => {
            document.body.classList.toggle('ir-enabled', isEnabled);
            document.body.classList.toggle('bt-bullets', isEnabled && isBulletsEnabled);
            document.body.classList.toggle('bt-toggles', isEnabled && isTogglesEnabled);
            document.body.classList.toggle('ir-bullets-neutral', bulletColorMode === 'neutral');
            document.body.classList.toggle('ir-bullets-hover', bulletColorMode === 'hover');
            document.body.classList.toggle('ir-bullets-always', bulletColorMode === 'always');
            document.body.classList.toggle('ir-hover-frame',
                isEnabled && isHoverFrameEnabled);
        };

        // Inject the static stylesheet once.
        this.styleElement = this.ui.injectCSS(STATIC_CSS);
        applySchemeVars(currentScheme);
        applySettingVars();
        applyEnabledState();

        // ---------- Panel scope ----------
        // Only apply the plugin's visuals + marker injection to panels
        // whose type is 'edit_panel'. Other panel types (search results,
        // overview, custom panels including our own settings panel) get
        // their root element tagged with `bt-skip-panel`, which:
        //   - is excluded by `isInsideSkipPanel(el)` so injectMarker
        //     early-returns for any .listitem inside that subtree, and
        //   - activates the CSS reset block in STATIC_CSS which hides
        //     .bt-marker and nullifies our indentline painting.
        //
        // Rebuilt on panel.focused / panel.navigated / panel.closed SDK
        // events since panels can change type across their lifetime
        // (e.g. a custom panel type is set after createPanel()).
        const EDITOR_PANEL_TYPE = 'edit_panel';
        const skipPanelRoots = new Set();
        const refreshPanelScope = () => {
            if (typeof this.ui?.getPanels !== 'function') return;
            let panels;
            try { panels = this.ui.getPanels(); } catch { return; }
            if (!Array.isArray(panels)) return;
            const nextSkip = new Set();
            for (const p of panels) {
                if (!p || typeof p.getElement !== 'function') continue;
                const el = p.getElement();
                if (!el) continue;
                const type = (typeof p.getType === 'function' ? p.getType() : '') || '';
                if (type !== EDITOR_PANEL_TYPE) {
                    nextSkip.add(el);
                    if (!el.classList.contains('bt-skip-panel')) {
                        el.classList.add('bt-skip-panel');
                    }
                } else if (el.classList.contains('bt-skip-panel')) {
                    // Panel transitioned INTO editor type (rare but
                    // possible across navigation) — lift the skip.
                    el.classList.remove('bt-skip-panel');
                }
            }
            // Clean up roots that are no longer present in getPanels()
            // (panel closed) — drop the class so stale DOM doesn't
            // accumulate the marker.
            for (const el of skipPanelRoots) {
                if (!nextSkip.has(el) && el.isConnected) {
                    el.classList.remove('bt-skip-panel');
                }
            }
            skipPanelRoots.clear();
            for (const el of nextSkip) skipPanelRoots.add(el);
        };
        const isInsideSkipPanel = (el) => {
            if (!el || skipPanelRoots.size === 0) return false;
            let a = el;
            while (a && a !== document.body) {
                if (a.classList && a.classList.contains('bt-skip-panel')) return true;
                a = a.parentNode;
            }
            return false;
        };
        // Initial pass (some panels may already exist when we load).
        refreshPanelScope();
        // Re-sync whenever panels change. Deferred by a microtask so
        // panel.getType() reflects the post-event state even when the
        // event fires during the panel's own init sequence.
        const onPanelEvent = () => { queueMicrotask(refreshPanelScope); };
        if (typeof this.on === 'function') {
            this.on('panel.focused', onPanelEvent);
            this.on('panel.navigated', onPanelEvent);
            this.on('panel.closed', onPanelEvent);
            this.cleanupMethods.push(() => {
                if (typeof this.off === 'function') {
                    try { this.off('panel.focused', onPanelEvent); } catch {}
                    try { this.off('panel.navigated', onPanelEvent); } catch {}
                    try { this.off('panel.closed', onPanelEvent); } catch {}
                }
            });
        }
        this.cleanupMethods.push(() => {
            // On unload strip our class from any tagged roots so nothing
            // stays hidden if the user reinstalls/toggles.
            for (const el of skipPanelRoots) {
                if (el.isConnected) el.classList.remove('bt-skip-panel');
            }
            skipPanelRoots.clear();
        });

        // =====================================================
        // Focus Tracking via .listitem-with-caret
        // =====================================================
        // Thymer marks the listitem containing the caret with the class
        // `listitem-with-caret`. We watch for that class toggle to resolve
        // the focused item — no transform parsing, no hit-tests, no key
        // or click listeners.

        let currentFocusedItem = null;
        let currentThreadParents = []; // Ancestors of the focused row — used
                                       // to extend hover-mode bullet coloring
                                       // across the full active thread path.
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
            let parents = [];

            if (node && document.body.contains(node) && node.offsetParent !== null) {
                parents = getParents(node);

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

                            // Anchor the arm's end Y to the target row's marker
                            // center when available (bullet/caret is the exact
                            // visual target the thread should land on). Falls
                            // back to the first-line midpoint so wrapped rows
                            // without a marker still behave correctly.
                            //
                            // This matters most when the parent is a heading
                            // (H1): the heading's indent line starts much
                            // higher, so any mismatch between "first-line
                            // midpoint" and "marker center" on the child row
                            // is visually amplified and reads as the arm
                            // terminating above the caret.
                            let tY;
                            const tMarker = targetPointNode.querySelector(':scope > .bt-marker');
                            if (tMarker && tMarker.offsetParent !== null) {
                                const mRect = tMarker.getBoundingClientRect();
                                if (mRect.height > 0) {
                                    tY = mRect.top + (mRect.height / 2);
                                }
                            }
                            if (tY === undefined) {
                                const firstLineH = Math.min(tRect.height, lineHeight);
                                tY = tRect.top + (firstLineH / 2);
                            }

                            const pIndent = p.querySelector('.listitem-indentline');
                            const pLine = pIndent ? pIndent.parentElement : null;

                            // Compute the horizontal target edge (where the
                            // arm should terminate). Shared between the
                            // normal and fallback paths below.
                            let armEndX = tRect.left - 5;
                            for (let ci = 0; ci < targetPointNode.children.length; ci++) {
                                const ch = targetPointNode.children[ci];
                                if (ch.style && ch.style.marginLeft && parseInt(ch.style.marginLeft) > 0) {
                                    armEndX = ch.getBoundingClientRect().left;
                                    break;
                                }
                            }

                            if (pLine && pIndent && pIndent.parentElement) {
                                const pRect = pIndent.getBoundingClientRect();
                                const pContainerRect = pIndent.parentElement.getBoundingClientRect();

                                const h = tY - pRect.top;
                                const w = Math.max(14, armEndX - pRect.left);

                                if (h > 0) {
                                    highlightData.push({
                                        parent: pIndent.parentElement,
                                        top: (pRect.top - pContainerRect.top),
                                        left: (pRect.left - pContainerRect.left),
                                        width: w,
                                        height: h,
                                        color: getComputedStyle(pIndent).backgroundColor
                                    });
                                }
                            } else {
                                // Fallback: Thymer removes the parent's
                                // .listitem-indentline entirely when the
                                // only visible descendant is a collapsed
                                // row (it has nothing to stretch the guide
                                // against). In that state the arm would
                                // simply not render, leaving the focused
                                // collapsed child disconnected from its
                                // parent's thread. Synthesize the arm
                                // geometry from the parent's marker and
                                // copy the indent-line X from any sibling
                                // at the same indent level.
                                let pLevel = 0;
                                for (let i = 0; i < p.children.length; i++) {
                                    const ch = p.children[i];
                                    if (ch.style && ch.style.marginLeft) {
                                        pLevel = Math.floor((parseInt(ch.style.marginLeft) || 0) / INDENT_STEP);
                                        break;
                                    }
                                }

                                // Find a donor indent-line at the same
                                // level to reuse its X offset. The guide
                                // X is driven by Thymer's layout, so we
                                // can't hard-code it.
                                let donorLeft = null;
                                const donors = document.querySelectorAll('.listitem-indentline');
                                for (const d of donors) {
                                    if (!d.offsetParent) continue;
                                    const dItem = d.closest('.listitem');
                                    if (!dItem || dItem === p) continue;
                                    let dLevel = 0;
                                    for (let i = 0; i < dItem.children.length; i++) {
                                        const ch = dItem.children[i];
                                        if (ch.style && ch.style.marginLeft) {
                                            dLevel = Math.floor((parseInt(ch.style.marginLeft) || 0) / INDENT_STEP);
                                            break;
                                        }
                                    }
                                    if (dLevel !== pLevel) continue;
                                    const dr = d.getBoundingClientRect();
                                    if (dr.height > 0) { donorLeft = dr.left; break; }
                                }

                                const pMarker = p.querySelector(':scope > .bt-marker');
                                // Use the parent row's .line-div as the
                                // positioned container — the listitem
                                // itself is position: static, so absolute
                                // children on it resolve against a distant
                                // ancestor and render at the wrong Y.
                                const pContainer = p.querySelector('.line-div') || p;
                                if (donorLeft !== null && pMarker) {
                                    const mRect = pMarker.getBoundingClientRect();
                                    const armTopY = mRect.top + (mRect.height / 2);
                                    const h = tY - armTopY;
                                    if (h > 0) {
                                        const pContainerRect = pContainer.getBoundingClientRect();
                                        // Resolve CSS var once so the
                                        // drop-shadow filter (which doesn't
                                        // always accept var() reliably in
                                        // inline styles) gets a concrete
                                        // color.
                                        const color = (getComputedStyle(document.documentElement)
                                            .getPropertyValue(`--ir-level-${pLevel}`) || '').trim()
                                            || `var(--ir-level-${pLevel})`;
                                        const w = Math.max(14, armEndX - donorLeft);
                                        highlightData.push({
                                            parent: pContainer,
                                            top: (armTopY - pContainerRect.top),
                                            left: (donorLeft - pContainerRect.left),
                                            width: w,
                                            height: h,
                                            color: color
                                        });
                                    }
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

            // Sync `.bt-thread-parent` on the focused row's ancestors so
            // hover-mode can tint the full active path (not just the
            // hovered/focused row). Diff against the previous set to avoid
            // thrashing classes on every rAF tick.
            const nextSet = new Set(parents);
            for (const prev of currentThreadParents) {
                if (!nextSet.has(prev)) prev.classList.remove('bt-thread-parent');
            }
            for (const p of parents) {
                if (!p.classList.contains('bt-thread-parent')) p.classList.add('bt-thread-parent');
            }
            currentThreadParents = parents;

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
            // Compute the row's level first so we can always mirror it onto
            // --bt-bullet-color — even when the row has no indent-line
            // (leaf rows, or parents whose only child is collapsed). The
            // bullet lives outside .listitem-indentline, so its coloring
            // can't depend on the indent-line's presence.
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
            const levelVar = `var(--ir-level-${level})`;
            item.style.setProperty('--bt-bullet-color', levelVar);

            // Compute emptiness BEFORE the indent-line early-return. Blank
            // rows frequently have no .listitem-indentline at all (Thymer
            // strips it on empty content), and we still need to tag the
            // listitem with .bt-empty so the hide-empty-markers CSS works.
            //
            // Scope: when a .line-div exists, walk only its direct own
            // content \u2014 skip our own injected children and anything that
            // looks like a nested sub-row wrapper so a parent with blank
            // text but non-empty descendants still registers as empty.
            const lineDiv = item.querySelector(':scope > .line-div');
            let isEmpty;
            if (lineDiv) {
                isEmpty = true;
                for (const n of lineDiv.childNodes) {
                    if (n.nodeType === 1 && n.classList
                        && (n.classList.contains('listitem-indentline')
                            || n.classList.contains('bt-active-highlight')
                            || n.classList.contains('bt-marker'))) continue;
                    const txt = n.textContent;
                    if (txt && txt.trim().length > 0) { isEmpty = false; break; }
                }
            } else {
                // Fallback: no .line-div. Use the item's own directly-owned
                // text nodes only \u2014 don't recurse into nested listitems so
                // a parent with blank text but child rows stays "empty".
                isEmpty = true;
                for (const n of item.childNodes) {
                    if (n.nodeType === 3) {
                        if ((n.nodeValue || '').trim().length > 0) { isEmpty = false; break; }
                    }
                }
            }

            // Mirror the empty-state onto the listitem so CSS under
            // body.ir-hide-empty-markers can hide .bt-bullet / .bt-caret
            // on blank rows while keeping .bt-marker's layout slot
            // reserved (visibility: hidden, not display: none).
            item.classList.toggle('bt-empty', isEmpty);

            const indentLine = item.querySelector('.listitem-indentline');
            if (!indentLine) return;

            if (isEmpty) {
                indentLine.style.setProperty('display', 'none', 'important');
                indentLine.dataset.btEmpty = '1';
            } else if (indentLine.dataset.btEmpty) {
                indentLine.style.removeProperty('display');
                delete indentLine.dataset.btEmpty;
            }

            indentLine.style.setProperty('--ir-color', levelVar, 'important');
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
            // Strip the bt-empty class we set in colorIndentLine so a
            // disabled plugin doesn't leave stale state on rows.
            document.querySelectorAll('.listitem.bt-empty').forEach(el => {
                el.classList.remove('bt-empty');
            });
            // Also clear the bullet-color var from any listitems we wrote it onto.
            const items = document.querySelectorAll('.listitem');
            for (const it of items) {
                if (it.style && it.style.getPropertyValue('--bt-bullet-color')) {
                    it.style.removeProperty('--bt-bullet-color');
                }
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
                        : [...editorContainer.querySelectorAll('.listitem')];
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
            if (this.isUnloaded) return;
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
            // Indent is whatever Thymer left on the row's native
            // indent-carrier child (.line-div / .line-check-div / etc).
            // We mirror it onto --bt-indent for marker positioning but
            // never mutate the source, so reading the child is the
            // source of truth.
            for (let i = 0; i < li.children.length; i++) {
                const c = li.children[i];
                if (c.classList?.contains('bt-marker')) continue;
                if (c.style && c.style.marginLeft) {
                    const v = parseInt(c.style.marginLeft) || 0;
                    if (v) return v;
                }
            }
            // Defensive fallbacks for older marker DOM (legacy transfer
            // path) and for the listitem-itself fallback that the prior
            // commit used during the cursor-fix iteration.
            const marker = li.firstElementChild;
            if (marker && marker.classList?.contains('bt-marker') && marker.style.marginLeft) {
                return parseInt(marker.style.marginLeft) || 0;
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

        // Mirror Thymer's native indent (inline marginLeft on the first
        // indent-carrying child — typically .line-div, but check-div,
        // bullet-div, and number-div all carry it on their respective
        // row types) onto a CSS custom property on the .listitem. The
        // absolute .bt-marker reads `--bt-indent` for its `left:` so
        // the bullet column tracks hierarchy depth without us touching
        // Thymer's marginLeft.
        const syncIndentVar = (li) => {
            if (!li) return;
            for (let i = 0; i < li.children.length; i++) {
                const c = li.children[i];
                if (!c.classList || c.classList.contains('bt-marker')) continue;
                if (c.style && c.style.marginLeft) {
                    li.style.setProperty('--bt-indent', c.style.marginLeft);
                    return;
                }
            }
            // No indent-carrying child — clear the var so left:0 wins.
            li.style.removeProperty('--bt-indent');
        };

        // Inject (or re-sync) the .bt-marker wrapper as the first child of
        // a .listitem. Mirrors the row's native indent onto --bt-indent so
        // the absolute marker tracks hierarchy depth without mutating
        // Thymer's layout (cursor-misplacement-fix-fd1558).
        const injectMarker = (li) => {
            if (!li || !li.classList || !li.classList.contains('listitem')) return;
            // Skip any .listitem that lives inside a non-editor panel
            // (search, overview, custom panels). See refreshPanelScope.
            if (isInsideSkipPanel(li)) return;
            let marker = li.firstElementChild;
            if (marker && marker.classList.contains('bt-marker')) {
                // Marker already present — re-sync our --bt-indent mirror
                // in case Thymer changed .line-div's marginLeft (Tab,
                // Shift+Tab, drag-reorder, etc).
                syncIndentVar(li);
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

            // Mirror Thymer's native indent (which lives on .line-div
            // or a sibling indent-carrier as inline marginLeft) onto a
            // CSS custom property `--bt-indent` on the .listitem. The
            // absolute marker reads it via `left: var(--bt-indent,0)`,
            // so the bullet column tracks the row's hierarchy depth
            // without us mutating Thymer's marginLeft.
            //
            // Why we DON'T transfer marginLeft anymore: pressing Tab
            // makes Thymer set .line-div.marginLeft synchronously and
            // render the cursor at the resulting (indented) text X.
            // Our previous transfer (.line-div → .listitem) ran
            // asynchronously via MutationObserver, AFTER Thymer's
            // cursor render — the post-transfer layout shifted text
            // back left but Thymer never re-measured the cursor, so
            // the visual cursor stayed at the old (further-right) X.
            // Mirroring via --bt-indent leaves Thymer's layout exactly
            // as it set it, so the cursor never desyncs.
            outlineMutating = true;
            li.insertBefore(marker, li.firstElementChild);
            syncIndentVar(li);
            outlineMutating = false;
            // Mirror Thymer's native rich tooltips (data-tooltip-html +
            // tooltip class) onto our new caret + bullet. No-op until
            // captureNativeTooltips has seen its first link-menu, at
            // which point a sweep fills in every existing marker.
            applyMarkerTooltips(li);
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
        // whose class we remembered when we transferred from it. Falls back
        // to a looser match if Thymer mutated that child's classList between
        // inject and remove — otherwise the margin is silently destroyed
        // along with .bt-marker and the row loses its indent.
        const removeMarker = (li) => {
            if (!li) return;
            const marker = li.firstElementChild;
            if (!marker || !marker.classList?.contains('bt-marker')) return;
            outlineMutating = true;
            // Legacy cleanup: an older version of this plugin transferred
            // marginLeft from .line-div onto either .bt-marker or .listitem.
            // If a marker injected by that older code is still present at
            // unload, restore the margin onto a native child and clear the
            // temporaries so Thymer's layout returns to its untouched state.
            const legacyMl = marker.style.marginLeft || li.style.marginLeft;
            if (legacyMl) {
                const restoredTo = marker.dataset.btFromClass;
                let restored = false;
                if (restoredTo) {
                    for (let i = 1; i < li.children.length; i++) {
                        const c = li.children[i];
                        if (c.className === restoredTo) {
                            c.style.marginLeft = legacyMl;
                            restored = true;
                            break;
                        }
                    }
                }
                if (!restored) {
                    for (let i = 1; i < li.children.length; i++) {
                        const c = li.children[i];
                        if (!c.classList) continue;
                        if (c.classList.contains('line-check-div')
                            || c.classList.contains('line-bullet-div')
                            || c.classList.contains('line-number-div')
                            || c.classList.contains('line-div')) {
                            c.style.marginLeft = legacyMl;
                            restored = true;
                            break;
                        }
                    }
                }
                if (li.style.marginLeft && restored) li.style.marginLeft = '';
            }
            li.style.removeProperty('--bt-indent');
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
            // Preserve bt-has-children on folded rows: Thymer's native
            // fold removes descendant rows from the DOM, which would
            // otherwise flip this false and hide the caret — leaving no
            // way to expand the row again. Source of truth is Thymer's
            // `.listitem-folded`; we also accept our mirror class
            // `.bt-collapsed` to cover the brief optimistic window.
            if (!hasChild && (li.classList.contains('listitem-folded')
                || li.classList.contains('bt-collapsed'))) hasChild = true;
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
        // Scoped to editorContainer to skip unrelated chrome (side panels,
        // modals) — editorContainer falls back to document.body when the
        // editor isn't found, so functional coverage is unchanged.
        const annotateAll = () => {
            const items = Array.from(editorContainer.querySelectorAll('.listitem'));
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
                let hasChild = !!next && nextIndent > curIndent;
                // Sticky: folded rows keep their caret even after Thymer
                // removes their descendants from the DOM. Without this the
                // user would have no way to re-expand the row. Source of
                // truth is Thymer's `.listitem-folded`; our mirror class
                // `.bt-collapsed` also counts (optimistic window).
                if (!hasChild && (cur.classList.contains('listitem-folded')
                    || cur.classList.contains('bt-collapsed'))) hasChild = true;
                const currently = cur.classList.contains('bt-has-children');
                if (hasChild && !currently) cur.classList.add('bt-has-children');
                else if (!hasChild && currently) cur.classList.remove('bt-has-children');
                curIndent = nextIndent;
            }
            return items;
        };

        // Sync the caret's chevron glyph with the row's collapse state
        // (down = expanded, right = collapsed).
        //
        // Two render paths, picked per-row based on whether we've yet
        // observed Thymer's native .link-menu chevrons:
        //   1. NATIVE-CLONE PATH (preferred, used after first link-menu
        //      hover): empty the .bt-caret wrapper and append a deep
        //      clone of the matching native chevron node so it renders
        //      pixel-identical to Thymer's popup chevron.
        //   2. TABLER-FALLBACK PATH (used before the first capture):
        //      toggle `ti ti-chevron-down`/`ti-chevron-right` classes
        //      on the wrapper itself; Thymer's stylesheet supplies the
        //      ::before glyph via the icon font.
        //
        // Source of truth for fold state is Thymer's `.listitem-folded`
        // class. We mirror that onto our own `.bt-collapsed` styling
        // hook so CSS selectors keyed on `.bt-collapsed` (collapsed-
        // bullet halo, sticky has-children) continue to work no matter
        // how the fold was triggered (our chevron, native link-menu,
        // Cmd+/, etc.).
        const setCaretChevron = (caret, folded) => {
            const wantState = folded ? 'expand' : 'collapse';
            if (nativeChevronTemplate.collapse && nativeChevronTemplate.expand) {
                // Native-clone path. Skip if already in correct state.
                if (caret.dataset.btChevronState === wantState) return;
                // Strip Tabler fallback classes so we don't double-render
                // the icon-font ::before alongside the cloned glyph.
                caret.classList.remove('ti', 'ti-chevron-down', 'ti-chevron-right');
                while (caret.firstChild) caret.removeChild(caret.firstChild);
                const clone = nativeChevronTemplate[wantState].cloneNode(true);
                // re-sanitize the fresh clone (cloneNode of an already-
                // sanitized template carries inline pointer-events:none
                // forward, but be defensive in case the template was
                // reset).
                sanitizeChevronClone(clone);
                caret.appendChild(clone);
                caret.dataset.btChevronState = wantState;
                return;
            }
            // Tabler fallback path.
            delete caret.dataset.btChevronState;
            if (!caret.classList.contains('ti')) caret.classList.add('ti');
            const wantDown = !folded;
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
        const updateCaretIcon = (li) => {
            if (!li || !li.classList?.contains('listitem')) return;
            const marker = li.firstElementChild;
            if (!marker || !marker.classList?.contains('bt-marker')) return;
            const caret = marker.firstElementChild;
            if (!caret || !caret.classList?.contains('bt-caret')) return;
            // Mirror Thymer's native `.listitem-folded` onto our
            // `.bt-collapsed` styling hook so CSS stays in sync no
            // matter how the fold was triggered (our chevron, native
            // link-menu, Cmd+/, etc.).
            const folded = li.classList.contains('listitem-folded');
            if (folded && !li.classList.contains('bt-collapsed')) {
                li.classList.add('bt-collapsed');
            } else if (!folded && li.classList.contains('bt-collapsed')) {
                li.classList.remove('bt-collapsed');
            }
            setCaretChevron(caret, folded);
            // Keep the tooltip text synced with fold state (Collapse
            // when expanded, Expand when folded).
            applyMarkerTooltips(li);
        };

        // Previously this function hid descendant rows by setting
        // style.display = 'none' on each. That broke arrow-key navigation
        // because Thymer's editor model still treated those rows as
        // valid cursor targets — moving Up/Down would land on an
        // invisible row.
        //
        // Fold/unfold is now delegated to Thymer's native link-menu
        // action (see triggerNativeFold below), which updates Thymer's
        // internal fold state and makes navigation skip folded rows
        // correctly. This function is retained only to (a) sync caret
        // icon state on each pass, and (b) defensively restore any row
        // that was hidden by a previous buggy version of this plugin
        // (data-bt-hidden-by-collapse marker, pre-1.4.10).
        const applyCollapseState = (items) => {
            items = items || Array.from(editorContainer.querySelectorAll('.listitem'));
            for (const li of items) {
                if (li.dataset.btHiddenByCollapse === '1') {
                    li.style.display = '';
                    delete li.dataset.btHiddenByCollapse;
                }
                updateCaretIcon(li);
            }
        };

        // Trigger Thymer's native fold action for `li`. The desired
        // direction is passed explicitly (shouldCollapse) — we do NOT
        // infer it from DOM state, because Thymer leaves
        // `.lineitem-btn-unfold` in place for a render tick after
        // expansion, which would cause a subsequent collapse click on
        // the same row to mistakenly take the expand path again.
        //
        //   - shouldCollapse=false (expand) → click `.lineitem-btn-unfold`
        //     (the "..." affordance Thymer injects at the end of the
        //     .line-div on collapsed rows). Its click handler is event-
        //     delegated on the editor root, so a direct .click() fires
        //     the right code path.
        //
        //   - shouldCollapse=true (collapse) → hover the row to summon
        //     `.link-menu`, then click `.link-menu-action-collapse`. Our
        //     stylesheet hides that button (our chevron is the visible
        //     affordance) so we temporarily neutralize the display rule
        //     before .click().
        //
        // Both paths route through Thymer's own fold mechanism, so
        // arrow-key navigation stays in sync with the folded state (the
        // plugin SDK exposes no direct collapse API on PluginLineItem).
        const triggerNativeFold = (li, shouldCollapse) => {
            if (!li || !li.classList) return;
            const lineDiv = li.querySelector(':scope > .line-div') || li;

            // Full synthetic click sequence: pointerdown/mousedown → up →
            // click. Some handlers bind on mousedown instead of click,
            // and some state machines (like hover popups) care about the
            // pointer events too.
            const fullClick = (el) => {
                const r = el.getBoundingClientRect();
                const opts = {
                    bubbles: true, cancelable: true, composed: true,
                    view: window, button: 0, buttons: 1,
                    clientX: r.left + r.width / 2,
                    clientY: r.top + r.height / 2,
                };
                const popts = Object.assign({
                    pointerId: 1, pointerType: 'mouse', isPrimary: true,
                }, opts);
                try { el.dispatchEvent(new PointerEvent('pointerdown', popts)); } catch (_) {}
                try { el.dispatchEvent(new MouseEvent('mousedown', opts)); } catch (_) {}
                try { el.dispatchEvent(new PointerEvent('pointerup', popts)); } catch (_) {}
                try { el.dispatchEvent(new MouseEvent('mouseup', opts)); } catch (_) {}
                try { el.click(); } catch (_) {
                    try { el.dispatchEvent(new MouseEvent('click', opts)); } catch (_) {}
                }
            };

            // Expand fast-path: click inline .lineitem-btn-unfold if
            // Thymer has injected it ("..." at end of .line-div). Not
            // always present immediately after a programmatic collapse.
            if (!shouldCollapse) {
                const unfoldBtn = lineDiv.querySelector(':scope > .lineitem-btn-unfold')
                    || li.querySelector('.lineitem-btn-unfold');
                if (unfoldBtn) {
                    fullClick(unfoldBtn);
                    return;
                }
            }

            const actionClass = shouldCollapse
                ? '.link-menu-action-collapse'
                : '.link-menu-action-expand';

            const rect = li.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const cx = rect.right - 10;
            const cy = rect.top + rect.height / 2;
            const mouseOpts = {
                bubbles: true, cancelable: true, composed: true,
                view: window, clientX: cx, clientY: cy,
            };
            const pointerOpts = Object.assign({
                pointerId: 1, pointerType: 'mouse', isPrimary: true,
            }, mouseOpts);
            const dispatch = (el, type, Ctor, opts) => {
                try { el.dispatchEvent(new Ctor(type, opts)); } catch (_) {}
            };
            const hoverTargets = lineDiv === li ? [li] : [li, lineDiv];
            // Target element at the row's center via real hit-testing.
            // Thymer's hover/anchor logic almost certainly queries
            // document.elementFromPoint on pointermove, so we want to
            // dispatch on whatever element actually occupies that spot.
            const hitEl = document.elementFromPoint(cx, cy);
            const enter = () => {
                // Phase 1: force a "moved from elsewhere" transition by
                // first aiming the pointer at the origin of the viewport.
                // Without this, Thymer's state machine may notice no
                // change in hover target and skip re-anchoring.
                const farOpts = Object.assign({}, mouseOpts, { clientX: 0, clientY: 0 });
                const farPOpts = Object.assign({}, pointerOpts, { clientX: 0, clientY: 0 });
                dispatch(document, 'pointermove', PointerEvent, farPOpts);
                dispatch(document, 'mousemove', MouseEvent, farOpts);
                // Phase 2: move back to the row's coords at document
                // level so any global listeners fire with the right
                // clientX/Y.
                dispatch(document, 'pointermove', PointerEvent, pointerOpts);
                dispatch(document, 'mousemove', MouseEvent, mouseOpts);
                // Phase 3: bubbling enter/over on both the row and the
                // element actually at those coordinates.
                const targets = hitEl ? [hitEl, ...hoverTargets] : hoverTargets;
                for (const t of targets) {
                    dispatch(t, 'pointerover', PointerEvent, pointerOpts);
                    dispatch(t, 'pointerenter', PointerEvent, pointerOpts);
                    dispatch(t, 'mouseover', MouseEvent, mouseOpts);
                    dispatch(t, 'mouseenter', MouseEvent, mouseOpts);
                    dispatch(t, 'pointermove', PointerEvent, pointerOpts);
                    dispatch(t, 'mousemove', MouseEvent, mouseOpts);
                }
            };
            const leave = () => {
                const targets = hitEl ? [...hoverTargets, hitEl] : hoverTargets;
                for (const t of targets.slice().reverse()) {
                    dispatch(t, 'mouseleave', MouseEvent, mouseOpts);
                    dispatch(t, 'mouseout', MouseEvent, mouseOpts);
                    dispatch(t, 'pointerleave', PointerEvent, pointerOpts);
                    dispatch(t, 'pointerout', PointerEvent, pointerOpts);
                }
            };
            const tryClickAction = () => {
                if (!shouldCollapse) {
                    const inline = lineDiv.querySelector(':scope > .lineitem-btn-unfold')
                        || li.querySelector('.lineitem-btn-unfold');
                    if (inline) {
                        fullClick(inline);
                        return true;
                    }
                }
                const menus = document.querySelectorAll('.link-menu');
                // Pick the first menu that actually has the action
                // button we want. The menu's DOM position doesn't
                // matter — Thymer anchors by `data-guid`, which we
                // override below to point at our target row.
                let menu = null;
                let btn = null;
                for (const m of menus) {
                    const b = m.querySelector(actionClass);
                    if (b) { menu = m; btn = b; break; }
                }
                if (!menu) return false;
                // Thymer's click handler appears to gate on four pieces
                // of anchor state:
                //   - `.link-menu-visible` class on the menu
                //   - `.editor-drag-handle-open` class on body
                //   - `data-guid` on the menu (the row guid)
                //   - CSS `top`/`left` positioning the menu over the
                //     target row (used as a secondary anchor / for
                //     resolving the row when data-guid is stale)
                // When our chevron click fires on a row Thymer hasn't
                // actively hovered, the menu is hidden AND still
                // positioned over a previously-hovered row. Override
                // all four around the button click, then restore so we
                // don't leave the menu visibly orphaned.
                const ourGuid = li.getAttribute('data-guid') || '';
                const prevGuid = menu.getAttribute('data-guid');
                const menuWasVisible = menu.classList.contains('link-menu-visible');
                const bodyWasOpen = document.body.classList.contains('editor-drag-handle-open');
                const prevTop = menu.style.top;
                const prevLeft = menu.style.left;
                if (ourGuid && prevGuid !== ourGuid) menu.setAttribute('data-guid', ourGuid);
                if (!menuWasVisible) menu.classList.add('link-menu-visible');
                if (!bodyWasOpen) document.body.classList.add('editor-drag-handle-open');
                // Position the menu over our target row so any
                // position-based anchor resolution in Thymer's click
                // handler picks the right row.
                const liRect = li.getBoundingClientRect();
                menu.style.setProperty('top', `${liRect.top + liRect.height / 2}px`, 'important');
                menu.style.setProperty('left', `${liRect.right - 80}px`, 'important');
                const prevD = btn.style.display;
                const prevV = btn.style.visibility;
                btn.style.setProperty('display', 'flex', 'important');
                btn.style.setProperty('visibility', 'hidden', 'important');
                fullClick(btn);
                btn.style.display = prevD;
                btn.style.visibility = prevV;
                // Restore any state we forced. Thymer will re-apply on
                // its next hover update, so we leave things clean.
                if (!menuWasVisible) menu.classList.remove('link-menu-visible');
                if (!bodyWasOpen) document.body.classList.remove('editor-drag-handle-open');
                if (ourGuid && prevGuid && prevGuid !== ourGuid) menu.setAttribute('data-guid', prevGuid);
                if (prevTop) menu.style.top = prevTop; else menu.style.removeProperty('top');
                if (prevLeft) menu.style.left = prevLeft; else menu.style.removeProperty('left');
                return true;
            };

            // Reset any stale hover state before re-entering. Thymer's
            // hover popup logic can debounce: if it believes the row is
            // already hovered (from a previous click), synthetic enter
            // events are ignored. A leave → enter cycle forces a fresh
            // attachment.
            leave();
            enter();
            // Skip immediate-tick: Thymer's link-menu often needs a
            // frame to re-anchor after our synthetic leave/enter.
            // Clicking too early hits a stale popup from a prior state.
            requestAnimationFrame(() => {
                if (this.isUnloaded) { leave(); return; }
                if (tryClickAction()) { leave(); return; }
                setTimeout(() => {
                    if (this.isUnloaded) { leave(); return; }
                    if (tryClickAction()) { leave(); return; }
                    setTimeout(() => {
                        if (this.isUnloaded) { leave(); return; }
                        tryClickAction();
                        leave();
                    }, 64);
                }, 32);
            });
        };

        // =====================================================
        // Persistent collapse state (v1)
        //
        // Remembers which rows the user has collapsed, keyed by lineItem
        // guid (globally unique across records), and restores them after
        // page navigation / full reload.
        //
        // Capture:  a dedicated MutationObserver watching `class` changes
        //           on `.listitem[data-guid]` inside the editor. Diffs the
        //           target's `listitem-folded` presence against a per-guid
        //           `lastSeen` map; only updates the Set + triggers a
        //           debounced save when the state actually flipped. The
        //           observer is SEPARATE from the existing outline
        //           observer (which only watches `style`) so unrelated
        //           class churn (hover, bt-focused, bt-thread-parent, …)
        //           stays off the main outline pipeline.
        //
        // Restore: on `panel.navigated` and after the existing 1000ms
        //          post-load outline pass, iterate rows whose guid is in
        //          the Set + not already folded + have bt-has-children,
        //          and `triggerNativeFold(li, true)` in chunks of 5 per
        //          rAF. A generation counter aborts in-flight restores
        //          when a new navigation starts.
        //
        // Guards:  - foldSelfApplying flag short-circuits the capture
        //            observer while our own restore is dispatching folds,
        //            preventing feedback loops.
        //          - Master switch (isEnabled) AND the user-facing
        //            "Remember collapse state" toggle each gate capture
        //            + restore independently.
        //          - Wrapping scrollTop + selection snapshot/restore keeps
        //            the viewport steady across restore passes.
        // =====================================================

        const FOLDED_DEBUG = localStorage.getItem(FOLDED_DEBUG_KEY) === '1';
        const foldedDebug = (...args) => {
            if (FOLDED_DEBUG) try { console.log('[ir-fold]', ...args); } catch (_) {}
        };

        let foldedSet = new Set();
        // Per-guid last-seen folded state — avoids repeatedly re-diffing
        // the Set when a class mutation doesn't change fold state.
        const foldedLastSeen = new Map();
        // Session-only retry counter. Incremented each time a restore
        // attempt fails to actually fold a row (triggerNativeFold no-op'd,
        // Thymer rejected the action, etc). When a guid hits RETRY_CAP
        // we drop it from the persisted set so we stop thrashing on it.
        const foldedRetry = new Map();
        // Session-only skip list: guids we've given up on (retry cap hit).
        // These are already removed from foldedSet; kept here so a later
        // legitimate capture doesn't re-add them until the next session.
        const foldedSkip = new Set();
        let foldedDirty = false;
        let foldedSaveTimer = null;
        // True while our restore pass is synthesizing fold clicks. Capture
        // observer early-returns in this window so restore doesn't re-enter
        // itself and so manual records don't get double-written.
        let foldSelfApplying = false;
        // Bumped on each panel.navigated; in-flight restore chunks check
        // this before proceeding so a rapid nav cancels the previous pass.
        let foldRestoreGen = 0;

        // Hard cap on persisted guids. When exceeded, evict oldest-inserted
        // (Set iteration order = insertion order; touch = delete+re-add
        // to move to the end). Chosen conservatively — 5000 guids is ~180KB
        // JSON, well under localStorage quota limits.
        const FOLDED_CAP = 5000;
        // Max restore attempts per guid before giving up for the session.
        const FOLDED_RETRY_CAP = 3;

        const loadFoldedSet = () => {
            try {
                const raw = localStorage.getItem(FOLDED_SET_KEY);
                if (!raw) return;
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    foldedSet = new Set(arr.filter(x => typeof x === 'string'));
                    foldedDebug('loaded', foldedSet.size, 'folded guids');
                } else {
                    foldedDebug('stored value not an array — resetting');
                }
            } catch (e) {
                // Corrupt JSON: drop silently, don't block plugin load.
                console.warn('[ir-fold] failed to parse stored set; resetting', e);
                try { localStorage.removeItem(FOLDED_SET_KEY); } catch (_) {}
            }
        };
        loadFoldedSet();

        const saveFoldedSetImmediate = () => {
            if (foldedSaveTimer) {
                clearTimeout(foldedSaveTimer);
                foldedSaveTimer = null;
            }
            if (!foldedDirty) return;
            foldedDirty = false;
            try {
                localStorage.setItem(FOLDED_SET_KEY, JSON.stringify([...foldedSet]));
            } catch (e) {
                // Quota / disabled storage: keep the in-memory set usable
                // for the session; log once.
                if (!this._irFoldQuotaLogged) {
                    console.warn('[ir-fold] could not persist fold set', e);
                    this._irFoldQuotaLogged = true;
                }
            }
        };
        const saveFoldedSetDebounced = () => {
            foldedDirty = true;
            if (foldedSaveTimer) return;
            foldedSaveTimer = setTimeout(() => {
                foldedSaveTimer = null;
                saveFoldedSetImmediate();
            }, 500);
        };

        // One-shot warning per session when the cap evicts an entry.
        let foldedCapWarned = false;
        const trimFoldedSetLRU = () => {
            if (foldedSet.size <= FOLDED_CAP) return;
            // Set iteration order = insertion order. Touch via
            // delete+re-add elsewhere keeps most-recently-used at the end,
            // so iterating from the start yields the oldest entries.
            const toEvict = foldedSet.size - FOLDED_CAP;
            const iter = foldedSet.values();
            for (let i = 0; i < toEvict; i++) {
                const g = iter.next().value;
                if (g !== undefined) foldedSet.delete(g);
            }
            if (!foldedCapWarned) {
                foldedCapWarned = true;
                console.warn('[ir-fold] cap of', FOLDED_CAP,
                    'guids reached; evicting oldest entries');
            }
        };

        // Called from the capture observer when a .listitem's class changes.
        // Fast-path early-returns when fold state hasn't actually flipped.
        const noteFoldStateChange = (li) => {
            if (!isEnabled) return;
            if (!isRememberFoldsEnabled) return;
            if (foldSelfApplying) return;
            const guid = li.getAttribute('data-guid');
            if (!guid) return;
            const folded = li.classList.contains('listitem-folded');
            const prev = foldedLastSeen.get(guid);
            if (prev === folded) return; // no flip — hot-path exit
            foldedLastSeen.set(guid, folded);
            const had = foldedSet.has(guid);
            if (folded) {
                if (foldedSkip.has(guid)) {
                    // User re-folded a previously-given-up row — trust them,
                    // clear the skip + retry state and re-persist.
                    foldedSkip.delete(guid);
                    foldedRetry.delete(guid);
                }
                // Delete + re-add to refresh LRU position (even if already
                // present). Then trim if we're over the cap.
                foldedSet.delete(guid);
                foldedSet.add(guid);
                trimFoldedSetLRU();
                if (!had || foldedSet.size <= FOLDED_CAP) {
                    saveFoldedSetDebounced();
                }
            } else if (had) {
                foldedSet.delete(guid);
                // A fresh manual unfold clears any prior give-up state so
                // the user can fold → unfold → fold again normally.
                foldedRetry.delete(guid);
                foldedSkip.delete(guid);
                saveFoldedSetDebounced();
            }
        };

        // Snapshot active selection + scroll so we can restore them after
        // a fold pass (synthetic folds can shift focus / collapse layout).
        const snapshotSelection = () => {
            const editor = document.querySelector(EDITOR_SELECTORS) || document.body;
            const scrollTop = (editor.scrollTop !== undefined) ? editor.scrollTop : 0;
            let range = null;
            try {
                const sel = document.getSelection();
                if (sel && sel.rangeCount > 0) {
                    range = sel.getRangeAt(0).cloneRange();
                }
            } catch (_) {}
            return { editor, scrollTop, range };
        };
        const restoreSelectionSnapshot = (snap) => {
            if (!snap) return;
            if (snap.editor && typeof snap.editor.scrollTop === 'number') {
                try { snap.editor.scrollTop = snap.scrollTop; } catch (_) {}
            }
            if (snap.range) {
                try {
                    const sel = document.getSelection();
                    if (sel) { sel.removeAllRanges(); sel.addRange(snap.range); }
                } catch (_) {}
            }
        };

        // Chunked, abortable restore of all rows whose guid is in the
        // persisted set. Called on initial load + on every page nav.
        // Runs at most 5 folds per rAF to keep large pages responsive.
        const RESTORE_CHUNK = 5;
        const restoreFolds = () => {
            if (!isEnabled) return;
            if (!isRememberFoldsEnabled) return;
            if (foldedSet.size === 0) return;
            // Fall back to document-wide search — matches other plugin
            // features (outline observer, etc). EDITOR_SELECTORS doesn't
            // always match in the current Thymer build.
            const editor = document.querySelector(EDITOR_SELECTORS) || document.body;

            const started = performance.now();
            const myGen = ++foldRestoreGen;
            const rows = editor.querySelectorAll('.listitem[data-guid]');
            const targets = [];
            for (const li of rows) {
                const g = li.getAttribute('data-guid');
                if (!g || !foldedSet.has(g)) continue;
                if (foldedSkip.has(g)) continue;              // gave up this session
                if (li.classList.contains('listitem-folded')) continue;
                if (!li.classList.contains('bt-has-children')) continue;
                targets.push(li);
            }
            if (targets.length === 0) {
                foldedDebug('restore: nothing to do');
                return;
            }
            foldedDebug('restore:', targets.length, 'row(s)');
            const snap = snapshotSelection();
            // Remember which guids this pass attempted, so we can verify
            // success + increment retry counters once Thymer has had a
            // chance to apply the class.
            const attemptedGuids = targets.map(li => li.getAttribute('data-guid'));

            let i = 0;
            const step = () => {
                if (this.isUnloaded) return;
                if (myGen !== foldRestoreGen) {
                    foldedDebug('restore aborted (gen superseded)');
                    return;
                }
                foldSelfApplying = true;
                try {
                    const end = Math.min(i + RESTORE_CHUNK, targets.length);
                    for (; i < end; i++) {
                        const li = targets[i];
                        // Re-verify — user may have folded it manually
                        // while chunks were pending.
                        if (!li.isConnected) continue;
                        if (li.classList.contains('listitem-folded')) continue;
                        triggerNativeFold(li, true);
                    }
                } finally {
                    // Release the guard on the next tick so any class
                    // mutations Thymer applies synchronously here don't
                    // echo into the capture observer as user-initiated.
                    setTimeout(() => { foldSelfApplying = false; }, 0);
                }
                if (i < targets.length) {
                    requestAnimationFrame(step);
                } else {
                    restoreSelectionSnapshot(snap);
                    foldedDebug('restore done in',
                        (performance.now() - started).toFixed(1), 'ms');
                    // Verify each target actually folded. If a row is
                    // still unfolded + still in our set + user hasn't
                    // unfolded it manually (observer would have pulled it
                    // from the set), bump the retry counter. Over the cap
                    // → drop from set + skip for the rest of the session.
                    // 800ms: triggerNativeFold has up to ~100ms of nested
                    // setTimeout levels for the synthetic click sequence,
                    // plus Thymer's own async fold handling. 800ms is
                    // well beyond that without being user-visible.
                    setTimeout(() => {
                        if (this.isUnloaded) return;
                        if (myGen !== foldRestoreGen) return;
                        let dropped = 0;
                        for (const g of attemptedGuids) {
                            if (!g || !foldedSet.has(g) || foldedSkip.has(g)) continue;
                            const sel = `.listitem[data-guid="${CSS.escape(g)}"]`;
                            const li = editor.querySelector(sel);
                            if (!li) continue;                          // row gone
                            if (li.classList.contains('listitem-folded')) continue;
                            const n = (foldedRetry.get(g) || 0) + 1;
                            foldedRetry.set(g, n);
                            if (n >= FOLDED_RETRY_CAP) {
                                foldedSkip.add(g);
                                foldedSet.delete(g);
                                foldedLastSeen.delete(g);
                                dropped++;
                                foldedDebug('giving up on guid after',
                                    n, 'tries:', g);
                            }
                        }
                        if (dropped > 0) saveFoldedSetDebounced();
                    }, 800);
                }
            };
            requestAnimationFrame(step);
        };

        // Bulk fold / unfold on the current page. Each call walks every
        // visible .listitem in the editor and dispatches triggerNativeFold
        // in rAF-chunked batches. Uses the same foldSelfApplying guard as
        // the restore path so the capture observer doesn't fire 500 times
        // in a tight loop while we batch — once we're done, the capture
        // observer catches up naturally via Thymer's class mutations and
        // persists the new state.
        const BULK_CHUNK = 5;
        const bulkFoldUnfold = (shouldCollapse) => {
            // Fall back to document-wide search if EDITOR_SELECTORS doesn't
            // match (Thymer's DOM shape varies across builds — other plugin
            // features use the same fallback). We also drop the
            // [data-guid] filter: guid isn't needed to fold a row, and
            // Thymer doesn't always expose it on every listitem.
            const editor = document.querySelector(EDITOR_SELECTORS) || document.body;
            const all = Array.from(editor.querySelectorAll('.listitem'));
            if (all.length === 0) return 0;

            // Thymer's DOM is FLAT: all .listitem elements are siblings,
            // and "nesting" is expressed via marginLeft on the marker.
            // So depth is NOT the number of .listitem ancestors — it's
            // the relative indent compared to the minimum indent on the
            // current page. And a row "has children" iff the NEXT row in
            // document order has strictly greater indent.
            const indents = all.map(getItemIndent);
            let minIndent = Infinity;
            for (const v of indents) {
                if (v < minIndent) minIndent = v;
            }
            if (!Number.isFinite(minIndent)) minIndent = 0;
            const hasChildrenByOrder = new Array(all.length);
            for (let i = 0; i < all.length; i++) {
                const nextIndent = i + 1 < all.length ? indents[i + 1] : -Infinity;
                let hc = nextIndent > indents[i];
                // Folded rows hide their children from the DOM, so the
                // "next row" heuristic under-counts. Treat folded as a
                // positive signal regardless.
                if (!hc && (all[i].classList.contains('listitem-folded')
                    || all[i].classList.contains('bt-collapsed'))) hc = true;
                hasChildrenByOrder[i] = hc;
            }

            const targets = [];
            for (let i = 0; i < all.length; i++) {
                const li = all[i];
                if (!li.isConnected) continue;
                const isFolded = li.classList.contains('listitem-folded');
                if (shouldCollapse) {
                    // Fold: only TOP-LEVEL rows (minimum indent on page)
                    // that have children and aren't already folded.
                    // Folding the outermost bullet implicitly hides every
                    // descendant, so we collapse the page to its
                    // outermost level with a single command.
                    if (indents[i] === minIndent
                        && hasChildrenByOrder[i]
                        && !isFolded) {
                        targets.push(li);
                    }
                } else if (isFolded) {
                    // Unfold: every folded row on the page.
                    targets.push(li);
                }
            }
            if (targets.length === 0) return 0;

            const snap = snapshotSelection();
            let i = 0;
            const step = () => {
                if (this.isUnloaded) return;
                foldSelfApplying = true;
                try {
                    const end = Math.min(i + BULK_CHUNK, targets.length);
                    for (; i < end; i++) {
                        const li = targets[i];
                        if (!li.isConnected) continue;
                        const isFolded = li.classList.contains('listitem-folded');
                        if (shouldCollapse && isFolded) continue;
                        if (!shouldCollapse && !isFolded) continue;
                        triggerNativeFold(li, shouldCollapse);
                    }
                } finally {
                    setTimeout(() => { foldSelfApplying = false; }, 0);
                }
                if (i < targets.length) {
                    requestAnimationFrame(step);
                } else {
                    restoreSelectionSnapshot(snap);
                    if (this.ui && typeof this.ui.showToaster === 'function') {
                        this.ui.showToaster({
                            message: shouldCollapse
                                ? `Folded ${targets.length} row${targets.length === 1 ? '' : 's'}`
                                : `Unfolded ${targets.length} row${targets.length === 1 ? '' : 's'}`,
                            duration: 1500
                        });
                    }
                }
            };
            requestAnimationFrame(step);
            return targets.length;
        };
        const foldAllOnPage = () => bulkFoldUnfold(true);
        const unfoldAllOnPage = () => bulkFoldUnfold(false);

        // Dedicated class-attr observer — kept separate from the outline
        // observer to avoid flooding the main pipeline with hover / focus
        // class churn. Attached once; re-targets the editor in a cleanup
        // step below.
        const foldCaptureObserver = new MutationObserver((mutations) => {
            if (this.isUnloaded) return;
            if (foldSelfApplying) return;
            if (!isEnabled || !isRememberFoldsEnabled) return;
            for (const m of mutations) {
                const t = m.target;
                if (!t || t.nodeType !== 1) continue;
                if (!t.classList || !t.classList.contains('listitem')) continue;
                noteFoldStateChange(t);
            }
        });
        const foldCaptureTarget = document.querySelector(EDITOR_SELECTORS) || document.body;
        foldCaptureObserver.observe(foldCaptureTarget, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true,
        });

        // Hook navigation events — run a restore pass each time the
        // panel switches to a different record. The SDK exposes
        // panel.navigated via this.events.on.
        try {
            if (this.events && typeof this.events.on === 'function') {
                const navListenerId = this.events.on('panel.navigated', () => {
                    if (this.isUnloaded) return;
                    // Wait one frame so Thymer has a chance to populate
                    // rows + our outline pass has assigned bt-has-children
                    // before we look for fold targets.
                    requestAnimationFrame(() => {
                        if (this.isUnloaded) return;
                        restoreFolds();
                    });
                });
                if (navListenerId && this.events.off) {
                    this.cleanupMethods = this.cleanupMethods || [];
                    this.cleanupMethods.push(() => {
                        try { this.events.off(navListenerId); } catch (_) {}
                    });
                }
            }
        } catch (e) {
            console.warn('[ir-fold] panel.navigated hook failed', e);
        }

        // Cleanup: disconnect observer, flush pending save.
        this.cleanupMethods = this.cleanupMethods || [];
        this.cleanupMethods.push(() => {
            try { foldCaptureObserver.disconnect(); } catch (_) {}
            saveFoldedSetImmediate();
            foldedLastSeen.clear();
            foldedRetry.clear();
            foldedSkip.clear();
            foldedSet = new Set();
            foldRestoreGen++; // invalidate any in-flight restore rAFs
        });

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
            if (this.isUnloaded) return;
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
                    // added row inside findParentListItem. Scoped to the
                    // editor container to avoid walking side panels.
                    const allListItems = editorContainer.querySelectorAll('.listitem');
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
        const outlineInitTimeout2 = setTimeout(() => {
            scheduleOutlinePass();
            // Kick the initial restore AFTER bt-has-children has settled
            // on the fully-populated outline — triggerNativeFold skips
            // rows without that class, so running restore earlier would
            // miss the parents we need to fold.
            restoreFolds();
        }, 1000);
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

        // ----- Native tooltip mirroring -----
        // Thymer's tooltip system is driven by `class="tooltip"` +
        // `data-tooltip-html` / `data-tooltip-delay` / `data-tooltip-dir`
        // attributes on the target element (a global mouseover listener
        // inside Thymer reads these). So to show the native rich tooltip
        // on our in-row .bt-caret / .bt-bullet, we just copy the same
        // attributes off the real native buttons onto our elements.
        //
        // Caret needs both collapse + expand variants cached (the active
        // one is picked per-row based on current fold state). Bullet has
        // a single zoom variant.
        const nativeTooltipAttrs = {
            collapse: null,
            expand: null,
            zoom: null,
        };
        const TOOLTIP_ATTRS = ['data-tooltip-html', 'data-tooltip-delay', 'data-tooltip-dir'];

        // ----- Native chevron template capture -----
        // Snapshot the actual DOM nodes Thymer uses for collapse / expand
        // chevrons inside .link-menu, so we can clone them into each row's
        // .bt-caret wrapper. This makes our in-row chevron render exactly
        // like the native popup chevron (same Tabler classes, native color,
        // native font metrics). Captured once on first observation; stays
        // stable across hovers because Thymer reuses a single element.
        const nativeChevronTemplate = {
            collapse: null,
            expand: null,
        };
        let chevronsCaptured = false;
        const sanitizeChevronClone = (clone) => {
            // Strip identity + interactivity attrs so the clone is inert
            // visual chrome only; the wrapping .bt-caret takes the click.
            // Keeping the native classes intact preserves Thymer's icon
            // font ::before content + color tokens.
            clone.removeAttribute('id');
            clone.removeAttribute('style');
            clone.classList.remove('tooltip');
            for (const a of TOOLTIP_ATTRS) clone.removeAttribute(a);
            // pointer-events: none so the clone never absorbs clicks; the
            // outer .bt-caret wrapper handles the click → triggerNativeFold
            // path. Also blocks the clone's own listeners (none typical,
            // since cloneNode doesn't copy them, but defensive).
            clone.style.pointerEvents = 'none';
            return clone;
        };
        const captureNativeChevrons = (linkMenu) => {
            if (!linkMenu || !linkMenu.querySelector) return false;
            // Use descendant query so wrapped/reordered handles still match.
            const c = linkMenu.querySelector('.link-menu-action-collapse');
            const e = linkMenu.querySelector('.link-menu-action-expand');
            let changed = false;
            if (c && !nativeChevronTemplate.collapse) {
                nativeChevronTemplate.collapse = sanitizeChevronClone(c.cloneNode(true));
                changed = true;
            }
            if (e && !nativeChevronTemplate.expand) {
                nativeChevronTemplate.expand = sanitizeChevronClone(e.cloneNode(true));
                changed = true;
            }
            return changed;
        };
        const snapshotTooltipAttrs = (btn) => {
            if (!btn) return null;
            const out = {};
            let any = false;
            for (const a of TOOLTIP_ATTRS) {
                const v = btn.getAttribute(a);
                if (v != null) { out[a] = v; any = true; }
            }
            return any ? out : null;
        };
        let tooltipsCaptured = false;
        const captureNativeTooltips = (linkMenu) => {
            if (!linkMenu || !linkMenu.querySelector) return;
            // Descendant queries so capture survives wrapped / re-ordered
            // children (Thymer occasionally wraps these in newer builds).
            const c = linkMenu.querySelector('.link-menu-action-collapse');
            const e = linkMenu.querySelector('.link-menu-action-expand');
            const z = linkMenu.querySelector('.link-menu-action-zoom');
            let changed = false;
            const cs = snapshotTooltipAttrs(c);
            if (cs) { nativeTooltipAttrs.collapse = cs; changed = true; }
            const es = snapshotTooltipAttrs(e);
            if (es) { nativeTooltipAttrs.expand = es; changed = true; }
            const zs = snapshotTooltipAttrs(z);
            if (zs) { nativeTooltipAttrs.zoom = zs; changed = true; }
            // Snapshot the live chevron nodes for cloning into each row.
            const chevronChanged = captureNativeChevrons(linkMenu);
            // First time we capture anything, re-apply across every row
            // so in-flight markers pick up tooltips + native chevron
            // clones without waiting for the next caret-update / outline
            // pass.
            const firstTooltip = changed && !tooltipsCaptured;
            const firstChevron = chevronChanged && !chevronsCaptured;
            if (firstTooltip) tooltipsCaptured = true;
            if (firstChevron) chevronsCaptured = true;
            if (firstTooltip || firstChevron) {
                document.querySelectorAll('.listitem').forEach((li) => {
                    applyMarkerTooltips(li);
                    if (firstChevron) updateCaretIcon(li);
                });
            }
        };

        const applyTooltipAttrs = (el, attrs) => {
            if (!el) return;
            if (!attrs) {
                // Nothing captured yet → make sure we don't leave stale
                // tooltip hooks behind if the user toggled the plugin.
                el.classList.remove('tooltip');
                for (const a of TOOLTIP_ATTRS) el.removeAttribute(a);
                return;
            }
            if (!el.classList.contains('tooltip')) el.classList.add('tooltip');
            for (const a of TOOLTIP_ATTRS) {
                const v = attrs[a];
                if (v == null) {
                    el.removeAttribute(a);
                } else if (el.getAttribute(a) !== v) {
                    el.setAttribute(a, v);
                }
            }
        };
        const applyMarkerTooltips = (li) => {
            if (!li || !li.classList?.contains('listitem')) return;
            const marker = li.firstElementChild;
            if (!marker || !marker.classList?.contains('bt-marker')) return;
            const caret = marker.querySelector(':scope > .bt-caret');
            const bullet = marker.querySelector(':scope > .bt-bullet');
            if (bullet) applyTooltipAttrs(bullet, nativeTooltipAttrs.zoom);
            if (caret) {
                const folded = li.classList.contains('listitem-folded');
                const which = folded ? nativeTooltipAttrs.expand : nativeTooltipAttrs.collapse;
                applyTooltipAttrs(caret, which);
            }
        };

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

        // Tag link-menus that anchor to a row (i.e. contain a drag-handle
        // somewhere inside) so our CSS overrides only apply to row-level
        // menus, leaving inline page-link popups (which share the
        // .link-menu class but lack a drag-handle) with their native
        // pill chrome intact.
        //
        // Descendant query (not :scope > ...) so newer Thymer builds that
        // wrap the drag-handle in an inner container still match.
        // Re-evaluated on every per-menu observer callback because Thymer
        // reuses a single .link-menu element across hovers and the
        // drag-handle's presence can change between anchorings.
        const tagRowMenu = (linkMenu) => {
            if (!linkMenu || !linkMenu.querySelector) return;
            // Broadened heuristic: any of the row-anchored native widgets
            // is conclusive evidence that this is a row-menu. The original
            // check was just .item-drag-handle, which missed brief windows
            // where Thymer mounts the popup DOM (with its
            // collapse/expand/zoom buttons) BEFORE the drag-handle lands
            // -- in that window our hide rules didn't match, so the
            // native zoom + chevron buttons were rendering inside the
            // both-on hover frame next to our caret/bullet (image 1).
            // Any of the four child types is unique to row-menus; inline
            // page-link popups (which reuse .link-menu) have none of them.
            const isRow = !!linkMenu.querySelector(
                '.item-drag-handle, .link-menu-action-collapse, '
                + '.link-menu-action-expand, .link-menu-action-zoom');
            linkMenu.classList.toggle('bt-row-menu', isRow);
        };

        // Pin the drag circle to the anchored row's FIRST-line midline via
        // JS-measured inline `top`. Necessary because Thymer positions the
        // `.link-menu` absolutely based on the hovered row, and for
        // last-in-hierarchy wrapped rows the popup's `top` isn't the row's
        // top (observed: ends up centered on the full row box, placing our
        // CSS `top: calc(1em - 14.5px)` offset on a later line). Measuring
        // the delta between `linkMenu.top` and `row.firstLineTop` lets the
        // alignment survive Thymer's positioning strategy for any row.
        // The existing CSS rule remains as a fallback for the first paint
        // and for the rare case where the anchored row can't be resolved.
        const DRAG_HANDLE_RADIUS = 13.5; // half of 27px circle
        // Measure the row's FIRST visible text line by walking to its
        // first non-empty text node and reading the first rect from
        // Range.getClientRects(). Returns { top, height } in viewport
        // coords, or null if no measurable text was found. Range-based
        // because getComputedStyle(row).lineHeight resolves to "normal"
        // for many Thymer rows (especially headings / wrapped body
        // text), which previously fell back to rowRect.height -- on
        // wrapped rows that's the FULL multi-line box, so the
        // computed firstLineMid landed at the row's vertical center
        // and the drag-circle ended up dropped to mid-row (image 2).
        const measureFirstTextLine = (row) => {
            const lineDiv = row.querySelector(':scope > .line-div') || row;
            // selectNodeContents() over the WHOLE line-div + reading
            // rects[0] returns the first visual line of the row's
            // content -- regardless of whether that content starts
            // with a text node, an inline element (page-link, mention,
            // tag, etc.), or a mix. The previous TreeWalker approach
            // hopped to the first non-empty text node, which on rows
            // with leading inline elements landed on whatever line the
            // text BEGAN, not necessarily line 1 (observed in image 1
            // of the wrap-alignment report: the drag-circle sat at
            // line 2 because the first text node started after a
            // leading inline element that pushed it past line 1).
            const range = document.createRange();
            range.selectNodeContents(lineDiv);
            const rects = range.getClientRects();
            if (!rects || rects.length === 0) return null;
            // rects[0] = first visual line box. Height is the line's
            // computed line-height; top is the line's top edge.
            const r = rects[0];
            if (r.height <= 0) return null;
            return { top: r.top, height: r.height };
        };
        const alignDragHandleToFirstLine = (linkMenu) => {
            if (!linkMenu || !linkMenu.isConnected) return;
            // CSS rules that pin the drag handle are gated on bt-toggles
            // or bt-bullets -- match so we don't override the native look.
            if (!isEnabled) return;
            if (!isBulletsEnabled && !isTogglesEnabled) return;
            // Descendant query so newer Thymer builds that wrap the
            // drag-handle in an inner container still match. Earlier
            // ':scope > .item-drag-handle' missed those builds, the
            // function bailed early, and the drag-circle stayed at
            // Thymer's native row-center position on wrapped rows.
            const handle = linkMenu.querySelector('.item-drag-handle');
            if (!handle) return;
            const guid = linkMenu.getAttribute('data-guid');
            if (!guid) return;
            const row = document.querySelector(
                `.listitem[data-guid="${CSS.escape(guid)}"]`);
            if (!row || !row.isConnected) return;
            const menuRect = linkMenu.getBoundingClientRect();
            if (menuRect.height === 0) return;
            // Prefer the Range-based first-line measurement; fall back
            // to the row's full box midline only when the row has no
            // measurable text (rare: empty rows mid-creation).
            let firstLineMidY;
            const firstLine = measureFirstTextLine(row);
            if (firstLine) {
                firstLineMidY = firstLine.top + firstLine.height / 2;
            } else {
                const rowRect = row.getBoundingClientRect();
                if (rowRect.height === 0) return;
                firstLineMidY = rowRect.top + rowRect.height / 2;
            }
            const offsetTop = firstLineMidY - menuRect.top - DRAG_HANDLE_RADIUS;
            // Avoid layout thrash: skip re-writing when the value hasn't
            // changed meaningfully (sub-pixel noise on rapid repositions).
            const prev = parseFloat(handle.style.top);
            if (Number.isFinite(prev) && Math.abs(prev - offsetTop) < 0.5) return;
            handle.style.top = offsetTop + 'px';
            handle.style.bottom = 'auto';
        };

        // Per-menu style observer. Thymer re-uses a single `.link-menu`
        // across hovered rows by updating its inline `top`/`left` —
        // meaning a child-attach observer alone only catches the first
        // anchor. Watching `style` on each `.link-menu` catches the
        // subsequent re-anchors and keeps the drag circle pinned.
        const perMenuObservers = new WeakMap();
        const attachPerMenuObserver = (linkMenu) => {
            if (!linkMenu || perMenuObservers.has(linkMenu)) return;
            const obs = new MutationObserver(() => {
                if (this.isUnloaded) return;
                // Re-evaluate row-menu tagging on each callback. The
                // attribute filter (style/data-guid) fires on every
                // re-anchor, which is also when Thymer may have swapped
                // children into / out of this reused element. Cheap.
                tagRowMenu(linkMenu);
                // Also opportunistically retry tooltip + chevron capture.
                // Thymer's link-menu shows only collapse OR expand at a
                // time depending on row state; both are usually present
                // in DOM but if the first observation missed one, this
                // re-anchor pass catches it.
                if (!chevronsCaptured || !tooltipsCaptured) {
                    captureNativeTooltips(linkMenu);
                }
                alignDragHandleToFirstLine(linkMenu);
            });
            obs.observe(linkMenu, {
                attributes: true,
                attributeFilter: ['style', 'data-guid'],
                // childList so we re-tag on direct child changes (e.g.
                // Thymer toggling action buttons in/out per anchor type).
                // subtree so newer builds that wrap the drag-handle /
                // action buttons in an inner container still trigger
                // tagRowMenu when the row-anchored widgets land late.
                childList: true,
                subtree: true,
            });
            perMenuObservers.set(linkMenu, obs);
        };
        const onLinkMenuAdded = (linkMenu) => {
            reorderLinkMenu(linkMenu);
            tagRowMenu(linkMenu);
            attachPerMenuObserver(linkMenu);
            // Harvest the native tooltip attributes + chevron clones off
            // this menu's action buttons. First successful capture triggers
            // a sweep across every existing .listitem's marker.
            captureNativeTooltips(linkMenu);
            // rAF so Thymer's initial inline top/left are in place before
            // we measure (style is assigned after insertion in some paths).
            requestAnimationFrame(() => alignDragHandleToFirstLine(linkMenu));
        };
        const detachPerMenuObserver = (linkMenu) => {
            const obs = perMenuObservers.get(linkMenu);
            if (!obs) return;
            try { obs.disconnect(); } catch (_) {}
            perMenuObservers.delete(linkMenu);
            // Strip our row-menu tag so a reused .link-menu doesn't
            // carry stale state into the next observation cycle.
            if (linkMenu.classList) linkMenu.classList.remove('bt-row-menu');
            // Also strip our inline overrides so a reused .link-menu
            // doesn't carry stale positioning into the next hover.
            const handle = linkMenu.querySelector
                ? linkMenu.querySelector('.item-drag-handle')
                : null;
            if (handle) {
                handle.style.top = '';
                handle.style.bottom = '';
            }
        };
        const linkMenuObserver = new MutationObserver((mutations) => {
            if (this.isUnloaded) return;
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (!(node instanceof Element)) continue;
                    if (node.classList && node.classList.contains('link-menu')) {
                        onLinkMenuAdded(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('.link-menu').forEach(onLinkMenuAdded);
                    }
                }
                for (const node of m.removedNodes) {
                    if (!(node instanceof Element)) continue;
                    if (node.classList && node.classList.contains('link-menu')) {
                        detachPerMenuObserver(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('.link-menu').forEach(detachPerMenuObserver);
                    }
                }
            }
        });
        linkMenuObserver.observe(outlineTarget, { childList: true, subtree: true });
        // Bootstrap any .link-menu nodes already present at load.
        outlineTarget.querySelectorAll('.link-menu').forEach(onLinkMenuAdded);
        this.cleanupMethods.push(() => {
            linkMenuObserver.disconnect();
            // Tear down every per-menu observer + clear inline overrides
            // so the plugin leaves no residual positioning behind.
            document.querySelectorAll('.link-menu').forEach(detachPerMenuObserver);
        });

        // Prime Thymer's link-menu so our chevron / triggerNativeFold work
        // from the first click. Thymer creates the popup lazily on first
        // user hover; before that, document.querySelectorAll('.link-menu')
        // returns empty and tryClickAction() inside triggerNativeFold
        // silently fails. The user-visible symptom: "chevron doesn't fold
        // until I use the native popup once first."
        //
        // Synthesize a hover sequence on the first visible .listitem at
        // init. If Thymer accepts synthetic events (no isTrusted gate),
        // it lazy-creates the link-menu and our captureNativeChevrons +
        // triggerNativeFold immediately have the DOM they need. If
        // Thymer's hover creation is gated on isTrusted, this is a safe
        // no-op — we leave nothing visibly different (we leave() right
        // after enter()). Either way, no regression on real user hover.
        const primeLinkMenu = () => {
            if (this.isUnloaded) return;
            // Already primed — bail.
            if (document.querySelector('.link-menu')) return;
            const li = outlineTarget.querySelector('.listitem');
            if (!li) return;
            const r = li.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            const cx = r.right - 10;
            const cy = r.top + r.height / 2;
            const opts = {
                bubbles: true, cancelable: true, composed: true,
                view: window, clientX: cx, clientY: cy,
            };
            const popts = Object.assign(
                { pointerId: 1, pointerType: 'mouse', isPrimary: true },
                opts,
            );
            const targets = [li, document.elementFromPoint(cx, cy)].filter(Boolean);
            try {
                for (const t of targets) {
                    t.dispatchEvent(new PointerEvent('pointerover', popts));
                    t.dispatchEvent(new PointerEvent('pointerenter', popts));
                    t.dispatchEvent(new MouseEvent('mouseover', opts));
                    t.dispatchEvent(new MouseEvent('mouseenter', opts));
                    t.dispatchEvent(new PointerEvent('pointermove', popts));
                    t.dispatchEvent(new MouseEvent('mousemove', opts));
                }
            } catch (_) {}
            // Leave on the next tick so Thymer has time to react. We
            // don't want the row visibly highlighted on session start.
            setTimeout(() => {
                if (this.isUnloaded) return;
                try {
                    for (const t of targets.slice().reverse()) {
                        t.dispatchEvent(new MouseEvent('mouseleave', opts));
                        t.dispatchEvent(new MouseEvent('mouseout', opts));
                        t.dispatchEvent(new PointerEvent('pointerleave', popts));
                        t.dispatchEvent(new PointerEvent('pointerout', popts));
                    }
                } catch (_) {}
            }, 16);
        };
        // Run once shortly after the outline settles. The 1500ms delay
        // matches the existing post-load outline init pass so we don't
        // race the first row paint.
        const primeTimer = setTimeout(primeLinkMenu, 1500);
        this.cleanupMethods.push(() => clearTimeout(primeTimer));

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
                    // Source of truth is Thymer's `.listitem-folded` —
                    // our own `.bt-collapsed` can drift if the user
                    // folds via keyboard shortcut or native UI between
                    // our clicks. Driving off listitem-folded keeps
                    // the direction right across all entry points.
                    const shouldCollapse = !li.classList.contains('listitem-folded');
                    // Optimistic chevron glyph flip for responsiveness.
                    // Full class sync (listitem-folded → bt-collapsed)
                    // happens via updateCaretIcon on the next outline
                    // pass once Thymer applies the native action.
                    // Route through setCaretChevron so both render paths
                    // stay consistent: in the native-clone path we swap
                    // the cloned chevron node, and in the Tabler-fallback
                    // path we toggle the icon-font classes. The previous
                    // unconditional class-toggle piled `ti-chevron-right`
                    // onto the wrapper while the cloned glyph was still
                    // inside, double-rendering as a stray block.
                    const caretEl = li.querySelector(':scope > .bt-marker > .bt-caret');
                    if (caretEl) setCaretChevron(caretEl, shouldCollapse);
                    triggerNativeFold(li, shouldCollapse);
                    // Let Thymer apply listitem-folded, then re-sync our
                    // mirror class + caret + has-children stickiness.
                    scheduleOutlinePass();
                }
                return;
            }
        };

        outlineTarget.addEventListener('click', outlineClickHandler, true);
        this.cleanupMethods.push(() => {
            outlineTarget.removeEventListener('click', outlineClickHandler, true);
        });

        // Mirror drag-handle hover onto the anchored .listitem via the
        // `bt-drag-hover` class. .link-menu (drag-handle's parent) is
        // absolutely positioned outside .listitem's DOM subtree, so
        // CSS :hover on the row drops the moment the cursor crosses
        // onto the drag circle. Track the most recently hovered
        // .listitem and reuse it as the anchor when the cursor is on
        // the drag circle — more robust than resolving via the
        // link-menu's data-guid (which can be stale or absent when
        // Thymer is mid-repositioning the popup).
        let lastHoveredLi = null;
        let lastDragHoverLi = null;
        const clearDragHover = () => {
            if (lastDragHoverLi) {
                lastDragHoverLi.classList.remove('bt-drag-hover');
                lastDragHoverLi = null;
            }
        };
        const onAnyMouseOver = (e) => {
            const t = e.target;
            if (!t || !t.closest) return;
            // Remember any listitem we pass through so we can reuse it
            // as the anchor when the pointer leaves .listitem for
            // .item-drag-handle (a DOM-disjoint sibling).
            const li = t.closest('.listitem');
            if (li) lastHoveredLi = li;
            if (!isEnabled || !isTogglesEnabled || !isBulletsEnabled) return;
            const dh = t.closest('.item-drag-handle');
            if (!dh) {
                // Mouse is somewhere other than the drag-handle — let
                // CSS :hover drive the rectangle.
                clearDragHover();
                return;
            }
            // Prefer the link-menu's data-guid (the row it's anchored
            // to); fall back to the last-hovered listitem if the menu
            // hasn't got a guid yet or the lookup fails.
            let anchor = null;
            const menu = dh.closest('.link-menu');
            const guid = menu && menu.getAttribute('data-guid');
            if (guid) {
                anchor = document.querySelector(
                    `.listitem[data-guid="${CSS.escape(guid)}"]`);
            }
            if (!anchor) anchor = lastHoveredLi;
            if (!anchor) return;
            if (anchor === lastDragHoverLi) return;
            clearDragHover();
            anchor.classList.add('bt-drag-hover');
            lastDragHoverLi = anchor;
        };
        const onAnyMouseOut = (e) => {
            if (!lastDragHoverLi) return;
            const to = e.relatedTarget;
            // Still inside the drag-handle or the anchored listitem →
            // keep the class.
            if (to && to.closest) {
                if (to.closest('.item-drag-handle')) return;
                if (to.closest('.listitem') === lastDragHoverLi) return;
            }
            clearDragHover();
        };
        document.addEventListener('mouseover', onAnyMouseOver, true);
        document.addEventListener('mouseout', onAnyMouseOut, true);
        this.cleanupMethods.push(() => {
            document.removeEventListener('mouseover', onAnyMouseOver, true);
            document.removeEventListener('mouseout', onAnyMouseOut, true);
            clearDragHover();
            lastHoveredLi = null;
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

        // Keyboard-active tracker. Toggle a body class on/off so the
        // both-on hover-frame paint rule (gated on
        // :not(.bt-keyboard-active) in CSS) suppresses while the user
        // is navigating/typing. Mirrors Thymer's native popup, which
        // hides on keyboard interaction. Cleared on the next mousemove
        // so the frame restores as soon as the mouse moves -- with no
        // movement the frame stays hidden, preventing a stale :hover
        // state on a row the user moved away from with arrow keys.
        const setKeyboardActive = () => {
            if (this.isUnloaded) return;
            document.body.classList.add('bt-keyboard-active');
        };
        const clearKeyboardActive = () => {
            if (this.isUnloaded) return;
            document.body.classList.remove('bt-keyboard-active');
        };
        document.addEventListener('keydown', setKeyboardActive, true);
        document.addEventListener('mousemove', clearKeyboardActive, true);
        this.cleanupMethods.push(() => {
            document.removeEventListener('keydown', setKeyboardActive, true);
            document.removeEventListener('mousemove', clearKeyboardActive, true);
            document.body.classList.remove('bt-keyboard-active');
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
            currentThreadParents = [];
            activeHighlights.length = 0;
            statusBarItem = null;
        });

        const updateSettings = (newSettings) => {
            // Mirror the same validation we apply when reading from
            // localStorage so a bogus value sent from the settings panel
            // (or a future external caller) can't put the plugin into an
            // invalid state.
            if (newSettings.currentScheme !== undefined
                && colorSchemes[newSettings.currentScheme]) {
                currentScheme = newSettings.currentScheme;
            }
            if (newSettings.currentWidth !== undefined) {
                currentWidth = clampNum(parseFloat(newSettings.currentWidth), 0, 4, currentWidth);
            }
            if (newSettings.activeWidth !== undefined) {
                activeWidth = clampNum(parseFloat(newSettings.activeWidth), 0, 4, activeWidth);
            }
            if (newSettings.currentOpacity !== undefined) {
                currentOpacity = clampNum(parseFloat(newSettings.currentOpacity), 0, 1, currentOpacity);
            }
            if (newSettings.isEnabled !== undefined) isEnabled = !!newSettings.isEnabled;
            if (newSettings.threadingMode !== undefined
                && (newSettings.threadingMode === 'staircase'
                    || newSettings.threadingMode === 'stretched')) {
                threadingMode = newSettings.threadingMode;
            }
            if (newSettings.isBulletsEnabled !== undefined) isBulletsEnabled = !!newSettings.isBulletsEnabled;
            if (newSettings.isTogglesEnabled !== undefined) isTogglesEnabled = !!newSettings.isTogglesEnabled;
            if (newSettings.isHoverFrameEnabled !== undefined) isHoverFrameEnabled = !!newSettings.isHoverFrameEnabled;
            if (newSettings.isRememberFoldsEnabled !== undefined) {
                const prev = isRememberFoldsEnabled;
                isRememberFoldsEnabled = !!newSettings.isRememberFoldsEnabled;
                // Transitioning OFF → flush any pending save; the in-memory
                // set stays intact so turning it back on recovers history.
                if (prev && !isRememberFoldsEnabled) {
                    saveFoldedSetImmediate();
                }
            }
            if (newSettings.isHideEmptyMarkersEnabled !== undefined) {
                isHideEmptyMarkersEnabled = !!newSettings.isHideEmptyMarkersEnabled;
            }
            if (newSettings.bulletColorMode !== undefined
                && (newSettings.bulletColorMode === 'neutral'
                    || newSettings.bulletColorMode === 'hover'
                    || newSettings.bulletColorMode === 'always')) {
                bulletColorMode = newSettings.bulletColorMode;
            }
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
                    isEnabled, threadingMode, isBulletsEnabled, isTogglesEnabled,
                    bulletColorMode, isHoverFrameEnabled,
                    isRememberFoldsEnabled, isHideEmptyMarkersEnabled
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

        // Bulk fold/unfold commands — scoped to the currently-visible
        // editor. Uses triggerNativeFold so arrow-key navigation stays
        // correct after the batch.
        //
        // IMPORTANT: Defer the batch via setTimeout so the command
        // palette fully closes first. triggerNativeFold dispatches
        // synthetic pointer events at the row's viewport coordinates +
        // hit-tests via document.elementFromPoint; if the palette
        // overlay is still up it intercepts those events and the fold
        // no-ops. 50ms is enough for Thymer's palette close animation;
        // any remaining ms overlap is invisible to the user.
        const runBulkDeferred = (fn, emptyMsg) => setTimeout(() => {
            if (this.isUnloaded) return;
            const n = fn();
            if (n === 0 && this.ui && typeof this.ui.showToaster === 'function') {
                this.ui.showToaster({ message: emptyMsg, duration: 1500 });
            }
        }, 50);
        this.ui.addCommandPaletteCommand({
            label: "Fold All (top level) on this page",
            icon: "chevron-right",
            onSelected: () => runBulkDeferred(
                foldAllOnPage, 'Nothing to fold on this page'
            )
        });
        this.ui.addCommandPaletteCommand({
            label: "Unfold All on this page",
            icon: "chevron-down",
            onSelected: () => runBulkDeferred(
                unfoldAllOnPage, 'Nothing to unfold on this page'
            )
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
        document.querySelectorAll('.bt-thread-parent').forEach(el => el.classList.remove('bt-thread-parent'));
        document.body.classList.remove('ir-enabled', 'bt-bullets', 'bt-toggles',
            'ir-bullets-neutral', 'ir-bullets-hover', 'ir-bullets-always',
            'ir-guides-hidden', 'ir-hover-frame');

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

                /* Establish an inline-size container so nested rules can
                   adapt to the panel width rather than the viewport — the
                   settings panel can be docked narrow even when the
                   window is wide. 'width: 100%' is critical here: without
                   it, when the panel host is a flex item, container-type
                   collapses the element to its min-content width (one
                   word per line). */
                container-type: inline-size;
                container-name: ir-settings;
                width: 100%;
                box-sizing: border-box;

                padding: 24px clamp(14px, 4cqi, 28px) 40px;
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
                min-width: 140px;
                flex-shrink: 0;
            }
            .ir-slider-control {
                width: min(320px, 48%);
                min-width: 160px;
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
            .ir-preview-caret {
                position: absolute;
                width: 14px;
                height: 14px;
                display: grid;
                place-items: center;
                font-size: 12px;
                line-height: 0;
                color: var(--ir-text-secondary);
                background: transparent;
                opacity: 0.55;
                pointer-events: none;
                transition: opacity 0.15s, color 0.15s, transform 0.15s;
            }
            .ir-preview-bullet {
                position: absolute;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                box-sizing: border-box;
                border: 1px solid rgba(128,128,128,0.55);
                background: #888;
                opacity: 0.55;
                pointer-events: none;
                transition: background-color 0.15s, opacity 0.15s;
            }
            .ir-preview-legend {
                margin-top: 8px;
                font-size: 0.82em;
                color: var(--ir-text-secondary);
                opacity: 0.75;
            }
            /* Container-query-based responsiveness: the settings panel is
               often docked narrow inside Thymer even when the viewport is
               wide, so we adapt to the panel's own inline size. */
            @container ir-settings (max-width: 560px) {
                .ir-row {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 10px;
                }
                .ir-control,
                .ir-slider-control {
                    width: 100%;
                    min-width: 0;
                }
                .ir-card {
                    padding: 14px 14px 4px;
                    border-radius: 12px;
                }
                .ir-preview {
                    padding: 12px 14px 12px;
                    border-radius: 12px;
                }
                .ir-header { margin-bottom: 14px; }
                .ir-title { font-size: 1.2em; }
            }
            @container ir-settings (max-width: 380px) {
                .ir-settings { padding-top: 18px; padding-bottom: 28px; }
                .ir-card { padding: 12px 12px 2px; margin-bottom: 12px; }
                .ir-preview-canvas { height: 96px; }
                .ir-val-text { min-width: 44px; padding: 2px 8px; }
                .ir-header-copy { font-size: 0.9em; }
            }
            /* Fallback for environments without container-query support:
               fall back to viewport-based breakpoints so the panel still
               behaves reasonably. */
            @supports not (container-type: inline-size) {
                @media (max-width: 720px) {
                    .ir-settings { padding: 18px 16px 32px; }
                    .ir-row { flex-direction: column; align-items: stretch; }
                    .ir-control, .ir-slider-control { width: 100%; min-width: 0; }
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
            const barWidth = Math.max(0, parseFloat(s.currentWidth));
            const opacity = parseFloat(s.currentOpacity);
            // Mirror the production outline features so the preview reacts
            // live to the Bullets / Chevrons / Bullet Color toggles.
            const showToggles = !!s.isTogglesEnabled;
            const showBullets = !!s.isBulletsEnabled;
            const bulletColorMode = s.bulletColorMode || 'always';
            const CARET_W = 14;
            const BULLET_W = 10;
            const MARKER_GAP = 4;       // gap between bar and caret
            const CARET_BULLET_GAP = 2; // gap between caret and bullet
            const activeIdx = PREVIEW_ROWS - 1; // row labeled "Active item"

            // Draw 4 nested rows
            for (let i = 0; i < PREVIEW_ROWS; i++) {
                const marginLeft = i * INDENT_STEP + BASE_LEFT;
                const top = i * ROW_H + Math.floor((116 - PREVIEW_ROWS * ROW_H) / 2);
                const color = colors[i % colors.length] || '#888';
                const hasChildren = i < activeIdx; // rows 0..2 have descendants

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

                // Marker column (caret + bullet). Positioned absolutely
                // within the row so the text can shift right dynamically.
                let markerCursor = marginLeft + barWidth + MARKER_GAP;
                if (showToggles) {
                    const caret = document.createElement('div');
                    caret.className = 'ir-preview-caret';
                    caret.style.left = `${markerCursor}px`;
                    caret.style.top = `${(ROW_H - CARET_W) / 2}px`;
                    // Only render a chevron glyph on rows with descendants;
                    // keep the footprint so bullets stay column-aligned.
                    if (hasChildren) caret.textContent = '▾';
                    else caret.style.opacity = '0';
                    row.appendChild(caret);
                    markerCursor += CARET_W + CARET_BULLET_GAP;
                }
                if (showBullets) {
                    const dot = document.createElement('div');
                    dot.className = 'ir-preview-bullet';
                    dot.style.left = `${markerCursor}px`;
                    dot.style.top = `${(ROW_H - BULLET_W) / 2}px`;
                    // Map bullet-color-mode → fill. Hover mode previews as
                    // the active (focused) row being tinted, gray otherwise.
                    let fill = '#888';
                    if (bulletColorMode === 'always') fill = color;
                    else if (bulletColorMode === 'hover' && i === activeIdx) fill = color;
                    dot.style.backgroundColor = fill;
                    if (bulletColorMode !== 'neutral' && (bulletColorMode === 'always' || i === activeIdx)) {
                        dot.style.opacity = '0.9';
                    }
                    row.appendChild(dot);
                    markerCursor += BULLET_W;
                }

                // Placeholder text line — padding-left follows markerCursor
                // so text never overlaps the caret/bullet regardless of
                // which are enabled.
                const txt = document.createElement('div');
                txt.className = 'ir-preview-text';
                const textPad = (showToggles || showBullets)
                    ? markerCursor + 6
                    : marginLeft + barWidth + 10;
                txt.style.paddingLeft = `${textPad}px`;
                txt.textContent = i === 0 ? 'Top level item' : i === 1 ? '  Nested item' : i === 2 ? '    Deeper nesting' : '      Active item ←';
                row.appendChild(txt);

                previewCanvas.appendChild(row);
            }

            // Draw active threading arm(s) from row 0/1/2 down to row 3
            const activeWidth = Math.max(0, parseFloat(s.activeWidth));
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
        // 0.5 step allows a hairline-thin guide (matches activeWidth).
        widthSlider.step = '0.5';
        widthSlider.value = currentSettings.currentWidth;
        widthSlider.addEventListener('input', (e) => {
            currentSettings.currentWidth = parseFloat(e.target.value);
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
        // 0.5 step allows a hairline-thin active highlight (matches
        // the standard guide width control below).
        aWidthSlider.step = '0.5';
        aWidthSlider.value = currentSettings.activeWidth;
        aWidthSlider.addEventListener('input', (e) => {
            currentSettings.activeWidth = parseFloat(e.target.value);
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
            renderPreview(currentSettings);
        });
        outlineCard.appendChild(createField(
            'Workflowy Bullets',
            'Click a bullet to zoom into that row. Headings, text, and list items all get bullets.',
            bulletsCheckbox
        ));

        // Bullet Color mode (tri-state): neutral / hover / always.
        const bulletColorSelect = document.createElement('select');
        bulletColorSelect.className = 'ir-input cursor-pointer';
        const bulletColorOptions = [
            { value: 'neutral', label: 'Neutral (uniform gray)' },
            { value: 'hover',   label: 'Color active thread' },
            { value: 'always',  label: 'Color all parents' },
        ];
        const currentBulletColorMode = (currentSettings.bulletColorMode === 'neutral'
            || currentSettings.bulletColorMode === 'hover'
            || currentSettings.bulletColorMode === 'always')
            ? currentSettings.bulletColorMode
            : 'always';
        for (const o of bulletColorOptions) {
            const opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.label;
            opt.selected = currentBulletColorMode === o.value;
            bulletColorSelect.appendChild(opt);
        }
        bulletColorSelect.addEventListener('change', (e) => {
            currentSettings.bulletColorMode = e.target.value;
            api.updateSettings({ bulletColorMode: e.target.value });
            renderPreview(currentSettings);
        });
        outlineCard.appendChild(createField(
            'Bullet Color',
            'How the row bullet picks up your indent rainbow palette.',
            bulletColorSelect
        ));

        const togglesCheckbox = document.createElement('input');
        togglesCheckbox.type = 'checkbox';
        togglesCheckbox.className = 'ir-checkbox';
        togglesCheckbox.checked = !!currentSettings.isTogglesEnabled;
        togglesCheckbox.addEventListener('change', (e) => {
            currentSettings.isTogglesEnabled = e.target.checked;
            api.updateSettings({ isTogglesEnabled: e.target.checked });
            renderPreview(currentSettings);
        });
        outlineCard.appendChild(createField(
            'Disclosure Chevrons',
            'Show a chevron on rows that have sub-items; click to collapse / expand.',
            togglesCheckbox
        ));

        const hoverFrameCheckbox = document.createElement('input');
        hoverFrameCheckbox.type = 'checkbox';
        hoverFrameCheckbox.className = 'ir-checkbox';
        hoverFrameCheckbox.checked = !!currentSettings.isHoverFrameEnabled;
        hoverFrameCheckbox.addEventListener('change', (e) => {
            currentSettings.isHoverFrameEnabled = e.target.checked;
            api.updateSettings({ isHoverFrameEnabled: e.target.checked });
            renderPreview(currentSettings);
        });
        outlineCard.appendChild(createField(
            'Hover Frame',
            'Draw a subtle rectangle around the drag handle, chevron, and bullet on row hover. Only visible when both Workflowy Bullets and Disclosure Chevrons are enabled.',
            hoverFrameCheckbox
        ));

        const rememberFoldsCheckbox = document.createElement('input');
        rememberFoldsCheckbox.type = 'checkbox';
        rememberFoldsCheckbox.className = 'ir-checkbox';
        rememberFoldsCheckbox.checked = !!currentSettings.isRememberFoldsEnabled;
        rememberFoldsCheckbox.addEventListener('change', (e) => {
            currentSettings.isRememberFoldsEnabled = e.target.checked;
            api.updateSettings({ isRememberFoldsEnabled: e.target.checked });
        });
        outlineCard.appendChild(createField(
            'Remember Collapse State',
            'Restore your collapsed rows after page navigation or reload. Persists per-row (by lineItem id) in local storage.',
            rememberFoldsCheckbox
        ));

        const hideEmptyMarkersCheckbox = document.createElement('input');
        hideEmptyMarkersCheckbox.type = 'checkbox';
        hideEmptyMarkersCheckbox.className = 'ir-checkbox';
        hideEmptyMarkersCheckbox.checked = !!currentSettings.isHideEmptyMarkersEnabled;
        hideEmptyMarkersCheckbox.addEventListener('change', (e) => {
            currentSettings.isHideEmptyMarkersEnabled = e.target.checked;
            api.updateSettings({ isHideEmptyMarkersEnabled: e.target.checked });
        });
        outlineCard.appendChild(createField(
            'Hide Markers on Blank Lines',
            'Hide the bullet and fold chevron on rows with no text. The marker slot stays reserved so layout does not shift when you start typing.',
            hideEmptyMarkersCheckbox
        ));

        container.appendChild(outlineCard);

        element.appendChild(container);
    }
}
