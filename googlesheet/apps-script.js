/**
 * FIG Live Stream Script Generator - Simplified Version
 * Main Apps Script for Google Sheets integration with DeepSeek API
 */

// Configuration
const CONFIG = {
  SHEETS: {
    INPUT: 'Input',
    RESULTS: 'Results'
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
    .addItem('▶️ Process Selected Row', 'processSelectedRow')
    .addToUi();
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
    const response = callDeepSeek(
      systemPrompt || 'You are an expert short video script writer. Generate engaging scripts in Chinese.',
      fullUserPrompt,
      apiKey
    );
    
    // Save to Results sheet
    resultsSheet.appendRow([
      row,                    // Source Row
      timestamp,              // Timestamp
      articleContent.substring(0, 100) + '...', // Article Preview
      response,               // Generated Script
      response.length,        // Character Count
      systemPrompt || 'Default', // System Prompt Used
      userPrompt || 'Default'    // User Prompt Used
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
 */
function callDeepSeek(systemPrompt, userPrompt, apiKey) {
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
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: CONFIG.API.TEMPERATURE,
      max_tokens: 4000
    })
  });
  
  const result = JSON.parse(response.getContentText());
  if (!result.choices || !result.choices[0]) {
    throw new Error('Invalid API response');
  }
  
  return result.choices[0].message.content;
}

// Note: setApiKey() and testAPI() functions have been commented out
// To re-enable them for initial setup, uncomment the functions below
// and add them back to the menu in onOpen()

/*
function setApiKey() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.prompt(
    'Set DeepSeek API Key',
    'Enter your DeepSeek API key:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const apiKey = response.getResponseText().trim();
    
    if (apiKey) {
      const scriptProperties = PropertiesService.getScriptProperties();
      scriptProperties.setProperty('DEEPSEEK_API_KEY', apiKey);
      ui.alert('API key has been saved successfully!');
    } else {
      ui.alert('API key cannot be empty.');
    }
  }
}

function testAPI() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('DEEPSEEK_API_KEY');
  
  if (!apiKey) {
    SpreadsheetApp.getUi().alert('No API key set. Please use menu to set API key first.');
    return;
  }
  
  try {
    const response = callDeepSeek(
      'You are a helpful assistant.',
      'Say "API connection successful!" in Chinese',
      apiKey
    );
    
    SpreadsheetApp.getUi().alert('Success!', 
      'API connection successful.\n\nResponse: ' + response, 
      SpreadsheetApp.getUi().ButtonSet.OK);
      
  } catch (error) {
    SpreadsheetApp.getUi().alert('API Error', 
      'Failed to connect to DeepSeek API:\n' + error.toString(), 
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
*/