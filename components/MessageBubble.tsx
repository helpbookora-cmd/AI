
import React, { useState, useRef } from 'react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const [copied, setCopied] = useState(false);
  const [highlightedSource, setHighlightedSource] = useState<string | null>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Detect Arabic script
  const isArabicScript = /[\u0600-\u06FF]/.test(message.content);
  // Specifically detect Urdu characters to use Nastaliq
  const isUrdu = /[ٹڈڑئےں]/.test(message.content);
  const isArabicOnly = isArabicScript && !isUrdu;

  const extractAllSources = (text: string) => {
    const sourceRegex = /\((Qur’an|Sahih|Sunan|Jami|Tafsir)[^)]+\)/g;
    const matches = Array.from(text.matchAll(sourceRegex));
    return Array.from(new Set(matches.map(m => m[0])));
  };

  const allSources = !isUser ? extractAllSources(message.content) : [];

  const handleSourceClick = (sourceStr: string) => {
    setHighlightedSource(sourceStr);
    footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setHighlightedSource(null), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData: ShareData = {
      title: 'Islamic Knowledge - Al-Muwaffaq',
      text: message.content,
    };

    try {
      if (window.location.protocol.startsWith('http')) {
        shareData.url = window.location.href;
      }
    } catch (e) {}

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    
    return lines.map((line, i) => {
      const sourceRegex = /\((?:Qur’an|Sahih|Sunan|Jami|Tafsir)[^)]+\)/g;
      const citationsFound = Array.from(line.matchAll(sourceRegex)).map(m => m[0]);
      let cleanText = line.replace(sourceRegex, '').trim();
      const parts = cleanText.split(/(\*\*.*?\*\*)/g);

      return (
        <div key={i} className={`mb-4 last:mb-0 group ${isUrdu ? 'urdu-text' : isArabicOnly ? 'arabic-text' : ''}`}>
          <p className={`leading-relaxed text-slate-700 ${isArabicScript ? 'text-lg md:text-xl' : 'text-base md:text-lg'} mb-2 ${line.trim().startsWith('•') ? 'pl-4' : ''}`}>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
          
          {citationsFound.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 mt-1 ${isArabicScript ? 'justify-end' : ''}`}>
              {citationsFound.map((citation, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSourceClick(citation)}
                  className="inline-flex items-center px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-[10px] font-bold border border-teal-100 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all cursor-pointer active:scale-95"
                >
                  <i className="fa-solid fa-book-open text-[8px] mr-1.5"></i>
                  {citation.replace(/[()]/g, '')}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  if (isUser) {
    return (
      <div className={`w-full flex ${isArabicScript ? 'justify-end' : 'justify-start'} mt-6 md:mt-10 mb-4 md:mb-6 animate-in fade-in slide-in-from-left-2 duration-300 px-4`}>
        <h2 className={`text-lg md:text-2xl font-semibold text-slate-900 tracking-tight leading-tight ${isUrdu ? 'urdu-text' : isArabicOnly ? 'arabic-text' : ''}`}>{message.content}</h2>
      </div>
    );
  }

  return (
    <div className="w-full mb-10 md:mb-14 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both px-4">
      <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 border border-slate-100 shadow-sm">
        <div className={`flex items-center gap-2 mb-4 md:mb-5 text-slate-900 font-bold border-b border-slate-50 pb-3 md:pb-4 ${isArabicScript ? 'flex-row-reverse' : ''}`}>
          <div className="w-6 h-6 md:w-7 md:h-7 bg-teal-600 rounded-lg flex items-center justify-center text-white text-[9px] md:text-[10px]">
            <i className="fa-solid fa-kaaba"></i>
          </div>
          <span className={`text-sm md:text-lg tracking-tight ${isUrdu ? 'urdu-text' : isArabicOnly ? 'arabic-text' : ''}`}>
            {isUrdu ? 'تصدیق شدہ معلومات' : isArabicOnly ? 'معلومات موثقة' : 'Verified Knowledge'}
          </span>
        </div>

        <div className={`message-text ${isArabicScript ? 'text-right' : ''}`}>
          {renderContent(message.content)}
        </div>

        {!isUser && allSources.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-50" ref={footerRef}>
            <div className={`flex items-center gap-2 mb-3 text-slate-400 text-[9px] font-black uppercase tracking-widest ${isArabicScript ? 'flex-row-reverse' : ''}`}>
              <i className="fa-solid fa-scroll text-teal-600/60"></i>
              <span>{isUrdu ? 'اس جواب میں استعمال ہونے والے ذرائع:' : isArabicOnly ? 'المصادر المستخدمة في هذا الرد:' : 'Sources verification list:'}</span>
            </div>
            <div className={`space-y-1 ${isArabicScript ? 'text-right' : ''}`}>
              {allSources.map((source, idx) => (
                <div 
                  key={idx} 
                  className={`text-[12px] md:text-[13px] py-0.5 transition-all duration-500 rounded-lg ${
                    highlightedSource === source 
                    ? 'bg-teal-50 px-3 text-teal-900 font-bold ring-1 ring-teal-200' 
                    : 'text-slate-600 px-0'
                  }`}
                >
                  {isArabicScript ? (
                    <>
                      {source.replace(/[()]/g, '')}
                      <span className="text-teal-600 ml-2 font-black">•</span>
                    </>
                  ) : (
                    <>
                      <span className="text-teal-600 mr-2 font-black">•</span>
                      {source.replace(/[()]/g, '')}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className={`mt-3 px-2 flex items-center justify-between text-slate-400 text-[8px] font-bold uppercase tracking-widest ${isArabicScript ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-3 md:gap-5 ${isArabicScript ? 'flex-row-reverse' : ''}`}>
          <button onClick={handleCopy} className={`hover:text-teal-600 transition-colors flex items-center gap-1.5 active:scale-95 ${isArabicScript ? 'flex-row-reverse' : ''}`}>
            <i className={`fa-regular ${copied ? 'fa-circle-check text-teal-600' : 'fa-copy'}`}></i>
            <span>{copied ? (isArabicScript ? 'تم النسخ' : 'Copied') : (isArabicScript ? 'نسخ' : 'Copy')}</span>
          </button>
          <button onClick={handleShare} className={`hover:text-teal-600 transition-colors flex items-center gap-1.5 active:scale-95 ${isArabicScript ? 'flex-row-reverse' : ''}`}>
            <i className="fa-solid fa-share-nodes"></i>
            <span>{isArabicScript ? 'مشاركة' : 'Share'}</span>
          </button>
        </div>
        <div className={`flex items-center gap-2 opacity-60 ${isArabicScript ? 'flex-row-reverse' : ''}`}>
          <i className="fa-regular fa-clock"></i>
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};
