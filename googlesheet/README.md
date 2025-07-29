# Google Sheets + DeepSeek Implementation

A simple content-to-scripts generator using Google Sheets as the interface and DeepSeek API for AI-powered script generation.

## Overview

This solution transforms long-form content (articles, transcripts) into multiple short video scripts optimized for social media. Users submit content through a Google Form, and the system automatically generates themed scripts using AI.

## Architecture

```
Google Form → Google Sheet → Apps Script → DeepSeek API → Results Sheet
```

## Features

- **Simple Interface**: Google Form for submissions
- **Automated Processing**: Apps Script handles everything
- **AI-Powered**: DeepSeek generates multiple themed scripts
- **Cost-Effective**: ~$2-3/month for 1000 generations
- **No Infrastructure**: Runs entirely on Google's platform

## Quick Start

1. Copy the template Google Sheet
2. Add your DeepSeek API key
3. Deploy the Apps Script
4. Create and link the form
5. Start generating scripts!

## Files in This Directory

- `README.md` - This overview
- `setup-instructions.md` - Detailed step-by-step setup guide
- `apps-script.js` - Main Apps Script code
- `advanced-features.js` - Optional enhancements
- `example-prompts.md` - Sample prompts and outputs