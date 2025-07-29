# Feishu Implementation Setup Guide

## Prerequisites
- Feishu Developer Account
- Tencent Cloud Account
- DeepSeek API Key ([Get one here](https://platform.deepseek.com/))
- ~30 minutes setup time

### Tencent Cloud Function Costs
- **Free Tier**: 1 million requests/month + 400,000 GB-seconds compute
- **Cost After Free Tier**:
  - $0.0000167 per 100ms of duration (per GB memory)
  - $0.002 per 10,000 requests
- **Estimated Cost for This App**:
  - 100 requests: ~$0.0167
  - 1,000 requests: ~$0.167
  - Very cost-effective for MVP testing

## Step 1: Create Feishu Open Platform App
1. Go to [Feishu Open Platform](https://open.feishu.cn)
2. Create new "Script Generator" application
3. Enable "Bot" and "Custom Bots" features
4. Note down App ID and App Secret

## Step 2: Configure Tencent Cloud Function
1. Create new Cloud Function in Tencent Cloud Console
2. Set runtime to Node.js 16
3. Upload `cloud-function.js`
4. Add environment variables:
   - FEISHU_APP_ID: Your Feishu App ID
   - FEISHU_APP_SECRET: Your Feishu App Secret
   - DEEPSEEK_API_KEY: Your DeepSeek API key

## Step 3: Set Up Feishu Form
1. Create Feishu form with fields:
   - Source Content (Long text)
   - Script Count (Dropdown: 1, 2, 3, 5)
   - Word Count (Dropdown: 300-500, 500-1000)
2. Configure form to trigger webhook on submission
3. Set webhook URL to your Tencent Cloud Function endpoint

## Step 4: Test Workflow
1. Submit test content via Feishu form
2. Check Tencent Cloud Function logs for execution
3. Verify script delivery in Feishu chat

## Troubleshooting
- **Form not triggering**: Check webhook URL and permissions
- **API errors**: Verify Baidu ERNIE API key in environment variables
- **Feishu permissions**: Ensure bot has message sending and doc creation permissions

## Next Steps
1. Add user authentication
2. Implement usage tracking
3. Add advanced features like style templates
