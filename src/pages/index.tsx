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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">虚拟许振超专家形象</h2>
            <div className="border-2 border-gray-700 rounded-lg aspect-video flex items-center justify-center">
              <CharacterAnimation
                character={character}
                isAnimating={isAnimating}
                response={aiResponse}
              />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">专家对话</h2>

            <div className="mb-4 h-64 overflow-y-auto bg-gray-900 rounded-lg p-4">
              {userInput && (
                <div className="mb-3">
                  <p className="text-sm text-gray-400">你：</p>
                  <p className="bg-gray-700 rounded-lg p-2">{userInput}</p>
                </div>
              )}

              {aiResponse && (
                <div className="mb-3">
                  <p className="text-sm text-gray-400">虚拟许振超：</p>
                  <p className="bg-blue-900 rounded-lg p-2">{aiResponse}</p>
                </div>
              )}
            </div>

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
      </main>
    </div>
  );
}