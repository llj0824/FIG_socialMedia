# FIG Live Stream - Requirements & Implementation Options

## What We're Trying To Do

Transform long-form content (transcripts, articles) into multiple viral short video scripts using AI. Users upload content → AI extracts themes → Generates multiple 300-1000 word scripts optimized for social media virality.

## Constraints

### 🚫 Location Constraint
- **Target users in China** - Google services blocked (no Sheets, Docs, Drive)
- Need China-accessible platforms only

### ⚡ Speed Constraint  
- **Speculative project** - Need MVP in days, not weeks
- Must validate demand before investing heavily

### 🎯 Simplicity Constraint
- **Non-technical users** - Simple upload → get scripts
- Minimal setup, no app downloads if possible
- Mobile-first (most Chinese users on mobile)

## Goal

Build the simplest possible working version to test if people actually want this service. If yes, then scale up complexity.

## Implementation Options (Ranked by Simplicity)

### Option 1: WeChat Mini Program (微信小程序) 
**Pros:**
- Everyone in China has WeChat
- No app download needed
- Built-in payments if needed later
- Can use Tencent Cloud services

**Implementation:**
```
WeChat Mini Program Frontend
↓
Tencent Cloud Function 
↓
AI API (Baidu ERNIE/Alibaba Qwen)
↓
Return scripts in-app
```

**Time to MVP:** 3-5 days

---

### Option 2: WeChat Official Account Bot (公众号机器人) 
**Pros:**
- Even simpler than mini program
- Just send article → receive scripts
- No UI needed

**Implementation:**
```
User sends article to Official Account
↓
Bot processes with AI
↓
Returns multiple scripts as messages
```

**Time to MVP:** 1-2 days

---

### Option 3: Feishu/DingTalk Document + Bot (飞书/钉钉) 
**Pros:**
- Popular with businesses
- Good automation tools
- Free tier available

**Implementation:**
```
Feishu Form → Feishu Sheet → Bot processes → Feishu Doc output
```

**Time to MVP:** 2-3 days

---

### Option 4: Simple Web App (H5页面) 
**Pros:**
- Works everywhere
- Can share via link
- No platform restrictions

**Cons:**
- Need hosting in China (requires ICP license)
- More complex than chat-based

**Implementation:**
```
Simple HTML upload page
↓
Alibaba Cloud Function
↓  
Results page with scripts
```

**Time to MVP:** 3-4 days

---

### Option 5: Notion-like Tools (Wolai/语雀) 
**Pros:**
- Notion alternatives work in China
- Can build forms and databases

**Cons:**
- Less familiar to users
- Limited automation

---

### Option 6: Feishu Open Platform + Cloud Functions
**Pros:**
- Native automation via Feishu Open Platform bots
- Direct integration with Tencent/Ali cloud functions
- No ICP license needed (hosted within Feishu)
- Free tier available

**Implementation:**
```
User submits via Feishu form
↓
Feishu bot triggers Tencent Cloud Function 
↓
AI processing (Baidu ERNIE API)
↓
Results auto-posted to Feishu doc/chat
```

**Time to MVP:** 2-3 days  
**Confirmation:** Yes, Feishu supports custom scripting through its Open Platform SDK
