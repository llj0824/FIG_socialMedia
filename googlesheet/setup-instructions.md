# Simplified Setup Instructions

## Prerequisites
- Google Account
- DeepSeek API Key ([Get one here](https://platform.deepseek.com/))
- ~15 minutes for setup

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Rename it to "FIG Script Generator"

## Step 2: Set Up Sheet Structure

### Create Tab 1: "Input"
1. Right-click on "Sheet1" → Rename to "Input"
2. Add headers in Row 1:
   - A1: `Timestamp`
   - B1: `Article Content`
   - C1: `System Prompt`
   - D1: `User Prompt`
   - E1: `Status`
   - F1: `Completed At`

3. Format the headers (optional):
   - Select Row 1
   - Format → Bold
   - Format → Fill color → Light blue

### Create Tab 2: "Results"
1. Click "+" to add new sheet
2. Rename to "Results"
3. Add headers in Row 1:
   - A1: `Source Row`
   - B1: `Timestamp`
   - C1: `Article Preview`
   - D1: `Generated Script`
   - E1: `Character Count`
   - F1: `System Prompt Used`
   - G1: `User Prompt Used`
   - H1: `Full LLM Payload`
   - I1: `Token Usage`
   - J1: `Model Used`
   - K1: `Processing Time`

### Create Tab 3: "knowledge_base" (Optional but Recommended)
1. Click "+" to add new sheet
2. Rename to "knowledge_base"
3. Add headers in Row 1:
   - A1: `ID`
   - B1: `Title`
   - C1: `Content`
   - D1: `Category`
   - E1: `Tags`
   - F1: `Created Date`
   - G1: `Last Updated`

## Step 3: Add Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code
3. Copy all code from `apps-script.js` 
4. Paste into the Apps Script editor
5. Click 💾 Save (Ctrl/Cmd + S)
6. Name the project "FIG Script Generator"

**Note:** When you first open the sheet after adding the script, it will automatically create all necessary sheets with proper formatting if they don't exist.

## Step 4: Set API Key

**Option A: Using the Menu (Easier)**
1. Refresh your Google Sheet
2. Go to **🎬 Script Generator → 🔑 Set DeepSeek API Key**
3. Enter your API key when prompted
4. Click OK

**Option B: Using Script Properties**
1. In Apps Script editor, go to Project Settings (gear icon)
2. Scroll down to "Script Properties"
3. Click "Add Script Property"
4. Property name: `DEEPSEEK_API_KEY`
5. Value: Your DeepSeek API key
6. Click "Save script properties"

## Step 5: Authorize the Script

When you first run any menu item:
1. You'll see "Authorization required"
2. Click "Continue"
3. Choose your Google account
4. Click "Advanced" → "Go to FIG Script Generator (unsafe)"
5. Click "Allow"

## Step 6: Add Your First Entry

Based on the example files, here's what to put in each column:

### Input Sheet (Row 2):

| Column | What to Put | Example |
|--------|-------------|---------|
| **A (Timestamp)** | Leave empty | Auto-fills when processed |
| **B (Article Content)** | Your full article | *Paste entire article about your topic* |
| **C (System Prompt)** | Define AI's role | `你是一个短视频脚本创作专家，擅长将长文章改编成多个有吸引力的短视频脚本。每个脚本要有强烈的开头钩子，口语化表达，适合口播。` |
| **D (User Prompt)** | Specific instructions | `请根据这篇关于萧山赘婿的文章，生成2个不同角度的短视频脚本，每个400-600字。第一个从历史角度讲述萧山赘婿现象，第二个从现实角度分析为什么现在很难复制。要用"兄弟"这样的口语化称呼，让观众有代入感。` |
| **E (Status)** | Leave empty | Will show "Processing..." then "Completed" |
| **F (Completed At)** | Leave empty | Auto-fills when done |
| **G (Knowledge Base Refs)** | Knowledge IDs (optional) | `KB001, KB002` or leave empty |

## Step 7: Process Your Entry

### Option A: Use the Form (Recommended)
1. Go to **🎬 Script Generator → 📝 New Article Form**
2. Fill out the form:
   - Paste your article
   - Adjust the system prompt (or use presets)
   - Select number of scripts, word count, style
   - Select reference knowledge base items (optional)
   - Add any special instructions
3. Click "Generate Scripts"
4. The form will automatically add a row and process it

### Option B: Manual Row Entry
1. Add your data manually to the Input sheet
2. Click on the row you just added (click the row number)
3. Go to **🎬 Script Generator → ▶️ Process Selected Row**
4. Watch Column E - it will show "Processing..." then "Completed"
5. Check the "Results" tab for your generated script

### What You'll See in Results Sheet:

| Column | What You'll Get |
|--------|----------------|
| **A (Source Row)** | 2 |
| **B (Timestamp)** | Processing time |
| **C (Article Preview)** | First 100 characters of your article |
| **D (Generated Script)** | The AI-generated script(s) |
| **E (Character Count)** | Length of generated content |
| **F (System Prompt Used)** | Your system prompt |
| **G (User Prompt Used)** | Your user prompt |
| **H (Full LLM Payload)** | Complete request sent to DeepSeek (for transparency) |
| **I (Token Usage)** | Input/output token counts |
| **J (Model Used)** | Which AI model was used |
| **K (Processing Time)** | When the script was generated |

## Example Prompts from Real Use Case

### System Prompt Examples:

**For viral content:**
```
你是一个短视频脚本专家，擅长创作病毒式传播的内容。注重强钩子和情绪点。
```

**For educational content:**
```
你是一个知识类短视频创作者，擅长把复杂概念讲解得通俗易懂。
```

**For story-based content:**
```
你是一个故事型短视频编剧，擅长从普通内容中提取精彩故事。
```

### User Prompt Examples:

**For multiple scripts in one response (like the Xiaoshan example):**
```
请基于文章内容生成3个短视频脚本：
1. 标题"凭什么当萧山赘婿"（500字，用兄弟开头，讲历史）
2. 标题"现实赘婿财富吞噬局"（400字，揭露现实残酷）
3. 标题"富二代的算盘"（450字，分析心理）
每个脚本都要有强钩子开头。
```

**For single focused script:**
```
生成一个抖音短视频脚本，主题是"为什么20年前能当萧山赘婿，现在不行了"。要求：
- 开头用疑问句吸引注意力
- 300-400字
- 用具体例子（如万向集团、航民集团）
- 结尾要有金句总结
```

**For different angles from same content:**
```
请根据文章生成2个不同角度的短视频脚本：
1. 从历史发展角度，讲述萧山企业家的崛起（500字）
2. 从现代年轻人角度，分析为什么不要有入赘幻想（400字）
都要用口语化表达，有故事性。
```

## Knowledge Base Feature (New!)

The knowledge base allows you to store reference materials that can be included when generating scripts:

### Adding Knowledge Base Entries:
1. Go to the "knowledge_base" sheet
2. Add entries with:
   - **ID**: Unique identifier (e.g., KB001)
   - **Title**: Short description
   - **Content**: The reference material
   - **Category**: Type of content
   - **Tags**: Keywords for searching

### Example Knowledge Base Entries:
- **KB001**: Short video hook techniques
- **KB002**: Pacing and rhythm control
- **KB003**: Emotional expression techniques

### Using Knowledge Base:
1. In the form, select relevant knowledge base items
2. The content will be included as reference material
3. The AI will use it for inspiration but won't copy directly

## Enhanced Transparency Features

The Results sheet now shows:
- **Full LLM Payload**: See exactly what was sent to the AI
- **Token Usage**: Monitor your API usage
- **Processing Details**: Track when and how scripts were generated

This transparency helps you:
1. Understand how prompts affect output
2. Optimize your prompts for better results
3. Track API usage and costs
4. Debug any issues

## Tips

1. **Article Content**: The more detailed your article, the better the output
2. **System Prompt**: Defines the AI's role and style
3. **User Prompt**: Specific instructions for this generation
4. **Knowledge Base**: Use reference materials to guide style and structure
5. **Experiment**: Try different combinations to find what works best
6. **Processing Multiple**: Add multiple rows and process them one by one

## Troubleshooting

### "No API key set"
- Use the menu: **🎬 Script Generator → 🔑 Set DeepSeek API Key**
- Or set it in Apps Script project settings (see Step 4)

### "Error" in Status column
- Check your API key is correct
- Verify you have credits in DeepSeek account
- Try a simpler prompt first

### Nothing happens when clicking menu
- Make sure you've authorized the script (Step 5)
- Refresh the page and try again

## Cost

- Each generation uses approximately 2-3K tokens
- Cost: ~$0.001 per script
- Monitor usage at: https://platform.deepseek.com/usage