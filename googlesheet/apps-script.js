/**
 * FIG Live Stream Script Generator - Simplified Version
 * Main Apps Script for Google Sheets integration with DeepSeek API
 */

// Configuration
const CONFIG = {
  SHEETS: {
    INPUT: 'Input',
    RESULTS: 'Results',
    REFERENCE_MATERIAL: 'Reference Material'
  },
  TEMPERATURE: 0.7,
  DEFAULT_PROVIDER: 'openrouter',
  DEFAULT_MODEL: 'deepseek/deepseek-r1-0528:free'
};

// Provider configurations
const PROVIDERS = {
  openrouter: {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    models: [
      { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek Reasoning' },
      { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek Chat' },
      { id: 'z-ai/glm-4.5', name: 'GLM-4.5' },
      { id: 'moonshotai/kimi-k2', name: 'Kimi K2' },
      { id: 'qwen/qwen3-235b-a22b-2507', name: 'Qwen3 235B' },
      { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro' }
    ],
    headers: (apiKey) => ({
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://docs.google.com', // Site URL for OpenRouter
      'X-Title': 'FIG Script Generator' // Site name for OpenRouter
    }),
    apiKeyProperty: 'OPENROUTER_API_KEY'
  }
};

/**
 * Runs when the spreadsheet is opened
 * Creates custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎬 Script Generator')
    .addItem('📝 Generate New Script', 'showArticleForm')
    .addItem('▶️ Generate Scripts From Input Row', 'processSelectedRow')
    .addItem('📤 Upload Reference Material', 'showReferenceMaterialForm')
    .addSeparator()
    .addItem('🔧 Initialize Sheets', 'initializeSheets')
    .addItem('🔑 Set OpenRouter API Key', 'setOpenRouterApiKey')
    .addToUi();
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
      'Provider',
      'Model',
      'Status',
      'Completed At',
      'Knowledge Base Refs'
    ]);
    
    // Format headers
    const headerRange = inputSheet.getRange(1, 1, 1, 9);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    
    // Set column widths
    inputSheet.setColumnWidth(1, 150); // Timestamp
    inputSheet.setColumnWidth(2, 400); // Article Content
    inputSheet.setColumnWidth(3, 300); // System Prompt
    inputSheet.setColumnWidth(4, 300); // User Prompt
    inputSheet.setColumnWidth(5, 100); // Provider
    inputSheet.setColumnWidth(6, 150); // Model
    inputSheet.setColumnWidth(7, 100); // Status
    inputSheet.setColumnWidth(8, 150); // Completed At
    inputSheet.setColumnWidth(9, 150); // Knowledge Base Refs
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
  
  // Initialize Reference Material sheet
  let refSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.REFERENCE_MATERIAL);
  if (!refSheet) {
    refSheet = spreadsheet.insertSheet(CONFIG.SHEETS.REFERENCE_MATERIAL);
    refSheet.appendRow([
      'ID',
      'Title',
      'Content',
      'Purpose',
      'Usage Notes',
      'Upload Date'
    ]);
    
    // Format headers
    const headerRange = refSheet.getRange(1, 1, 1, 6);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#fbbc04');
    headerRange.setFontColor('#000000');
    
    // Set column widths
    refSheet.setColumnWidth(1, 80);  // ID
    refSheet.setColumnWidth(2, 250); // Title
    refSheet.setColumnWidth(3, 500); // Content
    refSheet.setColumnWidth(4, 300); // Purpose
    refSheet.setColumnWidth(5, 250); // Usage Notes
    refSheet.setColumnWidth(6, 150); // Upload Date
    
    // Add sample reference material entries
    refSheet.appendRow([
      'REF001',
      '短视频开头钩子技巧',
      '1. 疑问式开头：直接抛出观众关心的问题\n2. 冲突式开头：展示矛盾或争议性观点\n3. 结果前置：先展示惊人结果再讲过程\n4. 情绪共鸣：用情绪化语言引起共鸣',
      '这是我总结的有效开头技巧，希望新脚本都能用类似的钩子方式吸引观众',
      '根据内容选择合适的钩子类型',
      new Date()
    ]);
    
    refSheet.appendRow([
      'REF002',
      '口播视频节奏控制',
      '1. 每句话控制在15-20字以内\n2. 使用短句和断句增加节奏感\n3. 重要信息重复2-3次\n4. 每30秒设置一个小高潮',
      '这是让口播视频保持节奏感的方法，按这个节奏写脚本观众不容易走神',
      '特别适合教育类内容',
      new Date()
    ]);
    
    refSheet.appendRow([
      'REF003',
      '情绪化表达技巧',
      '1. 使用"你"而不是"大家"\n2. 加入个人经历和故事\n3. 使用具体数字和案例\n4. 适当使用夸张和对比',
      '用这些技巧让内容更有感染力，观众更容易产生共鸣',
      '适合故事类和情感类内容',
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
  const provider = inputSheet.getRange(row, 5).getValue() || CONFIG.DEFAULT_PROVIDER;
  const model = inputSheet.getRange(row, 6).getValue() || CONFIG.DEFAULT_MODEL;
  
  // Validation
  if (!articleContent) {
    inputSheet.getRange(row, 7).setValue('Error: No article content');
    return;
  }
  
  // Update status
  inputSheet.getRange(row, 7).setValue('Processing...');
  SpreadsheetApp.flush();
  
  // Get provider configuration
  const providerConfig = PROVIDERS[provider];
  if (!providerConfig) {
    inputSheet.getRange(row, 7).setValue('Error: Invalid provider');
    return;
  }
  
  // Get API key from script properties
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty(providerConfig.apiKeyProperty);
  
  if (!apiKey) {
    inputSheet.getRange(row, 7).setValue(`Error: No ${providerConfig.name} API key set.`);
    return;
  }
  
  try {
    // Combine article with user prompt if provided
    const fullUserPrompt = userPrompt 
      ? `${userPrompt}\n\n文章内容：\n${articleContent}`
      : `请根据以下文章生成短视频脚本：\n\n${articleContent}`;
    
    // Call LLM API
    const apiResult = callLLM(
      provider,
      model,
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
      apiResult.response.model || model, // Model Used
      new Date() // Processing Timestamp
    ]);
    
    // Update status
    inputSheet.getRange(row, 7).setValue('Completed');
    inputSheet.getRange(row, 8).setValue(new Date());
    
  } catch (error) {
    console.error('Processing error:', error);
    inputSheet.getRange(row, 7).setValue('Error: ' + error.toString());
  }
}


/**
 * Call LLM API (supports multiple providers)
 * Returns both the response content and the full payload for transparency
 */
function callLLM(provider, model, systemPrompt, userPrompt, apiKey) {
  const providerConfig = PROVIDERS[provider];
  if (!providerConfig) {
    throw new Error('Invalid provider: ' + provider);
  }
  
  const payload = {
    model: model,
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
    temperature: CONFIG.TEMPERATURE,
    max_tokens: 4000
  };
  
  const response = UrlFetchApp.fetch(providerConfig.endpoint, {
    method: 'post',
    headers: providerConfig.headers(apiKey),
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
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Generate New Script');
}

/**
 * Process form submission
 */
function processArticleForm(formData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const inputSheet = sheet.getSheetByName(CONFIG.SHEETS.INPUT);
    
    // Build system prompt based on selected styles
    const systemPrompt = buildSystemPromptFromStyles(formData.scriptStyles);
    
    // Build user prompt from form data
    const userPrompt = buildUserPromptFromForm(formData);
    
    // Add new row to Input sheet with knowledge references
    const timestamp = new Date();
    const newRow = [
      timestamp,                      // Timestamp
      formData.articleContent,        // Article Content
      systemPrompt,                   // System Prompt (generated from styles)
      userPrompt,                     // User Prompt (includes knowledge base content)
      formData.provider || CONFIG.DEFAULT_PROVIDER,  // Provider
      formData.model || CONFIG.DEFAULT_MODEL,        // Model
      'Processing...',                // Status
      '',                            // Completed At
      formData.referenceIds ? formData.referenceIds.join(', ') : '' // Reference Material IDs
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
 * Build system prompt from selected styles
 */
function buildSystemPromptFromStyles(scriptStyles) {
  // Base system prompt
  let systemPrompt = '你是一个短视频脚本创作专家，擅长将长文章改编成多个有吸引力的短视频脚本。';
  
  // Style-specific attributes
  const styleAttributes = {
    viral: '你特别擅长创作病毒式传播的内容，知道如何抓住热点和争议性话题。',
    educational: '你善于将复杂知识简化，用通俗易懂的方式传播有价值的信息。',
    story: '你是讲故事的高手，能从平凡中发现不平凡，创造引人入胜的叙事。',
    conversational: '你的语言风格亲切自然，像朋友聊天一样让人感到舒适。',
    professional: '你注重内容的准确性和权威性，用专业的态度对待每个话题。',
    emotional: '你善于触动人心，能够准确把握和调动观众的情绪。',
    humorous: '你有幽默感，能够用轻松有趣的方式呈现内容。'
  };
  
  // Add attributes based on selected styles
  if (scriptStyles && scriptStyles.length > 0) {
    scriptStyles.forEach(style => {
      if (styleAttributes[style]) {
        systemPrompt += styleAttributes[style];
      }
    });
  }
  
  // Add common requirements
  systemPrompt += '每个脚本都要有强烈的开头钩子，适合口播，能在短时间内吸引并保持观众注意力。';
  
  return systemPrompt;
}

/**
 * Build user prompt from form data
 */
function buildUserPromptFromForm(formData) {
  // Comprehensive style mapping including both content type and tone
  const styleMap = {
    viral: '病毒式传播内容 - 注重强钩子、情绪点和争议性话题，让人看了想评论或分享',
    educational: '知识类内容 - 把复杂概念讲解得通俗易懂，用生动的例子和类比',
    story: '故事型内容 - 从普通内容中提取精彩故事，有起承转合、悬念和反转',
    conversational: '口语化表达 - 使用"兄弟"、"朋友们"等称呼，拉近距离',
    professional: '专业严谨 - 使用专业语言，有理有据，适合知识分享',
    emotional: '情绪化 - 注重情绪渲染，引起观众共鸣',
    humorous: '幽默风趣 - 加入幽默元素，让内容轻松有趣'
  };
  
  let prompt = `请根据文章内容生成${formData.scriptCount}个短视频脚本。\n\n`;
  prompt += `要求：\n`;
  prompt += `- 每个脚本${formData.wordCount}字\n`;
  
  // Handle multiple selected styles
  if (formData.scriptStyles && formData.scriptStyles.length > 0) {
    prompt += `- 风格要求：\n`;
    formData.scriptStyles.forEach(style => {
      prompt += `  • ${styleMap[style]}\n`;
    });
  }
  
  prompt += `- 每个脚本要有不同的角度和侧重点\n`;
  prompt += `- 开头必须有强钩子，3秒内吸引注意力\n`;
  
  if (formData.additionalInstructions) {
    prompt += `\n特别要求：${formData.additionalInstructions}`;
  }

  if (formData.referenceIds && formData.referenceIds.length > 0) {
    const references = getReferenceMaterials(formData.referenceIds);
    prompt += `\n\n参考材料：\n`;
    references.forEach(ref => {
      prompt += `\n【${ref.title}】\n`;
      prompt += `用途说明：${ref.purpose}\n`;
      prompt += `参考内容：${ref.content}\n`;
      if (ref.usageNotes) {
        prompt += `补充说明：${ref.usageNotes}\n`;
      }
    });
    prompt += `\n请智能地运用这些参考材料，根据各自的用途说明来指导你的创作。`;
  }
  
  return prompt;
}

/**
 * Get reference materials for given IDs
 */
function getReferenceMaterials(ids) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.REFERENCE_MATERIAL);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const materials = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (ids.includes(row[0])) {
      materials.push({
        id: row[0],
        title: row[1],
        content: row[2],
        purpose: row[3],
        usageNotes: row[4],
        uploadDate: row[5]
      });
    }
  }
  
  return materials;
}

/**
 * Get HTML for the article form
 */
/**
 * Get reference material items for form dropdown
 */
function getReferenceMaterialItems() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.REFERENCE_MATERIAL);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  // Skip header row
  return data.slice(1).map(row => [row[0], row[1], row[3]]); // [ID, Title, Purpose]
}

/**
 * Get available models for form dropdown
 */
function getAvailableModels() {
  const models = [];
  Object.keys(PROVIDERS).forEach(providerId => {
    const provider = PROVIDERS[providerId];
    provider.models.forEach(model => {
      models.push({
        providerId: providerId,
        providerName: provider.name,
        modelId: model.id,
        modelName: model.name,
        display: `${provider.name}: ${model.name}`
      });
    });
  });
  return models;
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
  <h2>🎬 Generate New Script</h2>
  
  <form id="scriptForm">
    <div class="form-group">
      <label for="articleContent">Article Content *</label>
      <textarea id="articleContent" name="articleContent" required 
                placeholder="Paste your article here..."></textarea>
      <div class="help-text">The source article you want to convert into video scripts</div>
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
      <label for="model">AI Model</label>
      <select id="model" name="model" required>
        <!-- Options will be populated dynamically -->
      </select>
      <div class="help-text">Select the AI model to use for generation</div>
    </div>

    <div class="form-group">
      <label for="scriptStyles">Script Styles (Select Multiple)</label>
      <select id="scriptStyles" name="scriptStyles" multiple style="height: 150px">
        <option value="viral">Viral Content (病毒式传播)</option>
        <option value="educational">Educational (知识类)</option>
        <option value="story">Story-based (故事型)</option>
        <option value="conversational">Conversational (口语化)</option>
        <option value="professional">Professional (专业严谨)</option>
        <option value="emotional">Emotional (情绪化)</option>
        <option value="humorous">Humorous (幽默风趣)</option>
      </select>
      <div class="help-text">Select one or more styles (hold Ctrl/Cmd to multi-select)</div>
    </div>

    <div class="form-group">
      <label for="referenceIds">Reference Materials</label>
      <select id="referenceIds" name="referenceIds" multiple style="height: 120px">
        <!-- Options will be populated dynamically -->
      </select>
      <div class="help-text">Select reference materials to guide the script generation (hold Ctrl/Cmd to multi-select)</div>
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
    // Get selected reference materials
    const referenceOptions = document.getElementById('referenceIds').selectedOptions;
    const referenceIds = Array.from(referenceOptions).map(opt => opt.value);
    
    // Get selected script styles
    const styleOptions = document.getElementById('scriptStyles').selectedOptions;
    const scriptStyles = Array.from(styleOptions).map(opt => opt.value);
    
    // Get selected model
    const modelSelect = document.getElementById('model');
    const selectedOption = modelSelect.options[modelSelect.selectedIndex];
    const provider = selectedOption.getAttribute('data-provider');
    const model = selectedOption.value;
    
    const formData = {
      articleContent: document.getElementById('articleContent').value,
      scriptStyles: scriptStyles,
      scriptCount: document.getElementById('scriptCount').value,
      wordCount: document.getElementById('wordCount').value,
      additionalInstructions: document.getElementById('additionalInstructions').value,
      referenceIds: referenceIds,
      provider: provider,
      model: model
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
    // Populate reference material options on load
    document.addEventListener('DOMContentLoaded', function() {
      // Populate reference materials
      google.script.run
        .withSuccessHandler(function(items) {
          const select = document.getElementById('referenceIds');
          items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[0];
            option.textContent = item[0] + ': ' + item[1];
            if (item[2]) {
              option.title = 'Purpose: ' + item[2]; // Show purpose on hover
            }
            select.appendChild(option);
          });
        })
        .getReferenceMaterialItems();
        
      // Populate models
      google.script.run
        .withSuccessHandler(function(models) {
          const select = document.getElementById('model');
          let defaultSet = false;
          models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.modelId;
            option.setAttribute('data-provider', model.providerId);
            option.textContent = model.display;
            select.appendChild(option);
            
            // Set default to DeepSeek Reasoning
            if (model.modelId === 'deepseek/deepseek-r1-0528:free' && !defaultSet) {
              option.selected = true;
              defaultSet = true;
            }
          });
        })
        .getAvailableModels();
    });
  </script>
</body>
</html>`;
}

/**
 * Set OpenRouter API Key through UI prompt
 */
function setOpenRouterApiKey() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '🔑 Set OpenRouter API Key',
    'Enter your OpenRouter API key (get one at openrouter.ai):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (result.getSelectedButton() === ui.Button.OK) {
    const apiKey = result.getResponseText().trim();
    if (apiKey) {
      const scriptProperties = PropertiesService.getScriptProperties();
      scriptProperties.setProperty('OPENROUTER_API_KEY', apiKey);
      ui.alert('✅ OpenRouter API Key saved successfully!');
    } else {
      ui.alert('❌ Please enter a valid API key.');
    }
  }
}

/**
 * Show the reference material upload form
 */
function showReferenceMaterialForm() {
  const html = HtmlService.createHtmlOutput(getReferenceMaterialFormHtml())
    .setWidth(650)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Upload Reference Material');
}

/**
 * Process reference material form submission
 */
function processReferenceMaterialForm(formData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const refSheet = sheet.getSheetByName(CONFIG.SHEETS.REFERENCE_MATERIAL);
    
    // Generate unique ID
    const lastRow = refSheet.getLastRow();
    const newId = 'REF' + String(lastRow).padStart(3, '0');
    
    // Add new reference material
    const newRow = [
      newId,                        // ID
      formData.title,               // Title
      formData.content,             // Content
      formData.purpose,             // Purpose
      formData.usageNotes || '',    // Usage Notes
      new Date()                    // Upload Date
    ];
    
    refSheet.appendRow(newRow);
    
    return {
      success: true,
      id: newId,
      title: formData.title
    };
    
  } catch (error) {
    console.error('Reference material upload error:', error);
    throw new Error(error.toString());
  }
}

/**
 * Get HTML for the reference material upload form
 */
function getReferenceMaterialFormHtml() {
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
    input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    textarea {
      min-height: 120px;
      resize: vertical;
    }
    .large-textarea {
      min-height: 200px;
    }
    .help-text {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
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
    .example {
      background-color: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <h2>📤 Upload Reference Material</h2>
  
  <form id="referenceForm">
    <div class="form-group">
      <label for="title">Title *</label>
      <input type="text" id="title" name="title" required 
             placeholder="What do you call this reference?">
      <div class="help-text">A short, memorable name for this reference material</div>
    </div>

    <div class="form-group">
      <label for="content">Content *</label>
      <textarea id="content" name="content" required class="large-textarea"
                placeholder="Paste your reference material here..."></textarea>
      <div class="help-text">The actual content you want to use as reference (script, technique, example, etc.)</div>
    </div>

    <div class="form-group">
      <label for="purpose">Purpose *</label>
      <textarea id="purpose" name="purpose" required
                placeholder="Explain why you're adding this and how it should be used..."></textarea>
      <div class="help-text">Tell the AI how to use this reference material</div>
      <div class="example">
        <strong>Example:</strong> "This script got 285K views. I want new scripts to have similar pacing and emotional beats but different content"
      </div>
    </div>

    <div class="form-group">
      <label for="usageNotes">Usage Notes (Optional)</label>
      <textarea id="usageNotes" name="usageNotes"
                placeholder="Any additional guidance or context..."></textarea>
      <div class="help-text">Optional additional instructions or context</div>
    </div>

    <div>
      <button type="submit" id="submitBtn">Upload Reference</button>
      <button type="button" onclick="google.script.host.close()">Cancel</button>
    </div>
  </form>

  <div id="status"></div>

  <script>
    document.getElementById('referenceForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      const status = document.getElementById('status');
      
      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = 'Uploading...';
      
      // Gather form data
      const formData = {
        title: document.getElementById('title').value,
        content: document.getElementById('content').value,
        purpose: document.getElementById('purpose').value,
        usageNotes: document.getElementById('usageNotes').value
      };
      
      // Call server function
      google.script.run
        .withSuccessHandler(function(result) {
          status.className = 'success';
          status.innerHTML = '✅ Reference material uploaded successfully!<br>' +
                             '<strong>' + result.id + '</strong>: ' + result.title + '<br>' +
                             '<small>You can now select this in the script generation form.</small>';
          status.style.display = 'block';
          
          // Reset form
          document.getElementById('referenceForm').reset();
          submitBtn.textContent = 'Upload Another Reference';
          submitBtn.disabled = false;
        })
        .withFailureHandler(function(error) {
          status.className = 'error';
          status.textContent = '❌ Error: ' + error.message;
          status.style.display = 'block';
          submitBtn.textContent = 'Upload Reference';
          submitBtn.disabled = false;
        })
        .processReferenceMaterialForm(formData);
    });
  </script>
</body>
</html>`;
}
