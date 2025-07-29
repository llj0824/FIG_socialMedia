const axios = require('axios');
const { FeishuClient } = require('feishu-open-api-sdk');

// Configuration
const CONFIG = {
  DEEPSEEK_API_ENDPOINT: 'https://api.deepseek.com/v1/chat/completions',
  FEISHU_BOT_TOKEN: process.env.FEISHU_BOT_TOKEN,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  MODEL: 'deepseek-chat',
  TEMPERATURE: 0.7
};

// Initialize Feishu client
const feishu = new FeishuClient({
  appId: process.env.FEISHU_APP_ID,
  appSecret: process.env.FEISHU_APP_SECRET
});

/**
 * Main cloud function handler
 */
exports.main_handler = async (event, context) => {
  try {
    // Parse Feishu form data
    const formData = parseFormData(event);
    
    // Generate scripts using Baidu ERNIE
    const scripts = await generateScripts(
      formData.content,
      formData.scriptCount,
      formData.wordCount
    );
    
    // Create Feishu doc with results
    const docUrl = await createFeishuDoc(formData.userId, scripts);
    
    // Send notification to user
    await sendFeishuMessage(formData.userId, docUrl);
    
    return { success: true, docUrl };
  } catch (error) {
    console.error('Processing error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Parse Feishu form submission data
 */
function parseFormData(event) {
  // Extract form data from event
  const body = JSON.parse(event.body);
  return {
    userId: body.event.sender.sender_id.user_id,
    content: body.event.form_content.content,
    scriptCount: parseInt(body.event.form_content.script_count),
    wordCount: body.event.form_content.word_count
  };
}

/**
 * Generate scripts using DeepSeek API
 */
async function generateScripts(content, count, wordCount) {
  const response = await axios.post(
    CONFIG.DEEPSEEK_API_ENDPOINT,
    {
      model: CONFIG.MODEL,
      messages: [
        {
          role: 'user',
          content: buildPrompt(content, count, wordCount)
        }
      ],
      temperature: CONFIG.TEMPERATURE,
      max_tokens: 4000
    },
    {
      headers: {
        'Authorization': `Bearer ${CONFIG.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  // Extract JSON from response content
  const contentString = response.data.choices[0].message.content;
  const jsonMatch = contentString.match(/\[[\s\S]*\]/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error('Failed to parse JSON response');
}

/**
 * Build the prompt for ERNIE
 */
function buildPrompt(content, count, wordCount) {
  return `你是一个短视频脚本创作专家。请根据以下内容，提取${count}个不同的主题，并为每个主题生成一个${wordCount}字的短视频脚本。

注意：请严格按以下JSON格式返回，不要包含任何其他文字：
[
  {
    "theme": "主题名称（10字以内）",
    "content": "完整的脚本内容"
  }
]

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
]`;
}

/**
 * Create Feishu doc with generated scripts
 */
async function createFeishuDoc(userId, scripts) {
  const docContent = scripts.map(script => 
    `### ${script.theme}\n\n${script.content}\n\n---`
  ).join('\n\n');
  
  const doc = await feishu.docs.create({
    title: `短视频脚本 - ${new Date().toLocaleDateString('zh-CN')}`,
    content: docContent
  });
  
  return doc.url;
}

/**
 * Send Feishu message to user with doc link
 */
async function sendFeishuMessage(userId, docUrl) {
  await feishu.message.send({
    receive_id: userId,
    msg_type: 'text',
    content: {
      text: `您的短视频脚本已生成！\n点击查看文档：${docUrl}`
    }
  });
}
