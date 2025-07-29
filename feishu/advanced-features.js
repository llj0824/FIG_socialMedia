/**
 * Advanced Features for Feishu Script Generator
 * Optional enhancements for power users
 */

const STYLE_TEMPLATES = {
  conversational: { instruction: "用'兄弟'或'朋友们'开头，像朋友聊天一样自然" },
  storytelling: { instruction: "从一个具体的故事或案例开始，有画面感" },
  educational: { instruction: "用数据和事实说话，逻辑清晰，适合知识分享" },
  controversial: { instruction: "提出犀利观点，引发思考和讨论" }
};

const PLATFORM_SETTINGS = {
  douyin: { wordCount: "300-500", style: "强钩子，快节奏，情绪化" },
  xiaohongshu: { wordCount: "500-800", style: "干货分享，个人经验，生活化" },
  bilibili: { wordCount: "800-1200", style: "深度内容，知识密度高，可以有梗" }
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
 * Add emojis to text for Xiaohongshu
 */
function addEmojis(text) {
  const emojiMap = {
    '重要': '⚠️', '注意': '📌', '第一': '1️⃣', '第二': '2️⃣',
    '第三': '3️⃣', '钱': '💰', '想法': '💡', '秘密': '🤫'
  };
  
  let result = text;
  Object.entries(emojiMap).forEach(([word, emoji]) => {
    result = result.replace(new RegExp(word, 'g'), word + emoji);
  });
  return result;
}

/**
 * Add chapter markers for Bilibili
 */
function addChapterMarkers(text) {
  const paragraphs = text.split(/\n\n/);
  const markers = ['🎬 开场', '📖 正文', '🎯 重点', '💡 总结'];
  return paragraphs.map((para, index) => {
    return index < markers.length ? `【${markers[index]}】\n${para}` : para;
  }).join('\n\n');
}

/**
 * Format scripts for different platforms
 */
function formatForPlatform(script, platform) {
  switch(platform) {
    case 'douyin': return script.content.replace(/。/g, '。\n');
    case 'xiaohongshu': return addEmojis(script.content);
    case 'bilibili': return addChapterMarkers(script.content);
    default: return script.content;
  }
}

/**
 * Retry mechanism for API calls
 */
async function generateWithRetry(content, count, wordCount, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateScripts(content, count, wordCount);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}

module.exports = {
  buildEnhancedPrompt,
  formatForPlatform,
  generateWithRetry
};
