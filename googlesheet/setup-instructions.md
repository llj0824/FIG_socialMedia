# Step-by-Step Setup Instructions

## Prerequisites
- Google Account
- DeepSeek API Key ([Get one here](https://platform.deepseek.com/))
- ~30 minutes for initial setup

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Rename it to "FIG Script Generator"

## Step 2: Set Up Sheet Structure

### Create Tab 1: "Input"
1. Right-click on "Sheet1" → Rename to "Input"
2. Add headers in Row 1:
   - A1: `Timestamp`
   - B1: `Source Content`
   - C1: `Script Count`
   - D1: `Word Count`
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
   - A1: `Request ID`
   - B1: `Script #`
   - C1: `Theme`
   - D1: `Script Content`
   - E1: `Word Count`
   - F1: `Generated At`

### Create Tab 3: "Config"
1. Add another new sheet
2. Rename to "Config"
3. Set up configuration:
   - A1: `DeepSeek API Key`
   - B1: [Paste your API key here]
   - A2: `Model`
   - B2: `deepseek-chat`
   - A3: `Temperature`
   - B3: `0.7`

## Step 3: Add Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code
3. Copy all code from `apps-script.js` 
4. Paste into the Apps Script editor
5. Click 💾 Save (Ctrl/Cmd + S)
6. Name the project "FIG Script Generator"

## Step 4: Create Google Form

1. In your Google Sheet, go to **Tools → Create a new form**
2. Set up the form:

### Form Title
"Content to Video Scripts Generator"

### Question 1: Source Content
- Type: Long answer text
- Question: "Paste your article or transcript here"
- Required: Yes

### Question 2: Number of Scripts
- Type: Multiple choice
- Question: "How many scripts do you want?"
- Options:
  - 1
  - 2
  - 3
  - 5
- Required: Yes

### Question 3: Word Count
- Type: Multiple choice  
- Question: "Target word count per script"
- Options:
  - 300-500
  - 500-1000
- Required: Yes

3. Click "Send" → "Link" icon → Copy the form link for later

## Step 5: Link Form to Sheet

1. In the Google Form editor
2. Click "Responses" tab
3. Click the Google Sheets icon
4. Select "Select existing spreadsheet"
5. Choose your "FIG Script Generator" sheet
6. This creates a new tab called "Form Responses 1"

## Step 6: Set Up Form Trigger

1. Go back to your Google Sheet
2. Click on **Extensions → Apps Script**
3. You should see the custom menu when you refresh the sheet
4. Click **🎬 Script Generator → ⚙️ Setup Form Trigger**
5. You'll be asked to authorize:
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to FIG Script Generator (unsafe)"
   - Click "Allow"

## Step 7: Test the System

1. Open your form link (from Step 4)
2. Submit a test entry:
   - **Source Content**: 
   ```
   今天讲讲萧山赘婿的故事。20年前和现在完全不同，以前是富一代招女婿，
   现在是富二代。富一代的钱是自己赚的，看重能力。富二代从小就在争遗产，
   把钱看得特别重。所以现在想靠入赘发财，基本不可能。
   ```
   - **Number of Scripts**: 3
   - **Word Count**: 300-500

3. Go back to your Google Sheet
4. Check the "Form Responses 1" tab - you should see your submission
5. The Apps Script should automatically:
   - Copy data to "Input" tab
   - Process with DeepSeek
   - Generate scripts in "Results" tab

## Step 8: Manual Processing (If Needed)

If automatic processing doesn't work:
1. Go to **🎬 Script Generator → ▶️ Process Latest Entry**
2. Check "Input" tab for status updates
3. Check "Results" tab for generated scripts

## Step 9: Verify Results

You should see in the "Results" tab:
- 3 different scripts
- Each with a unique theme
- Each around 300-500 words
- Ready for video recording

## Troubleshooting

### "No API Key configured"
- Check Config tab, cell B1 has your DeepSeek API key

### Scripts not generating automatically
1. Check form trigger: **🎬 Script Generator → ⚙️ Setup Form Trigger**
2. Try manual processing: **🎬 Script Generator → ▶️ Process Latest Entry**

### "Error: Invalid API response"
- Verify API key is correct
- Test API: **🎬 Script Generator → 🧪 Test API Connection**
- Check DeepSeek account has credits

### Form responses not showing in sheet
1. In Google Form → Responses → Settings (⚙️)
2. Make sure "Collect email addresses" is OFF
3. Re-link to spreadsheet if needed

## Advanced Usage

### Batch Processing
Process multiple pending entries:
**🎬 Script Generator → 🔄 Process All Pending**

### Export to Document
Create a formatted Google Doc with all scripts:
**🎬 Script Generator → 📄 Export to Google Doc**

### Monitor Usage
Check your DeepSeek usage at: https://platform.deepseek.com/usage

## Tips for Best Results

1. **Source Content Quality**: 
   - Provide 500+ words for best results
   - Include specific examples and stories
   - Clear topic focus works better

2. **Optimal Settings**:
   - 3 scripts gives good variety
   - 300-500 words for short platforms (TikTok, Shorts)
   - 500-1000 words for longer content (B站, 小红书)

3. **Cost Management**:
   - Each generation uses ~2-3K tokens
   - Monitor usage in DeepSeek dashboard
   - Batch process during off-peak for stability

## Next Steps

1. Share form link with content creators
2. Review and refine generated scripts
3. Track which themes perform best
4. Adjust prompts based on results

## Support

- Check Apps Script logs: View → Logs
- API issues: support@deepseek.com
- Script updates: Check the GitHub repo