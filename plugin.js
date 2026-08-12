class Plugin extends AppPlugin {
    onLoad() {
        this.STORAGE_KEY = 'thymer-indent-rainbow';
        this.INDENT_STEP = 30;
        this.PANEL_TYPE = 'thymer-ir-settings';

        this.PALETTES = {
            theme: [
                "var(--theme-accent, var(--button-primary-bg-color, #8b5cf6))",
                "var(--color-primary-400, var(--theme-accent, #a78bfa))",
                "var(--cmdpal-selected-bg-color, var(--theme-accent-subtle, #7c3aed))",
                "var(--button-secondary-bg-color, var(--color-bg-400, #64748b))",
                "var(--theme-text-secondary, var(--color-text-500, #94a3b8))"
            ],
            rainbow: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6"],
            ocean: ["#0077b6", "#00b4d8", "#48cae4", "#90e0ef", "#ade8f4", "#023e8a", "#0096c7"],
            sunset: ["#ff6b6b", "#ff8e53", "#feca57", "#ff9ff3", "#ee5a24", "#ff4757"],
            forest: ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2", "#b7e4c7", "#1b4332"],
            monochrome: ["#6b7280", "#9ca3af", "#d1d5db", "#4b5563", "#374151", "#e5e7eb", "#1f2937", "#f3f4f6"]
        };

        this.PALETTE_LABELS = {
            theme: 'Theme', rainbow: 'Rainbow', ocean: 'Ocean',
            sunset: 'Sunset', forest: 'Forest', monochrome: 'Monochrome'
        };

        this.DEFAULTS = { palette: 'rainbow', enabled: true, width: 1, opacity: 0.45 };

        this.settings = { ...this.DEFAULTS };
        try {
            const stored = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            this.settings = { ...this.DEFAULTS, ...stored };
            if (!this.PALETTES[this.settings.palette]) this.settings.palette = this.DEFAULTS.palette;
        } catch (e) {}

        this._styleEl = document.createElement('style');
        this._styleEl.textContent = `
:root { --thymer-ir-width: 1px; --thymer-ir-opacity: 0.45; }
body.thymer-ir-active .listitem-indentline {
    --line-height: 26px; --checkbox-size: 23.5px; --bullet-size: 10px;
    background-color: var(--thymer-ir-color, currentColor) !important;
    border-color: var(--thymer-ir-color, currentColor) !important;
    opacity: var(--thymer-ir-opacity, 0.45) !important;
    min-width: var(--thymer-ir-width, 1px) !important;
    width: var(--thymer-ir-width, 1px) !important;
    transition: opacity 0.15s ease, filter 0.15s ease, background-color 0.15s ease !important;
}
body.thymer-ir-active .listitem:hover .listitem-indentline {
    opacity: min(calc(var(--thymer-ir-opacity, 0.45) + 0.3), 0.9) !important;
    filter: brightness(1.2) !important;
}
.thymer-ir-settings { padding: 24px; max-width: 640px; margin: 0 auto; }
.thymer-ir-settings h2 { margin: 0 0 4px; font-size: 1.3em; }
.thymer-ir-settings .desc { margin: 0 0 24px; color: var(--theme-text-secondary, var(--color-text-secondary, inherit)); font-size: 0.95em; }
.thymer-ir-settings section { margin-bottom: 24px; }
.thymer-ir-settings h3 { margin: 0 0 10px; font-size: 1em; }
.thymer-ir-toggle { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--theme-border, rgba(128,128,128,0.18)); }
.thymer-ir-toggle input { width: 20px; height: 20px; accent-color: var(--theme-accent, #8b5cf6); }
.thymer-ir-palettes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.thymer-ir-palette-btn { text-align: left; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--theme-border, rgba(128,128,128,0.18)); background: transparent; color: inherit; cursor: pointer; font: inherit; }
.thymer-ir-palette-btn[data-selected="true"] { border-color: var(--theme-accent, #8b5cf6); background: color-mix(in srgb, var(--theme-accent, #8b5cf6) 10%, transparent); }
.thymer-ir-swatches { display: flex; gap: 4px; margin-top: 6px; }
.thymer-ir-swatches i { display: inline-block; width: 16px; height: 16px; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(128,128,128,0.2); }
.thymer-ir-slider-row { display: flex; align-items: center; gap: 12px; }
.thymer-ir-slider-row input[type="range"] { flex: 1; accent-color: var(--theme-accent, #8b5cf6); }
.thymer-ir-slider-val { min-width: 48px; text-align: right; font-weight: 600; font-size: 0.9em; }
@media (max-width: 600px) { .thymer-ir-palettes { grid-template-columns: 1fr; } }
        `;
        document.head.appendChild(this._styleEl);

        this._resizeHandler = () => this._scheduleUpdate();
        window.addEventListener('resize', this._resizeHandler);

        this._keyUpHandler = (e) => {
            if (['Tab', 'Enter', 'ArrowUp', 'ArrowDown'].includes(e.key)) this._scheduleUpdate();
        };
        document.addEventListener('keyup', this._keyUpHandler);

        this._observer = new MutationObserver(() => this._scheduleUpdate());
        this._observer.observe(document.body, {
            childList: true, subtree: true,
            attributes: true, attributeFilter: ['style', 'class', 'data-guid']
        });

        if (this.ui) {
            this.ui.registerCustomPanelType(this.PANEL_TYPE, (panel) => {
                panel.setTitle('Indent Rainbow Settings');
                this._settingsPanel = panel;
                this._renderSettings(panel);
            });

            const openSettings = async () => {
                const panel = await this.ui.createPanel();
                if (panel) panel.navigateToCustomType(this.PANEL_TYPE);
            };

            this.ui.addCommandPaletteCommand({
                label: 'Plugins: Indent Rainbow',
                icon: 'paint',
                onSelected: openSettings
            });

            this._statusBarItem = this.ui.addStatusBarItem({
                icon: 'paint',
                tooltip: 'Thymer Indent Rainbow - Click for settings',
                onClick: openSettings
            });
        }

        this._applySettings();
        this._updateColors();
    }

    _formatLabel(name) {
        return this.PALETTE_LABELS[name] || String(name).split(/[-_\s]+/).filter(Boolean)
            .map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    _saveSettings() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    }

    _updateSettings(next) {
        this.settings = { ...this.settings, ...next };
        this._saveSettings();
        this._applySettings();
        this._updateColors();
    }

    _applySettings() {
        document.documentElement.style.setProperty('--thymer-ir-width', `${this.settings.width}px`);
        document.documentElement.style.setProperty('--thymer-ir-opacity', String(this.settings.opacity));
        document.body.classList.toggle('thymer-ir-active', this.settings.enabled);
        if (this._statusBarItem?.setTooltip) {
            this._statusBarItem.setTooltip(`Thymer Indent Rainbow: ${this._formatLabel(this.settings.palette)} - Click for settings`);
        }
    }

    _getEditorContainer() {
        if (this._editorContainer && document.body.contains(this._editorContainer))
            return this._editorContainer;
        this._editorContainer =
            document.querySelector('.editor-wrapper, .page-content, #editor') || document.body;
        return this._editorContainer;
    }

    _getRows() {
        return [...this._getEditorContainer().querySelectorAll('.listitem[data-guid]')];
    }

    _getRowIndentMargin(row) {
        const lineDiv = row.querySelector('.line-div');
        const elements = [
            row.querySelector('.line-check-div'),
            row.querySelector('.line-bullet-div'),
            row.querySelector('.line-number-div'),
            row.querySelector('.line-chrome-ulist'),
            row.querySelector('.line-chrome-olist'),
            lineDiv,
            row
        ];
        for (const el of elements) {
            if (!el) continue;
            const inline = parseFloat(el.style?.marginLeft || '');
            if (isFinite(inline) && inline > 0) return inline;
            const computed = parseFloat(getComputedStyle(el).marginLeft);
            if (isFinite(computed) && computed > 0) return computed;
            const btIndent = parseFloat(getComputedStyle(el).getPropertyValue('--bt-indent') || '');
            if (isFinite(btIndent) && btIndent > 0) return btIndent;
        }
        return 0;
    }

    _isCodeBlockRow(row) {
        if (row.closest('.block-container-div.block-codelang, .block-container-div[class*="block-lang-"], .block-container-div[ns-type]'))
            return true;
        const classText = `${row.className || ''} ${row.querySelector('.line-div')?.className || ''}`;
        return /\b(?:listitem-code|codeblock|code-block|preformatted)\b/i.test(classText);
    }

    _updateColors() {
        const palette = this.PALETTES[this.settings.palette] || this.PALETTES[this.DEFAULTS.palette];
        for (const row of this._getRows()) {
            if (this._isCodeBlockRow(row)) {
                row.style.removeProperty('--thymer-ir-color');
                continue;
            }
            const depth = Math.max(0, Math.round(this._getRowIndentMargin(row) / this.INDENT_STEP));
            row.style.setProperty('--thymer-ir-color', palette[depth % palette.length]);
        }
    }

    _scheduleUpdate() {
        if (this._rafId) return;
        this._rafId = requestAnimationFrame(() => { this._rafId = 0; this._updateColors(); });
    }

    _renderSettings(panel) {
        const el = panel.getElement();
        if (!el) return;
        el.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'thymer-ir-settings';

        const header = document.createElement('header');
        header.innerHTML = '<h2>Indent Rainbow</h2>';
        const desc = document.createElement('p');
        desc.className = 'desc';
        desc.textContent = 'Color-code your indent guides by nesting depth.';
        header.appendChild(desc);
        container.appendChild(header);

        const toggleSection = document.createElement('section');
        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'thymer-ir-toggle';
        const toggleText = document.createElement('span');
        toggleText.textContent = 'Enable indent rainbow';
        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.checked = this.settings.enabled;
        toggleInput.addEventListener('change', () => {
            this._updateSettings({ enabled: toggleInput.checked });
        });
        toggleLabel.appendChild(toggleText);
        toggleLabel.appendChild(toggleInput);
        toggleSection.appendChild(toggleLabel);
        container.appendChild(toggleSection);

        const paletteSection = document.createElement('section');
        const paletteHeading = document.createElement('h3');
        paletteHeading.textContent = 'Color palette';
        paletteSection.appendChild(paletteHeading);
        const paletteGrid = document.createElement('div');
        paletteGrid.className = 'thymer-ir-palettes';

        Object.keys(this.PALETTES).forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'thymer-ir-palette-btn';
            btn.type = 'button';
            btn.dataset.selected = this.settings.palette === key ? 'true' : 'false';
            const label = document.createElement('strong');
            label.textContent = this._formatLabel(key);
            btn.appendChild(label);
            const swatches = document.createElement('div');
            swatches.className = 'thymer-ir-swatches';
            this.PALETTES[key].forEach(color => {
                const swatch = document.createElement('i');
                swatch.style.background = color;
                swatches.appendChild(swatch);
            });
            btn.appendChild(swatches);
            btn.addEventListener('click', () => {
                paletteGrid.querySelectorAll('.thymer-ir-palette-btn').forEach(b => {
                    b.dataset.selected = b === btn ? 'true' : 'false';
                });
                this._updateSettings({ palette: key });
            });
            paletteGrid.appendChild(btn);
        });
        paletteSection.appendChild(paletteGrid);
        container.appendChild(paletteSection);

        const widthSection = document.createElement('section');
        const widthHeading = document.createElement('h3');
        widthHeading.textContent = 'Line width';
        widthSection.appendChild(widthHeading);
        const widthRow = document.createElement('div');
        widthRow.className = 'thymer-ir-slider-row';
        const widthSlider = document.createElement('input');
        widthSlider.type = 'range';
        widthSlider.min = '0.5'; widthSlider.max = '3'; widthSlider.step = '0.5';
        widthSlider.value = String(this.settings.width);
        const widthVal = document.createElement('span');
        widthVal.className = 'thymer-ir-slider-val';
        widthVal.textContent = `${this.settings.width}px`;
        widthSlider.addEventListener('input', () => {
            const v = parseFloat(widthSlider.value);
            widthVal.textContent = `${v}px`;
            this._updateSettings({ width: v });
        });
        widthRow.appendChild(widthSlider);
        widthRow.appendChild(widthVal);
        widthSection.appendChild(widthRow);
        container.appendChild(widthSection);

        const opacitySection = document.createElement('section');
        const opacityHeading = document.createElement('h3');
        opacityHeading.textContent = 'Opacity';
        opacitySection.appendChild(opacityHeading);
        const opacityRow = document.createElement('div');
        opacityRow.className = 'thymer-ir-slider-row';
        const opacitySlider = document.createElement('input');
        opacitySlider.type = 'range';
        opacitySlider.min = '0'; opacitySlider.max = '1'; opacitySlider.step = '0.05';
        opacitySlider.value = String(this.settings.opacity);
        const opacityVal = document.createElement('span');
        opacityVal.className = 'thymer-ir-slider-val';
        opacityVal.textContent = `${Math.round(this.settings.opacity * 100)}%`;
        opacitySlider.addEventListener('input', () => {
            const v = parseFloat(opacitySlider.value);
            opacityVal.textContent = `${Math.round(v * 100)}%`;
            this._updateSettings({ opacity: v });
        });
        opacityRow.appendChild(opacitySlider);
        opacityRow.appendChild(opacityVal);
        opacitySection.appendChild(opacityRow);
        container.appendChild(opacitySection);

        el.appendChild(container);
    }

    onUnload() {
        if (this._observer) this._observer.disconnect();
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        if (this._keyUpHandler) document.removeEventListener('keyup', this._keyUpHandler);
        if (this._rafId) cancelAnimationFrame(this._rafId);
        if (this._styleEl) this._styleEl.remove();
        if (this._statusBarItem) this._statusBarItem.remove?.();
        this._settingsPanel = null;
        document.body.classList.remove('thymer-ir-active');
        document.documentElement.style.removeProperty('--thymer-ir-width');
        document.documentElement.style.removeProperty('--thymer-ir-opacity');
        document.querySelectorAll('.listitem[data-guid]').forEach(row => {
            row.style.removeProperty('--thymer-ir-color');
        });
    }
}
