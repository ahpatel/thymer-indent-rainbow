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
        // Keep track of resources to clean up later
        this.cleanupMethods = [];

        // Storage keys for persisting settings
        const STORAGE_KEY = 'indent-rainbow-scheme';
        const WIDTH_KEY = 'indent-rainbow-width';
        const ACTIVE_WIDTH_KEY = 'indent-rainbow-active-width';
        const OPACITY_KEY = 'indent-rainbow-opacity';
        const ENABLED_KEY = 'indent-rainbow-enabled';
        const THREADING_ENABLED_KEY = 'indent-rainbow-threading-enabled';
        const THREADING_MODE_KEY = 'indent-rainbow-threading-mode';

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
                    '#ffd700',  // Gold
                    '#ffc107',  // Amber
                    '#ffa000',  // Dark Amber
                    '#ff8f00',  // Light Amber
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

        // Reference to injected style element
        let styleElement = null;

        // Get saved settings or defaults
        let currentWidth = parseInt(localStorage.getItem(WIDTH_KEY)) || 2;
        let activeWidth = parseInt(localStorage.getItem(ACTIVE_WIDTH_KEY)) || 3;
        let currentOpacity = parseFloat(localStorage.getItem(OPACITY_KEY)) || 0.3;
        let isEnabled = localStorage.getItem(ENABLED_KEY) !== 'false'; // default true
        let isThreadingEnabled = localStorage.getItem(THREADING_ENABLED_KEY) !== 'false'; // default true
        let threadingMode = localStorage.getItem(THREADING_MODE_KEY) || 'staircase'; // 'staircase' or 'stretched'

        // Opacity presets
        const opacityPresets = {
            subtle: { name: 'Subtle', value: 0.2 },
            normal: { name: 'Normal', value: 0.3 },
            bold: { name: 'Bold', value: 0.45 }
        };

        // Generate CSS for a given color scheme
        const generateCSS = (schemeName) => {
            const scheme = colorSchemes[schemeName];
            const colors = scheme.colors;

            // Base styles with dynamic width and opacity
            let css = `
/* Thymer Indent Rainbow - ${scheme.name} Theme */

/* CSS Variables for theming */
:root {
    --bt-line-width: ${currentWidth}px;
    --bt-line-opacity: ${currentOpacity};
    --bt-line-opacity-hover: ${Math.min(currentOpacity + 0.5, 0.9)};
    --bt-transition-duration: 0.15s;
}

/* CRITICAL: Provide fallback values for Thymer's inline calc() expressions.
   Without these, height calculations like "calc(127px - var(--line-height))" resolve to 0.
   These are scoped to indent lines only to avoid affecting other Thymer elements. */
.listitem-indentline {
    --line-height: 26px;
    --checkbox-size: 23.5px;
    --bullet-size: 8px;
}

/* Base styling for indent lines - lighter by default */
.listitem-indentline {
    transition: opacity var(--bt-transition-duration) ease,
                filter var(--bt-transition-duration) ease,
                background-color var(--bt-transition-duration) ease,
                border-color var(--bt-transition-duration) ease !important;
    opacity: var(--bt-line-opacity) !important;
    min-width: var(--bt-line-width) !important;
    width: var(--bt-line-width) !important;
}

/* Ensure task and bullet indent lines have minimum height as safety net */
.listitem-task .listitem-indentline,
.listitem-ulist .listitem-indentline {
    min-height: 20px !important;
}

/* Ensure indent lines are visible for all item types */
.listitem-text .listitem-indentline,
.listitem-task .listitem-indentline,
.listitem-ulist .listitem-indentline {
    display: block !important;
    visibility: visible !important;
}

/* Highlight on hover - make the line darker/brighter */
.listitem:hover > .line-div > .listitem-indentline,
.listitem:hover > .line-check-div ~ .line-div > .listitem-indentline {
    opacity: var(--bt-line-opacity-hover) !important;
    filter: brightness(1.2) !important;
}

/* Highlight on focus (cursor position) - strongest emphasis */
.bt-focused > .line-div > .listitem-indentline,
.bt-focused > .line-check-div ~ .line-div > .listitem-indentline {
    opacity: 1 !important;
    filter: brightness(1.3) drop-shadow(0 0 2px currentColor) !important;
}

/* Color levels based on margin-left (30px increments) */
`;

            // Generate color rules for each indentation level
            // Level 0 is at margin-left: 0px, Level 1 at 30px, etc.
            for (let level = 0; level < 12; level++) {
                const marginLeft = level * 30;
                const colorIndex = level % colors.length;
                const color = colors[colorIndex];

                css += `
/* Level ${level + 1} (margin-left: ${marginLeft}px) */

/* Plain text and bullet items - margin on line-div */
.line-div[style*="margin-left: ${marginLeft}px"] > .listitem-indentline,
.line-div[style*="margin-left:${marginLeft}px"] > .listitem-indentline {
    background-color: ${color} !important;
    border-color: ${color} !important;
}

/* Task items - margin is on line-check-div, color the sibling line-div's indent line */
.line-check-div[style*="margin-left: ${marginLeft}px"] ~ .line-div > .listitem-indentline,
.line-check-div[style*="margin-left:${marginLeft}px"] ~ .line-div > .listitem-indentline {
    background-color: ${color} !important;
    border-color: ${color} !important;
}

/* Fallback for .listitem with margin-left */
.listitem[style*="margin-left: ${marginLeft}px"] .listitem-indentline,
.listitem[style*="margin-left:${marginLeft}px"] .listitem-indentline {
    background-color: ${color} !important;
    border-color: ${color} !important;
}
`;
            }

            // Additional hover effects for enhanced threading visibility
            css += `
/* Enhanced hover states - brighten the threading path */
.listitem:hover .line-div .listitem-indentline {
    filter: brightness(1.1);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
    :root {
        --bt-line-opacity: 0.35;
    }
    
    .listitem-indentline {
        filter: brightness(1.1);
    }
}

/* Support for Thymer's dark theme via class */
.dark .listitem-indentline,
[data-theme="dark"] .listitem-indentline {
    filter: brightness(1.1);
    --bt-line-opacity: 0.35;
}

/* Smooth animation when expanding/collapsing */
.listitem-indentline {
    transform-origin: top;
}
`;

            return css;
        };

        // Inject, update, or remove CSS
        const applySettings = () => {
            if (!isEnabled) {
                // Remove styles when disabled
                if (styleElement) {
                    styleElement.textContent = '';
                }
                return;
            }

            localStorage.setItem(STORAGE_KEY, currentScheme);
            localStorage.setItem(WIDTH_KEY, currentWidth);
            localStorage.setItem(ACTIVE_WIDTH_KEY, activeWidth);
            localStorage.setItem(OPACITY_KEY, currentOpacity);
            localStorage.setItem(ENABLED_KEY, isEnabled);
            localStorage.setItem(THREADING_ENABLED_KEY, isThreadingEnabled);
            localStorage.setItem(THREADING_MODE_KEY, threadingMode);

            const css = generateCSS(currentScheme);

            if (styleElement) {
                styleElement.textContent = css;
            } else {
                styleElement = this.ui.injectCSS(css);
            }
        };

        // Legacy wrapper for theme switching
        const applyColorScheme = (schemeName) => {
            currentScheme = schemeName;
            applySettings();
        };

        // Initial CSS injection
        applySettings();

        // =====================================================
        // Focus Tracking (Virtual Input Position Tracking)
        // =====================================================
        // Thymer uses a virtual input system where the browser's Selection API
        // always points to #editor-meta, not the actual list items.
        // We track focus by watching the virtualinput-wrapper's transform
        // position and using elementFromPoint to find the focused line.

        let currentFocusedItem = null;
        let rafPending = false;
        let virtualInputWrapper = null;
        let lastTransform = '';  // Cache to skip redundant updates

        // O(1) lookup for navigation keys
        const NAV_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace', 'Tab']);

        const updateFocusedItem = () => {
            rafPending = false;

            // Find the virtual input wrapper if not cached
            if (!virtualInputWrapper) {
                virtualInputWrapper = document.getElementById('virtualinput-wrapper');
            }

            if (!virtualInputWrapper) {
                return;
            }

            // Parse the transform to get cursor position
            const style = virtualInputWrapper.style.transform;

            // Skip if transform hasn't changed (cursor didn't move)
            if (style === lastTransform) {
                return;
            }
            lastTransform = style;

            const match = style.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);

            if (!match) {
                return;
            }

            const x = parseFloat(match[1]);
            const y = parseFloat(match[2]);

            // Use elementFromPoint to find what's at the cursor position
            // Add a small offset to ensure we hit the line content area
            const element = document.elementFromPoint(x + 50, y + 10);

            if (!element) {
                if (currentFocusedItem) {
                    currentFocusedItem.classList.remove('bt-focused');
                    currentFocusedItem = null;
                }
                return;
            }

            // Walk up to find parent .listitem
            let node = element;
            while (node && !node.classList?.contains('listitem')) {
                node = node.parentElement;
            }

            // Build helper to find thread parents
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
                    for (const child of el.children) {
                        if (child.classList.contains('line-div') || child.classList.contains('line-check-div')) {
                            if (child.style.marginLeft) return parseInt(child.style.marginLeft) || 0;
                        }
                    }
                    if (el.style.marginLeft) return parseInt(el.style.marginLeft) || 0;
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

            // Update focus class if the focused item changed
            if (node !== currentFocusedItem) {
                if (currentFocusedItem) {
                    currentFocusedItem.classList.remove('bt-focused');
                }
                if (node) {
                    node.classList.add('bt-focused');
                }
                currentFocusedItem = node;
            }

            // Clean up old highlights
            document.querySelectorAll('.bt-active-highlight').forEach(el => el.remove());

            if (!node || !isThreadingEnabled) return;

            const parents = getParents(node);
            if (!parents || parents.length === 0) return;

            // Optional: check if node is detached from DOM or hidden
            if (!document.body.contains(node) || node.offsetParent === null) return;

            // To avoid reflows in the loop, we could batch reads and writes, 
            // but for a single branch path it's usually < 10 items, so inline is fine.
            const highlightsToInsert = [];

            parents.forEach((p, index) => {
                // Staircase targets immediate child; stretched targets the completely deepest active node
                const targetNode = threadingMode === 'staircase'
                    ? (index === 0 ? node : parents[index - 1])
                    : node;

                const targetLineDiv = targetNode.querySelector('.line-div, .line-check-div') || targetNode;
                const targetRect = targetLineDiv.getBoundingClientRect();

                // If element has no height (hidden/collapsed display mode), ignore
                if (targetRect.height === 0) return;

                const targetY = targetRect.top + (targetRect.height / 2); // target middle of the bullet

                const parentLine = p.querySelector('.line-div') || p.querySelector('.line-check-div');
                const parentIndent = parentLine ? parentLine.querySelector('.listitem-indentline') : null;

                if (parentLine && parentIndent && parentIndent.parentElement) {
                    const parentRect = parentIndent.getBoundingClientRect();
                    const parentLineContainerRect = parentIndent.parentElement.getBoundingClientRect();

                    // Height from top of parent's line to middle of the target item's line
                    const height = targetY - parentRect.top;

                    // Width from the parent line to the target line vertically
                    const width = Math.max(14, targetRect.left - parentRect.left - 10);

                    // Only draw if we have a positive height (it's physically below the parent)
                    // and parent is actually visible
                    if (height > 0 && parentRect.height > 0) {
                        const highlight = document.createElement('div');
                        highlight.className = 'bt-active-highlight';

                        const style = getComputedStyle(parentIndent);
                        const color = style.backgroundColor;

                        highlight.style.position = 'absolute';
                        highlight.style.top = (parentRect.top - parentLineContainerRect.top) + 'px';
                        highlight.style.left = (parentRect.left - parentLineContainerRect.left) + 'px';
                        highlight.style.width = width + 'px'; // Width of the horizontal "elbow"
                        highlight.style.height = height + 'px';

                        highlight.style.borderLeft = `${activeWidth}px solid ${color}`;
                        highlight.style.borderBottom = `${activeWidth}px solid ${color}`;
                        highlight.style.borderBottomLeftRadius = '6px';
                        highlight.style.boxSizing = 'border-box';
                        highlight.style.backgroundColor = 'transparent';

                        highlight.style.zIndex = '10';
                        highlight.style.pointerEvents = 'none';

                        highlight.style.opacity = '1';
                        highlight.style.willChange = 'opacity, filter'; // Hint browser
                        highlight.style.filter = `brightness(1.5) drop-shadow(0 0 3px ${color})`;

                        highlightsToInsert.push({ parent: parentIndent.parentElement, el: highlight });
                    }
                }
            });

            // Batch writes to avoid layout thrashing
            highlightsToInsert.forEach(h => h.parent.appendChild(h.el));
        };

        const scheduleUpdate = () => {
            // Debounce with RAF to batch with browser paint cycle
            if (!rafPending) {
                rafPending = true;
                requestAnimationFrame(updateFocusedItem);
            }
        };

        // Watch for changes to the virtual input wrapper's style (transform)
        const setupObserver = () => {
            virtualInputWrapper = document.getElementById('virtualinput-wrapper');

            if (!virtualInputWrapper) {
                // Retry until the wrapper exists
                setTimeout(setupObserver, 100);
                return;
            }

            // Observe style attribute changes on the virtual input wrapper
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.attributeName === 'style') {
                        scheduleUpdate();
                    }
                }
            });

            observer.observe(virtualInputWrapper, {
                attributes: true,
                attributeFilter: ['style']
            });

            this.cleanupMethods.push(() => observer.disconnect());

            // Initial update
            scheduleUpdate();
        };

        // Start observing
        setupObserver();

        // Also listen for keyboard events as backup (O(1) Set lookup)
        const keyHandler = (e) => {
            if (NAV_KEYS.has(e.key)) {
                scheduleUpdate();
            }
        };
        document.addEventListener('keyup', keyHandler);
        this.cleanupMethods.push(() => document.removeEventListener('keyup', keyHandler));

        // Listen for clicks in editor area only, fallback to document
        const clickHandler = () => scheduleUpdate();
        const editorContainer = document.querySelector('.editor-wrapper, .page-content, #editor');
        if (editorContainer) {
            editorContainer.addEventListener('click', clickHandler);
            this.cleanupMethods.push(() => editorContainer.removeEventListener('click', clickHandler));
        } else {
            document.addEventListener('click', clickHandler);
            this.cleanupMethods.push(() => document.removeEventListener('click', clickHandler));
        }

        // Register the panel type
        this.ui.registerCustomPanelType("indent-rainbow-settings", (panel) => {
            this.renderSettingsUI(panel, {
                colorSchemes, opacityPresets,
                getSettings: () => ({ currentScheme, currentWidth, activeWidth, currentOpacity, isEnabled, isThreadingEnabled, threadingMode }),
                updateSettings: (newSettings) => {
                    if (newSettings.currentScheme !== undefined) currentScheme = newSettings.currentScheme;
                    if (newSettings.currentWidth !== undefined) currentWidth = parseInt(newSettings.currentWidth);
                    if (newSettings.activeWidth !== undefined) activeWidth = parseInt(newSettings.activeWidth);
                    if (newSettings.currentOpacity !== undefined) currentOpacity = parseFloat(newSettings.currentOpacity);
                    if (newSettings.isEnabled !== undefined) isEnabled = newSettings.isEnabled;
                    if (newSettings.isThreadingEnabled !== undefined) isThreadingEnabled = newSettings.isThreadingEnabled;
                    if (newSettings.threadingMode !== undefined) threadingMode = newSettings.threadingMode;
                    applySettings();
                }
            });
        });

        // Add a sidebar button to launch it
        this.ui.addSidebarItem({
            label: "Indent Rainbow",
            icon: "paint",
            tooltip: "Configure Indent Rainbow",
            onClick: async () => {
                const newPanel = await this.ui.createPanel();
                if (newPanel) {
                    newPanel.navigateToCustomType("indent-rainbow-settings");
                }
            }
        });
    }

    onUnload() {
        // Remove globally bound event listeners and unobserve mutation observers
        if (this.cleanupMethods) {
            this.cleanupMethods.forEach(cleanupFn => {
                try {
                    cleanupFn();
                } catch (e) {
                    console.warn('Failed to clean up plugin resource:', e);
                }
            });
            this.cleanupMethods = [];
        }

        // Manually destroy appended UI artifacts
        const existingHighlights = document.querySelectorAll('.bt-active-highlight');
        existingHighlights.forEach(el => el.remove());

        const focused = document.querySelectorAll('.bt-focused');
        focused.forEach(el => el.classList.remove('bt-focused'));

        // Delete style element injected into <head>
        const styleElement = document.querySelector('style[data-source="thymer-indent-rainbow"]');
        if (styleElement) {
            styleElement.remove();
        }
    }

    renderSettingsUI(panel, api) {
        const settings = api.getSettings();

        let schemeOptionsHtml = Object.keys(api.colorSchemes).map(key =>
            `<option value="${key}" ${settings.currentScheme === key ? 'selected' : ''}>${api.colorSchemes[key].name}</option>`
        ).join('');

        let opacityOptionsHtml = Object.keys(api.opacityPresets).map(key =>
            `<option value="${api.opacityPresets[key].value}" ${settings.currentOpacity == api.opacityPresets[key].value ? 'selected' : ''}>${api.opacityPresets[key].name}</option>`
        ).join('');

        const html = `
            <div class="pm-container" style="padding: 20px; color: var(--text-color); font-family: var(--font-m); max-width: 600px; margin: 0 auto;">
                <div class="pm-header" style="margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <h2 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                        <i class="ti-paint"></i> Indent Rainbow Settings
                    </h2>
                </div>

                <div class="pm-card" style="padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <div>
                            <strong style="display: block;">Enable Indent Rainbow</strong>
                            <span style="font-size: 0.85em; color: var(--text-color-secondary);">Toggle the plugin on or off completely.</span>
                        </div>
                        <input type="checkbox" id="ir-enable" ${settings.isEnabled ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary-color); cursor: pointer;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;"><strong>Color Scheme</strong></label>
                        <select id="ir-scheme" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-color); cursor: pointer;">
                            ${schemeOptionsHtml}
                        </select>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;"><strong>Opacity</strong></label>
                        <select id="ir-opacity" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-color); cursor: pointer;">
                            ${opacityOptionsHtml}
                        </select>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <label><strong>Line Width</strong></label>
                            <span id="ir-width-val">${settings.currentWidth}px</span>
                        </div>
                        <input type="range" id="ir-width" min="1" max="4" step="1" value="${settings.currentWidth}" style="width: 100%; accent-color: var(--primary-color); cursor: pointer;">
                    </div>
                </div>

                <div class="pm-card" style="padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary);">
                    <h3 style="margin-top: 0; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <i class="ti-target"></i> Active Threading
                    </h3>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <div>
                            <strong style="display: block;">Enable Thread Highlighting</strong>
                            <span style="font-size: 0.85em; color: var(--text-color-secondary);">Highlight the path to the currently focused item.</span>
                        </div>
                        <input type="checkbox" id="ir-thread-enable" ${settings.isThreadingEnabled ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary-color); cursor: pointer;">
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;"><strong>Threading Style</strong></label>
                        <select id="ir-thread-style" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-color); cursor: pointer;">
                            <option value="staircase" ${settings.threadingMode === 'staircase' ? 'selected' : ''}>Staircase (Follows indentation path)</option>
                            <option value="stretched" ${settings.threadingMode === 'stretched' ? 'selected' : ''}>Stretched (Direct line from parent)</option>
                        </select>
                    </div>

                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <label><strong>Active Thread Width</strong></label>
                            <span id="ir-active-width-val">${settings.activeWidth}px</span>
                        </div>
                        <input type="range" id="ir-active-width" min="1" max="4" step="1" value="${settings.activeWidth}" style="width: 100%; accent-color: var(--primary-color); cursor: pointer;">
                    </div>
                </div>
            </div>
        `;

        const element = panel.getElement();
        if (element) {
            element.innerHTML = html;

            // Bind events
            element.querySelector('#ir-enable').addEventListener('change', (e) => {
                api.updateSettings({ isEnabled: e.target.checked });
            });

            element.querySelector('#ir-scheme').addEventListener('change', (e) => {
                api.updateSettings({ currentScheme: e.target.value });
            });

            element.querySelector('#ir-opacity').addEventListener('change', (e) => {
                api.updateSettings({ currentOpacity: e.target.value });
            });

            const widthSlider = element.querySelector('#ir-width');
            const widthVal = element.querySelector('#ir-width-val');
            widthSlider.addEventListener('input', (e) => {
                widthVal.textContent = e.target.value + 'px';
                api.updateSettings({ currentWidth: e.target.value });
            });

            element.querySelector('#ir-thread-enable').addEventListener('change', (e) => {
                api.updateSettings({ isThreadingEnabled: e.target.checked });
            });

            element.querySelector('#ir-thread-style').addEventListener('change', (e) => {
                api.updateSettings({ threadingMode: e.target.value });
            });

            const activeWidthSlider = element.querySelector('#ir-active-width');
            const activeWidthVal = element.querySelector('#ir-active-width-val');
            activeWidthSlider.addEventListener('input', (e) => {
                activeWidthVal.textContent = e.target.value + 'px';
                api.updateSettings({ activeWidth: e.target.value });
            });
        }
    }
}
