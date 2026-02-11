# Open Claude Code

An Obsidian plugin that adds a right-click context menu option to open [Claude Code](https://docs.anthropic.com/en/docs/claude-code) in a terminal at any folder location.

## Installation

### Via BRAT (recommended)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin from Obsidian's community plugins
2. Open BRAT settings → **Add Beta plugin**
3. Enter: `blokpardi/open-claude-code`
4. Enable **Open Claude Code** in Settings → Community plugins

### Manual

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/blokpardi/open-claude-code/releases/latest)
2. Create a folder called `open-claude-code` in your vault's `.obsidian/plugins/` directory
3. Copy both files into that folder
4. Enable **Open Claude Code** in Settings → Community plugins

## Usage

Right-click any folder in the file explorer → **Open Claude Code**

This opens a new terminal window with Claude Code running at that folder's location.

## Settings

Go to Settings → **Open Claude Code** to configure:

- **Shell**: Choose between PowerShell (default) or Command Prompt (cmd)

## Requirements

- Windows (desktop only)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and available on your PATH
- [Windows Terminal](https://aka.ms/terminal) (recommended) — falls back to direct shell launch if not available
