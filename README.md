# Thymer Indent Rainbow

Rainbow-colored vertical indent guides for Thymer, inspired by popular IDE extensions like VS Code's `indent-rainbow`.

Each indentation level gets a unique color, making it much easier to track hierarchy and parent-child relationships at a glance.

## Screenshots

| Before | After |
|--------|-------|
| ![Before](./screenshots/before.png) | ![After](./screenshots/after.png) |

## Features

- **Rainbow Colors** - Each nesting level has a distinct color
- **6 Color Themes** - Theme, Rainbow, Ocean, Sunset, Forest, Monochrome
- **Configurable Width** - 0.5px to 3px line thickness
- **Adjustable Opacity** - 0% to 100% visibility
- **Hover Enhancement** - Lines brighten on hover for easier tracking
- **Settings Panel** - Configure everything from a dedicated panel
- **Persistent Settings** - Your preferences are saved automatically

## Installation

1. Copy the `thymer-indent-rainbow` folder to your Thymer plugins directory
2. Reload Thymer
3. The plugin activates automatically with the Rainbow theme

## Usage

### Command Palette

Open the Command Palette and search for **"Plugins: Indent Rainbow"** to open the settings panel.

### Status Bar

Click the paint icon in the status bar to open the settings panel.

### Settings Panel

From the settings panel you can:

- Toggle indent rainbow on/off
- Choose a color palette (with live color swatch previews)
- Adjust line width with a slider
- Adjust opacity with a slider

All changes apply live to the editor as you make them.

## Color Themes

| Theme | Description |
|-------|-------------|
| **Theme** | Uses Thymer's built-in theme accent colors |
| **Rainbow** | Vibrant red, orange, yellow, green, cyan, blue, purple |
| **Ocean** | Cool blues and cyans |
| **Sunset** | Warm reds, oranges, and pinks |
| **Forest** | Natural greens |
| **Monochrome** | Subtle grayscale |

## Requirements

- Thymer with Plugin SDK support

## License

MIT
