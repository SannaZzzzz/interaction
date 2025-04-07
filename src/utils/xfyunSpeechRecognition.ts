import CryptoJS from 'crypto-js';
import { xfyunConfig } from '../config/xfyunConfig';

interface XFYunSpeechConfig {
  APPID: string;
  APISecret: string;
  APIKey: string;
  serviceType?: string; // 可选：iat（识别）、ist（听写）
}

class XFYunSpeechRecognition {
  private config: XFYunSpeechConfig;
  private ws: WebSocket | null = null;
  private resultText: string = '';
  private isError: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor(config: XFYunSpeechConfig) {
    this.config = {
      ...config,
      serviceType: config.serviceType || 'iat' // 默认使用语音识别
    };
  }

  private getWebsocketUrl(): string {
    // 这里使用讯飞语音听写的WebSocket地址
    const host = 'iat-api.xfyun.cn';
    const date = new Date().toUTCString();
    const algorithm = 'hmac-sha256';
    const headers = 'host date request-line';
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/${this.config.serviceType} HTTP/1.1`;
    const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(signatureOrigin, this.config.APISecret));
    const authorizationOrigin = `api_key="${this.config.APIKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
    const authorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));
    
    return `wss://${host}/v2/${this.config.serviceType}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
  }

  public async recognize(audioData: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.getWebsocketUrl();
        this.ws = new WebSocket(url);
        
        this.resultText = '';
        this.isError = false;
        
        // 将录音数据转换为 arrayBuffer
        const reader = new FileReader();
        reader.readAsArrayBuffer(audioData);
        
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          
          this.ws!.onopen = () => {
            console.log('讯飞语音识别 WebSocket 已连接');
            
            // 发送业务参数
            const businessParams = {
              common: {
                app_id: this.config.APPID
              },
              business: {
                language: 'zh_cn',
                domain: 'iat',
                accent: 'mandarin', // 普通话
                vad_eos: 5000, // 静默检测（毫秒）
                dwa: 'wpgs' // 开启动态修正
              },
              data: {
                status: 0, // 初始状态
                format: 'audio/L16;rate=16000',
                encoding: 'raw'
              }
            };
            
            this.ws!.send(JSON.stringify(businessParams));
            
            // 发送音频数据
            // 将音频分成多个帧发送，每个帧大约20ms（320字节）的音频
            const frameSize = 320; // 16000Hz，16bit，单通道，20ms为320字节
            const frames = Math.ceil(arrayBuffer.byteLength / frameSize);
            
            for (let i = 0; i < frames; i++) {
              const start = i * frameSize;
              const end = Math.min(start + frameSize, arrayBuffer.byteLength);
              const frameData = arrayBuffer.slice(start, end);
              
              const frameArrayBuffer = new ArrayBuffer(frameData.byteLength);
              new Uint8Array(frameArrayBuffer).set(new Uint8Array(frameData));
              
              // 发送音频数据
              if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(frameArrayBuffer);
              }
              
              // 最后一帧时，发送结束标记
              if (i === frames - 1) {
                const endParams = {
                  data: {
                    status: 2, // 结束状态
                    format: 'audio/L16;rate=16000',
                    encoding: 'raw'
                  }
                };
                
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                  this.ws.send(JSON.stringify(endParams));
                }
              }
            }
          };
          
          this.ws!.onmessage = (e) => {
            const response = JSON.parse(e.data);
            
            if (response.code !== 0) {
              this.isError = true;
              const errorMsg = `识别错误: ${response.code}, ${response.message}`;
              console.error(errorMsg);
              if (this.onErrorCallback) this.onErrorCallback(errorMsg);
              this.ws?.close();
              reject(new Error(errorMsg));
              return;
            }
            
            // 处理识别结果
            if (response.data && response.data.result) {
              const result = response.data.result;
              
              if (result.ws) {
                let text = '';
                
                // 解析识别结果
                for (const ws of result.ws) {
                  for (const cw of ws.cw) {
                    text += cw.w;
                  }
                }
                
                if (text) {
                  this.resultText += text;
                  if (this.onResultCallback) this.onResultCallback(this.resultText);
                }
              }
              
              // 如果是最后一条消息，关闭连接并返回结果
              if (response.data.status === 2) {
                this.ws?.close();
                
                if (!this.isError) {
                  resolve(this.resultText);
                }
              }
            }
          };
          
          this.ws!.onerror = (e) => {
            console.error('WebSocket错误:', e);
            this.isError = true;
            
            const errorMsg = '讯飞语音识别服务连接错误';
            if (this.onErrorCallback) this.onErrorCallback(errorMsg);
            reject(new Error(errorMsg));
          };
          
          this.ws!.onclose = () => {
            console.log('WebSocket已关闭');
            
            if (!this.isError && this.resultText) {
              resolve(this.resultText);
            } else if (!this.isError) {
              reject(new Error('未能获取识别结果'));
            }
          };
        };
        
        reader.onerror = (error) => {
          console.error('读取音频文件错误:', error);
          reject(new Error('读取音频文件错误'));
        };
      } catch (error) {
        console.error('讯飞语音识别初始化错误:', error);
        reject(error);
      }
    });
  }
  
  public close(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
  
  public onResult(callback: (text: string) => void): void {
    this.onResultCallback = callback;
  }
  
  public onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }
}

// 导出单例
export const xfyunSpeechRecognition = new XFYunSpeechRecognition(xfyunConfig);