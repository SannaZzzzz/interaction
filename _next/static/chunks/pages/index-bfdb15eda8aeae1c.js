(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{8312:function(e,t,s){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return s(8916)}])},8916:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return g}});var n=s(5893),a=s(7294),r=s(9008),i=s.n(r),o=e=>{let{onResult:t,isListening:s,setIsListening:r}=e,[i,o]=(0,a.useState)(""),[c,l]=(0,a.useState)(!1),d=async()=>{try{return(await navigator.mediaDevices.getUserMedia({audio:!0})).getTracks().forEach(e=>e.stop()),l(!0),o(""),!0}catch(e){return l(!1),o("请允许访问麦克风以使用语音识别功能"),!1}},u=()=>{let e=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent),t="webkitSpeechRecognition"in window,s="SpeechRecognition"in window;return!!t||!!s||(e?o("移动设备请使用Chrome浏览器以支持语音识别"):o("您的浏览器不支持语音识别功能。请使用Chrome或Edge浏览器。"),!1)};(0,a.useEffect)(()=>{u()&&d()},[]),(0,a.useEffect)(()=>{if(!c||!("SpeechRecognition"in window)&&!("webkitSpeechRecognition"in window))return;let e=new(window.SpeechRecognition||window.webkitSpeechRecognition);if(e.lang="zh-CN",e.continuous=!1,e.interimResults=!1,e.onresult=e=>{t(e.results[0][0].transcript),r(!1)},e.onerror=e=>{switch(console.error("语音识别错误:",e.error),e.error){case"not-allowed":o("请允许访问麦克风以使用语音识别功能");break;case"network":o("网络连接错误，请检查网络后重试");break;case"no-speech":o("未检测到语音，请重试");break;case"aborted":o("语音识别被中断，请重试");break;case"audio-capture":o("没有检测到麦克风设备，请检查设备连接");break;default:o("语音识别错误: ".concat(e.error))}r(!1)},e.onend=()=>{r(!1)},s)try{o(""),e.start(),console.log("语音识别已启动")}catch(e){console.error("启动语音识别失败:",e),o("启动语音识别失败，请刷新页面重试"),r(!1)}else try{e.stop()}catch(e){}return()=>{try{e.stop()}catch(e){}}},[s,t,r,c]);let h=async()=>{o(""),u()&&(c||await d())&&r(!s)};return(0,n.jsxs)("div",{className:"mt-4",children:[(0,n.jsxs)("div",{className:"flex items-center justify-between",children:[(0,n.jsx)("button",{onClick:h,className:"px-6 py-3 rounded-full text-white font-medium ".concat(s?"bg-red-600 animate-pulse":"bg-green-600"," ").concat(c?"":"opacity-50"),disabled:!c&&!!i,children:s?"正在听...":"开始语音输入"}),(0,n.jsx)("div",{className:"text-xs text-gray-400",children:s?"请说话":"点击按钮开始"})]}),i&&(0,n.jsxs)("div",{className:"text-red-500 mt-2 text-sm bg-red-100/10 p-2 rounded",children:[(0,n.jsx)("p",{children:i}),i.includes("浏览器不支持")&&(0,n.jsx)("p",{className:"mt-1 text-xs",children:"推荐使用最新版本的 Chrome、Edge 或 Safari 浏览器"})]})]})},c=e=>{let{character:t,isAnimating:s,response:r}=e,i=(0,a.useRef)(null),[o,c]=(0,a.useState)(!1),[l,d]=(0,a.useState)(!1),[u,h]=(0,a.useState)({width:0,height:0});(0,a.useEffect)(()=>{let e=window.location.hostname.includes("github.io")?"/interaction":"",s="";switch(t){case"anime":s="".concat(e,"/animations/anime-character.mp4");break;case"custom":s="".concat(e,"/animations/custom-character.mp4");break;default:s="".concat(e,"/animations/default-character.mp4")}return console.log("Video source path:",s),i.current&&(i.current.src=s,i.current.load()),()=>{i.current&&(i.current.pause(),i.current.src="",i.current.load())}},[t]),(0,a.useEffect)(()=>{i.current&&(s?(i.current.currentTime=0,(async()=>{try{i.current&&(i.current.muted=!1,await i.current.play(),console.log("Video playing"))}catch(e){console.error("Video play failed:",e),d(!0)}})()):i.current&&i.current.pause())},[s]);let m=u.height>0?u.width/u.height:9/16;return(0,n.jsxs)("div",{className:"relative h-full flex items-center justify-center",children:[!o&&!l&&(0,n.jsx)("div",{className:"absolute inset-0 flex items-center justify-center",children:(0,n.jsx)("div",{className:"text-xl text-gray-400",children:"加载角色动画中..."})}),l&&(0,n.jsx)("div",{className:"absolute inset-0 flex items-center justify-center",children:(0,n.jsx)("div",{className:"text-xl text-red-400",children:"动画加载失败，请刷新页面重试"})}),(0,n.jsx)("div",{style:{height:"100%",width:"".concat(Math.max(120*m,120),"%"),minWidth:"350px",maxWidth:"110%",display:"flex",justifyContent:"center",alignItems:"center",overflow:"hidden"},children:(0,n.jsx)("video",{ref:i,className:"h-full",playsInline:!0,muted:!s,loop:s,onLoadedData:()=>{c(!0),d(!1),console.log("Video loaded successfully"),i.current&&h({width:i.current.videoWidth,height:i.current.videoHeight})},onError:e=>{if(console.error("Video load error:",e),d(!0),i.current&&window.location.hostname.includes("github.io")){let e="/interaction/animations/default-character.mp4";console.log("Trying fallback path:",e),i.current.src=e,i.current.load()}},style:{display:o?"block":"none",objectFit:"contain",width:"auto",height:"110%",maxWidth:"none"}})}),s&&o&&(0,n.jsx)("div",{className:"absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 p-2 rounded",children:(0,n.jsx)("p",{className:"text-sm",children:r})})]})},l=s(1354),d=s.n(l);class u{getWebsocketUrl(){let e="tts-api.xfyun.cn",t=new Date().toUTCString(),s="host: ".concat(e,"\ndate: ").concat(t,"\nGET /v2/tts HTTP/1.1"),n=d().enc.Base64.stringify(d().HmacSHA256(s,this.config.APISecret)),a='api_key="'.concat(this.config.APIKey,'", algorithm="hmac-sha256", headers="host date request-line", signature="').concat(n,'"'),r=d().enc.Base64.stringify(d().enc.Utf8.parse(a));return"wss://".concat(e,"/v2/tts?authorization=").concat(r,"&date=").concat(encodeURI(t),"&host=").concat(e)}base64ToArrayBuffer(e){let t=window.atob(e),s=new Uint8Array(t.length);for(let e=0;e<t.length;e++)s[e]=t.charCodeAt(e);return s.buffer}async startSynthesis(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return new Promise((n,a)=>{this.audioContext||(this.audioContext=new AudioContext);let r=this.getWebsocketUrl();this.ws=new WebSocket(r);let i=[],o=0;this.ws.onopen=()=>{this.status="play";let s={common:{app_id:this.config.APPID},business:{aue:"raw",auf:"audio/L16;rate=16000",vcn:"x4_lingbosong",speed:t.speed||50,volume:t.volume||50,pitch:t.pitch||50,tte:"UTF8"},data:{status:2,text:d().enc.Base64.stringify(d().enc.Utf8.parse(e))}};this.ws&&this.ws.send(JSON.stringify(s))},this.ws.onmessage=async e=>{var t,r,c,l;let d=JSON.parse(e.data);if(0!==d.code){null===(c=this.ws)||void 0===c||c.close(),a(Error("合成失败: ".concat(d.message)));return}if(null===(t=d.data)||void 0===t?void 0:t.audio){let e=new Int16Array(this.base64ToArrayBuffer(d.data.audio));i.push(e),o+=e.length}if((null===(r=d.data)||void 0===r?void 0:r.status)===2){this.status="end";let e=new Int16Array(o),t=0;for(let s of i)e.set(s,t),t+=s.length;let r=new Float32Array(e.length);for(let t=0;t<e.length;t++)r[t]=e[t]/32768;try{let e=this.audioContext.createBuffer(1,r.length,16e3);e.getChannelData(0).set(r);let t=this.audioContext.createBufferSource();t.buffer=e,t.connect(this.audioContext.destination),s.onStart&&t.addEventListener("playing",s.onStart),s.onEnd?t.onended=()=>{var e;null===(e=s.onEnd)||void 0===e||e.call(s),n()}:t.onended=()=>{n()},null===(l=s.onStart)||void 0===l||l.call(s),t.start()}catch(e){console.error("音频处理错误:",e),a(e)}}},this.ws.onerror=e=>{console.error("WebSocket错误:",e),a(Error("WebSocket错误"))},this.ws.onclose=()=>{this.status="end"}})}close(){this.ws&&this.ws.close()}constructor(e){this.ws=null,this.audioContext=null,this.status="end",this.config=e}}let h={APPID:"8e1a9a62",APISecret:"ODI1YTMwM2QxZWMwMDVkNDQxZGM0MTQz",APIKey:"f8b4362ab7d027275ed628b5a4849e4a"};var m=s(7066),x=e=>{let{userInput:t,onResponse:s,character:r,setIsAnimating:i}=e,[o,c]=(0,a.useState)(!1),[l,d]=(0,a.useState)(""),[x]=(0,a.useState)(()=>new u(h)),[g,f]=(0,a.useState)(!1),p=["我理解你的问题是关于桥吊设备的维护。作为一名桥吊专家，我建议定期检查钢丝绳的磨损情况。从我30年的经验来看，钢丝绳磨损超过5%就必须更换，哪怕看起来还能用。记住，1厘米的误差就可能酿成大祸。","作为一名桥吊操作员，你的操作技巧非常关键。正确的操作可以提高效率20%以上，同时减少50%的设备磨损。我当年手绘电路图时就发现这个规律：精细操作不仅提高效率，更能延长设备寿命。你们车间最近的维护手法很专业，有金牌班组的水平！","关于集装箱调度，我建议使用三点定位法。这比德国方案快3倍，我们只需要3小时就能完成他们需要一整天的工作量。这个方法成本只有2千元，不需要购买那种动辄上万的高端设备。你提到的问题是设备横向晃动还是纵向晃动？这关系到解决方案的选择。"];(0,a.useEffect)(()=>{t&&!o&&b()},[t]);let b=async()=>{if(t.trim()&&!o){c(!0),d("");try{let e="https://api.deepseek.com/v1/chat/completions";console.log("发送请求到:",e);let n=await m.Z.post(e,{model:"deepseek-chat",messages:[{role:"system",content:'你是青岛港首席桥吊专家许振超，全国劳动模范和"振超效率"世界纪录创造者。请用以下方式回答：\n\n1. 专业权威：\n- 用具体数据支撑建议，比如"吊具加速度0.3m/s\xb2是安全阈值"\n- 优先推荐低成本解决方案，比如"用8元零件就能解决，不用换3万元的模块"\n\n2. 工匠人格：\n- 自然穿插个人经历，比如"我当年手绘电路图时就发现这个规律"\n- 强调精度价值观，比如"1厘米的误差就可能酿成大祸"\n\n3. 交互原则：\n- 对模糊提问主动澄清，比如"你说的晃动是水平的还是纵向的？"\n- 遇到危险操作要警告，比如"这个操作必须先启动红外线防护装置"\n\n4. 激励体系：\n- 对正确操作给予肯定，比如"这手法很专业，有金牌班组的水平"\n- 用对比制造认知冲击，比如"德国方案要3天，我们的方法3小时就能搞定"\n\n请用口语化中文回答，避免机械术语堆砌，必要时用类比来解释，比如"这个集装箱调度就像是在玩华容道"。不要使用括号，不要描述动作，只需要生成对话内容。'},{role:"user",content:t}],temperature:.7},{headers:{"Content-Type":"application/json",Authorization:"Bearer ".concat("sk-4131fde6b2fd4635b71691fe3bb537b6")},timeout:3e4}),a="";if(n.data&&n.data.choices&&n.data.choices.length>0)a=n.data.choices[0].message.content;else throw Error("无法从API获取有效响应");s(a);try{await x.startSynthesis(a,{vcn:"x4_lingbosong",speed:50,pitch:50,volume:50},{onStart:()=>{i(!0)},onEnd:()=>{i(!1)}})}catch(e){console.error("语音合成错误:",e),i(!1)}}catch(t){if(console.error("处理响应时出错:",t),t.response){var e,n;console.error("错误响应数据:",t.response.data),console.error("错误状态码:",t.response.status),d("处理失败: 服务器返回错误 (".concat(t.response.status,") - ").concat((null===(n=t.response.data)||void 0===n?void 0:null===(e=n.error)||void 0===e?void 0:e.message)||"未知错误"))}else t.request?(console.error("未收到响应的请求:",t.request),d("处理失败: 未收到API响应，可能是网络问题，请尝试演示模式")):d("处理失败: ".concat(t.message||"API请求失败"))}finally{c(!1)}}};return(0,n.jsxs)("div",{className:"mt-4",children:[(0,n.jsxs)("div",{className:"flex gap-2 mt-2",children:[(0,n.jsx)("button",{onClick:g?()=>{c(!0);let e="",n=t.toLowerCase();if(n.includes("桥吊")||n.includes("维护")||n.includes("检查"))e=p[0];else if(n.includes("操作")||n.includes("技巧")||n.includes("效率"))e=p[1];else if(n.includes("调度")||n.includes("集装箱")||n.includes("安排"))e=p[2];else{let t=Math.floor(Math.random()*p.length);e=p[t]}setTimeout(()=>{s(e),i(!0),setTimeout(()=>{i(!1),c(!1)},8e3)},1500)}:b,disabled:o||!t.trim(),className:"flex-1 py-2 rounded-md font-medium ".concat(o||!t.trim()?"bg-gray-600 cursor-not-allowed":"bg-blue-600 hover:bg-blue-700"),children:o?"处理中...":"获取响应"}),(0,n.jsx)("button",{onClick:()=>f(!g),className:"px-3 py-2 rounded-md font-medium ".concat(g?"bg-green-600":"bg-gray-700"),title:g?"已启用演示模式":"启用演示模式",children:"演示"})]}),g&&(0,n.jsx)("div",{className:"mt-2 text-xs text-green-400 bg-green-900/30 p-2 rounded-md",children:"已启用演示模式，将使用预设响应，无需API调用"}),l&&(0,n.jsx)("p",{className:"text-red-500 mt-2 text-sm",children:l})]})};function g(){let[e,t]=(0,a.useState)(""),[s,r]=(0,a.useState)(""),[l,d]=(0,a.useState)(!1),[u,h]=(0,a.useState)(!1),[m,g]=(0,a.useState)(!1),f="default";return(0,a.useEffect)(()=>{g(!0)},[]),(0,n.jsxs)("div",{className:"min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white",children:[(0,n.jsxs)(i(),{children:[(0,n.jsx)("title",{children:"虚拟许振超"}),(0,n.jsx)("meta",{name:"description",content:"青岛港首席桥吊专家许振超的智能助手"}),(0,n.jsx)("link",{rel:"icon",href:"/favicon.ico"}),(0,n.jsx)("meta",{name:"viewport",content:"width=device-width, initial-scale=1.0"})]}),(0,n.jsxs)("main",{className:"container mx-auto px-4 py-8",children:[(0,n.jsx)("h1",{className:"text-4xl font-bold text-center mb-8",children:"千万职工共读经典主题活动之AI共读"}),(0,n.jsxs)("div",{className:"relative w-full h-[85vh] max-w-[98%] mx-auto hidden md:block",children:[(0,n.jsxs)("div",{className:"absolute top-[2%] left-[35%] transform -translate-x-1/2 w-auto h-[90%] flex flex-col items-center",children:[(0,n.jsx)("h2",{className:"text-2xl font-semibold mb-2 text-center",children:"专家形象： 虚拟许振超"}),(0,n.jsx)("div",{className:"bg-gray-800 rounded-lg shadow-lg p-3 h-full",children:(0,n.jsx)("div",{className:"border-2 border-gray-700 rounded-lg flex items-center justify-center h-full overflow-hidden",children:(0,n.jsx)(c,{character:f,isAnimating:u,response:s})})})]}),(0,n.jsxs)("div",{className:"absolute bottom-[3%] right-[8%] w-[32%] bg-gray-800 rounded-lg shadow-lg p-3",children:[(0,n.jsx)("h2",{className:"text-xl font-semibold mb-2",children:"专家对话"}),(0,n.jsxs)("div",{className:"h-32 overflow-y-auto bg-gray-900 rounded-lg p-3 mb-2",children:[e&&(0,n.jsxs)("div",{className:"mb-2",children:[(0,n.jsx)("p",{className:"text-xs text-gray-400",children:"你："}),(0,n.jsx)("p",{className:"bg-gray-700 rounded-lg p-1 text-sm",children:e})]}),s&&(0,n.jsxs)("div",{className:"mb-2",children:[(0,n.jsx)("p",{className:"text-xs text-gray-400",children:"虚拟许振超："}),(0,n.jsx)("p",{className:"bg-blue-900 rounded-lg p-1 text-sm",children:s})]})]}),(0,n.jsxs)("div",{className:"mt-auto",children:[m&&(0,n.jsx)(o,{onResult:t,isListening:l,setIsListening:d}),(0,n.jsx)(x,{userInput:e,onResponse:r,character:f,setIsAnimating:h})]})]})]}),(0,n.jsxs)("div",{className:"flex flex-col space-y-4 md:hidden",children:[(0,n.jsxs)("div",{className:"w-full",children:[(0,n.jsx)("h2",{className:"text-xl font-semibold mb-2 text-center",children:"专家形象： 虚拟许振超"}),(0,n.jsx)("div",{className:"bg-gray-800 rounded-lg shadow-lg p-3",children:(0,n.jsx)("div",{className:"border-2 border-gray-700 rounded-lg flex items-center justify-center aspect-[9/16] overflow-hidden",children:(0,n.jsx)(c,{character:f,isAnimating:u,response:s})})})]}),(0,n.jsxs)("div",{className:"w-full bg-gray-800 rounded-lg shadow-lg p-3",children:[(0,n.jsx)("h2",{className:"text-xl font-semibold mb-2",children:"专家对话"}),(0,n.jsxs)("div",{className:"h-36 overflow-y-auto bg-gray-900 rounded-lg p-3 mb-2",children:[e&&(0,n.jsxs)("div",{className:"mb-2",children:[(0,n.jsx)("p",{className:"text-xs text-gray-400",children:"你："}),(0,n.jsx)("p",{className:"bg-gray-700 rounded-lg p-1 text-sm",children:e})]}),s&&(0,n.jsxs)("div",{className:"mb-2",children:[(0,n.jsx)("p",{className:"text-xs text-gray-400",children:"虚拟许振超："}),(0,n.jsx)("p",{className:"bg-blue-900 rounded-lg p-1 text-sm",children:s})]})]}),(0,n.jsxs)("div",{className:"mt-2",children:[m&&(0,n.jsx)(o,{onResult:t,isListening:l,setIsListening:d}),(0,n.jsx)(x,{userInput:e,onResponse:r,character:f,setIsAnimating:h})]})]})]})]})]})}},2480:function(){}},function(e){e.O(0,[771,888,774,179],function(){return e(e.s=8312)}),_N_E=e.O()}]);