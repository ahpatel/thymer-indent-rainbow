"use strict";
var plugins = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // plugin.js
  var plugin_exports = {};
  __export(plugin_exports, {
    Plugin: () => Plugin
  });

  // plugin.css
  var plugin_default = '\n:root {\n	--flowythymer-indentline-width: 1px;\n	--flowythymer-indentline-opacity: 0.45;\n	--flowythymer-thread-stroke-width: 2px;\n}\n\nbody.flowythymer-retain-menu .link-menu.item-drag-handle-editor-style[data-guid].flowythymer-target-menu {\n	display: flex !important;\n	visibility: visible !important;\n	opacity: 0.7 !important;\n}\n\n.link-menu.item-drag-handle-editor-style[data-guid] {\n	margin-left: 20px !important;\n}\n\n.link-menu.item-drag-handle-editor-style[data-guid].flowythymer-menu-firstline {\n	translate: 0 var(--flowythymer-menu-offset-y, 0px);\n}\n\n.item-drag-handle.clickable.link-menu-opener[data-guid][data-mode="drag-handle-handle-editor"] {\n	translate: -14px 0;\n}\n\nbody.flowythymer-retain-menu .link-menu.item-drag-handle-editor-style[data-guid].flowythymer-target-menu.show-collapse > .link-menu-action-collapse,\nbody.flowythymer-retain-menu .link-menu.item-drag-handle-editor-style[data-guid].flowythymer-target-menu.show-expand > .link-menu-action-expand {\n	display: block !important;\n}\n\n.link-menu.item-drag-handle-editor-style[data-guid] > .link-menu-action-zoom {\n	display: none !important;\n}\n\nbody.flowythymer-native-bullets-only .link-menu.item-drag-handle-editor-style[data-guid] > .link-menu-action-zoom {\n	display: block !important;\n	margin-right: 6px;\n	opacity: 1 !important;\n	visibility: visible !important;\n}\n\n	body.flowythymer-native-bullets-only .link-menu.item-drag-handle-editor-style[data-guid] {\n	display: inline-flex;\n	align-items: flex-start;\n	gap: 10px;\n}\n\nbody.flowythymer-themed-indentlines .listitem-indentline {\n	--line-height: 26px;\n	--checkbox-size: 23.5px;\n	--bullet-size: 10px;\n	--flowythymer-indentline-offset: -16.5px;\n	--flowythymer-indentline-extension: calc((var(--line-height) / 2) + 5px);\n	background-color: var(--flowythymer-level-color, currentColor) !important;\n	border-color: var(--flowythymer-level-color, currentColor) !important;\n	opacity: var(--flowythymer-indentline-opacity, 0.45) !important;\n	min-width: var(--flowythymer-indentline-width, 1px) !important;\n	width: var(--flowythymer-indentline-width, 1px) !important;\n	box-shadow: 0 calc(var(--flowythymer-indentline-extension) * -1) 0 0 var(--flowythymer-level-color, currentColor);\n	transform: translateX(var(--flowythymer-indentline-offset)) !important;\n}\n\nbody.flowythymer-themed-indentlines .listitem-ulist .listitem-indentline {\n	--flowythymer-indentline-offset: -10px;\n}\n\nbody.flowythymer-themed-indentlines .listitem-olist .listitem-indentline {\n	--flowythymer-indentline-offset: -19px;\n}\n\nbody.flowythymer-themed-indentlines .listitem-quote .listitem-indentline,\nbody.flowythymer-themed-indentlines .listitem[class*="quote"] .listitem-indentline {\n	--flowythymer-indentline-offset: -18px;\n}\n\nbody.flowythymer-themed-indentlines.flowythymer-native-bullets-only .listitem-indentline {\n	--flowythymer-indentline-offset: 1px;\n}\n\nbody.flowythymer-themed-indentlines.flowythymer-native-bullets-only .listitem-ulist .listitem-indentline,\nbody.flowythymer-themed-indentlines.flowythymer-native-bullets-only .listitem-olist .listitem-indentline,\nbody.flowythymer-themed-indentlines.flowythymer-native-bullets-only .listitem-quote .listitem-indentline,\nbody.flowythymer-themed-indentlines.flowythymer-native-bullets-only .listitem[class*="quote"] .listitem-indentline {\n	--flowythymer-indentline-offset: -2px;\n}\n\nbody.flowythymer-themed-indentlines.flowythymer-native-bullets-only .listitem-ulist .listitem-indentline {\n	--flowythymer-indentline-offset: 8px;\n}\n\n.flowythymer-thread-path > .flowythymer-marker,\n.flowythymer-thread-target > .flowythymer-marker {\n	opacity: 1;\n	box-shadow:\n		0 0 0 4px rgb(var(--flowythymer-marker-ring-color, 139 92 246) / 28%),\n		0 0 8px rgb(var(--flowythymer-marker-ring-color, 139 92 246) / 35%),\n		inset 0 0 0 1.5px rgb(255 255 255 / 78%);\n}\n\n.flowythymer-thread-connector {\n	position: absolute;\n	left: var(--flowythymer-thread-x);\n	top: var(--flowythymer-thread-y);\n	width: var(--flowythymer-thread-width, 24px);\n	height: var(--flowythymer-thread-height, 14px);\n	border-left: var(--flowythymer-thread-stroke-width, 2px) solid var(--flowythymer-level-color, currentColor);\n	border-bottom: var(--flowythymer-thread-stroke-width, 2px) solid var(--flowythymer-level-color, currentColor);\n	border-bottom-left-radius: 8px;\n	opacity: 0;\n	pointer-events: none;\n	z-index: 18;\n	box-sizing: border-box;\n	filter: drop-shadow(0 0 2px var(--flowythymer-level-color, currentColor));\n}\n\n.flowythymer-indent-extension {\n	position: absolute;\n	left: calc(var(--flowythymer-indent-extension-x) - (var(--flowythymer-indentline-width, 1px) / 2));\n	top: var(--flowythymer-indent-extension-y);\n	width: var(--flowythymer-indentline-width, 1px);\n	height: var(--flowythymer-indent-extension-height, 0px);\n	background-color: var(--flowythymer-level-color, currentColor);\n	opacity: var(--flowythymer-indentline-opacity, 0.45);\n	pointer-events: none;\n	z-index: 8;\n}\n\n.flowythymer-thread-path > .flowythymer-thread-connector,\n.flowythymer-thread-target > .flowythymer-thread-connector {\n	opacity: 0.95;\n}\n\nbody.flowythymer-activethread-disabled .flowythymer-thread-path > .flowythymer-thread-connector,\nbody.flowythymer-activethread-disabled .flowythymer-thread-target > .flowythymer-thread-connector {\n	opacity: 0 !important;\n}\n\nbody.flowythymer-activethread-disabled .flowythymer-thread-path > .flowythymer-marker,\nbody.flowythymer-activethread-disabled .flowythymer-thread-target > .flowythymer-marker {\n	box-shadow:\n		0 0 0 3px rgb(var(--flowythymer-marker-ring-color, 139 92 246) / 18%),\n		inset 0 0 0 1.5px rgb(255 255 255 / 70%) !important;\n}\n\nbody.flowythymer-native-bullets-only .flowythymer-marker {\n	opacity: 0 !important;\n	pointer-events: none !important;\n}\n\nbody.flowythymer-retain-menu .link-menu.item-drag-handle-editor-style[data-guid].flowythymer-target-menu.show-collapse > .link-menu-action-expand,\nbody.flowythymer-retain-menu .link-menu.item-drag-handle-editor-style[data-guid].flowythymer-target-menu.show-expand > .link-menu-action-collapse {\n	display: none !important;\n}\n\n.listitem.flowythymer-row {\n	position: relative;\n}\n\n.flowythymer-marker {\n	position: absolute;\n	left: var(--flowythymer-marker-x);\n	top: var(--flowythymer-marker-y);\n	width: var(--flowythymer-marker-size, 12px);\n	height: var(--flowythymer-marker-size, 12px);\n	border-radius: 999px;\n	background: var(--flowythymer-marker-color, #8b5cf6);\n	box-shadow:\n		0 0 0 3px rgb(var(--flowythymer-marker-ring-color, 139 92 246) / 18%),\n		inset 0 0 0 1.5px rgb(255 255 255 / 70%);\n	opacity: 0.86;\n	pointer-events: auto;\n	cursor: zoom-in;\n	z-index: 20;\n	box-sizing: border-box;\n	transform: none;\n	transition: opacity 160ms ease, box-shadow 160ms ease;\n}\n\n.flowythymer-marker::after {\n	content: "";\n	position: absolute;\n	inset: -4px;\n	border-radius: 999px;\n	border: 1px solid rgb(var(--flowythymer-marker-ring-color, 139 92 246) / 45%);\n	opacity: 0;\n	box-sizing: border-box;\n}\n\n.flowythymer-marker-folded {\n	background: var(--flowythymer-marker-color, #8b5cf6);\n	opacity: 0.95;\n	box-shadow:\n		0 0 0 5px rgb(var(--flowythymer-marker-ring-color, 139 92 246) / 24%),\n		0 0 0 9px rgb(var(--flowythymer-marker-ring-color, 139 92 246) / 10%),\n		inset 0 0 0 1.5px rgb(255 255 255 / 78%);\n}\n\n.flowythymer-marker-folded::after {\n	opacity: 0.9;\n}\n\n.flowythymer-marker-blank {\n	opacity: 0;\n	transition: opacity 2.5s ease-out, box-shadow 160ms ease;\n}\n\n.listitem-with-caret.flowythymer-row > .flowythymer-marker-blank {\n	opacity: 0.52;\n	transition-duration: 120ms, 160ms;\n}\n\n.listitem.flowythymer-row.flowythymer-row-wrapped-guide .listitem-indentline {\n	opacity: 0 !important;\n	border-color: transparent !important;\n	background-color: transparent !important;\n	box-shadow: none !important;\n}\n\n.flowythymer-marker-blank.flowythymer-marker-hover {\n	opacity: 0.52;\n	transition-duration: 120ms, 160ms;\n}\n\n';

  // plugin.js
  var PALETTES = {
    theme: [
      "var(--theme-accent, var(--button-primary-bg-color, #8b5cf6))",
      "var(--color-primary-400, var(--theme-accent, #a78bfa))",
      "var(--cmdpal-selected-bg-color, var(--theme-accent-subtle, #7c3aed))",
      "var(--button-secondary-bg-color, var(--color-bg-400, #64748b))",
      "var(--theme-text-secondary, var(--color-text-500, #94a3b8))"
    ],
    rainbow: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6"],
    fire: ["#fef08a", "#facc15", "#fb923c", "#f97316", "#ef4444", "#b91c1c"],
    monochrome: ["#94a3b8", "#94a3b8", "#94a3b8", "#94a3b8", "#94a3b8"],
    grayscale: ["#f8fafc", "#cbd5e1", "#94a3b8", "#64748b", "#334155"],
    oceans: ["#67e8f9", "#22d3ee", "#06b6d4", "#0284c7", "#1d4ed8"],
    "spring flowers": ["#fb7185", "#f9a8d4", "#c084fc", "#a7f3d0", "#bef264"],
    soot: ["#8c5a36", "#5a6b6a", "#a65d5d", "#7a7369", "#8c7d6b", "#6b7280", "#b3924d", "#4a5c5c"]
  };
  var SETTINGS_STORAGE_KEY = "flowythymer-settings";
  var PANEL_TYPE = "flowythymer-settings";
  var DEFAULT_SETTINGS = {
    palette: "rainbow",
    indentLinesEnabled: true,
    indentLineWidth: 1,
    indentLineOpacity: 0.45,
    activeThread: true,
    activeThreadWidth: 2,
    activeThreadMode: "staircase",
    flowyThymerBulletsEnabled: true
  };
  var Plugin = class extends AppPlugin {
    static {
      __name(this, "Plugin");
    }
    onLoad() {
      this.settings = this.loadSettings();
      this.paletteName = this.settings.palette;
      this.activeThreadEnabled = this.settings.activeThread;
      this.styleElement = document.createElement("style");
      this.styleElement.dataset.flowythymer = "menu-retention";
      this.styleElement.textContent = plugin_default;
      document.head.appendChild(this.styleElement);
      this.retainedGuid = null;
      this.hoveredGuid = null;
      this.focusedGuid = null;
      this.markerRaf = 0;
      this.markerUpdateTimeout = 0;
      this.markerObserver = null;
      this.caretObserver = null;
      this.lastPointerPoint = null;
      this.pendingMarkerGuids = /* @__PURE__ */ new Set();
      this.fullMarkerRefreshRequested = true;
      this.viewportSyncRaf = 0;
      this.activeThreadTargets = /* @__PURE__ */ new Map();
      this.activeThreadRows = [];
      this.hoverLockGuid = null;
      this.pendingChevronIntent = null;
      this.statusBarItem = null;
      this.applySettingsState();
      this.getEditorContainer();
      this.flowythymerRetainMenu = (guid) => {
        return this.retainMenu(guid);
      };
      this.flowythymerClearRetainMenu = () => {
        this.clearRetainedMenu();
      };
      this.flowythymerToggleMenuState = (guid) => {
        return this.toggleMenuState(guid);
      };
      this.flowythymerSetPalette = (paletteName) => {
        this.updateSettings({ palette: paletteName });
        return this.settings.palette;
      };
      this.flowythymerSetActiveThread = (enabled) => {
        this.updateSettings({ activeThread: enabled !== false });
        return this.settings.activeThread;
      };
      this.flowythymerOpenSettings = () => {
        return this.openSettingsPanel();
      };
      this.flowythymerEnableDiagnostics = () => {
        this.installDiagnostics();
        return true;
      };
      this.flowythymerInspectPointer = () => this.inspectPointer();
      this.clickHandler = (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        this.captureChevronIntent(event);
        const marker = target.closest(".flowythymer-marker[data-guid]");
        if (marker) {
          event.preventDefault();
          event.stopPropagation();
          this.zoomIntoMarkerRow(marker.getAttribute("data-guid"));
          return;
        }
        const action = target.closest(".link-menu-action-collapse, .link-menu-action-expand");
        const menu = action?.closest?.(".link-menu.item-drag-handle-editor-style[data-guid]");
        const guid = menu?.getAttribute("data-guid");
        if (!guid) {
          if (!this.isEventInsideRetainedRow(event)) this.clearRetainedMenu();
          return;
        }
        this.retainMenu(guid);
        requestAnimationFrame(() => {
          this.toggleMenuState(guid);
          this.scheduleMarkerUpdate();
          requestAnimationFrame(() => this.restoreChevronHover());
        });
      };
      document.addEventListener("click", this.clickHandler, true);
      this.pointerDownHandler = (event) => {
        this.captureChevronIntent(event);
      };
      document.addEventListener("pointerdown", this.pointerDownHandler, true);
      this.pointerMoveHandler = (event) => {
        this.lastPointerPoint = { x: event.clientX, y: event.clientY };
        const hoveredGuid = this.getResolvedHoverGuid(event.target, event.clientX, event.clientY);
        this.setHoveredGuid(hoveredGuid);
        if (!this.retainedGuid) return;
        if (!this.isPointInsideRetainedRow(event.clientX, event.clientY)) this.clearRetainedMenu();
      };
      document.addEventListener("pointermove", this.pointerMoveHandler, true);
      this.resizeHandler = () => {
        this.invalidateMarkerPositionCache();
        this.scheduleMarkerUpdate();
      };
      window.addEventListener("resize", this.resizeHandler, true);
      this.mobileViewportSyncHandler = () => {
        if (!this.shouldUseMobileMarkerLayout()) return;
        if (this.viewportSyncRaf) return;
        this.viewportSyncRaf = requestAnimationFrame(() => {
          this.viewportSyncRaf = 0;
          this.invalidateMarkerPositionCache();
          this.scheduleMarkerUpdate();
        });
      };
      window.addEventListener("scroll", this.mobileViewportSyncHandler, true);
      window.visualViewport?.addEventListener?.("scroll", this.mobileViewportSyncHandler, true);
      window.visualViewport?.addEventListener?.("resize", this.mobileViewportSyncHandler, true);
      this.keyDownHandler = (event) => {
        this.clearRetainedMenu();
        if (event.key !== "Tab") return;
        this.invalidateMarkerPositionCache();
        this.scheduleMarkerUpdate();
        requestAnimationFrame(() => {
          this.invalidateMarkerPositionCache();
          this.scheduleMarkerUpdate();
        });
        setTimeout(() => {
          this.invalidateMarkerPositionCache();
          this.scheduleMarkerUpdate();
        }, 50);
      };
      document.addEventListener("keydown", this.keyDownHandler, true);
      this.keyUpHandler = () => {
        if (this.updateFocusedGuid()) this.updateActiveThread();
      };
      document.addEventListener("keyup", this.keyUpHandler, true);
      this.registerSettingsEntryPoints();
      this.updateFocusedGuid();
      this.scheduleMarkerUpdate();
      const editorContainer = this.getEditorContainer();
      this.markerObserver = new MutationObserver((mutations) => {
        const focusChanged = this.updateFocusedGuid();
        if (focusChanged && !this.markerRaf) this.updateActiveThread();
        const relevantMutations = mutations.filter((mutation) => !this.isPluginIndentCorrectionMutation(mutation));
        if (!relevantMutations.length) return;
        if (this.isRowMoveInProgress()) {
          this.scheduleDeferredMarkerUpdate();
          return;
        }
        const affectedRows = this.getAffectedRowsFromMutations(relevantMutations);
        if (relevantMutations.some((mutation) => mutation.type === "childList" || mutation.attributeName === "style" || mutation.attributeName === "data-guid")) {
          this.invalidateIndentAlignmentCache(affectedRows);
        }
        this.scheduleMarkerUpdate(affectedRows);
      });
      this.markerObserver.observe(editorContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "data-guid"]
      });
      this.caretObserver = new MutationObserver((mutations) => {
        if (!mutations.some((mutation) => mutation.attributeName === "class")) return;
        const focusChanged = this.updateFocusedGuid();
        if (focusChanged || mutations.some((mutation) => mutation.target instanceof Element && mutation.target.classList.contains("listitem-with-caret"))) {
          this.updateActiveThread();
        }
      });
      this.caretObserver.observe(editorContainer, {
        attributes: true,
        subtree: true,
        attributeFilter: ["class"]
      });
    }
    retainMenu(guid) {
      document.querySelectorAll(".flowythymer-target-menu").forEach((menu2) => {
        menu2.classList.remove("flowythymer-target-menu");
      });
      const menu = document.querySelector(`.link-menu.item-drag-handle-editor-style[data-guid="${CSS.escape(guid)}"]`);
      menu?.classList.add("flowythymer-target-menu");
      document.body.classList.add("flowythymer-retain-menu");
      this.retainedGuid = menu ? guid : null;
      return Boolean(menu);
    }
    getDefaultSettings() {
      const custom = this.getConfiguration?.().custom || {};
      return this.normalizeSettings({
        ...DEFAULT_SETTINGS,
        palette: custom.palette ?? DEFAULT_SETTINGS.palette,
        indentLinesEnabled: custom.indentLinesEnabled ?? DEFAULT_SETTINGS.indentLinesEnabled,
        indentLineWidth: custom.indentLineWidth ?? DEFAULT_SETTINGS.indentLineWidth,
        indentLineOpacity: custom.indentLineOpacity ?? DEFAULT_SETTINGS.indentLineOpacity,
        activeThread: custom.activeThread ?? DEFAULT_SETTINGS.activeThread,
        activeThreadWidth: custom.activeThreadWidth ?? DEFAULT_SETTINGS.activeThreadWidth,
        activeThreadMode: custom.activeThreadMode ?? DEFAULT_SETTINGS.activeThreadMode,
        flowyThymerBulletsEnabled: custom.flowyThymerBulletsEnabled ?? custom.flowyThymeBulletsEnabled ?? DEFAULT_SETTINGS.flowyThymerBulletsEnabled
      });
    }
    normalizeSettings(settings) {
      const indentLineWidth = Number.parseFloat(settings?.indentLineWidth);
      const activeThreadWidth = Number.parseFloat(settings?.activeThreadWidth);
      const indentLineOpacity = Number.parseFloat(settings?.indentLineOpacity);
      const hasFlowyThymerBulletSetting = typeof settings?.flowyThymerBulletsEnabled === "boolean";
      const hasLegacyFlowyThymeBulletSetting = typeof settings?.flowyThymeBulletsEnabled === "boolean";
      const clampHalfStep = /* @__PURE__ */ __name((value, fallback) => {
        if (!Number.isFinite(value)) return fallback;
        return Math.min(3, Math.max(0, Math.round(value * 2) / 2));
      }, "clampHalfStep");
      return {
        palette: PALETTES[settings?.palette] ? settings.palette : DEFAULT_SETTINGS.palette,
        indentLinesEnabled: settings?.indentLinesEnabled !== false,
        indentLineWidth: clampHalfStep(indentLineWidth, DEFAULT_SETTINGS.indentLineWidth),
        indentLineOpacity: Number.isFinite(indentLineOpacity) ? Math.min(1, Math.max(0, indentLineOpacity)) : DEFAULT_SETTINGS.indentLineOpacity,
        activeThread: settings?.activeThread !== false,
        activeThreadWidth: clampHalfStep(activeThreadWidth, DEFAULT_SETTINGS.activeThreadWidth),
        activeThreadMode: settings?.activeThreadMode === "stretched" ? "stretched" : "staircase",
        flowyThymerBulletsEnabled: hasFlowyThymerBulletSetting ? settings.flowyThymerBulletsEnabled !== false : hasLegacyFlowyThymeBulletSetting ? settings.flowyThymeBulletsEnabled !== false : settings?.workflowyBulletsEnabled === true ? false : DEFAULT_SETTINGS.flowyThymerBulletsEnabled
      };
    }
    loadSettings() {
      let stored = {};
      try {
        stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}") || {};
      } catch (error) {
        stored = {};
      }
      localStorage.removeItem("flowythyme-settings");
      return this.normalizeSettings({ ...this.getDefaultSettings(), ...stored });
    }
    saveSettings() {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
      localStorage.removeItem("flowythyme-settings");
    }
    applySettingsState() {
      this.paletteName = this.settings.palette;
      this.activeThreadEnabled = this.settings.activeThread;
      document.documentElement.style.setProperty("--flowythymer-indentline-width", `${this.settings.indentLineWidth}px`);
      document.documentElement.style.setProperty("--flowythymer-indentline-opacity", String(this.settings.indentLineOpacity));
      document.documentElement.style.setProperty("--flowythymer-thread-stroke-width", `${this.settings.activeThreadWidth}px`);
      document.body.classList.toggle("flowythymer-themed-indentlines", this.settings.indentLinesEnabled);
      document.body.classList.toggle("flowythymer-native-bullets-only", !this.settings.flowyThymerBulletsEnabled);
      document.body.classList.toggle("flowythymer-activethread-disabled", !this.settings.activeThread);
      if (!this.activeThreadEnabled) {
        this.applyActiveThreadClasses(/* @__PURE__ */ new Set(), /* @__PURE__ */ new Set(), /* @__PURE__ */ new Map(), []);
      }
      if (this.statusBarItem?.setTooltip) {
        this.statusBarItem.setTooltip(`FlowyThymer \u2013 ${this.settings.palette}`);
      }
    }
    formatPaletteLabel(name) {
      return String(name || "").split(/[-_\s]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
    }
    updateSettings(nextSettings) {
      this.settings = this.normalizeSettings({ ...this.settings, ...nextSettings });
      this.colorRgbCache = /* @__PURE__ */ new Map();
      this.applySettingsState();
      this.saveSettings();
      this.updateFocusedGuid();
      this.invalidateMarkerPositionCache();
      this.scheduleMarkerUpdate();
      return this.settings;
    }
    registerSettingsEntryPoints() {
      if (!this.ui) return;
      this.ui.registerCustomPanelType(PANEL_TYPE, (panel) => {
        this.renderSettingsUI(panel);
      });
      this.statusBarItem = this.ui.addStatusBarItem({
        icon: "paint",
        tooltip: `FlowyThymer \u2013 ${this.settings.palette}`,
        onClick: /* @__PURE__ */ __name(() => this.openSettingsPanel(), "onClick")
      });
      this.ui.addCommandPaletteCommand({
        label: "FlowyThymer: Settings",
        icon: "paint",
        onSelected: /* @__PURE__ */ __name(() => this.openSettingsPanel(), "onSelected")
      });
    }
    async openSettingsPanel() {
      const panel = await this.ui?.createPanel?.();
      if (panel) panel.navigateToCustomType(PANEL_TYPE);
      return Boolean(panel);
    }
    renderSettingsUI(panel) {
      const element = panel.getElement();
      if (!element) return;
      element.innerHTML = "";
      const style = document.createElement("style");
      style.textContent = `
			.flowythymer-settings { --flowythymer-settings-surface: var(--theme-background-primary, var(--color-background-primary, Canvas)); --flowythymer-settings-surface-elevated: var(--theme-background-secondary, var(--color-background-secondary, color-mix(in srgb, Canvas 94%, CanvasText 6%))); --flowythymer-settings-surface-muted: color-mix(in srgb, var(--flowythymer-settings-surface) 72%, var(--flowythymer-settings-surface-elevated)); --flowythymer-settings-surface-strong: color-mix(in srgb, var(--flowythymer-settings-surface-elevated) 82%, var(--flowythymer-settings-surface)); --flowythymer-settings-border: var(--theme-border, var(--color-border, color-mix(in srgb, CanvasText 16%, transparent))); --flowythymer-settings-text: var(--theme-text-primary, var(--color-text-primary, CanvasText)); --flowythymer-settings-text-muted: var(--theme-text-secondary, var(--color-text-secondary, color-mix(in srgb, CanvasText 62%, transparent))); --flowythymer-settings-accent: var(--theme-accent, var(--color-accent, #8b5cf6)); padding: 24px; max-width: 820px; margin: 0 auto; color: var(--flowythymer-settings-text); font-family: var(--font-m, var(--font-primary, inherit)); }
			.flowythymer-settings-header { display: grid; gap: 10px; margin-bottom: 20px; }
			.flowythymer-settings-header h2 { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 1.35em; }
			.flowythymer-settings-header p { margin: 0; color: var(--flowythymer-settings-text-muted); line-height: 1.5; }
			.flowythymer-settings-summary { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
			.flowythymer-settings-chip { display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--flowythymer-settings-border) 72%, transparent); background: color-mix(in srgb, var(--flowythymer-settings-surface-elevated) 92%, var(--flowythymer-settings-surface)); color: var(--flowythymer-settings-text-muted); font-size: 0.9em; }
			.flowythymer-settings-chip strong { color: inherit; font-weight: 700; }
			.flowythymer-settings-grid { display: grid; gap: 16px; }
			.flowythymer-settings-card { padding: 18px; border: 1px solid color-mix(in srgb, var(--flowythymer-settings-border) 72%, transparent); border-radius: 16px; background: color-mix(in srgb, var(--flowythymer-settings-surface-elevated) 94%, var(--flowythymer-settings-surface)); box-shadow: 0 1px 2px color-mix(in srgb, CanvasText 8%, transparent); }
			.flowythymer-settings-card.flowythymer-settings-card-dependent { border-color: color-mix(in srgb, var(--flowythymer-settings-accent) 34%, var(--flowythymer-settings-border)); background: color-mix(in srgb, var(--flowythymer-settings-accent) 8%, var(--flowythymer-settings-surface-elevated)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--flowythymer-settings-accent) 12%, transparent); }
			.flowythymer-settings-card-header { display: grid; gap: 4px; margin-bottom: 14px; }
			.flowythymer-settings-card h3 { margin: 0; font-size: 1em; }
			.flowythymer-settings-card p { margin: 0; color: var(--flowythymer-settings-text-muted); line-height: 1.45; }
			.flowythymer-settings-inline-toggle { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 14px; border-radius: 14px; border: 1px solid color-mix(in srgb, var(--flowythymer-settings-border) 55%, transparent); background: color-mix(in srgb, var(--flowythymer-settings-surface-strong) 88%, var(--flowythymer-settings-surface)); }
			.flowythymer-settings-inline-toggle strong { font-size: 0.95em; }
			.flowythymer-settings-inline-toggle span { display: block; margin-top: 4px; color: var(--flowythymer-settings-text-muted); font-size: 0.9em; line-height: 1.4; }
			.flowythymer-settings-control-block { display: grid; gap: 10px; }
			.flowythymer-settings-input { width: 100%; min-height: 40px; padding: 8px 12px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--flowythymer-settings-border) 72%, transparent); background: var(--input-bg-color, var(--flowythymer-settings-surface)); color: var(--flowythymer-settings-text); font: inherit; }
			.flowythymer-settings-checkbox { width: 22px; height: 22px; accent-color: var(--flowythymer-settings-accent); flex-shrink: 0; }
			.flowythymer-settings-slider { width: 100%; }
			.flowythymer-settings-slider-meta { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px; color: var(--flowythymer-settings-text-muted); font-size: 0.92em; }
			.flowythymer-settings-pill { padding: 3px 10px; border-radius: 999px; background: color-mix(in srgb, var(--flowythymer-settings-accent) 14%, var(--flowythymer-settings-surface)); color: var(--flowythymer-settings-accent); font-weight: 700; font-size: 0.85em; }
			.flowythymer-settings-choice-layout { display: grid; grid-template-columns: 1fr; }
			.flowythymer-settings-choice-list { display: grid; gap: 8px; }
			.flowythymer-settings-choice { width: 100%; text-align: left; padding: 11px 12px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--flowythymer-settings-border) 72%, transparent); background: color-mix(in srgb, var(--flowythymer-settings-surface-strong) 92%, var(--flowythymer-settings-surface)); color: var(--flowythymer-settings-text); cursor: pointer; display: grid; gap: 4px; }
			.flowythymer-settings-choice[data-selected="true"] { border-color: color-mix(in srgb, var(--flowythymer-settings-accent) 65%, var(--flowythymer-settings-border)); background: color-mix(in srgb, var(--flowythymer-settings-accent) 10%, var(--flowythymer-settings-surface)); color: var(--flowythymer-settings-text); }
			.flowythymer-settings-choice strong { font-size: 0.94em; }
			.flowythymer-settings-choice span { color: var(--flowythymer-settings-text-muted); font-size: 0.88em; line-height: 1.35; }
			.flowythymer-settings-live-card { padding: 14px; border-radius: 14px; border: 1px solid color-mix(in srgb, var(--flowythymer-settings-border) 60%, transparent); background: color-mix(in srgb, var(--flowythymer-settings-surface-strong) 86%, var(--flowythymer-settings-surface)); display: grid; gap: 10px; }
			.flowythymer-settings-live-card h4 { margin: 0; font-size: 0.96em; }
			.flowythymer-settings-live-card p { margin: 0; color: var(--flowythymer-settings-text-muted); font-size: 0.9em; line-height: 1.45; }
			.flowythymer-settings-live-list { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
			.flowythymer-settings-live-list li { color: var(--flowythymer-settings-text-muted); font-size: 0.9em; line-height: 1.4; }
			.flowythymer-settings-palette-preview { display: grid; gap: 12px; }
			.flowythymer-settings-palette-preview-row { display: flex; gap: 8px; flex-wrap: wrap; }
			.flowythymer-settings-palette-preview-row i { display: inline-block; width: 18px; height: 18px; border-radius: 999px; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--flowythymer-settings-surface) 35%, CanvasText); }
			.flowythymer-settings-note-list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
			.flowythymer-settings-note-list li { display: grid; gap: 3px; padding: 12px 14px; border-radius: 12px; background: color-mix(in srgb, var(--flowythymer-settings-surface-strong) 88%, var(--flowythymer-settings-surface)); border: 1px solid color-mix(in srgb, var(--flowythymer-settings-border) 50%, transparent); }
			.flowythymer-settings-muted { padding: 12px 14px; border-radius: 12px; color: var(--flowythymer-settings-text-muted); background: color-mix(in srgb, var(--flowythymer-settings-surface-muted) 92%, var(--flowythymer-settings-surface)); border: 1px dashed color-mix(in srgb, var(--flowythymer-settings-border) 58%, transparent); }
			.flowythymer-settings-preview-lines { display: flex; align-items: center; gap: 8px; min-height: 16px; }
			.flowythymer-settings-preview-lines i { display: inline-block; background: var(--flowythymer-settings-accent); border-radius: 999px; }
			.flowythymer-settings-preview-lines[data-mode="staircase"] i:nth-child(1) { width: 12px; height: 2px; opacity: 0.45; }
			.flowythymer-settings-preview-lines[data-mode="staircase"] i:nth-child(2) { width: 18px; height: 2px; opacity: 0.7; }
			.flowythymer-settings-preview-lines[data-mode="staircase"] i:nth-child(3) { width: 24px; height: 2px; opacity: 1; }
			.flowythymer-settings-preview-lines[data-mode="stretched"] i:nth-child(1) { width: 10px; height: 2px; opacity: 0.45; }
			.flowythymer-settings-preview-lines[data-mode="stretched"] i:nth-child(2) { width: 24px; height: 2px; opacity: 0.7; }
			.flowythymer-settings-preview-lines[data-mode="stretched"] i:nth-child(3) { width: 36px; height: 2px; opacity: 1; }
			@media (max-width: 720px) {
				.flowythymer-settings-choice-layout { grid-template-columns: 1fr; }
			}
		`;
      element.appendChild(style);
      const container = document.createElement("div");
      container.className = "flowythymer-settings";
      const settingsGrid = document.createElement("div");
      settingsGrid.className = "flowythymer-settings-grid";
      const header = document.createElement("header");
      header.className = "flowythymer-settings-header";
      const title = document.createElement("h2");
      const icon = this.ui?.createIcon?.("paint");
      if (icon) title.appendChild(icon);
      title.appendChild(document.createTextNode(" FlowyThymer"));
      header.appendChild(title);
      const intro = document.createElement("p");
      intro.textContent = "Customize bullets, indent lines, and the active path in your outline.";
      header.appendChild(intro);
      const summary = document.createElement("div");
      summary.className = "flowythymer-settings-summary";
      [
        ["Bullets", this.settings.flowyThymerBulletsEnabled ? "FlowyThymer" : "Native"],
        ["Indent lines", this.settings.indentLinesEnabled ? "On" : "Off"],
        ["Active thread", this.settings.activeThread ? "On" : "Off"],
        ["Palette", this.formatPaletteLabel(this.settings.palette)]
      ].forEach(([label, value]) => {
        const chip = document.createElement("div");
        chip.className = "flowythymer-settings-chip";
        const strong = document.createElement("strong");
        strong.textContent = `${label}:`;
        chip.appendChild(strong);
        chip.appendChild(document.createTextNode(value));
        summary.appendChild(chip);
      });
      header.appendChild(summary);
      container.appendChild(header);
      const createCard = /* @__PURE__ */ __name((heading, description, variant = "") => {
        const card = document.createElement("section");
        card.className = "flowythymer-settings-card";
        if (variant) card.classList.add(`flowythymer-settings-card-${variant}`);
        const headerWrap = document.createElement("div");
        headerWrap.className = "flowythymer-settings-card-header";
        const h = document.createElement("h3");
        h.textContent = heading;
        headerWrap.appendChild(h);
        if (description) {
          const p = document.createElement("p");
          p.textContent = description;
          headerWrap.appendChild(p);
        }
        card.appendChild(headerWrap);
        settingsGrid.appendChild(card);
        return card;
      }, "createCard");
      const appendControlBlock = /* @__PURE__ */ __name((parent, control, title2 = "", subtitle = "") => {
        const block = document.createElement("div");
        block.className = "flowythymer-settings-control-block";
        if (title2) {
          const strong = document.createElement("strong");
          strong.textContent = title2;
          block.appendChild(strong);
        }
        if (subtitle) {
          const text = document.createElement("p");
          text.textContent = subtitle;
          block.appendChild(text);
        }
        block.appendChild(control);
        parent.appendChild(block);
      }, "appendControlBlock");
      const appendInlineToggle = /* @__PURE__ */ __name((parent, titleText, subtitleText, checkbox) => {
        const row = document.createElement("label");
        row.className = "flowythymer-settings-inline-toggle";
        const text = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = titleText;
        text.appendChild(strong);
        if (subtitleText) {
          const sub = document.createElement("span");
          sub.textContent = subtitleText;
          text.appendChild(sub);
        }
        row.appendChild(text);
        row.appendChild(checkbox);
        parent.appendChild(row);
      }, "appendInlineToggle");
      const bindCheckbox = /* @__PURE__ */ __name((checkbox, onToggle) => {
        const handler = /* @__PURE__ */ __name((event) => {
          onToggle(event.currentTarget.checked);
        }, "handler");
        checkbox.addEventListener("input", handler);
        checkbox.addEventListener("change", handler);
      }, "bindCheckbox");
      const updateSettingsAndRefresh = /* @__PURE__ */ __name((nextSettings) => {
        this.updateSettings(nextSettings);
        this.renderSettingsUI(panel);
      }, "updateSettingsAndRefresh");
      const createChoiceButton = /* @__PURE__ */ __name(({ title: choiceTitle, description, selected = false, onSelect }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "flowythymer-settings-choice";
        button.dataset.selected = selected ? "true" : "false";
        const strong = document.createElement("strong");
        strong.textContent = choiceTitle;
        button.appendChild(strong);
        if (description) {
          const text = document.createElement("span");
          text.textContent = description;
          button.appendChild(text);
        }
        button.addEventListener("click", onSelect);
        return button;
      }, "createChoiceButton");
      const createLiveCard = /* @__PURE__ */ __name((cardTitle, description) => {
        const card = document.createElement("div");
        card.className = "flowythymer-settings-live-card";
        const heading = document.createElement("h4");
        heading.textContent = cardTitle;
        card.appendChild(heading);
        if (description) {
          const text = document.createElement("p");
          text.textContent = description;
          card.appendChild(text);
        }
        return card;
      }, "createLiveCard");
      const createThreadPreview = /* @__PURE__ */ __name((mode) => {
        const preview = document.createElement("div");
        preview.className = "flowythymer-settings-preview-lines";
        preview.dataset.mode = mode;
        preview.appendChild(document.createElement("i"));
        preview.appendChild(document.createElement("i"));
        preview.appendChild(document.createElement("i"));
        return preview;
      }, "createThreadPreview");
      const bulletCard = createCard("Bullet style");
      const bulletStyleLayout = document.createElement("div");
      bulletStyleLayout.className = "flowythymer-settings-choice-layout";
      const bulletChoiceList = document.createElement("div");
      bulletChoiceList.className = "flowythymer-settings-choice-list";
      bulletChoiceList.appendChild(createChoiceButton({
        title: "FlowyThymer bullets",
        description: "",
        selected: this.settings.flowyThymerBulletsEnabled,
        onSelect: /* @__PURE__ */ __name(() => updateSettingsAndRefresh({ flowyThymerBulletsEnabled: true }), "onSelect")
      }));
      bulletChoiceList.appendChild(createChoiceButton({
        title: "Native Thymer (no bullets)",
        description: "",
        selected: !this.settings.flowyThymerBulletsEnabled,
        onSelect: /* @__PURE__ */ __name(() => updateSettingsAndRefresh({ flowyThymerBulletsEnabled: false }), "onSelect")
      }));
      bulletStyleLayout.appendChild(bulletChoiceList);
      appendControlBlock(bulletCard, bulletStyleLayout);
      const indentToggleCard = createCard("Indent lines");
      const indentEnabled = document.createElement("input");
      indentEnabled.type = "checkbox";
      indentEnabled.className = "flowythymer-settings-checkbox";
      indentEnabled.checked = this.settings.indentLinesEnabled;
      bindCheckbox(indentEnabled, (checked) => {
        updateSettingsAndRefresh({ indentLinesEnabled: checked });
      });
      appendInlineToggle(indentToggleCard, "Show indent lines", "", indentEnabled);
      if (this.settings.indentLinesEnabled) {
        const indentCard = createCard("Indent line options", "", "dependent");
        const widthGroup = document.createElement("div");
        const widthMeta = document.createElement("div");
        widthMeta.className = "flowythymer-settings-slider-meta";
        const widthHint = document.createElement("span");
        widthHint.textContent = "Line thickness";
        const widthValue = document.createElement("span");
        widthValue.className = "flowythymer-settings-pill";
        widthValue.textContent = `${this.settings.indentLineWidth}px`;
        widthMeta.appendChild(widthHint);
        widthMeta.appendChild(widthValue);
        widthGroup.appendChild(widthMeta);
        const widthSlider = document.createElement("input");
        widthSlider.type = "range";
        widthSlider.min = "0";
        widthSlider.max = "3";
        widthSlider.step = "0.5";
        widthSlider.value = String(this.settings.indentLineWidth);
        widthSlider.className = "flowythymer-settings-slider";
        widthSlider.addEventListener("input", (event) => {
          const value = Number.parseFloat(event.target.value);
          widthValue.textContent = `${value}px`;
          this.updateSettings({ indentLineWidth: value });
        });
        widthGroup.appendChild(widthSlider);
        appendControlBlock(indentCard, widthGroup, "Line thickness");
        const opacityGroup = document.createElement("div");
        const opacityMeta = document.createElement("div");
        opacityMeta.className = "flowythymer-settings-slider-meta";
        const opacityHint = document.createElement("span");
        opacityHint.textContent = "Line visibility";
        const opacityValue = document.createElement("span");
        opacityValue.className = "flowythymer-settings-pill";
        opacityValue.textContent = `${Math.round(this.settings.indentLineOpacity * 100)}%`;
        opacityMeta.appendChild(opacityHint);
        opacityMeta.appendChild(opacityValue);
        opacityGroup.appendChild(opacityMeta);
        const opacitySlider = document.createElement("input");
        opacitySlider.type = "range";
        opacitySlider.min = "0";
        opacitySlider.max = "1";
        opacitySlider.step = "0.05";
        opacitySlider.value = String(this.settings.indentLineOpacity);
        opacitySlider.className = "flowythymer-settings-slider";
        opacitySlider.addEventListener("input", (event) => {
          const value = Number.parseFloat(event.target.value);
          opacityValue.textContent = `${Math.round(value * 100)}%`;
          this.updateSettings({ indentLineOpacity: value });
        });
        opacityGroup.appendChild(opacitySlider);
        appendControlBlock(indentCard, opacityGroup, "Line visibility");
      }
      const activeThreadToggleCard = createCard("Active thread");
      const activeThreadEnabled = document.createElement("input");
      activeThreadEnabled.type = "checkbox";
      activeThreadEnabled.className = "flowythymer-settings-checkbox";
      activeThreadEnabled.checked = this.settings.activeThread;
      bindCheckbox(activeThreadEnabled, (checked) => {
        updateSettingsAndRefresh({ activeThread: checked });
      });
      appendInlineToggle(activeThreadToggleCard, "Show active thread", "", activeThreadEnabled);
      if (this.settings.activeThread) {
        const threadCard = createCard("Active thread options", "", "dependent");
        const threadModeLayout = document.createElement("div");
        threadModeLayout.className = "flowythymer-settings-choice-layout";
        const threadChoiceList = document.createElement("div");
        threadChoiceList.className = "flowythymer-settings-choice-list";
        threadChoiceList.appendChild(createChoiceButton({
          title: "Step by step",
          description: "",
          selected: this.settings.activeThreadMode === "staircase",
          onSelect: /* @__PURE__ */ __name(() => updateSettingsAndRefresh({ activeThreadMode: "staircase" }), "onSelect")
        }));
        threadChoiceList.appendChild(createChoiceButton({
          title: "Stretch to active row",
          description: "",
          selected: this.settings.activeThreadMode === "stretched",
          onSelect: /* @__PURE__ */ __name(() => updateSettingsAndRefresh({ activeThreadMode: "stretched" }), "onSelect")
        }));
        threadModeLayout.appendChild(threadChoiceList);
        const threadPreviewCard = createLiveCard(
          this.settings.activeThreadMode === "stretched" ? "Stretch to active row" : "Step by step"
        );
        threadPreviewCard.appendChild(createThreadPreview(this.settings.activeThreadMode));
        appendControlBlock(threadCard, threadModeLayout, "Thread style");
        const threadWidthGroup = document.createElement("div");
        const threadWidthMeta = document.createElement("div");
        threadWidthMeta.className = "flowythymer-settings-slider-meta";
        const threadWidthHint = document.createElement("span");
        threadWidthHint.textContent = "Thread thickness";
        const threadWidthValue = document.createElement("span");
        threadWidthValue.className = "flowythymer-settings-pill";
        threadWidthValue.textContent = `${this.settings.activeThreadWidth}px`;
        threadWidthMeta.appendChild(threadWidthHint);
        threadWidthMeta.appendChild(threadWidthValue);
        threadWidthGroup.appendChild(threadWidthMeta);
        const threadWidthSlider = document.createElement("input");
        threadWidthSlider.type = "range";
        threadWidthSlider.min = "0";
        threadWidthSlider.max = "3";
        threadWidthSlider.step = "0.5";
        threadWidthSlider.value = String(this.settings.activeThreadWidth);
        threadWidthSlider.className = "flowythymer-settings-slider";
        threadWidthSlider.addEventListener("input", (event) => {
          const value = Number.parseFloat(event.target.value);
          threadWidthValue.textContent = `${value}px`;
          this.updateSettings({ activeThreadWidth: value });
        });
        threadWidthGroup.appendChild(threadWidthSlider);
        appendControlBlock(threadCard, threadWidthGroup, "Thread thickness");
      }
      const paletteCard = createCard("Color palette");
      const paletteLayout = document.createElement("div");
      paletteLayout.className = "flowythymer-settings-choice-layout";
      const paletteChoiceList = document.createElement("div");
      paletteChoiceList.className = "flowythymer-settings-choice-list";
      Object.keys(PALETTES).forEach((key) => {
        paletteChoiceList.appendChild(createChoiceButton({
          title: this.formatPaletteLabel(key),
          description: this.settings.palette === key ? "" : "",
          selected: this.settings.palette === key,
          onSelect: /* @__PURE__ */ __name(() => updateSettingsAndRefresh({ palette: key }), "onSelect")
        }));
      });
      paletteLayout.appendChild(paletteChoiceList);
      const palettePreview = createLiveCard(this.formatPaletteLabel(this.settings.palette));
      const palettePreviewWrap = document.createElement("div");
      palettePreviewWrap.className = "flowythymer-settings-palette-preview";
      const palettePreviewRow = document.createElement("div");
      palettePreviewRow.className = "flowythymer-settings-palette-preview-row";
      (PALETTES[this.settings.palette] || []).forEach((color) => {
        const swatch = document.createElement("i");
        swatch.style.background = color;
        palettePreviewRow.appendChild(swatch);
      });
      palettePreviewWrap.appendChild(palettePreviewRow);
      palettePreview.appendChild(palettePreviewWrap);
      paletteLayout.appendChild(palettePreview);
      appendControlBlock(paletteCard, paletteLayout);
      container.appendChild(settingsGrid);
      element.appendChild(container);
    }
    scheduleMarkerUpdate(rows = null) {
      if (!rows) {
        this.fullMarkerRefreshRequested = true;
      } else {
        rows.forEach((row) => {
          const usableRow = this.getUsableRow(row);
          const guid = usableRow?.getAttribute("data-guid");
          if (guid) this.pendingMarkerGuids.add(guid);
        });
      }
      if (this.markerRaf) return;
      this.markerRaf = requestAnimationFrame(() => {
        this.markerRaf = 0;
        const rowsToUpdate = this.fullMarkerRefreshRequested ? null : [...this.pendingMarkerGuids].map((guid) => this.getRowByGuid(guid)).filter(Boolean);
        this.pendingMarkerGuids.clear();
        this.fullMarkerRefreshRequested = false;
        this.updateMarkers(rowsToUpdate);
      });
    }
    scheduleDeferredMarkerUpdate() {
      if (this.markerUpdateTimeout) clearTimeout(this.markerUpdateTimeout);
      this.markerUpdateTimeout = setTimeout(() => {
        this.markerUpdateTimeout = 0;
        this.scheduleMarkerUpdate();
      }, 32);
    }
    isRowMoveInProgress() {
      return Boolean(document.body.classList.contains("editor-drag-handle-open") || document.querySelector('.listitem-closest-to-pointer, .sortable-ghost, .sortable-chosen, .dragging, [aria-grabbed="true"]'));
    }
    invalidateMarkerPositionCache() {
      document.querySelectorAll(".flowythymer-row[data-flowythymer-marker-center-x]").forEach((row) => {
        delete row.dataset.flowythymerMarkerCenterX;
      });
    }
    invalidateIndentAlignmentCache(rows = null) {
      return rows;
    }
    updateMarkers(rows = null) {
      const seen = /* @__PURE__ */ new Set();
      const rowsToUpdate = Array.isArray(rows) ? rows : this.getRows();
      try {
        rowsToUpdate.forEach((row) => {
          const guid = row.getAttribute("data-guid");
          if (!guid) return;
          if (this.isCodeBlockRow(row)) {
            document.querySelector(`.flowythymer-marker[data-guid="${CSS.escape(guid)}"]`)?.remove();
            row.querySelector(":scope > .flowythymer-thread-connector")?.remove();
            row.querySelector(":scope > .flowythymer-indent-extension")?.remove();
            this.clearRowMenuAlignment(guid);
            row.classList.remove("flowythymer-row", "flowythymer-row-blank", "flowythymer-row-folded", "flowythymer-row-native-list", "flowythymer-row-wrapped-guide");
            delete row.dataset.flowythymerMarkerCenterX;
            return;
          }
          seen.add(guid);
          const marker = this.getOrCreateMarker(row, guid);
          const isBlank = this.isBlankRow(row);
          const isFolded = this.isFoldedRow(row, guid);
          const lineDiv = row.querySelector(".line-div");
          const isNativeList = this.isNativeListRow(row, lineDiv);
          row.classList.add("flowythymer-row");
          row.classList.toggle("flowythymer-row-blank", isBlank);
          row.classList.toggle("flowythymer-row-folded", isFolded);
          row.classList.toggle("flowythymer-row-native-list", isNativeList);
          this.ensureActiveThreadConnector(row);
          marker.classList.toggle("flowythymer-marker-blank", isBlank);
          marker.classList.toggle("flowythymer-marker-folded", isFolded);
          marker.classList.toggle("flowythymer-marker-native-list", isNativeList);
          marker.classList.toggle("flowythymer-marker-hover", guid === this.hoveredGuid);
          this.applyMarkerPalette(marker, row, lineDiv);
          this.positionMarker(row, marker, guid);
          const nextSameDepthRow = this.getNextVisibleRowAtDepth(row);
          const shouldShowIndentExtension = Boolean(this.shouldRenderCustomIndentExtensions() && nextSameDepthRow);
          row.classList.toggle("flowythymer-row-wrapped-guide", Boolean(this.shouldRenderCustomIndentExtensions() && this.isWrappedRow(row, lineDiv) && row.querySelector(".listitem-indentline")));
          if (shouldShowIndentExtension) this.ensureIndentExtension(row);
          else row.querySelector(":scope > .flowythymer-indent-extension")?.remove();
          this.positionIndentExtension(row, shouldShowIndentExtension ? nextSameDepthRow : null);
          this.positionRowMenu(row, guid, lineDiv);
        });
        if (!Array.isArray(rows)) {
          document.querySelectorAll(".flowythymer-marker[data-guid]").forEach((marker) => {
            if (!seen.has(marker.getAttribute("data-guid"))) marker.remove();
          });
        }
      } catch (error) {
        console.error("[FlowyThymer] updateMarkers failed", error);
      }
      this.updateActiveThread();
    }
    getEditorContainer() {
      if (this.editorContainer && document.body.contains(this.editorContainer)) return this.editorContainer;
      this.editorContainer = document.querySelector(".editor-wrapper, .page-content, #editor") || document.body;
      return this.editorContainer;
    }
    getUsableRow(node) {
      const row = node?.closest?.(".listitem[data-guid]");
      if (!row) return null;
      if (row.classList.contains("listitem-virtual") || row.classList.contains("listitem-error")) return null;
      const rect = row.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      return row;
    }
    getAffectedRowsFromMutations(mutations) {
      if (!mutations?.length) return null;
      const affectedRows = /* @__PURE__ */ new Set();
      let needsFullRefresh = false;
      const collectRowsFromNode = /* @__PURE__ */ __name((node) => {
        if (!(node instanceof Element)) return;
        const row = this.getUsableRow(node);
        if (row) affectedRows.add(row);
        node.querySelectorAll?.(".listitem[data-guid]").forEach((childRow) => {
          const usableRow = this.getUsableRow(childRow);
          if (usableRow) affectedRows.add(usableRow);
        });
      }, "collectRowsFromNode");
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          const row = this.getUsableRow(mutation.target);
          if (row) affectedRows.add(row);
          else needsFullRefresh = true;
          continue;
        }
        if (mutation.type === "childList") {
          const targetRow = this.getUsableRow(mutation.target);
          if (targetRow) affectedRows.add(targetRow);
          mutation.addedNodes.forEach(collectRowsFromNode);
          mutation.removedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.matches?.(".listitem[data-guid]") || node.querySelector?.(".listitem[data-guid]")) needsFullRefresh = true;
          });
        }
        if (affectedRows.size > 80) {
          needsFullRefresh = true;
          break;
        }
      }
      return needsFullRefresh || !affectedRows.size ? null : affectedRows;
    }
    isPluginIndentCorrectionMutation(mutation) {
      return false;
    }
    updateActiveThread() {
      this.updateFocusedGuid();
      const targetRows = /* @__PURE__ */ new Set();
      const pathRows = /* @__PURE__ */ new Set();
      const connectorTargets = /* @__PURE__ */ new Map();
      if (!this.activeThreadEnabled || !this.shouldRenderActiveThread()) {
        this.applyActiveThreadClasses(targetRows, pathRows, connectorTargets, []);
        return;
      }
      const targetGuid = this.hoveredGuid || this.focusedGuid;
      if (!targetGuid) {
        this.applyActiveThreadClasses(targetRows, pathRows, connectorTargets, []);
        return;
      }
      const target = document.querySelector(`.listitem[data-guid="${CSS.escape(targetGuid)}"]`);
      if (!target || this.isCodeBlockRow(target)) {
        this.applyActiveThreadClasses(targetRows, pathRows, connectorTargets, []);
        return;
      }
      const threadRows = this.getActiveThreadRows(target);
      targetRows.add(target);
      threadRows.slice(0, -1).forEach((row) => pathRows.add(row));
      threadRows.slice(0, -1).forEach((row, index) => {
        const targetRow = this.settings.activeThreadMode === "stretched" ? target : threadRows[index + 1];
        connectorTargets.set(row, targetRow);
      });
      this.applyActiveThreadClasses(targetRows, pathRows, connectorTargets, threadRows);
    }
    getActiveThreadRows(target) {
      const lineDiv = target.querySelector(".line-div");
      const targetDepth = this.getRowDepth(target, lineDiv);
      if (targetDepth <= 0) return [target];
      const rows = this.getRows();
      const targetIndex = rows.indexOf(target);
      const ancestors = [];
      let neededDepth = targetDepth - 1;
      for (let index = targetIndex - 1; index >= 0 && neededDepth >= 0; index--) {
        const row = rows[index];
        if (this.isCodeBlockRow(row)) continue;
        const depth = this.getRowDepth(row, row.querySelector(".line-div"));
        if (depth === neededDepth) {
          ancestors.push(row);
          neededDepth -= 1;
        } else if (depth < neededDepth) {
          ancestors.push(row);
          neededDepth = depth - 1;
        }
      }
      return [...ancestors.reverse(), target];
    }
    getNextVisibleRowAtDepth(row) {
      if (!row) return null;
      const rows = this.getRows();
      const startIndex = rows.indexOf(row);
      if (startIndex < 0) return null;
      const depth = this.getRowDepth(row, row.querySelector(".line-div"));
      for (let index = startIndex + 1; index < rows.length; index++) {
        const candidate = rows[index];
        if (this.isCodeBlockRow(candidate)) continue;
        const candidateDepth = this.getRowDepth(candidate, candidate.querySelector(".line-div"));
        if (candidateDepth < depth) return null;
        if (candidateDepth === depth) return candidate;
      }
      return null;
    }
    shouldRenderCustomIndentExtensions() {
      return Boolean(this.settings.indentLinesEnabled && this.settings.flowyThymerBulletsEnabled);
    }
    shouldRenderActiveThread() {
      return Boolean(this.settings.activeThread);
    }
    applyActiveThreadClasses(targetRows, pathRows, connectorTargets, threadRows) {
      this.activeThreadTargets = connectorTargets;
      this.activeThreadRows = threadRows;
      document.querySelectorAll(".flowythymer-thread-target, .flowythymer-thread-path").forEach((row) => {
        row.classList.toggle("flowythymer-thread-target", targetRows.has(row));
        row.classList.toggle("flowythymer-thread-path", pathRows.has(row));
        this.positionActiveThreadConnector(row, connectorTargets.get(row) || null);
        this.syncIndentExtensionBreak(row, connectorTargets.get(row) || null);
      });
      targetRows.forEach((row) => {
        if (!row.classList.contains("flowythymer-thread-target")) row.classList.add("flowythymer-thread-target");
        this.positionActiveThreadConnector(row, connectorTargets.get(row) || null);
        this.syncIndentExtensionBreak(row, connectorTargets.get(row) || null);
      });
      pathRows.forEach((row) => {
        if (!row.classList.contains("flowythymer-thread-path")) row.classList.add("flowythymer-thread-path");
        this.positionActiveThreadConnector(row, connectorTargets.get(row) || null);
        this.syncIndentExtensionBreak(row, connectorTargets.get(row) || null);
      });
      document.querySelectorAll(".flowythymer-row").forEach((row) => {
        if (targetRows.has(row) || pathRows.has(row)) return;
        this.syncIndentExtensionBreak(row, null);
      });
    }
    syncIndentExtensionBreak(row, connectorTarget = null) {
      const extension = row?.querySelector?.(":scope > .flowythymer-indent-extension");
      if (!extension) return;
      if (!this.settings.indentLinesEnabled) {
        extension.style.opacity = "0";
        return;
      }
      extension.style.removeProperty("opacity");
    }
    ensureActiveThreadConnector(row) {
      if (row.querySelector(":scope > .flowythymer-thread-connector")) return;
      const connector = document.createElement("span");
      connector.className = "flowythymer-thread-connector";
      connector.setAttribute("aria-hidden", "true");
      row.appendChild(connector);
    }
    ensureIndentExtension(row) {
      if (row.querySelector(":scope > .flowythymer-indent-extension")) return;
      const extension = document.createElement("span");
      extension.className = "flowythymer-indent-extension";
      extension.setAttribute("aria-hidden", "true");
      row.appendChild(extension);
    }
    positionActiveThreadConnector(row, targetRow = null) {
      const connector = row.querySelector(":scope > .flowythymer-thread-connector");
      if (!connector) return;
      if (!row.classList.contains("flowythymer-thread-target") && !row.classList.contains("flowythymer-thread-path")) return;
      if (!targetRow) {
        connector.style.removeProperty("--flowythymer-thread-x");
        connector.style.removeProperty("--flowythymer-thread-y");
        connector.style.removeProperty("--flowythymer-thread-height");
        connector.style.removeProperty("--flowythymer-thread-width");
        connector.style.opacity = "0";
        return;
      }
      connector.style.removeProperty("opacity");
      const indentLine = row.querySelector(".listitem-indentline");
      const lineDiv = row.querySelector(".line-div");
      const rowRect = row.getBoundingClientRect();
      const lineRect = lineDiv?.getBoundingClientRect?.();
      if (!lineRect || !indentLine) return;
      const centerX = this.getActiveThreadCenterX(row, lineDiv, lineRect) - rowRect.left;
      const sourceY = targetRow === row ? this.getPreviousThreadBulletCenterY(row, rowRect) : this.getActiveThreadCenterY(row, lineDiv, lineRect) - rowRect.top;
      const targetMetrics = this.getRowAnchorMetrics(targetRow, targetRow?.querySelector?.(".line-div"), targetRow?.querySelector?.(".line-div")?.getBoundingClientRect?.());
      if (!targetMetrics) return;
      const targetLineDiv = targetRow?.querySelector?.(".line-div");
      const targetLineRect = targetLineDiv?.getBoundingClientRect?.();
      const targetY = this.getActiveThreadCenterY(targetRow, targetLineDiv, targetLineRect) - rowRect.top;
      const targetX = this.getActiveThreadCenterX(targetRow, targetLineDiv, targetLineRect) - rowRect.left;
      const endX = Math.max(centerX + 8, targetX);
      const top = Math.min(sourceY, targetY) - 1;
      const height = Math.max(8, Math.abs(targetY - sourceY) + 1);
      connector.style.setProperty("--flowythymer-thread-x", `${Math.round(centerX)}px`);
      connector.style.setProperty("--flowythymer-thread-y", `${Math.round(top)}px`);
      connector.style.setProperty("--flowythymer-thread-height", `${Math.round(height)}px`);
      connector.style.setProperty("--flowythymer-thread-width", `${Math.round(endX - centerX)}px`);
    }
    syncNativeIndentLineAlignment(row, lineDiv) {
      return lineDiv || row;
    }
    positionIndentExtension(row, targetRow = null) {
      const extension = row.querySelector(":scope > .flowythymer-indent-extension");
      if (!extension) return;
      if (!targetRow || !this.shouldRenderCustomIndentExtensions()) {
        extension.style.removeProperty("--flowythymer-indent-extension-x");
        extension.style.removeProperty("--flowythymer-indent-extension-y");
        extension.style.removeProperty("--flowythymer-indent-extension-height");
        extension.style.opacity = "0";
        return;
      }
      extension.style.removeProperty("opacity");
      const rowRect = row.getBoundingClientRect();
      const lineDiv = row.querySelector(".line-div");
      const lineRect = lineDiv?.getBoundingClientRect?.();
      const targetLineDiv = targetRow?.querySelector?.(".line-div");
      const targetLineRect = targetLineDiv?.getBoundingClientRect?.();
      if (!lineRect || !targetLineRect) return;
      const sourceMetrics = this.getRowAnchorMetrics(row, lineDiv, lineRect);
      const targetMetrics = this.getRowAnchorMetrics(targetRow, targetLineDiv, targetLineRect);
      if (!sourceMetrics || !targetMetrics) return;
      const sourceX = this.getMarkerCenterX(row, lineDiv, lineRect) - rowRect.left;
      const sourceY = sourceMetrics.firstLineTop - rowRect.top;
      let targetY = targetMetrics.firstLineTop - rowRect.top - 2;
      if (this.shouldRenderActiveThread() && (row.classList.contains("flowythymer-thread-path") || row.classList.contains("flowythymer-thread-target"))) {
        const breakY = this.getMarkerCenterY(row, lineDiv, lineRect) - rowRect.top - 2;
        targetY = Math.min(targetY, breakY);
      }
      const height = Math.max(6, targetY - sourceY);
      if (height <= 0) {
        extension.style.opacity = "0";
        return;
      }
      extension.style.setProperty("--flowythymer-indent-extension-x", `${Math.round(sourceX)}px`);
      extension.style.setProperty("--flowythymer-indent-extension-y", `${Math.round(sourceY)}px`);
      extension.style.setProperty("--flowythymer-indent-extension-height", `${Math.round(height)}px`);
    }
    getPreviousThreadBulletCenterY(row, rowRect) {
      const index = this.activeThreadRows.indexOf(row);
      const previous = index > 0 ? this.activeThreadRows[index - 1] : null;
      if (!this.settings.flowyThymerBulletsEnabled) {
        const previousLineDiv = previous?.querySelector?.(".line-div");
        const previousLineRect = previousLineDiv?.getBoundingClientRect?.();
        if (previous && previousLineRect) return this.getActiveThreadCenterY(previous, previousLineDiv, previousLineRect) - rowRect.top;
        const lineDiv = row.querySelector(".line-div");
        const lineRect = lineDiv?.getBoundingClientRect?.();
        if (lineRect) return this.getActiveThreadCenterY(row, lineDiv, lineRect) - rowRect.top;
      }
      const markerRect = previous?.querySelector?.(":scope > .flowythymer-marker")?.getBoundingClientRect?.();
      if (markerRect) return markerRect.top + markerRect.height / 2 - rowRect.top;
      const ownMarkerRect = row.querySelector(":scope > .flowythymer-marker")?.getBoundingClientRect?.();
      if (ownMarkerRect) return ownMarkerRect.top + ownMarkerRect.height / 2 - rowRect.top;
      return 0;
    }
    isWrappedRow(row, lineDiv) {
      const lineRect = lineDiv?.getBoundingClientRect?.();
      if (!lineDiv || !lineRect) return false;
      const style = getComputedStyle(lineDiv);
      const lineHeight = Number.parseFloat(style.lineHeight);
      const fontSize = Number.parseFloat(style.fontSize);
      const firstLineHeight = Number.isFinite(lineHeight) ? lineHeight : fontSize * 1.2;
      return lineRect.height > firstLineHeight * 1.4;
    }
    updateFocusedGuid() {
      const nextFocusedGuid = this.getEditorContainer().querySelector(".listitem-with-caret[data-guid]")?.getAttribute("data-guid") || this.getFocusedRowGuid();
      if (nextFocusedGuid !== this.focusedGuid) {
        this.focusedGuid = nextFocusedGuid;
        return true;
      }
      return false;
    }
    getFocusedRowGuid() {
      const activeRow = document.activeElement?.closest?.(".listitem[data-guid]");
      if (activeRow) return activeRow.getAttribute("data-guid");
      const virtualInput = document.getElementById("virtualinput-wrapper");
      const transform = virtualInput?.style?.transform || "";
      const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
      if (!match) return null;
      const x = Number.parseFloat(match[1]);
      const y = Number.parseFloat(match[2]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return document.elementFromPoint(x + 40, y + 10)?.closest?.(".listitem[data-guid]")?.getAttribute("data-guid") || null;
    }
    getHoverGuidFromTarget(target) {
      if (!(target instanceof Element)) return null;
      const guidOwner = target.closest([
        ".flowythymer-marker[data-guid]",
        ".link-menu.item-drag-handle-editor-style[data-guid]",
        ".item-drag-handle[data-guid]",
        ".link-menu-opener[data-guid]",
        ".listitem[data-guid]"
      ].join(", "));
      return guidOwner?.getAttribute("data-guid") || null;
    }
    setHoveredGuid(hoveredGuid) {
      if (hoveredGuid === this.hoveredGuid) return;
      const previousGuid = this.hoveredGuid;
      this.hoveredGuid = hoveredGuid;
      if (previousGuid) {
        document.querySelector(`.flowythymer-marker[data-guid="${CSS.escape(previousGuid)}"]`)?.classList.remove("flowythymer-marker-hover");
      }
      if (hoveredGuid) {
        document.querySelector(`.flowythymer-marker[data-guid="${CSS.escape(hoveredGuid)}"]`)?.classList.add("flowythymer-marker-hover");
      }
      this.updateActiveThread();
    }
    getResolvedHoverGuid(target, x, y) {
      const directGuid = this.getHoverGuidFromTarget(target);
      if (directGuid) {
        if (this.hoverLockGuid && this.hoverLockGuid !== directGuid) this.clearHoverLock();
        return directGuid;
      }
      if (this.hoverLockGuid && this.isPointInsideHoverOwner(this.hoverLockGuid, x, y, 10)) return this.hoverLockGuid;
      if (this.hoverLockGuid) this.clearHoverLock();
      return null;
    }
    setHoverLock(guid) {
      this.hoverLockGuid = guid || null;
    }
    clearHoverLock() {
      this.hoverLockGuid = null;
    }
    captureChevronIntent(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const action = target.closest(".link-menu-action-collapse, .link-menu-action-expand, .bt-caret[data-bt-chevron-state]");
      if (!action) return;
      const menuGuid = action.closest(".link-menu.item-drag-handle-editor-style[data-guid]")?.getAttribute("data-guid") || null;
      const row = menuGuid ? this.getRowByGuid(menuGuid) : this.getUsableRow(action);
      const guid = menuGuid || row?.getAttribute("data-guid");
      if (!guid || !row) return;
      this.pendingChevronIntent = {
        guid,
        point: { x: event.clientX, y: event.clientY },
        rect: row.getBoundingClientRect()
      };
    }
    restoreChevronHover() {
      const intent = this.pendingChevronIntent;
      this.pendingChevronIntent = null;
      if (!intent) return;
      const row = this.getRowByGuid(intent.guid);
      if (!row) return;
      const point = intent.point;
      if (this.isPointInRect(point, intent.rect, 10) || this.isPointInsideHoverOwner(intent.guid, point.x, point.y, 10)) {
        this.setHoverLock(intent.guid);
        this.setHoveredGuid(intent.guid);
      }
    }
    isPointInRect(point, rect, padding = 0) {
      if (!point || !rect) return false;
      return point.x >= rect.left - padding && point.x <= rect.right + padding && point.y >= rect.top - padding && point.y <= rect.bottom + padding;
    }
    isPointInsideHoverOwner(guid, x, y, padding = 0) {
      const point = { x, y };
      const rowRect = this.getRowByGuid(guid)?.getBoundingClientRect?.();
      if (this.isPointInRect(point, rowRect, padding)) return true;
      const menuRect = this.getMenuForGuid(guid)?.getBoundingClientRect?.();
      return this.isPointInRect(point, menuRect, padding);
    }
    getRowByGuid(guid) {
      if (!guid) return null;
      return document.querySelector(`.listitem[data-guid="${CSS.escape(guid)}"]`);
    }
    getRows() {
      const rows = [...this.getEditorContainer().querySelectorAll(".listitem[data-guid]")];
      if (rows.length) return rows;
      return [...this.getEditorContainer().querySelectorAll("[data-guid]")].filter((element) => {
        if (!(element instanceof HTMLElement)) return false;
        if (element.classList.contains("link-menu")) return false;
        return element.matches('.listitem, [class*="listitem"]');
      });
    }
    getOrCreateMarker(row, guid) {
      let marker = document.querySelector(`.flowythymer-marker[data-guid="${CSS.escape(guid)}"]`);
      if (!marker) {
        marker = document.createElement("span");
        marker.className = "flowythymer-marker";
        marker.dataset.guid = guid;
        marker.setAttribute("aria-hidden", "true");
      }
      if (marker.parentElement !== row) row.appendChild(marker);
      if (marker.dataset.parentGuid !== guid) marker.dataset.parentGuid = guid;
      return marker;
    }
    positionMarker(row, marker, guid) {
      const lineDiv = row.querySelector(".line-div");
      const lineRect = lineDiv?.getBoundingClientRect?.();
      const rowRect = row.getBoundingClientRect();
      const size = 8;
      if (this.shouldHideMarkerForViewport(rowRect, lineRect)) {
        marker.style.opacity = "0";
        return;
      }
      const x = this.getMarkerCenterX(row, lineDiv, lineRect) - rowRect.left - size / 2;
      const y = this.getMarkerCenterY(row, lineDiv, lineRect) - rowRect.top - size / 2;
      marker.style.removeProperty("opacity");
      marker.style.setProperty("--flowythymer-marker-x", `${Math.round(x)}px`);
      marker.style.setProperty("--flowythymer-marker-y", `${Math.round(y)}px`);
      marker.style.setProperty("--flowythymer-marker-size", `${size}px`);
    }
    getRowAnchorMetrics(row, lineDiv, lineRect) {
      if (!row || !lineDiv || !lineRect) return null;
      const style = getComputedStyle(lineDiv);
      const lineHeight = Number.parseFloat(style.lineHeight);
      const fontSize = Number.parseFloat(style.fontSize);
      const firstLineHeight = Number.isFinite(lineHeight) ? lineHeight : fontSize * 1.2;
      if (this.isHeadingRow(row, lineDiv)) {
        const h1Offset = fontSize >= 56 ? 2 : 0;
        return {
          centerY: lineRect.top + firstLineHeight / 2 + 1 + h1Offset,
          firstLineTop: lineRect.top,
          firstLineHeight,
          isHeading: true
        };
      }
      const firstLineRect = this.getFirstRenderedLineRect(lineDiv, lineRect);
      const firstLineTop = firstLineRect?.top ?? lineRect.top;
      const renderedLineHeight = firstLineRect?.height > 0 ? Math.min(firstLineRect.height, firstLineHeight) : firstLineHeight;
      return {
        centerY: firstLineTop + renderedLineHeight / 2 - 1.5,
        firstLineTop,
        firstLineHeight: renderedLineHeight,
        isHeading: false
      };
    }
    getMarkerCenterY(row, lineDiv, lineRect) {
      if (!lineDiv || !lineRect) return row.getBoundingClientRect().top + 10;
      return this.getRowAnchorMetrics(row, lineDiv, lineRect)?.centerY ?? row.getBoundingClientRect().top + 10;
    }
    getActiveThreadCenterX(row, lineDiv, lineRect) {
      if (!this.settings.flowyThymerBulletsEnabled) {
        const indentRect = row?.querySelector?.(".listitem-indentline")?.getBoundingClientRect?.();
        if (indentRect && indentRect.width > 0) return indentRect.left + indentRect.width / 2;
      }
      return this.getMarkerCenterX(row, lineDiv, lineRect);
    }
    getActiveThreadCenterY(row, lineDiv, lineRect) {
      const baseCenterY = this.getMarkerCenterY(row, lineDiv, lineRect);
      if (!this.settings.flowyThymerBulletsEnabled) return baseCenterY + 2;
      return baseCenterY;
    }
    positionRowMenu(row, guid, lineDiv) {
      const menu = this.getMenuForGuid(guid);
      if (!menu || !lineDiv) return;
      const rowRect = row.getBoundingClientRect();
      const lineRect = lineDiv.getBoundingClientRect();
      if (rowRect.height <= 0 || lineRect.height <= 0) {
        this.clearRowMenuAlignment(guid);
        return;
      }
      if (!this.isWrappedRow(row, lineDiv)) {
        this.clearRowMenuAlignment(guid);
        return;
      }
      const menuRect = menu.getBoundingClientRect();
      if (menuRect.height <= 0) {
        this.clearRowMenuAlignment(guid);
        return;
      }
      const targetCenterY = this.getMarkerCenterY(row, lineDiv, lineRect) - rowRect.top;
      const appliedOffsetY = Number.parseFloat(menu.style.getPropertyValue("--flowythymer-menu-offset-y") || "0") || 0;
      const menuCenterY = menuRect.top + menuRect.height / 2 - rowRect.top - appliedOffsetY;
      const offsetY = Math.round(targetCenterY - menuCenterY);
      if (Math.abs(offsetY) <= 1) {
        this.clearRowMenuAlignment(guid);
        return;
      }
      menu.style.setProperty("--flowythymer-menu-offset-y", `${offsetY}px`);
      menu.classList.add("flowythymer-menu-firstline");
    }
    clearRowMenuAlignment(guid) {
      const menu = this.getMenuForGuid(guid);
      if (menu) {
        menu.style.removeProperty("--flowythymer-menu-offset-y");
        menu.classList.remove("flowythymer-menu-firstline");
      }
    }
    getFirstRenderedLineRect(lineDiv, lineRect) {
      if (!lineDiv || !lineRect) return null;
      for (const node of [...lineDiv.childNodes]) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          const startIndex = text.search(/\S/);
          if (startIndex < 0) continue;
          const range = document.createRange();
          range.setStart(node, startIndex);
          range.setEnd(node, Math.min(startIndex + 1, text.length));
          const rect = [...range.getClientRects()].find((candidate) => candidate.width > 0 || candidate.height > 0) || null;
          range.detach();
          if (rect) return rect;
          continue;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node;
          if (element.classList?.contains("listitem-indentline")) continue;
          const rect = element.getBoundingClientRect?.();
          if (rect && (rect.width > 0 || rect.height > 0)) return rect;
        }
      }
      return null;
    }
    getLineContentLeft(lineDiv, lineRect) {
      if (!lineDiv || !lineRect || lineRect.width <= 0) return null;
      if (this.shouldUseMobileMarkerLayout()) return lineRect.left;
      const textNode = [...lineDiv.childNodes].find((node) => {
        return node.nodeType === Node.TEXT_NODE && (node.textContent || "").trim().length > 0;
      });
      if (!textNode) return lineRect.left;
      const text = textNode.textContent || "";
      const listPrefix = text.match(/^\s*(?:(?:\d+|[A-Za-z]+)[.)]|[-*•◦▪])\s+/);
      if (!listPrefix) return lineRect.left;
      const range = document.createRange();
      range.setStart(textNode, Math.min(listPrefix[0].length, text.length));
      range.setEnd(textNode, text.length);
      const rect = range.getBoundingClientRect();
      range.detach();
      return rect.width > 0 ? rect.left : lineRect.left;
    }
    getMarkerCenterX(row, lineDiv, lineRect) {
      if (!this.settings.flowyThymerBulletsEnabled) {
        const nativeAnchorCenterX = this.getNativeAnchorCenterX(row);
        if (Number.isFinite(nativeAnchorCenterX)) return nativeAnchorCenterX;
      }
      if (lineRect && lineRect.left > 0) {
        const contentLeft = this.getLineContentLeft(lineDiv, lineRect);
        const anchorLeft = contentLeft || lineRect.left;
        const centerX2 = this.constrainMarkerCenterX(this.blendMarkerTowardContentLeft(anchorLeft - this.getMarkerGutterOffset(row, lineDiv), lineDiv, lineRect), row, lineDiv, lineRect);
        return centerX2 + 1 + this.getMarkerAlignmentOffset(row, lineDiv);
      }
      const centerX = this.constrainMarkerCenterX(row.getBoundingClientRect().left + 23, row, lineDiv, lineRect);
      return centerX + 1 + this.getMarkerAlignmentOffset(row, lineDiv);
    }
    getMarkerAlignmentOffset(row, lineDiv) {
      const classText = `${row?.className || ""} ${lineDiv?.className || ""}`;
      if (/\blistitem-ulist\b/i.test(classText)) return -1;
      if (/\blistitem-olist\b/i.test(classText)) return -1;
      if (/\blistitem-quote\b/i.test(classText)) return -1;
      if (/\blistitem-heading\b/i.test(classText)) return -1.5;
      if (/\blistitem-task\b/i.test(classText)) return -1;
      return -1.5;
    }
    getNativeAnchorCenterX(row) {
      const nativeListIndentRect = row?.matches?.(".listitem-ulist") || row?.querySelector?.(".line-chrome-ulist") ? row.querySelector(".listitem-indentline")?.getBoundingClientRect?.() : null;
      if (nativeListIndentRect && nativeListIndentRect.width > 0) {
        return nativeListIndentRect.left + nativeListIndentRect.width / 2;
      }
      const anchor = row?.querySelector?.(".line-bullet-div, .line-number-div, .line-chrome-ulist, .line-chrome-olist");
      const rect = anchor?.getBoundingClientRect?.();
      if (!rect || rect.width <= 0) return null;
      return rect.left + rect.width / 2 + this.getNativeAnchorOffset(row);
    }
    getNativeAnchorOffset(row) {
      return row?.matches?.(".listitem-ulist") || row?.querySelector?.(".line-chrome-ulist") ? 8 : 0;
    }
    shouldUseMobileMarkerLayout() {
      const hasCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches;
      const hasTouch = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
      return Boolean((hasCoarsePointer || hasTouch) && window.innerWidth <= 900);
    }
    getViewportBounds() {
      const viewport = window.visualViewport;
      const left = viewport?.offsetLeft ?? 0;
      const top = viewport?.offsetTop ?? 0;
      const width = viewport?.width ?? window.innerWidth;
      const height = viewport?.height ?? window.innerHeight;
      return {
        left,
        top,
        right: left + width,
        bottom: top + height
      };
    }
    shouldHideMarkerForViewport(rowRect, lineRect) {
      if (!this.shouldUseMobileMarkerLayout()) return false;
      const viewport = this.getViewportBounds();
      const buffer = 96;
      if (rowRect.bottom < viewport.top - buffer || rowRect.top > viewport.bottom + buffer) return true;
      if (lineRect && (lineRect.right < viewport.left - buffer || lineRect.left > viewport.right + buffer)) return true;
      return false;
    }
    constrainMarkerCenterX(centerX, row, lineDiv, lineRect) {
      if (!Number.isFinite(centerX)) return centerX;
      const checkboxRect = row.querySelector(".line-check-div")?.getBoundingClientRect?.();
      if (checkboxRect && checkboxRect.width > 0) return Math.min(centerX, checkboxRect.left - 14);
      const contentLeft = this.getLineContentLeft(lineDiv, lineRect) || lineRect?.left;
      if (!contentLeft) return centerX;
      return Math.min(centerX, contentLeft - 14);
    }
    blendMarkerTowardContentLeft(centerX, lineDiv, lineRect) {
      const contentLeft = this.getLineContentLeft(lineDiv, lineRect) || lineRect?.left;
      if (!contentLeft || contentLeft <= centerX) return centerX;
      return centerX + (contentLeft - centerX) / 2;
    }
    getDragCircleRect(menu) {
      if (!menu?.getBoundingClientRect) return null;
      const visibleChildren = [...menu.children].map((child) => child.getBoundingClientRect()).filter((rect2) => rect2.width > 0 && rect2.height > 0).filter((rect2) => Math.abs(rect2.width - rect2.height) <= Math.max(6, rect2.height * 0.35)).sort((a, b) => b.right - a.right);
      if (visibleChildren.length) return visibleChildren[0];
      const rect = menu.getBoundingClientRect();
      if (Math.abs(rect.width - rect.height) <= Math.max(6, rect.height * 0.35)) return rect;
      return {
        ...rect,
        left: rect.right - rect.height,
        width: rect.height
      };
    }
    getMarkerGutterOffset(row, lineDiv) {
      const classText = `${row?.className || ""} ${lineDiv?.className || ""}`;
      if (/\blistitem-task\b/i.test(classText)) return 53;
      if (/\blistitem-quote\b|\bquote\b/i.test(classText)) return 28;
      if (/\blistitem-olist\b/i.test(classText)) return 84;
      if (/\blistitem-ulist\b/i.test(classText)) return 65;
      if (this.isHeadingRow(row, lineDiv)) return 28;
      return 28;
    }
    applyMarkerPalette(marker, row, lineDiv) {
      const palette = PALETTES[this.paletteName] || PALETTES.theme;
      const color = palette[this.getRowDepth(row, lineDiv) % palette.length];
      row.style.setProperty("--flowythymer-level-color", color);
      row.style.setProperty("--flowythymer-level-color-rgb", this.colorToRgb(color));
      marker.style.setProperty("--flowythymer-marker-color", color);
      marker.style.setProperty("--flowythymer-marker-ring-color", this.colorToRgb(color));
    }
    getConfiguredPaletteName() {
      return this.settings?.palette || this.getDefaultSettings().palette;
    }
    getRowDepth(row, lineDiv) {
      const marginLeft = this.getRowIndentMargin(row, lineDiv);
      return Math.max(0, Math.round(marginLeft / 30));
    }
    getRowIndentMargin(row, lineDiv) {
      const elements = [
        row.querySelector(".line-check-div"),
        row.querySelector(".line-bullet-div"),
        row.querySelector(".line-number-div"),
        row.querySelector(".line-chrome-ulist"),
        row.querySelector(".line-chrome-olist"),
        lineDiv,
        row
      ];
      for (const element of elements) {
        if (!element) continue;
        const inlineMargin = Number.parseFloat(element.style?.marginLeft || "");
        if (Number.isFinite(inlineMargin) && inlineMargin > 0) return inlineMargin;
        const computedMargin = Number.parseFloat(getComputedStyle(element).marginLeft);
        if (Number.isFinite(computedMargin) && computedMargin > 0) return computedMargin;
      }
      return 0;
    }
    colorToRgb(color) {
      if (!color) return "139 92 246";
      if (color.startsWith("#")) return this.hexToRgb(color);
      if (/^rgba?\(/i.test(color)) {
        const parts2 = color.match(/\d+(?:\.\d+)?/g)?.slice(0, 3) || [];
        return parts2.length === 3 ? parts2.map((part) => String(Math.round(Number.parseFloat(part)))).join(" ") : "139 92 246";
      }
      this.colorRgbCache ||= /* @__PURE__ */ new Map();
      const cached = this.colorRgbCache.get(color);
      if (cached) return cached;
      const probe = document.createElement("span");
      probe.style.color = color;
      probe.style.position = "fixed";
      probe.style.opacity = "0";
      probe.style.pointerEvents = "none";
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      const parts = resolved.match(/\d+(?:\.\d+)?/g)?.slice(0, 3) || [];
      const rgb = parts.length === 3 ? parts.map((part) => String(Math.round(Number.parseFloat(part)))).join(" ") : "139 92 246";
      this.colorRgbCache.set(color, rgb);
      return rgb;
    }
    hexToRgb(hex) {
      const value = hex.replace("#", "");
      const full = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
      const int = Number.parseInt(full, 16);
      return `${int >> 16 & 255} ${int >> 8 & 255} ${int & 255}`;
    }
    isNativeListRow(row, lineDiv) {
      const text = lineDiv?.textContent || "";
      return row?.matches?.(".listitem-ulist, .listitem-olist") || Boolean(row?.querySelector?.(".line-chrome-ulist, .line-chrome-olist")) || /^\s*(?:\d+[.)]|[-*•◦▪])\s+/.test(text);
    }
    isCodeBlockRow(row) {
      const lineDiv = row?.querySelector?.(".line-div");
      const classText = `${row?.className || ""} ${lineDiv?.className || ""}`;
      if (row?.closest?.('.block-container-div.block-codelang, .block-container-div[class*="block-lang-"], .block-container-div[ns-type]')) return true;
      if (/\b(?:listitem-code|codeblock|code-block|preformatted)\b/i.test(classText)) return true;
      if (row?.matches?.('[data-type="code"], [data-node-type="code"], [data-format="code"]')) return true;
      return Boolean(lineDiv?.querySelector?.('pre, code, .cm-editor, .cm-line, [class*="code-block"], [class*="codeblock"]'));
    }
    isHeadingRow(row, lineDiv) {
      const text = `${row?.className || ""} ${lineDiv?.className || ""}`;
      if (/\b(?:heading|header|h[1-6])\b/i.test(text)) return true;
      const fontSize = Number.parseFloat(getComputedStyle(lineDiv).fontSize);
      return Number.isFinite(fontSize) && fontSize >= 24;
    }
    getMenuForGuid(guid) {
      if (!guid) return null;
      return document.querySelector(`.link-menu.item-drag-handle-editor-style[data-guid="${CSS.escape(guid)}"]`);
    }
    zoomIntoMarkerRow(guid) {
      const row = document.querySelector(`.listitem[data-guid="${CSS.escape(guid)}"]`);
      if (!row) return;
      const menu = this.getMenuForGuid(guid) || document.querySelector(".link-menu.item-drag-handle-editor-style") || document.querySelector(".link-menu");
      const zoomAction = menu?.querySelector?.(".link-menu-action-zoom") || document.querySelector(".link-menu-action-zoom");
      if (!menu || !zoomAction) {
        row.querySelector(".line-div")?.dispatchEvent(new MouseEvent("dblclick", {
          bubbles: true,
          cancelable: true,
          composed: true,
          view: window
        }));
        return;
      }
      const previousGuid = menu.getAttribute("data-guid");
      const wasVisible = menu.classList.contains("link-menu-visible");
      const bodyWasOpen = document.body.classList.contains("editor-drag-handle-open");
      const previousTop = menu.style.top;
      const previousLeft = menu.style.left;
      const previousDisplay = zoomAction.style.display;
      const previousVisibility = zoomAction.style.visibility;
      const rowRect = row.getBoundingClientRect();
      menu.setAttribute("data-guid", guid);
      menu.classList.add("link-menu-visible");
      document.body.classList.add("editor-drag-handle-open");
      menu.style.setProperty("top", `${rowRect.top + rowRect.height / 2}px`, "important");
      menu.style.setProperty("left", `${rowRect.left}px`, "important");
      zoomAction.style.setProperty("display", "flex", "important");
      zoomAction.style.setProperty("visibility", "hidden", "important");
      this.fullClick(zoomAction);
      zoomAction.style.display = previousDisplay;
      zoomAction.style.visibility = previousVisibility;
      if (!wasVisible) menu.classList.remove("link-menu-visible");
      if (!bodyWasOpen) document.body.classList.remove("editor-drag-handle-open");
      if (previousGuid) menu.setAttribute("data-guid", previousGuid);
      else menu.removeAttribute("data-guid");
      if (previousTop) menu.style.top = previousTop;
      else menu.style.removeProperty("top");
      if (previousLeft) menu.style.left = previousLeft;
      else menu.style.removeProperty("left");
    }
    fullClick(element) {
      const rect = element.getBoundingClientRect();
      const options = {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
        button: 0,
        buttons: 1,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      };
      const pointerOptions = {
        ...options,
        pointerId: 1,
        pointerType: "mouse",
        isPrimary: true
      };
      element.dispatchEvent(new PointerEvent("pointerdown", pointerOptions));
      element.dispatchEvent(new MouseEvent("mousedown", options));
      element.dispatchEvent(new PointerEvent("pointerup", pointerOptions));
      element.dispatchEvent(new MouseEvent("mouseup", options));
      element.dispatchEvent(new MouseEvent("click", options));
    }
    isBlankRow(row) {
      const lineDiv = row?.querySelector?.(".line-div");
      if (!lineDiv) return !(row?.textContent || "").trim();
      return !Array.from(lineDiv.childNodes).some((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node;
          if (element.classList?.contains("listitem-indentline")) return false;
          if (element.classList?.contains("bt-active-highlight")) return false;
          if (element.classList?.contains("flowythymer-marker")) return false;
        }
        return (node.textContent || "").trim().length > 0;
      });
    }
    isFoldedRow(row, guid) {
      const menu = this.getMenuForGuid(guid);
      if (menu?.classList.contains("show-expand")) return true;
      if (menu?.classList.contains("show-collapse")) return false;
      if (row.getAttribute("aria-expanded") === "false") return true;
      if (row.matches('[aria-expanded="false"], .collapsed, .folded, .is-collapsed, .show-expand')) return true;
      if (row.querySelector('[aria-expanded="false"], .collapsed, .folded, .is-collapsed, .show-expand')) return true;
      const guidSelector = CSS.escape(guid);
      const collapseButton = document.querySelector(`.link-menu[data-guid="${guidSelector}"].show-expand, .link-menu.item-drag-handle-editor-style[data-guid="${guidSelector}"].show-expand`);
      return Boolean(collapseButton);
    }
    clearRetainedMenu() {
      this.retainedGuid = null;
      this.clearHoverLock();
      document.body.classList.remove("flowythymer-retain-menu");
      document.querySelectorAll(".flowythymer-target-menu").forEach((menu) => {
        menu.classList.remove("flowythymer-target-menu");
      });
    }
    getRetainedRow() {
      if (!this.retainedGuid) return null;
      return document.querySelector(`.listitem[data-guid="${CSS.escape(this.retainedGuid)}"]`);
    }
    isPointInsideRetainedRow(x, y) {
      const row = this.getRetainedRow();
      if (!row) return false;
      const rect = row.getBoundingClientRect();
      return x >= rect.left - 8 && x <= rect.right + 8 && y >= rect.top - 4 && y <= rect.bottom + 4;
    }
    isEventInsideRetainedRow(event) {
      const row = this.getRetainedRow();
      const target = event.target;
      return Boolean(row && target instanceof Node && row.contains(target));
    }
    toggleMenuState(guid) {
      const menu = document.querySelector(`.link-menu.item-drag-handle-editor-style[data-guid="${CSS.escape(guid)}"]`);
      if (!menu) return false;
      if (menu.classList.contains("show-collapse")) {
        menu.classList.remove("show-collapse");
        menu.classList.add("show-expand");
        menu.classList.add("link-menu-visible");
        return "show-expand";
      }
      if (menu.classList.contains("show-expand")) {
        menu.classList.remove("show-expand");
        menu.classList.add("show-collapse");
        menu.classList.add("link-menu-visible");
        return "show-collapse";
      }
      return false;
    }
    onUnload() {
      if (this.clickHandler) document.removeEventListener("click", this.clickHandler, true);
      if (this.pointerDownHandler) document.removeEventListener("pointerdown", this.pointerDownHandler, true);
      if (this.pointerMoveHandler) document.removeEventListener("pointermove", this.pointerMoveHandler, true);
      if (this.keyDownHandler) document.removeEventListener("keydown", this.keyDownHandler, true);
      if (this.keyUpHandler) document.removeEventListener("keyup", this.keyUpHandler, true);
      if (this.resizeHandler) window.removeEventListener("resize", this.resizeHandler, true);
      if (this.mobileViewportSyncHandler) window.removeEventListener("scroll", this.mobileViewportSyncHandler, true);
      window.visualViewport?.removeEventListener?.("scroll", this.mobileViewportSyncHandler, true);
      window.visualViewport?.removeEventListener?.("resize", this.mobileViewportSyncHandler, true);
      if (this.markerRaf) cancelAnimationFrame(this.markerRaf);
      if (this.viewportSyncRaf) cancelAnimationFrame(this.viewportSyncRaf);
      if (this.markerUpdateTimeout) clearTimeout(this.markerUpdateTimeout);
      this.markerObserver?.disconnect();
      this.caretObserver?.disconnect();
      this.statusBarItem?.remove?.();
      this.styleElement?.remove();
      document.body.classList.remove("flowythymer-themed-indentlines", "flowythymer-native-bullets-only", "flowythymer-activethread-disabled");
      document.documentElement.style.removeProperty("--flowythymer-indentline-width");
      document.documentElement.style.removeProperty("--flowythymer-indentline-opacity");
      document.documentElement.style.removeProperty("--flowythymer-thread-stroke-width");
      document.querySelectorAll(".link-menu.item-drag-handle-editor-style[data-guid]").forEach((menu) => {
        menu.style.removeProperty("--flowythymer-menu-offset-y");
        menu.classList.remove("flowythymer-menu-firstline");
      });
      document.querySelectorAll(".flowythymer-marker").forEach((marker) => marker.remove());
      document.querySelectorAll(".flowythymer-thread-connector").forEach((connector) => connector.remove());
      document.querySelectorAll(".flowythymer-indent-extension").forEach((extension) => extension.remove());
      document.querySelectorAll(".flowythymer-row, .flowythymer-row-blank, .flowythymer-row-folded, .flowythymer-row-native-list, .flowythymer-row-wrapped-guide").forEach((row) => {
        row.classList.remove("flowythymer-row", "flowythymer-row-blank", "flowythymer-row-folded", "flowythymer-row-native-list", "flowythymer-row-wrapped-guide", "flowythymer-thread-target", "flowythymer-thread-path");
        delete row.dataset.flowythymerMarkerCenterX;
      });
      this.clearRetainedMenu();
      delete globalThis.flowythymerRetainMenu;
      delete globalThis.flowythymerClearRetainMenu;
      delete globalThis.flowythymerToggleMenuState;
      delete globalThis.flowythymerSetPalette;
      delete globalThis.flowythymerSetActiveThread;
      delete globalThis.flowythymerOpenSettings;
    }
  };
  return __toCommonJS(plugin_exports);
})();
