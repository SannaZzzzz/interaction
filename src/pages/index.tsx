import React, { useState } from 'react';
import Head from 'next/head';
import SpeechRecognition from '../components/SpeechRecognition';
import CharacterAnimation from '../components/CharacterAnimation';
import AIResponse from '../components/AIResponse';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const character = 'default'; // 默认使用默认角色

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Head>
        <title>虚拟许振超</title>
        <meta name="description" content="青岛港首席桥吊专家许振超的智能助手" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">千万职工共话经典主题活动之AI共话许振超</h1>

        <div className="relative w-full h-[85vh] max-w-[98%] mx-auto">
          {/* 动画区域 - 更靠左 */}
          <div className="absolute top-[2%] left-[35%] transform -translate-x-1/2 w-auto h-[90%] flex flex-col items-center">
            {/* 将标题放在动画框上方中央 */}
            <h2 className="text-2xl font-semibold mb-2 text-center">虚拟许振超专家形象</h2>
            
            <div className="bg-gray-800 rounded-lg shadow-lg p-3 h-full">
              <div className="border-2 border-gray-700 rounded-lg flex items-center justify-center h-full overflow-hidden">
                <CharacterAnimation
                  character={character}
                  isAnimating={isAnimating}
                  response={aiResponse}
                />
              </div>
            </div>
          </div>

          {/* 对话区域 - 右侧，底部对齐，宽度增加一半 */}
          <div className="absolute bottom-[3%] right-[5%] w-[36%] bg-gray-800 rounded-lg shadow-lg p-3">
            <h2 className="text-xl font-semibold mb-2">专家对话</h2>

            <div className="h-32 overflow-y-auto bg-gray-900 rounded-lg p-3 mb-2">
              {userInput && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400">你：</p>
                  <p className="bg-gray-700 rounded-lg p-1 text-sm">{userInput}</p>
                </div>
              )}

              {aiResponse && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400">虚拟许振超：</p>
                  <p className="bg-blue-900 rounded-lg p-1 text-sm">{aiResponse}</p>
                </div>
              )}
            </div>

            <div className="mt-auto">
              <SpeechRecognition
                onResult={setUserInput}
                isListening={isListening}
                setIsListening={setIsListening}
              />

              <AIResponse
                userInput={userInput}
                onResponse={setAiResponse}
                character={character}
                setIsAnimating={setIsAnimating}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}