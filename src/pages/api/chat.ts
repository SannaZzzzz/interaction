import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type ResponseData = {
  response: string;
  error?: string;
};

// 支持的模型类型
type ModelType = 'doubo' | 'deepseek';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ response: '', error: '仅支持POST方法' });
  }

  try {
    const { message, character, apiKey, modelType = 'doubo', apiUrl } = req.body;

    if (!message || !apiKey) {
      return res.status(400).json({ response: '', error: '消息和API密钥是必需的' });
    }

    // 根据不同模型类型调用相应的API
    let responseText = '';
    
    switch (modelType as ModelType) {
      case 'doubo':
        // 调用豆包API
        responseText = await callDouboModel(message, character, apiKey, apiUrl);
        break;
      
      case 'deepseek':
        // 调用DeepSeek API
        responseText = await callDeepSeekModel(message, character, apiKey, apiUrl);
        break;
        
      default:
        throw new Error('不支持的模型类型');
    }

    // 返回响应
    res.status(200).json({ response: responseText });
  } catch (error: any) {
    console.error('API错误:', error);
    res.status(500).json({ 
      response: '', 
      error: `调用大模型API时出错: ${error.message || '未知错误'}` 
    });
  }
}

// 豆包API调用函数
async function callDouboModel(message: string, character: string, apiKey: string, apiUrl?: string): Promise<string> {
  try {
    const url = apiUrl || 'https://api.doubao.com/v1/chat/completions';
    
    // 构建请求参数
    const payload = {
      model: "doubao-lite",  // 可根据实际情况选择模型
      messages: [
        { role: 'system', content: character },
        { role: 'user', content: message }
      ],
      temperature: 0.7
    };
    
    // 发送请求到豆包API
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    // 解析并返回响应
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    }
    
    return '抱歉，无法获取回复';
  } catch (error) {
    console.error('豆包API调用错误:', error);
    throw new Error('豆包API调用失败');
  }
}

// DeepSeek API调用函数
async function callDeepSeekModel(message: string, character: string, apiKey: string, apiUrl?: string): Promise<string> {
  try {
    const url = apiUrl || 'https://api.deepseek.com/v1/chat/completions';
    
    // 构建请求参数
    const payload = {
      model: "deepseek-chat",  // 可根据实际情况选择模型
      messages: [
        { role: "system", content: character },
        { role: "user", content: message }
      ],
      temperature: 0.7
    };
    
    // 发送请求到DeepSeek API
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    // 解析并返回响应
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    }
    
    return '抱歉，无法获取回复';
  } catch (error) {
    console.error('DeepSeek API调用错误:', error);
    throw new Error('DeepSeek API调用失败');
  }
}