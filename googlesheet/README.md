# Google Sheets + DeepSeek Implementation

A simple content-to-scripts generator using Google Sheets as the interface and DeepSeek API for AI-powered script generation.

## Overview

This solution transforms long-form content (articles, transcripts) into short video scripts. Users input content directly in Google Sheets with custom prompts, and the system generates scripts using AI.

## Architecture

```
Input Sheet (Article + Prompts) → Apps Script → DeepSeek API → Results Sheet
```

## Features

- **Easy Form Interface**: Built-in form with presets and guidance
- **Direct Prompt Control**: Expose system and user prompts as columns
- **Simple Interface**: Form-based or direct Google Sheets editing
- **Secure API Key**: Stored in script properties, not in sheets
- **Flexible Processing**: Process via form or manually select rows
- **Style Presets**: Viral, Educational, Story-based templates
- **Cost-Effective**: ~$0.001 per script generation

## Quick Start

1. Create a new Google Sheet
2. Set up Input and Results tabs
3. Add the Apps Script code
4. Set your DeepSeek API key via menu
5. Start generating scripts!

## Files in This Directory

- `README.md` - This overview
- `setup-instructions-simple.md` - Simplified step-by-step setup guide
- `apps-script.js` - Main Apps Script code (updated for direct prompt control)
- `example-prompts.md` - Sample prompts and outputs
- `advanced-features.js` - Optional enhancements