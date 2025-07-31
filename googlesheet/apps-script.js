/**
 * FIG Live Stream Script Generator - Simplified Version
 * Main Apps Script for Google Sheets integration with DeepSeek API
 */

// Configuration
const CONFIG = {
  SHEETS: {
    INPUT: 'Input',
    RESULTS: 'Results',
    KNOWLEDGE_BASE: 'knowledge_base'
  },
  API: {
    DEEPSEEK_ENDPOINT: 'https://api.deepseek.com/v1/chat/completions',
    MODEL: 'deepseek-reasoner',
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
    .addItem('📝 New Article Form', 'showArticleForm')
    .addItem('▶️ Process Selected Row', 'processSelectedRow')
    .addSeparator()
    .addItem('🔧 Initialize Sheets', 'initializeSheets')
    .addItem('🔑 Set DeepSeek API Key', 'setApiKey')
    .addToUi();
  
  // Auto-initialize sheets if they don't exist
  initializeSheets(false);
}

/**
 * Initialize sheets with proper structure
 */
function initializeSheets(showAlert = true) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Initialize Input sheet
  let inputSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.INPUT);
  if (!inputSheet) {
    inputSheet = spreadsheet.insertSheet(CONFIG.SHEETS.INPUT);
    inputSheet.appendRow([
      'Timestamp',
      'Article Content',
      'System Prompt',
      'User Prompt',
      'Status',
      'Completed At',
      'Knowledge Base Refs'
    ]);
    
    // Format headers
    const headerRange = inputSheet.getRange(1, 1, 1, 7);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    
    // Set column widths
    inputSheet.setColumnWidth(1, 150); // Timestamp
    inputSheet.setColumnWidth(2, 400); // Article Content
    inputSheet.setColumnWidth(3, 300); // System Prompt
    inputSheet.setColumnWidth(4, 300); // User Prompt
    inputSheet.setColumnWidth(5, 100); // Status
    inputSheet.setColumnWidth(6, 150); // Completed At
    inputSheet.setColumnWidth(7, 150); // Knowledge Base Refs
  }
  
  // Initialize Results sheet with enhanced columns
  let resultsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.RESULTS);
  if (!resultsSheet) {
    resultsSheet = spreadsheet.insertSheet(CONFIG.SHEETS.RESULTS);
  }
  
  // Clear and reset Results sheet headers for enhanced transparency
  if (resultsSheet.getLastRow() === 0 || showAlert) {
    resultsSheet.clear();
    resultsSheet.appendRow([
      'Source Row',
      'Timestamp',
      'Article Preview',
      'Generated Script',
      'Character Count',
      'System Prompt Used',
      'User Prompt Used',
      'Full LLM Payload',
      'Token Usage',
      'Model Used',
      'Processing Time'
    ]);
    
    // Format headers
    const headerRange = resultsSheet.getRange(1, 1, 1, 11);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#34a853');
    headerRange.setFontColor('#ffffff');
    
    // Set column widths
    resultsSheet.setColumnWidth(1, 80);  // Source Row
    resultsSheet.setColumnWidth(2, 150); // Timestamp
    resultsSheet.setColumnWidth(3, 200); // Article Preview
    resultsSheet.setColumnWidth(4, 400); // Generated Script
    resultsSheet.setColumnWidth(5, 120); // Character Count
    resultsSheet.setColumnWidth(6, 200); // System Prompt
    resultsSheet.setColumnWidth(7, 200); // User Prompt
    resultsSheet.setColumnWidth(8, 500); // Full Payload
    resultsSheet.setColumnWidth(9, 150); // Token Usage
    resultsSheet.setColumnWidth(10, 150); // Model Used
    resultsSheet.setColumnWidth(11, 150); // Processing Time
  }
  
  // Initialize Knowledge Base sheet
  let kbSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.KNOWLEDGE_BASE);
  if (!kbSheet) {
    kbSheet = spreadsheet.insertSheet(CONFIG.SHEETS.KNOWLEDGE_BASE);
    kbSheet.appendRow([
      'ID',
      'Title',
      'Content',
      'Category',
      'Tags',
      'Created Date',
      'Last Updated'
    ]);
    
    // Format headers
    const headerRange = kbSheet.getRange(1, 1, 1, 7);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#fbbc04');
    headerRange.setFontColor('#000000');
    
    // Set column widths
    kbSheet.setColumnWidth(1, 80);  // ID
    kbSheet.setColumnWidth(2, 200); // Title
    kbSheet.setColumnWidth(3, 500); // Content
    kbSheet.setColumnWidth(4, 150); // Category
    kbSheet.setColumnWidth(5, 200); // Tags
    kbSheet.setColumnWidth(6, 150); // Created Date
    kbSheet.setColumnWidth(7, 150); // Last Updated
    
    // Add sample knowledge base entries
    kbSheet.appendRow([
      'KB001',
      '短视频开头钩子技巧',
      '1. 疑问式开头：直接抛出观众关心的问题\n2. 冲突式开头：展示矛盾或争议性观点\n3. 结果前置：先展示惊人结果再讲过程\n4. 情绪共鸣：用情绪化语言引起共鸣',
      'Script Writing',
      'hooks, opening, engagement',
      new Date(),
      new Date()
    ]);
    
    kbSheet.appendRow([
      'KB002',
      '口播视频节奏控制',
      '1. 每句话控制在15-20字以内\n2. 使用短句和断句增加节奏感\n3. 重要信息重复2-3次\n4. 每30秒设置一个小高潮',
      'Script Writing',
      'pacing, rhythm, structure',
      new Date(),
      new Date()
    ]);
    
    kbSheet.appendRow([
      'KB003',
      '情绪化表达技巧',
      '1. 使用"你"而不是"大家"\n2. 加入个人经历和故事\n3. 使用具体数字和案例\n4. 适当使用夸张和对比',
      'Script Writing',
      'emotion, engagement, storytelling',
      new Date(),
      new Date()
    ]);
  }
  
  if (showAlert) {
    SpreadsheetApp.getUi().alert('✅ Sheets initialized successfully!');
  }
}

/**
 * Process the currently selected row
 */
function processSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const inputSheet = sheet.getSheetByName(CONFIG.SHEETS.INPUT);
  const activeRange = inputSheet.getActiveRange();
  const row = activeRange.getRow();
  
  if (row < 2) {
    SpreadsheetApp.getUi().alert('Please select a data row (not the header)');
    return;
  }
  
  processRow(row);
}

/**
 * Process a specific row
 */
function processRow(row) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const inputSheet = sheet.getSheetByName(CONFIG.SHEETS.INPUT);
  const resultsSheet = sheet.getSheetByName(CONFIG.SHEETS.RESULTS);
  
  // Get data from the row
  const timestamp = inputSheet.getRange(row, 1).getValue() || new Date();
  const articleContent = inputSheet.getRange(row, 2).getValue();
  const systemPrompt = inputSheet.getRange(row, 3).getValue();
  const userPrompt = inputSheet.getRange(row, 4).getValue();
  
  // Validation
  if (!articleContent) {
    inputSheet.getRange(row, 5).setValue('Error: No article content');
    return;
  }
  
  // Update status
  inputSheet.getRange(row, 5).setValue('Processing...');
  SpreadsheetApp.flush();
  
  // Get API key from script properties
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('DEEPSEEK_API_KEY');
  
  if (!apiKey) {
    inputSheet.getRange(row, 5).setValue('Error: No API key set. Use menu to set key.');
    return;
  }
  
  try {
    // Combine article with user prompt if provided
    const fullUserPrompt = userPrompt 
      ? `${userPrompt}\n\n文章内容：\n${articleContent}`
      : `请根据以下文章生成短视频脚本：\n\n${articleContent}`;
    
    // Call DeepSeek API
    const apiResult = callDeepSeek(
      systemPrompt || 'You are an expert short video script writer. Generate engaging scripts in Chinese.',
      fullUserPrompt,
      apiKey
    );
    
    // Save to Results sheet with enhanced transparency
    resultsSheet.appendRow([
      row,                    // Source Row
      timestamp,              // Timestamp
      articleContent.substring(0, 100) + '...', // Article Preview
      apiResult.content,      // Generated Script
      apiResult.content.length, // Character Count
      systemPrompt || 'Default', // System Prompt Used
      userPrompt || 'Default',   // User Prompt Used
      JSON.stringify(apiResult.payload, null, 2), // Full LLM Payload (formatted)
      JSON.stringify(apiResult.response.usage || {}), // Token Usage Info
      apiResult.response.model || CONFIG.API.MODEL, // Model Used
      new Date() // Processing Timestamp
    ]);
    
    // Update status
    inputSheet.getRange(row, 5).setValue('Completed');
    inputSheet.getRange(row, 6).setValue(new Date());
    
  } catch (error) {
    console.error('Processing error:', error);
    inputSheet.getRange(row, 5).setValue('Error: ' + error.toString());
  }
}


/**
 * Call DeepSeek API
 * Returns both the response content and the full payload for transparency
 */
function callDeepSeek(systemPrompt, userPrompt, apiKey) {
  const payload = {
    model: CONFIG.API.MODEL,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: CONFIG.API.TEMPERATURE,
    max_tokens: 4000
  };
  
  const response = UrlFetchApp.fetch(CONFIG.API.DEEPSEEK_ENDPOINT, {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  });
  
  const result = JSON.parse(response.getContentText());
  if (!result.choices || !result.choices[0]) {
    throw new Error('Invalid API response');
  }
  
  return {
    content: result.choices[0].message.content,
    payload: payload,
    response: result
  };
}

/**
 * Show the article processing form
 */
function showArticleForm() {
  const html = HtmlService.createHtmlOutput(getArticleFormHtml())
    .setWidth(650)
    .setHeight(700);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Generate Video Scripts from Article');
}

/**
 * Process form submission
 */
function processArticleForm(formData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const inputSheet = sheet.getSheetByName(CONFIG.SHEETS.INPUT);
    
    // Build user prompt from form data
    const userPrompt = buildUserPromptFromForm(formData);
    
    // Add new row to Input sheet with knowledge references
    const timestamp = new Date();
    const newRow = [
      timestamp,                      // Timestamp
      formData.articleContent,        // Article Content
      formData.systemPrompt,          // System Prompt
      userPrompt,                     // User Prompt (includes knowledge base content)
      'Processing...',                // Status
      '',                            // Completed At
      formData.knowledgeRefs ? formData.knowledgeRefs.join(', ') : '' // Knowledge Base References
    ];
    
    inputSheet.appendRow(newRow);
    const rowNumber = inputSheet.getLastRow();
    
    // Process the row
    processRow(rowNumber);
    
    // Return success with row number
    return {
      success: true,
      rowNumber: rowNumber,
      scriptCount: formData.scriptCount
    };
    
  } catch (error) {
    console.error('Form processing error:', error);
    throw new Error(error.toString());
  }
}

/**
 * Build user prompt from form data
 */
function buildUserPromptFromForm(formData) {
  const styleMap = {
    conversational: '使用口语化表达，用"兄弟"、"朋友们"等称呼',
    professional: '使用专业严谨的语言，有理有据',
    emotional: '注重情绪渲染，引起观众共鸣',
    humorous: '加入幽默元素，让内容轻松有趣'
  };
  
  let prompt = `请根据文章内容生成${formData.scriptCount}个短视频脚本。\n\n`;
  prompt += `要求：\n`;
  prompt += `- 每个脚本${formData.wordCount}字\n`;
  prompt += `- 风格：${styleMap[formData.style]}\n`;
  prompt += `- 每个脚本要有不同的角度和侧重点\n`;
  prompt += `- 开头必须有强钩子，3秒内吸引注意力\n`;
  
  if (formData.additionalInstructions) {
    prompt += `\n特别要求：${formData.additionalInstructions}`;
  }

  if (formData.knowledgeRefs && formData.knowledgeRefs.length > 0) {
    const kbContent = getKnowledgeContent(formData.knowledgeRefs);
    prompt += `\n参考内容（仅供引用，不直接使用）：\n${kbContent}\n\n`;
    prompt += `注意：上述参考内容仅作为背景知识，不要直接复制或改写。`;
  }
  
  return prompt;
}

/**
 * Get knowledge base content for given IDs
 */
function getKnowledgeContent(ids) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.KNOWLEDGE_BASE);
  if (!sheet) return '';
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const content = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (ids.includes(row[0])) {
      content.push(`【参考${row[0]}】${row[2]}`);
    }
  }
  
  return content.join('\n\n');
}

/**
 * Get HTML for the article form
 */
/**
 * Get knowledge base items for form dropdown
 */
function getKnowledgeBaseItems() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.KNOWLEDGE_BASE);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  // Skip header row
  return data.slice(1).map(row => [row[0], row[1]]); // [ID, Title]
}

function getArticleFormHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      max-width: 600px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-weight: bold;
      margin-bottom: 5px;
      color: #333;
    }
    textarea, input, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    textarea {
      min-height: 150px;
      resize: vertical;
    }
    .small-textarea {
      min-height: 80px;
    }
    button {
      background-color: #4285f4;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      margin-right: 10px;
    }
    button:hover {
      background-color: #357ae8;
    }
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    .help-text {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    .preset-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .preset-btn {
      padding: 5px 10px;
      font-size: 12px;
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
    }
    .preset-btn:hover {
      background-color: #e0e0e0;
    }
    #status {
      margin-top: 20px;
      padding: 10px;
      border-radius: 4px;
      display: none;
    }
    .success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .processing {
      background-color: #cce5ff;
      color: #004085;
      border: 1px solid #b8daff;
    }
  </style>
</head>
<body>
  <h2>🎬 Article to Video Script Generator</h2>
  
  <form id="scriptForm">
    <div class="form-group">
      <label for="articleContent">Article Content *</label>
      <textarea id="articleContent" name="articleContent" required 
                placeholder="Paste your article here..."></textarea>
      <div class="help-text">The source article you want to convert into video scripts</div>
    </div>

    <div class="form-group">
      <label for="systemPrompt">System Prompt (AI Role)</label>
      <div class="preset-buttons">
        <button type="button" class="preset-btn" onclick="setPreset('viral')">Viral Content</button>
        <button type="button" class="preset-btn" onclick="setPreset('educational')">Educational</button>
        <button type="button" class="preset-btn" onclick="setPreset('story')">Story-based</button>
      </div>
      <textarea id="systemPrompt" name="systemPrompt" class="small-textarea">你是一个短视频脚本创作专家，擅长将长文章改编成多个有吸引力的短视频脚本。每个脚本要有强烈的开头钩子，口语化表达，适合口播。</textarea>
      <div class="help-text">Define how the AI should behave (you can edit this)</div>
    </div>

    <div class="form-group">
      <label for="scriptCount">Number of Scripts</label>
      <select id="scriptCount" name="scriptCount">
        <option value="1">1 Script</option>
        <option value="2" selected>2 Scripts</option>
        <option value="3">3 Scripts</option>
        <option value="5">5 Scripts</option>
      </select>
    </div>

    <div class="form-group">
      <label for="wordCount">Word Count per Script</label>
      <select id="wordCount" name="wordCount">
        <option value="200-300">200-300 words (Short)</option>
        <option value="300-500" selected>300-500 words (Standard)</option>
        <option value="500-800">500-800 words (Long)</option>
      </select>
    </div>

    <div class="form-group">
      <label for="style">Script Style</label>
      <select id="style" name="style">
        <option value="conversational">Conversational (用"兄弟"等口语)</option>
        <option value="professional">Professional (专业严谨)</option>
        <option value="emotional">Emotional (情绪化，引共鸣)</option>
        <option value="humorous">Humorous (幽默风趣)</option>
      </select>
    </div>

    <div class="form-group">
      <label for="knowledgeRefs">Reference Knowledge Base</label>
      <select id="knowledgeRefs" name="knowledgeRefs" multiple style="height: 100px">
        <!-- Options will be populated dynamically -->
      </select>
      <div class="help-text">Select reference materials (hold Ctrl/Cmd to multi-select)</div>
    </div>

    <div class="form-group">
      <label for="additionalInstructions">Additional Instructions (Optional)</label>
      <textarea id="additionalInstructions" name="additionalInstructions" class="small-textarea" 
                placeholder="E.g., Focus on specific angles, use certain examples, target audience..."></textarea>
    </div>

    <div>
      <button type="submit" id="submitBtn">Generate Scripts</button>
      <button type="button" onclick="google.script.host.close()">Cancel</button>
    </div>
  </form>

  <div id="status"></div>

  <script>
    // Preset system prompts
    const presets = {
      viral: '你是一个短视频脚本专家，擅长创作病毒式传播的内容。注重强钩子、情绪点和争议性话题。每个脚本都要让人看了想评论或分享。',
      educational: '你是一个知识类短视频创作者，擅长把复杂概念讲解得通俗易懂。用生动的例子和类比，让观众轻松学到知识。',
      story: '你是一个故事型短视频编剧，擅长从普通内容中提取精彩故事。每个脚本都要有起承转合，有悬念和反转。'
    };

    function setPreset(type) {
      document.getElementById('systemPrompt').value = presets[type];
    }

    // Form submission
    document.getElementById('scriptForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      const status = document.getElementById('status');
      
      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
      
      // Show processing status
      status.className = 'processing';
      status.textContent = 'Generating scripts... This may take 30-60 seconds.';
      status.style.display = 'block';
      
      // Gather form data
    // Get selected knowledge references
    const knowledgeOptions = document.getElementById('knowledgeRefs').selectedOptions;
    const knowledgeRefs = Array.from(knowledgeOptions).map(opt => opt.value);
    
    const formData = {
      articleContent: document.getElementById('articleContent').value,
      systemPrompt: document.getElementById('systemPrompt').value,
      scriptCount: document.getElementById('scriptCount').value,
      wordCount: document.getElementById('wordCount').value,
      style: document.getElementById('style').value,
      additionalInstructions: document.getElementById('additionalInstructions').value,
      knowledgeRefs: knowledgeRefs
    };
      
      // Call server function
      google.script.run
        .withSuccessHandler(function(result) {
          status.className = 'success';
          status.innerHTML = '✅ Success! Generated ' + result.scriptCount + ' scripts.<br>' +
                             'Check the <strong>Results</strong> tab to see your scripts.<br>' +
                             '<small>Row ' + result.rowNumber + ' has been processed.</small>';
          submitBtn.textContent = 'Generate More Scripts';
          submitBtn.disabled = false;
          
          // Clear form for next use
          document.getElementById('articleContent').value = '';
          document.getElementById('additionalInstructions').value = '';
        })
        .withFailureHandler(function(error) {
          status.className = 'error';
          status.textContent = '❌ Error: ' + error.message;
          submitBtn.textContent = 'Generate Scripts';
          submitBtn.disabled = false;
        })
        .processArticleForm(formData);
    });
  </script>
  
  <script>
    // Populate knowledge base options on load
    document.addEventListener('DOMContentLoaded', function() {
      google.script.run
        .withSuccessHandler(function(items) {
          const select = document.getElementById('knowledgeRefs');
          items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[0];
            option.textContent = item[0] + ': ' + item[1];
            select.appendChild(option);
          });
        })
        .getKnowledgeBaseItems();
    });
  </script>
</body>
</html>`;
}

/**
 * Set API Key through UI prompt
 */
function setApiKey() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '🔑 Set DeepSeek API Key',
    'Enter your DeepSeek API key:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() === ui.Button.OK) {
    const apiKey = result.getResponseText().trim();
    if (apiKey) {
      const scriptProperties = PropertiesService.getScriptProperties();
      scriptProperties.setProperty('DEEPSEEK_API_KEY', apiKey);
      ui.alert('✅ API Key saved successfully!');
    } else {
      ui.alert('❌ Please enter a valid API key.');
    }
  }
}
