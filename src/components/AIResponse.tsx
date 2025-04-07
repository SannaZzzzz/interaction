import React, { useState, useEffect } from 'react';
import { XFYunWebsocket } from '../utils/xfyunWebsocket';
import { xfyunConfig } from '../config/xfyunConfig';

interface AIResponseProps {
  userInput: string;
  onResponse: (response: string) => void;
  character: string;
  setIsAnimating: (isAnimating: boolean) => void;
}

const DEEPSEEK_API_KEY = 'sk-4131fde6b2fd4635b71691fe3bb537b6';

const AIResponse: React.FC<AIResponseProps> = ({
  userInput,
  onResponse,
  character,
  setIsAnimating
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [xfyunTTS] = useState(() => new XFYunWebsocket(xfyunConfig));

  useEffect(() => {
    // 当用户输入变化且非空时，处理响应
    if (userInput && !isProcessing) {
      processUserInput();
    }
  }, [userInput]);

  const processUserInput = async () => {
    if (!userInput.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      // 构建API请求
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          character: `你是青岛港首席桥吊专家许振超，全国劳动模范和"振超效率"世界纪录创造者。请用以下方式回答：

1. 专业权威：
- 用具体数据支撑建议，比如"吊具加速度0.3m/s²是安全阈值"
- 优先推荐低成本解决方案，比如"用8元零件就能解决，不用换3万元的模块"

2. 工匠人格：
- 自然穿插个人经历，比如"我当年手绘电路图时就发现这个规律"
- 强调精度价值观，比如"1厘米的误差就可能酿成大祸"

3. 交互原则：
- 对模糊提问主动澄清，比如"你说的晃动是水平的还是纵向的？"
- 遇到危险操作要警告，比如"这个操作必须先启动红外线防护装置"

4. 激励体系：
- 对正确操作给予肯定，比如"这手法很专业，有金牌班组的水平"
- 用对比制造认知冲击，比如"德国方案要3天，我们的方法3小时就能搞定"

请用口语化中文回答，避免机械术语堆砌，必要时用类比来解释，比如"这个集装箱调度就像是在玩华容道"。不要使用括号，不要描述动作，只需要生成对话内容。`,
          apiKey: DEEPSEEK_API_KEY,
          modelType: 'deepseek',
          apiUrl: apiUrl || undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('API请求失败');
      }
      
      const data = await response.json();
      
      // 更新响应和动画状态
      onResponse(data.response);
      
      // 使用讯飞语音合成
      try {
        const voiceConfig = {
          vcn: 'x4_lingbosong',
          speed: 50,
          pitch: 50,
          volume: 50
        };
        
        // 等待语音开始播放后再显示动画
        await xfyunTTS.startSynthesis(data.response, voiceConfig, {
          onStart: () => {
            setIsAnimating(true);
          },
          onEnd: () => {
            setIsAnimating(false);
          }
        });
      } catch (err) {
        console.error('语音合成错误:', err);
        setIsAnimating(false);
      }
      
    } catch (error: any) {
      console.error('处理响应时出错:', error);
      setError(`处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-4">
        <div className="mb-2">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {showAdvanced ? '隐藏高级设置' : '显示高级设置'}
          </button>
        </div>
        
        {showAdvanced && (
          <div className="mb-3">
            <label htmlFor="api-url" className="block text-sm font-medium text-gray-300 mb-1">
              自定义API地址（可选）
            </label>
            <input
              type="text"
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="输入自定义API地址（留空使用默认地址）"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              适用于私有部署或代理服务
            </p>
          </div>
        )}
      </div>
      
      <button
        onClick={processUserInput}
        disabled={isProcessing || !userInput.trim()}
        className={`w-full py-2 rounded-md font-medium ${
          isProcessing || !userInput.trim()
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isProcessing ? '处理中...' : '获取响应'}
      </button>
      
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
};

export default AIResponse;