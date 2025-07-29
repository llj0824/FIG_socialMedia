# Feishu Open Platform + Cloud Functions Implementation

A content-to-scripts generator using Feishu Forms as the interface, Tencent Cloud Functions for processing, and Baidu ERNIE API for AI-powered script generation.

## Overview
This solution transforms long-form content into multiple short video scripts optimized for social media. Users submit content through a Feishu Form, and the system automatically generates themed scripts using AI.

## Architecture
```
Feishu Form → Feishu Sheet → Tencent Cloud Function → DeepSeek API → Feishu Doc Output
```

## Features
- **Simple Interface**: Feishu Form for submissions
- **China-Compatible**: Fully accessible within China
- **AI-Powered**: DeepSeek generates multiple themed scripts
- **Serverless**: Runs on Tencent Cloud Functions
- **Integrated Notification**: Results delivered in Feishu chat/docs
- **Cost-Effective**: ~$2-3/month for 1000 generations

## Quick Start
1. Create Feishu Open Platform application
2. Set up Tencent Cloud Function
3. Configure Feishu form and bot
4. Add DeepSeek API key
5. Start generating scripts!

### Cost Estimate
- **1,000 requests**: ~$0.167 (Tencent Cloud) + $2-3 (DeepSeek)
- **10,000 requests**: ~$1.67 (Tencent Cloud) + $20-30 (DeepSeek)
