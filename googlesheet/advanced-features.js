/**
 * Advanced Features for FIG Script Generator
 * Optional enhancements for power users
 */

/**
 * Style Templates for different content types
 */
const STYLE_TEMPLATES = {
  conversational: {
    name: "对话式 Conversational",
    instruction: "用'兄弟'或'朋友们'开头，像朋友聊天一样自然"
  },
  storytelling: {
    name: "故事式 Story-based", 
    instruction: "从一个具体的故事或案例开始，有画面感"
  },
  educational: {
    name: "科普式 Educational",
    instruction: "用数据和事实说话，逻辑清晰，适合知识分享"
  },
  controversial: {
    name: "观点式 Opinion",
    instruction: "提出犀利观点，引发思考和讨论"
  }
};

/**
 * Platform-specific optimization
 */
const PLATFORM_SETTINGS = {
  douyin: {
    name: "抖音 Douyin",
    wordCount: "300-500",
    style: "强钩子，快节奏，情绪化"
  },
  xiaohongshu: {
    name: "小红书 XiaoHongShu",
    wordCount: "500-800", 
    style: "干货分享，个人经验，生活化"
  },
  bilibili: {
    name: "B站 Bilibili",
    wordCount: "800-1200",
    style: "深度内容，知识密度高，可以有梗"
  }
};

/**
 * Enhanced prompt builder with style options
 */
function buildEnhancedPrompt(content, count, wordCount, style, platform) {
  const styleInstruction = STYLE_TEMPLATES[style]?.instruction || "";
  const platformGuide = PLATFORM_SETTINGS[platform]?.style || "";
  
  return `你是一个短视频脚本创作专家。请根据以下内容，提取${count}个不同的主题，并为每个主题生成一个${wordCount}字的短视频脚本。

源内容：
${content.substring(0, 3000)} ${content.length > 3000 ? '...(内容已截断)' : ''}

风格要求：${styleInstruction}
平台特点：${platformGuide}

要求：
1. 提取的主题要有差异性，覆盖不同角度
2. 每个脚本要适合口播，语言要口语化、接地气
3. 开头必须有强钩子，能在3秒内吸引观众
4. 结构：钩子→故事/观点→转折→结论
5. 多用短句，避免长难句
6. 每个脚本控制在${wordCount}字
7. 融入平台特色和目标用户喜好

请严格按以下JSON格式返回：
[
  {
    "theme": "主题名称（10字以内）",
    "hook": "开头钩子（一句话）",
    "content": "完整的脚本内容"
  }
]`;
}

/**
 * Analyze content for better theme extraction
 */
function analyzeContent(content) {
  // Extract key entities, topics, and sentiments
  const analysis = {
    length: content.length,
    paragraphs: content.split(/\n\n/).length,
    hasNumbers: /\d+/.test(content),
    hasQuotes: /[""'']/.test(content),
    keywords: extractKeywords(content)
  };
  
  return analysis;
}

/**
 * Simple keyword extraction
 */
function extractKeywords(text) {
  // Remove common words
  const stopWords = ['的', '了', '和', '是', '在', '我', '有', '个', '不', '这', '为', '之', '与', '也', '到'];
  
  const words = text.match(/[\u4e00-\u9fa5]+/g) || [];
  const wordCount = {};
  
  words.forEach(word => {
    if (word.length >= 2 && !stopWords.includes(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Sort by frequency
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);
}

/**
 * Generate scripts with retry logic
 */
function generateScriptsWithRetry(content, count, wordCount, apiKey, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return generateScripts(content, count, wordCount, apiKey);
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        Utilities.sleep(2000 * (i + 1)); // Exponential backoff
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError}`);
}

/**
 * Format scripts for different platforms
 */
function formatForPlatform(script, platform) {
  switch(platform) {
    case 'douyin':
      // Add line breaks every sentence for teleprompter
      return script.content.replace(/。/g, '。\n');
      
    case 'xiaohongshu':
      // Add emoji suggestions
      return addEmojis(script.content);
      
    case 'bilibili':
      // Add chapter markers
      return addChapterMarkers(script.content);
      
    default:
      return script.content;
  }
}

/**
 * Add relevant emojis to text
 */
function addEmojis(text) {
  const emojiMap = {
    '重要': '⚠️',
    '注意': '📌',
    '第一': '1️⃣',
    '第二': '2️⃣',
    '第三': '3️⃣',
    '钱': '💰',
    '想法': '💡',
    '秘密': '🤫'
  };
  
  let result = text;
  Object.entries(emojiMap).forEach(([word, emoji]) => {
    result = result.replace(new RegExp(word, 'g'), word + emoji);
  });
  
  return result;
}

/**
 * Add chapter markers for longer content
 */
function addChapterMarkers(text) {
  const paragraphs = text.split(/\n\n/);
  const markers = ['🎬 开场', '📖 正文', '🎯 重点', '💡 总结'];
  
  return paragraphs.map((para, index) => {
    if (index < markers.length) {
      return `【${markers[index]}】\n${para}`;
    }
    return para;
  }).join('\n\n');
}

/**
 * Batch process with progress tracking
 */
function batchProcessWithProgress() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const inputSheet = sheet.getSheetByName(CONFIG.SHEETS.INPUT);
  const lastRow = inputSheet.getLastRow();
  
  // Create progress sheet if doesn't exist
  let progressSheet = sheet.getSheetByName('Progress');
  if (!progressSheet) {
    progressSheet = sheet.insertSheet('Progress');
    progressSheet.getRange('A1:C1').setValues([['Start Time', 'Status', 'Processed']]);
  }
  
  const startTime = new Date();
  const progressRow = progressSheet.getLastRow() + 1;
  progressSheet.getRange(progressRow, 1, 1, 3).setValues([[
    startTime,
    'Processing...',
    '0 / ?'
  ]]);
  
  let processed = 0;
  let pending = 0;
  
  // Count pending
  for (let row = 2; row <= lastRow; row++) {
    const status = inputSheet.getRange(row, 5).getValue();
    if (status === 'Pending' || status === '') {
      pending++;
    }
  }
  
  // Process pending
  for (let row = 2; row <= lastRow; row++) {
    const status = inputSheet.getRange(row, 5).getValue();
    
    if (status === 'Pending' || status === '') {
      try {
        onFormSubmit({ range: { getRow: () => row } });
        processed++;
        
        // Update progress
        progressSheet.getRange(progressRow, 2, 1, 2).setValues([[
          'Processing...',
          `${processed} / ${pending}`
        ]]);
        
        Utilities.sleep(2000);
      } catch (e) {
        console.error('Error processing row ' + row, e);
      }
    }
  }
  
  // Final update
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000 / 60; // minutes
  progressSheet.getRange(progressRow, 2).setValue(`Completed in ${duration.toFixed(1)} minutes`);
  
  SpreadsheetApp.getUi().alert(`Batch Processing Complete\n\nProcessed: ${processed} entries\nTime: ${duration.toFixed(1)} minutes`);
}

/**
 * Export with formatting options
 */
function exportToDocFormatted() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const resultsSheet = sheet.getSheetByName(CONFIG.SHEETS.RESULTS);
  const data = resultsSheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    SpreadsheetApp.getUi().alert('No results to export');
    return;
  }
  
  // Create document with custom formatting
  const doc = DocumentApp.create('视频脚本合集 - ' + 
    Utilities.formatDate(new Date(), 'GMT+8', 'yyyy-MM-dd'));
  const body = doc.getBody();
  
  // Set document style
  const style = {};
  style[DocumentApp.Attribute.FONT_FAMILY] = 'Arial';
  style[DocumentApp.Attribute.FONT_SIZE] = 11;
  body.setAttributes(style);
  
  // Add cover page
  const title = body.appendParagraph('🎬 短视频脚本合集');
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  title.setSpacingAfter(20);
  
  const subtitle = body.appendParagraph('AI Generated Video Scripts');
  subtitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  subtitle.setForegroundColor('#666666');
  
  body.appendParagraph('生成时间：' + new Date().toLocaleString('zh-CN'));
  body.appendParagraph('脚本总数：' + (data.length - 1));
  
  body.appendPageBreak();
  
  // Add table of contents
  const tocTitle = body.appendParagraph('📑 目录');
  tocTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  
  // Group and add scripts
  const groupedData = {};
  for (let i = 1; i < data.length; i++) {
    const requestId = data[i][0];
    if (!groupedData[requestId]) {
      groupedData[requestId] = [];
    }
    groupedData[requestId].push(data[i]);
  }
  
  // Add TOC entries
  Object.keys(groupedData).forEach((requestId, index) => {
    const tocEntry = body.appendParagraph(`${index + 1}. 请求 #${requestId} (${groupedData[requestId].length} 个脚本)`);
    tocEntry.setIndentFirstLine(20);
  });
  
  body.appendPageBreak();
  
  // Add scripts with formatting
  Object.keys(groupedData).forEach((requestId, groupIndex) => {
    const sectionTitle = body.appendParagraph(`📹 请求 #${requestId}`);
    sectionTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    sectionTitle.setSpacingBefore(10);
    
    groupedData[requestId].forEach((row, scriptIndex) => {
      // Script header with box
      const scriptHeader = body.appendTable([
        [`脚本 ${row[1]}: ${row[2]}`]
      ]);
      scriptHeader.setColumnWidth(0, 500);
      scriptHeader.getCell(0, 0).setBackgroundColor('#f0f0f0');
      scriptHeader.getCell(0, 0).getChild(0).asParagraph().setBold(true);
      
      // Script content with border
      const contentPara = body.appendParagraph(row[3]);
      contentPara.setIndentFirstLine(20);
      contentPara.setIndentStart(20);
      contentPara.setIndentEnd(20);
      contentPara.setSpacingAfter(10);
      
      // Metadata
      const metadata = body.appendParagraph(`📊 字数: ${row[4]} | ⏰ 生成时间: ${row[5] || 'N/A'}`);
      metadata.setFontSize(9);
      metadata.setForegroundColor('#888888');
      metadata.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
      
      if (scriptIndex < groupedData[requestId].length - 1) {
        body.appendHorizontalRule();
      }
    });
    
    if (groupIndex < Object.keys(groupedData).length - 1) {
      body.appendPageBreak();
    }
  });
  
  // Add footer
  body.appendPageBreak();
  const footer = body.appendParagraph('--- END ---');
  footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  footer.setForegroundColor('#cccccc');
  
  // Save and show URL
  const url = doc.getUrl();
  const htmlOutput = HtmlService
    .createHtmlOutput(`<p>文档已创建成功！</p>
      <p><a href="${url}" target="_blank">点击这里打开文档</a></p>
      <p>或复制链接：<br/><input type="text" value="${url}" style="width:400px" onclick="this.select()"/></p>`)
    .setWidth(450)
    .setHeight(150);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '导出完成');
}

/**
 * Add these functions to your menu
 */
function onOpenAdvanced() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎬 Script Generator')
    .addItem('▶️ Process Latest Entry', 'processLatest')
    .addItem('🔄 Process All Pending', 'batchProcess')
    .addSeparator()
    .addSubMenu(ui.createMenu('🎯 Advanced')
      .addItem('📊 Batch Process with Progress', 'batchProcessWithProgress')
      .addItem('📄 Export Formatted Document', 'exportToDocFormatted')
      .addItem('🔍 Analyze Content', 'analyzeCurrentContent'))
    .addSeparator()
    .addItem('⚙️ Setup Form Trigger', 'setupTrigger')
    .addItem('🧪 Test API Connection', 'testAPI')
    .addToUi();
}

/**
 * Analyze the current content
 */
function analyzeCurrentContent() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const inputSheet = sheet.getSheetByName(CONFIG.SHEETS.INPUT);
  const lastRow = inputSheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No content to analyze');
    return;
  }
  
  const content = inputSheet.getRange(lastRow, 2).getValue();
  const analysis = analyzeContent(content);
  
  const message = `Content Analysis:
  
Length: ${analysis.length} characters
Paragraphs: ${analysis.paragraphs}
Contains Numbers: ${analysis.hasNumbers ? 'Yes' : 'No'}
Contains Quotes: ${analysis.hasQuotes ? 'Yes' : 'No'}

Top Keywords:
${analysis.keywords.join(', ')}`;
  
  SpreadsheetApp.getUi().alert('Content Analysis', message, SpreadsheetApp.getUi().ButtonSet.OK);
}