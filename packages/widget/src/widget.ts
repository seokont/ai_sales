import { io } from 'socket.io-client';

/** Web Speech API (Chrome/Edge/Safari); not in all TS lib configs */
type SpeechRecognitionResultList = {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
};
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface WidgetSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: WidgetSpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: WidgetSpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: WidgetSpeechRecognition) => void) | null;
}
type WidgetSpeechRecognitionCtor = new () => WidgetSpeechRecognition;

type WidgetLang = 'en' | 'uk' | 'ru' | 'he';

type WidgetCopy = {
  header: string;
  placeholder: string;
  typing: string;
  error: string;
  openChat: string;
  greeting: string;
  footerWantThis: string;
  voiceListening: string;
  voiceMicDenied: string;
  voiceNotSupported: string;
  voiceMicLabel: string;
  speakReply: string;
};

const widgetTranslations: Record<WidgetLang, WidgetCopy> = {
  en: {
    header: 'Sales Assistant',
    placeholder: 'Type your message...',
    typing: 'Typing...',
    error: 'Sorry, something went wrong. Please try again.',
    openChat: 'Open chat',
    greeting: 'How can I help?',
    footerWantThis: 'Want this? Go to site',
    voiceListening: 'Listening… speak now',
    voiceMicDenied: 'Microphone access denied. Allow the mic in the browser or use HTTPS.',
    voiceNotSupported: 'Voice input is not supported in this browser. Try Chrome, Edge, or Safari.',
    voiceMicLabel: 'Voice input',
    speakReply: 'Read reply aloud',
  },
  uk: {
    header: 'Асистент з продажів',
    placeholder: 'Напишіть повідомлення...',
    typing: 'Друкує...',
    error: 'Вибачте, щось пішло не так. Спробуйте ще раз.',
    openChat: 'Відкрити чат',
    greeting: 'Чим можу допомогти?',
    footerWantThis: 'Хочеш такий? Перейди на сайт',
    voiceListening: 'Слухаю… говоріть',
    voiceMicDenied: 'Доступ до мікрофона заборонено. Дозвольте мікрофон у браузері або використовуйте HTTPS.',
    voiceNotSupported: 'Голосовий ввід не підтримується в цьому браузері. Спробуйте Chrome, Edge або Safari.',
    voiceMicLabel: 'Голосове питання',
    speakReply: 'Прочитати відповідь',
  },
  ru: {
    header: 'Ассистент по продажам',
    placeholder: 'Напишите сообщение...',
    typing: 'Печатает...',
    error: 'Извините, что-то пошло не так. Попробуйте ещё раз.',
    openChat: 'Открыть чат',
    greeting: 'Чем могу помочь?',
    footerWantThis: 'Хочешь такой? Перейди на сайт',
    voiceListening: 'Слушаю… говорите',
    voiceMicDenied: 'Доступ к микрофону запрещён. Разрешите микрофон в браузере или используйте HTTPS.',
    voiceNotSupported: 'Голосовой ввод не поддерживается в этом браузере. Попробуйте Chrome, Edge или Safari.',
    voiceMicLabel: 'Голосовой вопрос',
    speakReply: 'Прочитать ответ вслух',
  },
  he: {
    header: 'עוזר מכירות',
    placeholder: 'הקלד את ההודעה...',
    typing: 'מקליד...',
    error: 'מצטערים, משהו השתבש. נסה שוב.',
    openChat: 'פתח צ\'אט',
    greeting: 'במה אוכל לעזור?',
    footerWantThis: 'רוצה כזה? עבור לאתר',
    voiceListening: 'מקשיב… דברו עכשיו',
    voiceMicDenied: 'הגישה למיקרופון נדחתה. אשרו מיקרופון בדפדפן או השתמשו ב-HTTPS.',
    voiceNotSupported: 'קלט קולי לא נתמך בדפדפן זה. נסו Chrome, Edge או Safari.',
    voiceMicLabel: 'קלט קולי',
    speakReply: 'הקרא את התשובה',
  },
};

const speechLangBcp47: Record<WidgetLang, string> = {
  en: 'en-US',
  uk: 'uk-UA',
  ru: 'ru-RU',
  he: 'he-IL',
};

function widgetLangFromNavigator(): WidgetLang {
  try {
    const tags =
      typeof navigator !== 'undefined'
        ? ([...(navigator.languages || []), navigator.language].filter(Boolean) as string[])
        : [];
    for (const tag of tags) {
      const base = tag.toLowerCase().split('-')[0];
      if (base === 'uk') return 'uk';
      if (base === 'ru') return 'ru';
      if (base === 'he' || base === 'iw') return 'he';
      if (base === 'en') return 'en';
    }
  } catch {
    //
  }
  return 'en';
}

function parseExplicitWidgetLang(raw: string | null): WidgetLang | null {
  if (raw == null) return null;
  const v = raw.trim().toLowerCase();
  if (v === '' || v === 'auto') return null;
  if (v === 'uk' || v === 'ru' || v === 'he' || v === 'en') return v;
  return null;
}

(function () {
  let script = document.currentScript as HTMLScriptElement | null;
  if (!script?.getAttribute('data-key')) {
    const demo = document.getElementById('ai-seller-demo-widget');
    if (demo instanceof HTMLScriptElement && demo.getAttribute('data-key')) {
      script = demo;
    } else {
      const nodes = document.querySelectorAll<HTMLScriptElement>('script[src*="widget.js"]');
      script = nodes.length ? nodes[nodes.length - 1] : null;
    }
  }
  const apiKey = script?.getAttribute('data-key');
  if (!apiKey || !script) return;
  const embedScript = script;

  /** Temporarily hide voice UI and features; set to `true` to restore mic, read-aloud, and voice conversation. */
  const VOICE_UI_ENABLED = false;

  function scriptAttrOn(name: string): boolean {
    const v = (embedScript.getAttribute(name) || '').toLowerCase().trim();
    return v === '1' || v === 'true' || v === 'yes' || v === 'on';
  }

  const voiceConversationMode = VOICE_UI_ENABLED && scriptAttrOn('data-voice-conversation');
  const voiceAutostartEnabled = VOICE_UI_ENABLED && scriptAttrOn('data-voice-autostart');
  const voiceAutostartDelayMs = (() => {
    const raw = embedScript.getAttribute('data-voice-autostart-delay');
    const sec = parseFloat(raw ?? '2');
    if (!Number.isFinite(sec) || sec < 0) return 2000;
    return Math.min(Math.round(sec * 1000), 60000);
  })();

  const lang: WidgetLang =
    parseExplicitWidgetLang(embedScript.getAttribute('data-lang')) ?? widgetLangFromNavigator();
  const T = widgetTranslations[lang];
  const bcp47Lang = speechLangBcp47[lang];

  const apiUrl = embedScript.src.replace('/widget.js', '').replace('/widget', '');
  const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');

  const shadow = document.createElement('div');
  shadow.id = 'ai-seller-widget-root';
  document.body.appendChild(shadow);

  const root = document.createElement('div');
  root.innerHTML = `
    <style>
      #ai-seller-widget * { box-sizing: border-box; }
      #ai-seller-widget {
        font-family: system-ui, -apple-system, sans-serif;
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
      }
      @keyframes ai-seller-pulse {
        0%, 100% { box-shadow: 0 4px 20px rgba(249, 115, 22, 0.5), 0 0 0 0 rgba(249, 115, 22, 0.4); }
        50% { box-shadow: 0 6px 28px rgba(249, 115, 22, 0.6), 0 0 0 12px rgba(249, 115, 22, 0); }
      }
      @keyframes ai-seller-wave {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(20deg); }
        75% { transform: rotate(-10deg); }
      }
      @keyframes ai-seller-bounce {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-2px) scale(1.02); }
      }
      @keyframes wolly-wave-arm {
        0%, 100% { transform: rotate(-15deg); }
        50% { transform: rotate(25deg); }
      }
      @keyframes wolly-blink {
        0%, 45%, 55%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(0.1); }
      }
      @keyframes wolly-antenna {
        0%, 100% { transform: rotate(-5deg); }
        50% { transform: rotate(5deg); }
      }
      @keyframes wolly-glow {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      @keyframes ai-seller-gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      #ai-seller-btn {
        width: 88px;
        height: 88px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f97316 0%, #fb923c 20%, #ec4899 40%, #d946ef 60%, #8b5cf6 80%, #6366f1 100%);
        background-size: 300% 300%;
        animation: ai-seller-pulse 2s ease-in-out infinite, ai-seller-gradient 4s ease infinite;
        border: 3px solid rgba(255,255,255,0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }
      #ai-seller-btn:hover { transform: scale(1.08); animation: ai-seller-gradient 2s ease infinite; box-shadow: 0 8px 32px rgba(236, 72, 153, 0.5), 0 0 20px rgba(139, 92, 246, 0.4); }
      #ai-seller-btn .ai-seller-avatar { width: 56px; height: 56px; }
      #ai-seller-btn .ai-seller-avatar-img {
        width: 82px;
        height: 82px;
        border-radius: 50%;
        object-fit: cover;
        display: none;
        border: 3px solid rgba(255,255,255,0.4);
        box-sizing: border-box;
      }
      #ai-seller-btn.has-custom-avatar {
        overflow: hidden;
        padding: 0;
      }
      #ai-seller-btn.has-custom-avatar .ai-seller-avatar { display: none; }
      #ai-seller-btn.has-custom-avatar .ai-seller-avatar-img { display: block; }
      #ai-seller-btn .ai-seller-avatar .wolly-bounce { animation: ai-seller-bounce 2.5s ease-in-out infinite; }
      #ai-seller-btn .ai-seller-avatar .wolly-wave-arm { transform-origin: 3px 0; animation: wolly-wave-arm 1.5s ease-in-out infinite; }
      #ai-seller-btn .ai-seller-avatar .wolly-blink { transform-origin: center; animation: wolly-blink 3s ease-in-out infinite; }
      #ai-seller-btn .ai-seller-avatar .wolly-antenna { transform-origin: 24px 10px; animation: wolly-antenna 2s ease-in-out infinite; }
      #ai-seller-btn .ai-seller-avatar .wolly-glow { animation: wolly-glow 1.5s ease-in-out infinite; }
      #ai-seller-btn.ai-seller-headless-listening {
        animation: ai-seller-headless-ring 1.2s ease-in-out infinite, ai-seller-gradient 4s ease infinite;
      }
      @keyframes ai-seller-headless-ring {
        0%, 100% { box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.5), 0 4px 20px rgba(249, 115, 22, 0.45); }
        50% { box-shadow: 0 0 0 12px rgba(236, 72, 153, 0), 0 8px 32px rgba(139, 92, 246, 0.55); }
      }
      #ai-seller-panel {
        position: absolute;
        bottom: 92px;
        right: 0;
        width: 380px;
        max-width: calc(100vw - 32px);
        max-height: 680px;
        max-height: min(680px, 85vh);
        background: linear-gradient(180deg, #1e1b2e 0%, #16141f 100%);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(236, 72, 153, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      @supports (height: 100dvh) {
        #ai-seller-panel {
          max-height: min(680px, 85dvh);
        }
      }
      #ai-seller-panel.open { display: flex; }
      #ai-seller-header {
        padding: 16px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(249, 115, 22, 0.25) 100%);
        font-weight: 600;
        color: white;
      }
      #ai-seller-messages {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        padding: 16px;
        min-height: 240px;
        min-height: min(360px, 50vh);
        max-height: 500px;
        max-height: min(500px, 58vh);
        background: #1a1724;
      }
      @supports (height: 100dvh) {
        #ai-seller-messages {
          max-height: min(500px, 58dvh);
        }
      }
      .ai-seller-assistant-col {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        max-width: 85%;
      }
      .ai-seller-msg {
        margin-bottom: 0;
        padding: 10px 14px;
        border-radius: 12px;
        max-width: 100%;
        font-size: 14px;
        line-height: 1.5;
      }
      .ai-seller-msg.user {
        margin-left: auto;
        background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%);
        color: white;
      }
      .ai-seller-msg.assistant {
        background: rgba(99, 102, 241, 0.2);
        color: #fafafa;
        border: 1px solid rgba(139, 92, 246, 0.2);
      }
      .ai-seller-msg-row {
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
        align-items: flex-start;
      }
      .ai-seller-msg-row.user { flex-direction: row-reverse; }
      .ai-seller-msg-row.user .ai-seller-msg { max-width: 85%; }
      .ai-seller-msg-row .ai-seller-msg-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }
      .ai-seller-msg-row .ai-seller-msg {
        margin-bottom: 0;
      }
      .ai-seller-msg .ai-seller-link {
        color: #a78bfa;
        text-decoration: underline;
        word-break: break-all;
      }
      .ai-seller-msg .ai-seller-link:hover {
        color: #c4b5fd;
      }
      #ai-seller-typing {
        display: inline-block;
        padding: 4px 8px;
        background: rgba(139, 92, 246, 0.2);
        border-radius: 8px;
        font-size: 12px;
        color: #c4b5fd;
      }
      #ai-seller-input-wrap {
        padding: 12px;
        border-top: 1px solid rgba(139, 92, 246, 0.2);
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      #ai-seller-input-row {
        display: flex;
        gap: 8px;
        align-items: stretch;
      }
      #ai-seller-input-row #ai-seller-input {
        flex: 1;
        min-width: 0;
      }
      #ai-seller-input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 8px;
        background: rgba(30, 27, 46, 0.8);
        color: #fafafa;
        font-size: 14px;
        outline: none;
      }
      #ai-seller-input::placeholder { color: #a78bfa; opacity: 0.6; }
      #ai-seller-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3); }
      .ai-seller-mic {
        flex-shrink: 0;
        width: 44px;
        min-height: 44px;
        padding: 0;
        border-radius: 8px;
        border: 1px solid rgba(139, 92, 246, 0.35);
        background: rgba(99, 102, 241, 0.15);
        color: #c4b5fd;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, border-color 0.15s;
      }
      .ai-seller-mic:hover {
        background: rgba(139, 92, 246, 0.25);
        border-color: #8b5cf6;
      }
      .ai-seller-mic.listening {
        background: rgba(236, 72, 153, 0.25);
        border-color: #ec4899;
        animation: ai-seller-mic-pulse 1.2s ease-in-out infinite;
      }
      @keyframes ai-seller-mic-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.35); }
        50% { box-shadow: 0 0 0 6px rgba(236, 72, 153, 0); }
      }
      .ai-seller-mic svg { width: 20px; height: 20px; }
      .ai-seller-mic.ai-seller-mic-unsupported {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .ai-seller-mic.ai-seller-mic-unsupported:hover {
        background: rgba(99, 102, 241, 0.15);
        border-color: rgba(139, 92, 246, 0.35);
      }
      .ai-seller-voice-hint {
        min-height: 16px;
        font-size: 11px;
        line-height: 1.35;
        color: #94a3b8;
      }
      .ai-seller-voice-hint.error { color: #f87171; }
      .ai-seller-speak-btn {
        min-width: 36px;
        min-height: 32px;
        padding: 6px 8px;
        font-size: 11px;
        border-radius: 6px;
        border: 1px solid rgba(139, 92, 246, 0.25);
        background: rgba(30, 27, 46, 0.6);
        color: #a78bfa;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .ai-seller-speak-btn:hover {
        background: rgba(139, 92, 246, 0.15);
        color: #c4b5fd;
      }
      .ai-seller-speak-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
      #ai-seller-footer {
        padding: 8px 0 0;
        font-size: 12px;
        color: #94a3b8;
        text-align: center;
      }
      #ai-seller-footer a {
        color: #a78bfa;
        text-decoration: none;
      }
      #ai-seller-footer a:hover {
        text-decoration: underline;
        color: #c4b5fd;
      }
      #ai-seller-greeting {
        position: absolute;
        bottom: 96px;
        right: 0;
        padding: 12px 16px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(236, 72, 153, 0.9) 100%);
        color: white;
        font-size: 14px;
        font-weight: 500;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        white-space: nowrap;
        opacity: 0;
        transform: translateY(8px);
        pointer-events: none;
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      #ai-seller-greeting::after {
        content: '';
        position: absolute;
        bottom: -6px;
        right: 24px;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid rgba(236, 72, 153, 0.9);
      }
      #ai-seller-greeting.visible {
        opacity: 1;
        transform: translateY(0);
      }
      #ai-seller-widget.voice-ui-off .ai-seller-mic {
        display: none !important;
      }
      #ai-seller-widget.voice-ui-off #ai-seller-voice-hint {
        display: none !important;
        min-height: 0;
      }
    </style>
    <div id="ai-seller-widget" class="${VOICE_UI_ENABLED ? '' : 'voice-ui-off'}">
      <div id="ai-seller-greeting">${T.greeting}</div>
      <div id="ai-seller-panel">
        <div id="ai-seller-header">${T.header}</div>
        <div id="ai-seller-messages"></div>
        <div id="ai-seller-input-wrap">
          <div id="ai-seller-input-row">
            <input id="ai-seller-input" type="text" placeholder="${T.placeholder}" autocomplete="off" enterkeyhint="send" autocapitalize="sentences" inputmode="text" />
            <button type="button" class="ai-seller-mic" id="ai-seller-mic" aria-label="${T.voiceMicLabel.replace(/"/g, '&quot;')}" title="${T.voiceMicLabel.replace(/"/g, '&quot;')}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          </div>
          <div id="ai-seller-voice-hint" class="ai-seller-voice-hint" role="status" aria-live="polite"></div>
          <div id="ai-seller-footer"></div>
        </div>
      </div>
      <button id="ai-seller-btn" aria-label="${T.openChat}">
        <img class="ai-seller-avatar-img" id="ai-seller-avatar-img" alt="" />
        <svg class="ai-seller-avatar" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g class="wolly-bounce">
            <!-- Antenna -->
            <g class="wolly-antenna">
              <line x1="24" y1="4" x2="24" y2="10" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="24" cy="3" r="2" fill="#ec4899" class="wolly-glow"/>
            </g>
            <!-- Head -->
            <rect x="10" y="12" width="28" height="18" rx="4" fill="white" stroke="#94a3b8" stroke-width="1"/>
            <!-- Eyes -->
            <g class="wolly-blink">
              <rect x="14" y="18" width="6" height="6" rx="1" fill="#6366f1"/>
              <rect x="28" y="18" width="6" height="6" rx="1" fill="#6366f1"/>
            </g>
            <circle cx="17" cy="21" r="1" fill="white"/>
            <circle cx="31" cy="21" r="1" fill="white"/>
            <!-- Mouth / speaker -->
            <rect x="18" y="26" width="12" height="2" rx="1" fill="#64748b"/>
            <!-- Body -->
            <rect x="12" y="32" width="24" height="12" rx="3" fill="white" stroke="#94a3b8" stroke-width="1"/>
            <rect x="16" y="36" width="4" height="4" rx="1" fill="#6366f1"/>
            <rect x="22" y="36" width="4" height="4" rx="1" fill="#ec4899"/>
            <rect x="28" y="36" width="4" height="4" rx="1" fill="#6366f1"/>
            <!-- Waving arm -->
            <g class="wolly-wave-arm" transform="translate(36, 22)">
              <rect x="0" y="0" width="6" height="14" rx="2" fill="white" stroke="#94a3b8" stroke-width="1"/>
              <rect x="1" y="2" width="4" height="3" rx="0.5" fill="#94a3b8"/>
            </g>
          </g>
        </svg>
      </button>
    </div>
  `;

  shadow.appendChild(root);

  const panel = shadow.querySelector('#ai-seller-panel')!;
  const btn = shadow.querySelector('#ai-seller-btn')!;
  const greetingEl = shadow.querySelector('#ai-seller-greeting')!;
  const messagesEl = shadow.querySelector('#ai-seller-messages')!;
  const inputEl = shadow.querySelector('#ai-seller-input') as HTMLInputElement;
  const micEl = shadow.querySelector('#ai-seller-mic') as HTMLButtonElement;
  const voiceHintEl = shadow.querySelector('#ai-seller-voice-hint') as HTMLDivElement;

  const footerEl = shadow.querySelector('#ai-seller-footer')!;
  const avatarImgEl = shadow.querySelector('#ai-seller-avatar-img') as HTMLImageElement;
  const avatarBtnEl = shadow.querySelector('#ai-seller-btn')!;

  let assistantAvatarUrl = '';

  function applyAvatarToMessages() {
    if (!assistantAvatarUrl) return;
    messagesEl.querySelectorAll('.ai-seller-msg-row.assistant').forEach((row) => {
      let avatar = row.querySelector('.ai-seller-msg-avatar') as HTMLImageElement | null;
      if (!avatar) {
        avatar = document.createElement('img');
        avatar.className = 'ai-seller-msg-avatar';
        avatar.alt = '';
        avatar.src = assistantAvatarUrl;
        row.insertBefore(avatar, row.firstChild);
      } else {
        avatar.src = assistantAvatarUrl;
      }
    });
  }

  (async () => {
    try {
      const res = await fetch(`${apiUrl}/widget/config?apiKey=${encodeURIComponent(apiKey!)}`);
      const data = await res.json();
      if (data.greeting && typeof data.greeting === 'string') {
        greetingEl.textContent = data.greeting;
      }
      const headerEl = shadow.querySelector('#ai-seller-header');
      if (headerEl) {
        const headerText = (data.header && typeof data.header === 'string' && data.header.trim())
          ? data.header.trim()
          : (data.greeting && typeof data.greeting === 'string' ? data.greeting : T.header);
        headerEl.textContent = headerText;
      }
      if (data.hasAvatar) {
        assistantAvatarUrl = `${apiUrl}/widget/avatar?apiKey=${encodeURIComponent(apiKey!)}`;
        avatarImgEl.src = assistantAvatarUrl;
        avatarImgEl.onerror = () => avatarBtnEl.classList.remove('has-custom-avatar');
        avatarImgEl.onload = () => {
          avatarBtnEl.classList.add('has-custom-avatar');
          applyAvatarToMessages();
        };
      }
      let footerHtml = '';
      if (data.websiteUrl && typeof data.websiteUrl === 'string' && data.websiteUrl.trim()) {
        let url = data.websiteUrl.trim();
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        if (url.length > 10 && /^https?:\/\//i.test(url)) {
          const safeHref = url.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '') || url;
          footerHtml = `${T.footerWantThis} → <a href="${safeHref}" target="_blank" rel="noopener noreferrer">${escapeHtml(displayUrl)}</a>`;
        }
      }
      if (!footerHtml) footerHtml = T.footerWantThis;
      footerEl.innerHTML = footerHtml;
    } catch {
      footerEl.textContent = T.footerWantThis;
    }
  })();

  function playGreetingSound() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1109, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(1319, ctx.currentTime + 0.16);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  let greetingTimeout: ReturnType<typeof setTimeout> | null = null;
  setTimeout(() => {
    greetingEl.classList.add('visible');
    playGreetingSound();
    greetingTimeout = setTimeout(() => {
      greetingEl.classList.remove('visible');
    }, 5000);
  }, 2000);

  function hideGreeting() {
    greetingEl.classList.remove('visible');
    if (greetingTimeout) {
      clearTimeout(greetingTimeout);
      greetingTimeout = null;
    }
  }

  const STORAGE_KEY = `ai-seller-chat-${apiKey}`;

  let chatId: string | null = (() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  })();

  let socket: ReturnType<typeof import('socket.io-client').io> | null = null;

  function saveChatId(id: string) {
    chatId = id;
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  }

  let speakNextAssistantReply = false;
  let voiceHintClearTimer: ReturnType<typeof setTimeout> | null = null;
  let recognitionInstance: WidgetSpeechRecognition | null = null;
  let micListening = false;
  let allowMicWhenPanelClosed = false;
  let voiceAutostartTimer: number | null = null;

  function setVoiceHint(text: string, isError = false) {
    if (voiceHintClearTimer) {
      clearTimeout(voiceHintClearTimer);
      voiceHintClearTimer = null;
    }
    voiceHintEl.textContent = text;
    voiceHintEl.classList.toggle('error', isError && !!text);
    if (text) {
      voiceHintClearTimer = setTimeout(() => {
        voiceHintEl.textContent = '';
        voiceHintEl.classList.remove('error');
        voiceHintClearTimer = null;
      }, 8000);
    }
  }

  function setMicListening(on: boolean) {
    micListening = on;
    micEl.classList.toggle('listening', on);
    const headless = on && allowMicWhenPanelClosed && !panel.classList.contains('open');
    avatarBtnEl.classList.toggle('ai-seller-headless-listening', headless);
  }

  function stripForTts(s: string): string {
    return s
      .replace(/\((https?:\/\/[^)]+)\)/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  }

  let speechVoicesListenerAttached = false;
  function primeSpeechSynthesisVoices(): void {
    if (!('speechSynthesis' in window) || speechVoicesListenerAttached) return;
    speechVoicesListenerAttached = true;
    try {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        window.speechSynthesis.getVoices();
      });
    } catch {
      //
    }
  }

  function pickSpeechVoice(): SpeechSynthesisVoice | null {
    if (!('speechSynthesis' in window)) return null;
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;
      const full = bcp47Lang.toLowerCase();
      const base = full.split('-')[0] || full;
      const norm = (s: string) => s.replace(/_/g, '-').toLowerCase();
      return (
        voices.find((v) => v.lang && norm(v.lang).startsWith(full)) ||
        voices.find((v) => v.lang && norm(v.lang).startsWith(base)) ||
        voices.find((v) => v.default) ||
        voices[0] ||
        null
      );
    } catch {
      return null;
    }
  }

  function speakPlainText(raw: string, onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }
    const text = stripForTts(raw);
    if (!text) {
      onEnd?.();
      return;
    }
    primeSpeechSynthesisVoices();
    try {
      window.speechSynthesis.cancel();
    } catch {
      //
    }
    const speakNow = () => {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = bcp47Lang;
        const voice = pickSpeechVoice();
        if (voice) u.voice = voice;
        if (onEnd) {
          u.onend = () => onEnd();
          u.onerror = () => onEnd();
        }
        window.speechSynthesis.speak(u);
      } catch {
        onEnd?.();
      }
    };
    window.setTimeout(speakNow, 0);
  }

  function canListenNow(): boolean {
    if (!voiceConversationMode) return false;
    if (panel.classList.contains('open')) return true;
    return allowMicWhenPanelClosed;
  }

  function scheduleStartListening(): void {
    window.setTimeout(() => {
      if (!canListenNow()) return;
      startMicListening();
    }, 400);
  }

  function startMicListening(): void {
    if (!canListenNow()) return;
    const rec = getOrCreateRecognition();
    if (!rec) return;
    try {
      rec.abort();
    } catch {
      //
    }
    try {
      rec.start();
      setMicListening(true);
      setVoiceHint(T.voiceListening);
    } catch {
      setMicListening(false);
    }
  }

  let voiceGreetingPlayedThisSession = false;

  function speakGreetingThenListen(): void {
    if (!voiceConversationMode) return;
    if (!getSpeechRecognitionCtor()) {
      if ('speechSynthesis' in window && !voiceGreetingPlayedThisSession) {
        voiceGreetingPlayedThisSession = true;
        speakPlainText(greetingEl.textContent.trim() || T.greeting);
      }
      return;
    }
    if (!('speechSynthesis' in window)) {
      startMicListening();
      return;
    }
    window.speechSynthesis.cancel();
    try {
      recognitionInstance?.abort();
    } catch {
      //
    }
    setMicListening(false);
    const greetingText = greetingEl.textContent.trim() || T.greeting;
    if (!voiceGreetingPlayedThisSession) {
      voiceGreetingPlayedThisSession = true;
      speakPlainText(greetingText, () => scheduleStartListening());
    } else {
      scheduleStartListening();
    }
  }

  function handleAssistantVoiceOutput(plain: string): void {
    if (voiceConversationMode) {
      speakPlainText(plain, () => scheduleStartListening());
      return;
    }
    if (speakNextAssistantReply) {
      speakNextAssistantReply = false;
      speakPlainText(plain);
    }
  }

  function beginVoiceConversationOnOpen(): void {
    speakGreetingThenListen();
  }

  function getSpeechRecognitionCtor(): WidgetSpeechRecognitionCtor | null {
    const w = window as unknown as {
      SpeechRecognition?: WidgetSpeechRecognitionCtor;
      webkitSpeechRecognition?: WidgetSpeechRecognitionCtor;
    };
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
  }

  function getOrCreateRecognition(): WidgetSpeechRecognition | null {
    if (recognitionInstance) return recognitionInstance;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = bcp47Lang;
    rec.continuous = false;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    rec.interimResults = !/iPhone|iPad|iPod/i.test(ua);
    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const piece = r[0]?.transcript ?? '';
        if (r.isFinal) finalChunk += piece;
        else interim += piece;
      }
      if (finalChunk.trim()) {
        const text = finalChunk.trim();
        inputEl.value = text;
        setMicListening(false);
        setVoiceHint('');
        sendMessage({ fromVoice: true });
        return;
      }
      if (interim.trim()) {
        inputEl.value = interim.trimEnd();
      }
    };
    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      setMicListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceHint(T.voiceMicDenied, true);
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setVoiceHint(T.error, true);
      }
    };
    rec.onend = () => {
      setMicListening(false);
    };
    recognitionInstance = rec;
    return rec;
  }

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function linkify(text: string): string {
    const placeholders: string[] = [];
    const withPlaceholders = text.replace(/\((https?:\/\/[^)]+)\)/g, (_, url) => {
      placeholders.push(url);
      return `\u0000LINK${placeholders.length - 1}\u0000`;
    });
    const escaped = escapeHtml(withPlaceholders);
    return escaped.replace(/\u0000LINK(\d+)\u0000/g, (_, i) => {
      const url = placeholders[+i];
      const safeHref = url.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `(<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="ai-seller-link">${escapeHtml(url)}</a>)`;
    });
  }

  const speakBtnSvg =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';

  function addMessage(role: 'user' | 'assistant', content: string) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-seller-msg ${role}`;
    if (role === 'assistant') {
      msgDiv.innerHTML = linkify(content).replace(/\n/g, '<br>');
    } else {
      msgDiv.textContent = content;
    }
    const row = document.createElement('div');
    row.className = `ai-seller-msg-row ${role}`;
    if (role === 'assistant') {
      if (assistantAvatarUrl) {
        const avatar = document.createElement('img');
        avatar.className = 'ai-seller-msg-avatar';
        avatar.alt = '';
        avatar.src = assistantAvatarUrl;
        row.appendChild(avatar);
      }
      const col = document.createElement('div');
      col.className = 'ai-seller-assistant-col';
      col.appendChild(msgDiv);
      if (VOICE_UI_ENABLED && 'speechSynthesis' in window) {
        const speakBtn = document.createElement('button');
        speakBtn.type = 'button';
        speakBtn.className = 'ai-seller-speak-btn';
        speakBtn.setAttribute('aria-label', T.speakReply);
        speakBtn.title = T.speakReply;
        speakBtn.innerHTML = speakBtnSvg;
        speakBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          speakPlainText(content);
        });
        col.appendChild(speakBtn);
      }
      row.appendChild(col);
    } else {
      row.appendChild(msgDiv);
    }
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function loadHistory() {
    if (!chatId) return;
    try {
      const res = await fetch(`${apiUrl}/widget/chat/${chatId}?apiKey=${encodeURIComponent(apiKey!)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages?.length) {
        data.messages.forEach((m: { role: string; content: string }) => {
          if (m.role === 'user' || m.role === 'assistant') addMessage(m.role, m.content);
        });
      }
    } catch {}
  }

  loadHistory();

  let typingRowEl: HTMLElement | null = null;
  function showTyping(show: boolean) {
    let span = messagesEl.querySelector('#ai-seller-typing') as HTMLElement | null;
    if (show) {
      if (!span) {
        span = document.createElement('span');
        span.id = 'ai-seller-typing';
        span.textContent = T.typing;
        typingRowEl = document.createElement('div');
        typingRowEl.className = 'ai-seller-msg-row assistant';
        if (assistantAvatarUrl) {
          const avatar = document.createElement('img');
          avatar.className = 'ai-seller-msg-avatar';
          avatar.alt = '';
          avatar.src = assistantAvatarUrl;
          typingRowEl.appendChild(avatar);
        }
        typingRowEl.appendChild(span);
        messagesEl.appendChild(typingRowEl);
      }
      if (typingRowEl) typingRowEl.style.display = 'flex';
      if (span) span.style.display = 'inline-block';
    } else if (typingRowEl) {
      typingRowEl.style.display = 'none';
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function sendViaHttp(message: string) {
    addMessage('user', message);
    showTyping(true);
    try {
      const res = await fetch(`${apiUrl}/widget/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, message, chatId }),
      });
      if (!res.ok) {
        showTyping(false);
        speakNextAssistantReply = false;
        addMessage('assistant', T.error);
        handleAssistantVoiceOutput(T.error);
        return;
      }
      let data: { assistantMessage?: string; chatId?: string };
      try {
        data = await res.json();
      } catch {
        showTyping(false);
        speakNextAssistantReply = false;
        addMessage('assistant', T.error);
        handleAssistantVoiceOutput(T.error);
        return;
      }
      if (data.assistantMessage) {
        if (data.chatId) saveChatId(data.chatId);
        showTyping(false);
        addMessage('assistant', data.assistantMessage);
        handleAssistantVoiceOutput(data.assistantMessage);
      } else {
        showTyping(false);
        speakNextAssistantReply = false;
      }
    } catch (e) {
      showTyping(false);
      speakNextAssistantReply = false;
      addMessage('assistant', T.error);
      handleAssistantVoiceOutput(T.error);
    }
  }

  function connectSocket() {
    if (socket?.connected) return;
    try {
      socket = io(wsUrl, {
        auth: { apiKey },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 8,
        reconnectionDelay: 1000,
        timeout: 25000,
      });
      socket.on('assistant', (data: { chatId: string; message: string }) => {
        saveChatId(data.chatId);
        showTyping(false);
        addMessage('assistant', data.message);
        handleAssistantVoiceOutput(data.message);
      });
      socket.on('typing', (data: { typing: boolean }) => showTyping(data.typing));
      socket.on('error', (data: { message: string }) => {
        showTyping(false);
        speakNextAssistantReply = false;
        const errText = data?.message || T.error;
        addMessage('assistant', errText);
        handleAssistantVoiceOutput(errText);
      });
    } catch (_) {}
  }

  function sendMessage(opts?: { fromVoice?: boolean }) {
    const message = inputEl.value.trim();
    if (!message) return;
    speakNextAssistantReply = !voiceConversationMode && opts?.fromVoice === true;
    inputEl.value = '';
    setVoiceHint('');
    connectSocket();
    if (socket?.connected) {
      addMessage('user', message);
      showTyping(true);
      socket.emit('message', { message, chatId });
    } else {
      sendViaHttp(message);
    }
  }

  if (VOICE_UI_ENABLED && !getSpeechRecognitionCtor()) {
    micEl.classList.add('ai-seller-mic-unsupported');
    micEl.title = T.voiceNotSupported;
  }

  if (VOICE_UI_ENABLED) micEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!getSpeechRecognitionCtor()) {
      setVoiceHint(T.voiceNotSupported, true);
      return;
    }
    const rec = getOrCreateRecognition();
    if (!rec) {
      setVoiceHint(T.voiceNotSupported, true);
      return;
    }
    if (micListening) {
      try {
        rec.stop();
      } catch {
        //
      }
      setMicListening(false);
      setVoiceHint('');
      return;
    }
    try {
      rec.abort();
    } catch {
      //
    }
    try {
      rec.start();
      setMicListening(true);
      setVoiceHint(T.voiceListening);
    } catch {
      setMicListening(false);
      setVoiceHint(T.voiceNotSupported, true);
    }
  });

  btn.addEventListener('click', () => {
    hideGreeting();
    const opening = !panel.classList.contains('open');
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      if (voiceAutostartTimer != null) {
        window.clearTimeout(voiceAutostartTimer);
        voiceAutostartTimer = null;
      }
      inputEl.focus();
      if (opening) {
        beginVoiceConversationOnOpen();
      }
    } else {
      allowMicWhenPanelClosed = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      try {
        recognitionInstance?.stop();
      } catch {
        //
      }
      setMicListening(false);
      setVoiceHint('');
    }
  });

  if (voiceAutostartEnabled && voiceConversationMode) {
    voiceAutostartTimer = window.setTimeout(() => {
      voiceAutostartTimer = null;
      if (panel.classList.contains('open')) return;
      allowMicWhenPanelClosed = true;
      speakGreetingThenListen();
    }, voiceAutostartDelayMs);
  }

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
})();
