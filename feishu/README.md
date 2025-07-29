# Feishu Open Platform + Cloud Functions Implementation

A content-to-scripts generator using Feishu Forms as the interface, Tencent Cloud Functions for processing, and Baidu ERNIE API for AI-powered script generation.

## Overview
This solution transforms long-form content into multiple short video scripts optimized for social media. Users submit content through a Feishu Form, and the system automatically generates themed scripts using AI.

## Architecture
```
Feishu Form → Feishu Sheet → Tencent Cloud Function → Baidu ERNIE API → Feishu Doc Output
```

## Features
- **Simple Interface**: Feishu Form for submissions
- **China-Compatible**: Fully accessible within China
- **AI-Powered**: Baidu ERNIE generates multiple themed scripts
- **Serverless**: Runs on Tencent Cloud Functions
- **Integrated Notification**: Results delivered in Feishu chat/docs

## Quick Start
1. Create Feishu Open Platform application
2. Set up Tencent Cloud Function
3. Configure Feishu form and bot
4. Add Baidu ERNIE API key
5. Start generating scripts!
