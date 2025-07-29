/**
 * FIG Live Stream Script Generator
 * Main Apps Script for Google Sheets integration with DeepSeek API
 */

// Configuration
const CONFIG = {
  SHEETS: {
    INPUT: 'Input',
    RESULTS: 'Results', 
    CONFIG: 'Config'
  },
  API: {
    DEEPSEEK_ENDPOINT: 'https://api.deepseek.com/v1/chat/completions',
    MODEL: 'deepseek-chat',
    TEMPERATURE: 0.7
  }
};

/**
 * Runs when the spreadsheet is opened
 * Creates custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎬 Script Generator')
    .addItem('▶️ Process Latest Entry', 'processLatest')
    .addItem('🔄 Process All Pending', 'batchProcess')
    .addItem('⚙️ Setup Form Trigger', 'setupTrigger')
    .addItem('📄 Export to Google Doc', 'exportToDoc')
    .addSeparator()
    .addItem('🧪 Test API Connection', 'testAPI')
    .addToUi();
}

/**
 * Main function triggered by form submission
 * @param {Object} e - Form submit event
 */
function onFormSubmit(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const inputSheet = sheet.getSheetByName(CONFIG.SHEETS.INPUT);
  const resultsSheet = sheet.getSheetByName(CONFIG.SHEETS.RESULTS);
  const configSheet = sheet.getSheetByName(CONFIG.SHEETS.CONFIG);
  
  // Get the row that was just added
  const row = e ? e.range.getRow() : inputSheet.getLastRow();
  
  // Get submission data
  const timestamp = inputSheet.getRange(row, 1).getValue();
  const sourceContent = inputSheet.getRange(row, 2).getValue();
  const scriptCount = inputSheet.getRange(row, 3).getValue();
  const wordCount = inputSheet.getRange(row, 4).getValue();
  
  // Validation
  if (!sourceContent || !scriptCount || !wordCount) {
    inputSheet.getRange(row, 5).setValue('Error: Missing required fields');
    return;
  }
  
  // Update status
  inputSheet.getRange(row, 5).setValue('Processing...');
  SpreadsheetApp.flush(); // Force update
  
  // Get API key from config
  const apiKey = configSheet.getRange('B1').getValue();
  if (!apiKey) {
    inputSheet.getRange(row, 5).setValue('Error: No API key configured');
    return;
  }
  
  try {
    // Generate scripts using DeepSeek
    const scripts = generateScripts(sourceContent, scriptCount, wordCount, apiKey);
    
    // Save results
    let successCount = 0;
    scripts.forEach((script, index) => {
      try {
        resultsSheet.appendRow([
          row, // Request ID
          index + 1, // Script number
          script.theme || 'Theme ' + (index + 1),
          script.content || 'No content generated',
          script.content ? script.content.length : 0,
          timestamp
        ]);
        successCount++;
      } catch (err) {
        console.error('Error saving script ' + (index + 1), err);
      }
    });
    
    // Update status
    inputSheet.getRange(row, 5).setValue(`Completed (${successCount} scripts)`);
    inputSheet.getRange(row, 6).setValue(new Date()); // Completion time
    
  } catch (error) {
    console.error('Processing error:', error);
    inputSheet.getRange(row, 5).setValue('Error: ' + error.toString());
  }
}

/**
 * Generate scripts using DeepSeek API
 * @param {string} content - Source content
 * @param {number} count - Number of scripts to generate
 * @param {string} wordCount - Target word count (e.g., "300-500")
 * @param {string} apiKey - DeepSeek API key
 * @returns {Array} Array of script objects
 */
function generateScripts(content, count, wordCount, apiKey) {
  // Build the prompt
  const prompt = buildPrompt(content, count, wordCount);
  
  // Call DeepSeek API
  const response = UrlFetchApp.fetch(CONFIG.API.DEEPSEEK_ENDPOINT, {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      model: CONFIG.API.MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert short video script writer specializing in viral content creation. You understand narrative hooks, engagement patterns, and how to adapt long-form content into compelling short scripts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: CONFIG.API.TEMPERATURE,
      max_tokens: 4000
    })
  });
  
  // Parse response
  const result = JSON.parse(response.getContentText());
  if (!result.choices || !result.choices[0]) {
    throw new Error('Invalid API response');
  }
  
  const content = result.choices[0].message.content;
  
  // Try to parse as JSON
  try {
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse JSON response:', e);
  }
  
  // Fallback: create simple script objects
  return [{
    theme: 'Generated Script',
    content: content
  }];
}

/**
 * Build the prompt for DeepSeek
 * @param {string} content - Source content
 * @param {number} count - Number of scripts
 * @param {string} wordCount - Word count range
 * @returns {string} Formatted prompt
 */
function buildPrompt(content, count, wordCount) {
  return `你是一个短视频脚本创作专家。请根据以下内容，提取${count}个不同的主题，并为每个主题生成一个${wordCount}字的短视频脚本。

源内容：
${content.substring(0, 3000)} ${content.length > 3000 ? '...(内容已截断)' : ''}

要求：
1. 提取的主题要有差异性，覆盖不同角度
2. 每个脚本要适合口播，语言要口语化、接地气
3. 开头必须有强钩子，能在3秒内吸引观众
4. 结构：钩子→故事/观点→转折→结论
5. 多用短句，避免长难句
6. 每个脚本控制在${wordCount}字
7. 适合在抖音、小红书等平台发布

请严格按以下JSON格式返回：
[
  {
    "theme": "主题名称（10字以内）",
    "content": "完整的脚本内容"
  }
]

只返回JSON，不要有其他说明文字。`;
}

/**
 * Process the latest entry manually
 */
function processLatest() {
  onFormSubmit();
}

/**
 * Process all pending entries
 */
function batchProcess() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const inputSheet = sheet.getSheetByName(CONFIG.SHEETS.INPUT);
  const lastRow = inputSheet.getLastRow();
  
  let processed = 0;
  
  for (let row = 2; row <= lastRow; row++) {
    const status = inputSheet.getRange(row, 5).getValue();
    
    if (status === 'Pending' || status === '') {
      try {
        // Simulate form submit event
        onFormSubmit({ range: { getRow: () => row } });
        processed++;
        
        // Rate limiting
        Utilities.sleep(2000);
      } catch (e) {
        console.error('Error processing row ' + row, e);
      }
    }
  }
  
  SpreadsheetApp.getUi().alert(`Processed ${processed} entries`);
}

/**
 * Setup automatic trigger for form submissions
 */
function setupTrigger() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onFormSubmit()
    .create();
    
  SpreadsheetApp.getUi().alert('Form trigger has been set up successfully!');
}

/**
 * Export results to Google Doc
 */
function exportToDoc() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const resultsSheet = sheet.getSheetByName(CONFIG.SHEETS.RESULTS);
  const data = resultsSheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    SpreadsheetApp.getUi().alert('No results to export');
    return;
  }
  
  // Create new document
  const doc = DocumentApp.create('Script Generation Results - ' + 
    Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd HH:mm'));
  const body = doc.getBody();
  
  // Add title
  const title = body.appendParagraph('Generated Video Scripts');
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  body.appendParagraph('Generated on: ' + new Date().toString());
  body.appendParagraph('');
  
  // Group by request ID
  const groupedData = {};
  for (let i = 1; i < data.length; i++) {
    const requestId = data[i][0];
    if (!groupedData[requestId]) {
      groupedData[requestId] = [];
    }
    groupedData[requestId].push(data[i]);
  }
  
  // Add scripts
  Object.keys(groupedData).forEach(requestId => {
    body.appendPageBreak();
    
    const requestTitle = body.appendParagraph('Request #' + requestId);
    requestTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    
    groupedData[requestId].forEach(row => {
      const scriptTitle = body.appendParagraph('Script ' + row[1] + ': ' + row[2]);
      scriptTitle.setHeading(DocumentApp.ParagraphHeading.HEADING3);
      scriptTitle.setBold(true);
      
      body.appendParagraph(row[3]);
      body.appendParagraph('Word count: ' + row[4])
        .setFontSize(10)
        .setForegroundColor('#666666');
      body.appendParagraph('');
    });
  });
  
  // Get the URL and show to user
  const url = doc.getUrl();
  const ui = SpreadsheetApp.getUi();
  ui.alert('Export Complete', 'Document created: ' + url, ui.ButtonSet.OK);
}

/**
 * Test API connection
 */
function testAPI() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = sheet.getSheetByName(CONFIG.SHEETS.CONFIG);
  const apiKey = configSheet.getRange('B1').getValue();
  
  if (!apiKey) {
    SpreadsheetApp.getUi().alert('Error: No API key configured in Config sheet');
    return;
  }
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.API.DEEPSEEK_ENDPOINT, {
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: CONFIG.API.MODEL,
        messages: [
          {
            role: 'user',
            content: 'Say "API connection successful" in Chinese'
          }
        ],
        max_tokens: 50
      })
    });
    
    const result = JSON.parse(response.getContentText());
    SpreadsheetApp.getUi().alert('Success!', 
      'API connection successful.\n\nResponse: ' + 
      result.choices[0].message.content, 
      SpreadsheetApp.getUi().ButtonSet.OK);
      
  } catch (error) {
    SpreadsheetApp.getUi().alert('API Error', 
      'Failed to connect to DeepSeek API:\n' + error.toString(), 
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}