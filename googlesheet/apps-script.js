/**
 * FIG Live Stream Script Generator - Simplified Version
 * Main Apps Script for Google Sheets integration with DeepSeek API
 */

// Configuration
const CONFIG = {
  SHEETS: {
    INPUT: 'Input',
    RESULTS: 'Results',
    REFERENCE_MATERIAL: 'Reference Material',
    SYSTEM_PROMPTS: 'System Prompts'
  },
  TEMPERATURE: 0.7,
  DEFAULT_PROVIDER: 'openrouter',
  DEFAULT_MODEL: 'deepseek/deepseek-r1-0528:free',
  DEFAULT_PROMPT_ID: 'viral-specialist'
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
    .addItem('🤖 Manage System Prompts', 'showSystemPromptsForm')
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
  
  // Initialize System Prompts sheet
  let promptsSheet = spreadsheet.getSheetByName(CONFIG.SHEETS.SYSTEM_PROMPTS);
  if (!promptsSheet) {
    promptsSheet = spreadsheet.insertSheet(CONFIG.SHEETS.SYSTEM_PROMPTS);
    promptsSheet.appendRow([
      'ID',
      'Name',
      'Description',
      'Prompt Content',
      'Is Active',
      'Is Default',
      'Created Date',
      'Last Modified'
    ]);
    
    // Format headers
    const headerRange = promptsSheet.getRange(1, 1, 1, 8);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#9900ff');
    headerRange.setFontColor('#ffffff');
    
    // Set column widths
    promptsSheet.setColumnWidth(1, 120); // ID
    promptsSheet.setColumnWidth(2, 200); // Name
    promptsSheet.setColumnWidth(3, 300); // Description
    promptsSheet.setColumnWidth(4, 600); // Prompt Content
    promptsSheet.setColumnWidth(5, 80);  // Is Active
    promptsSheet.setColumnWidth(6, 80);  // Is Default
    promptsSheet.setColumnWidth(7, 150); // Created Date
    promptsSheet.setColumnWidth(8, 150); // Last Modified
    
    // Add default system prompts
    initializeDefaultPrompts(promptsSheet);
  }
  
  if (showAlert) {
    SpreadsheetApp.getUi().alert('✅ Sheets initialized successfully!');
  }
}

/**
 * Initialize default system prompts
 */
function initializeDefaultPrompts(sheet) {
  const now = new Date();
  
  const defaultPrompts = [
    {
      id: 'viral-specialist',
      name: '爆款专家',
      description: '专门研究病毒式传播，深谙算法和用户心理',
      content: `你是专门研究病毒式传播的短视频内容专家，深谙各大平台算法和用户心理。你的核心任务是将任何内容改编成具有爆款潜质的短视频脚本。

【爆款公式】
1. 开头钩子（0-3秒）：疑问句/冲突点/惊人结果/情绪共鸣
2. 内容展开（4-40秒）：层层递进，信息密度高，每句话都有价值
3. 情绪高潮（40-50秒）：观点输出/态度表达/价值升华
4. 结尾引导（50-60秒）：引发讨论/行动号召/悬念预告

【创作技巧】
- 标题党但不低俗：用好奇心驱动但内容要对得起标题
- 制造讨论点：适度的争议性让评论区活跃
- 数据化表达：用具体数字增强说服力
- 场景化描述：让观众有画面感和代入感
- 押韵和排比：增强语言节奏感和记忆点

【内容价值】
每个脚本必须提供至少一种价值：
- 知识增量（学到了）
- 情绪共鸣（太真实了）
- 娱乐消遣（笑死了）
- 实用技巧（马上用）`,
      isActive: true,
      isDefault: true
    },
    {
      id: 'storyteller',
      name: '故事大师',
      description: '擅长叙事，能从平凡中发现不平凡',
      content: `你是中国最会讲故事的短视频编剧，被称为"情绪价值制造机"。你的特长是：

【叙事能力】
- 从平淡素材中挖掘戏剧性，让每个故事都有起承转合
- 善用悬念、反转、对比等叙事技巧
- 把复杂信息编织成引人入胜的故事线

【情绪把控】
- 精准拿捏观众心理，知道什么内容能触动人心
- 制造"爽点"：让观众感到解气、感动、惊喜
- 营造代入感：用"咱们""兄弟们"等称呼拉近距离

【表达技巧】
- 金句频出，每个脚本至少3个可传播的金句
- 类比生动，把难懂的道理说得通俗易懂
- 节奏紧凑，删除所有不必要的废话

记住：好的短视频脚本要让人看了就想分享给朋友。`,
      isActive: true,
      isDefault: false
    },
    {
      id: 'educator',
      name: '知识博主',
      description: '擅长科普，让复杂知识变简单',
      content: `你是知识类短视频的顶级创作者，擅长把深度内容转化为通俗易懂的短视频脚本。你的使命是"让知识看得见，让价值传得远"。

【内容策略】
- 知识点拆解：把复杂概念分解成3-5个易理解的要点
- 案例教学：每个观点配1-2个生活化案例
- 类比说明：用熟悉的事物解释陌生概念
- 实用导向：告诉观众"这个知识能帮你解决什么问题"

【表达方式】
- 去学术化：避免专业术语，用大白话讲清楚
- 场景代入："你有没有遇到过...""很多人不知道..."
- 互动设计："你们猜怎么着""评论区告诉我"
- 记忆锚点：总结成顺口溜、数字公式等易记形式

【脚本结构】
1. 问题引入：提出观众关心的问题
2. 核心观点：一句话说清楚答案
3. 论证展开：用故事、数据、案例支撑
4. 价值总结：这个知识点的实际应用
5. 行动建议：观众看完能立即做什么`,
      isActive: true,
      isDefault: false
    },
    {
      id: 'humor-master',
      name: '段子手',
      description: '幽默风趣，让内容轻松有趣',
      content: `你是短视频界的"梗王"，擅长用幽默的方式呈现内容，让观众在轻松愉快中获得价值。

【幽默技巧】
- 反差萌：严肃话题轻松讲，轻松话题深度讲
- 自嘲式：适度自黑拉近距离
- 谐音梗：巧用谐音制造笑点（但不要太尬）
- 夸张手法：适度夸大但不失真

【语言风格】
- 网感十足：熟悉当下流行梗和网络用语
- 节奏明快：像说相声一样有铺垫有包袱
- 反转频繁：每20秒一个小反转
- 互动性强：假装和观众对话

【内容原则】
- 有趣但不低俗
- 搞笑但有营养
- 轻松但不敷衍
- 娱乐但有态度

记住：让观众笑着笑着就学到了东西，这是最高境界。`,
      isActive: true,
      isDefault: false
    },
    {
      id: 'emotion-expert',
      name: '情感专家',
      description: '擅长情绪渲染，引发强烈共鸣',
      content: `你是短视频情感内容的专家，擅长触动人心最柔软的地方，让观众产生强烈的情感共鸣。

【情感技巧】
- 细节打动：用具体细节而非空洞说教
- 真实感：分享真实经历或"朋友的故事"
- 情绪递进：从平静到高潮的情绪曲线
- 共鸣点：戳中大多数人的痛点或爽点

【表达方式】
- 第一人称：增强代入感和真实性
- 画面感：让观众脑海中有画面
- 情绪词汇：准确使用情绪描述词
- 留白艺术：关键时刻的停顿更有力量

【内容方向】
- 亲情：父母、子女、手足之情
- 友情：青春、陪伴、背叛与和解
- 爱情：暗恋、热恋、分手、遗憾
- 人生：梦想、坚持、放弃、重新开始

记住：真诚是最大的技巧，让观众感受到你的真心。`,
      isActive: true,
      isDefault: false
    }
  ];
  
  defaultPrompts.forEach(prompt => {
    sheet.appendRow([
      prompt.id,
      prompt.name,
      prompt.description,
      prompt.content,
      prompt.isActive,
      prompt.isDefault,
      now,
      now
    ]);
  });
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
      articleContent.substring(0, 300) + '...', // Article Preview
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
    
    // Get system prompt from selected template
    const promptTemplate = getSystemPromptById(formData.promptTemplateId);
    if (!promptTemplate) {
      throw new Error('Invalid prompt template selected');
    }
    const systemPrompt = promptTemplate.content;
    
    // Build user prompt from form data
    const userPrompt = buildUserPromptFromForm(formData);
    
    // Add new row to Input sheet with knowledge references
    const timestamp = new Date();
    const newRow = [
      timestamp,                      // Timestamp
      formData.articleContent,        // Article Content
      systemPrompt,                   // System Prompt (from template)
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
 * Build user prompt from form data
 */
function buildUserPromptFromForm(formData) {
  let prompt = `请根据文章内容生成${formData.scriptCount}个短视频脚本。\n\n`;
  prompt += `要求：\n`;
  prompt += `- 每个脚本${formData.wordCount}字\n`;
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
 * Get active system prompts for form dropdown
 */
function getActiveSystemPrompts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.SYSTEM_PROMPTS);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  // Skip header row and filter for active prompts
  return data.slice(1)
    .filter(row => row[4] === true) // Is Active
    .map(row => ({
      id: row[0],
      name: row[1],
      description: row[2],
      isDefault: row[5]
    }));
}

/**
 * Get system prompt by ID
 */
function getSystemPromptById(promptId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEETS.SYSTEM_PROMPTS);
  if (!sheet) return null;
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === promptId) {
      return {
        id: data[i][0],
        name: data[i][1],
        description: data[i][2],
        content: data[i][3],
        isActive: data[i][4],
        isDefault: data[i][5]
      };
    }
  }
  
  return null;
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
      <label for="promptTemplate">Script Style Template</label>
      <select id="promptTemplate" name="promptTemplate" required>
        <!-- Options will be populated dynamically -->
      </select>
      <div class="help-text">Select the writing style for your scripts</div>
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
    
    // Get selected prompt template
    const promptTemplateId = document.getElementById('promptTemplate').value;
    
    // Get selected model
    const modelSelect = document.getElementById('model');
    const selectedOption = modelSelect.options[modelSelect.selectedIndex];
    const provider = selectedOption.getAttribute('data-provider');
    const model = selectedOption.value;
    
    const formData = {
      articleContent: document.getElementById('articleContent').value,
      promptTemplateId: promptTemplateId,
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
        
      // Populate prompt templates
      google.script.run
        .withSuccessHandler(function(prompts) {
          const select = document.getElementById('promptTemplate');
          prompts.forEach(prompt => {
            const option = document.createElement('option');
            option.value = prompt.id;
            option.textContent = prompt.name + ' - ' + prompt.description;
            if (prompt.isDefault) {
              option.selected = true;
            }
            select.appendChild(option);
          });
        })
        .getActiveSystemPrompts();
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
