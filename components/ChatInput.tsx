
import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string, image?: { data: string, mimeType: string }) => void;
  isLoading: boolean;
  isFloating?: boolean;
}

type FocusMode = 'All' | "Qur'an" | 'Hadith' | 'Tafsir';

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isFloating = true }) => {
  const [input, setInput] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [focusMode, setFocusMode] = useState<FocusMode>('All');
  const [attachedFile, setAttachedFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const focusMenuRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || attachedFile) && !isLoading) {
      const prefix = focusMode !== 'All' ? `[Focus: ${focusMode}] ` : '';
      onSendMessage(prefix + input.trim(), attachedFile ? { data: attachedFile.data, mimeType: attachedFile.mimeType } : undefined);
      setInput('');
      setAttachedFile(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        setAttachedFile({
          name: file.name,
          data: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (focusMenuRef.current && !focusMenuRef.current.contains(event.target as Node)) {
        setIsFocusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Reduced max height for an even more compact feel
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const focusOptions: { mode: FocusMode; icon: string; desc: string }[] = [
    { mode: 'All', icon: 'fa-globe', desc: 'Search everything' },
    { mode: "Qur'an", icon: 'fa-kaaba', desc: 'Focus on Ayahs' },
    { mode: 'Hadith', icon: 'fa-book-open', desc: 'Focus on Narrations' },
    { mode: 'Tafsir', icon: 'fa-scroll', desc: 'Focus on Explanations' },
  ];

  return (
    <div className={`w-full max-w-2xl mx-auto px-4 ${isFloating ? 'pb-4' : ''}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Ultracompact Search Input Box */}
        <div className="bg-white rounded-[18px] border border-slate-200 shadow-[0_2px_15px_rgb(0,0,0,0.03)] focus-within:border-teal-500 focus-within:ring-[3px] focus-within:ring-teal-50/40 transition-all duration-300">
          
          {attachedFile && (
            <div className="px-3 pt-1.5 flex animate-in fade-in slide-in-from-top-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md border border-teal-100 text-[8px] font-bold uppercase tracking-wider">
                <i className={`fa-solid ${attachedFile.mimeType.startsWith('image/') ? 'fa-image' : 'fa-file-lines'}`}></i>
                <span className="max-w-[100px] truncate">{attachedFile.name}</span>
                <button type="button" onClick={() => setAttachedFile(null)} className="hover:bg-teal-200 p-0.5 rounded-full transition-colors ml-1">
                  <i className="fa-solid fa-xmark text-[7px]"></i>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center p-1 gap-1">
            {/* ATTACH BUTTON (START) */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf,.txt,.doc,.docx" className="hidden" />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all active:scale-95 shrink-0"
              title="Attach files"
            >
              <i className="fa-solid fa-paperclip text-sm"></i>
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any Islamic question"
              className="flex-grow px-1 py-1.5 outline-none resize-none overflow-hidden bg-transparent text-slate-800 placeholder:text-slate-400 text-sm min-h-[32px] max-h-[120px] leading-snug"
              disabled={isLoading}
            />

            {/* SEND BUTTON (END) */}
            <button 
              type="submit" 
              disabled={(!input.trim() && !attachedFile) || isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                (input.trim() || attachedFile)
                  ? 'bg-slate-900 text-white hover:bg-teal-700 active:scale-90 shadow-sm' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <i className="fa-solid fa-spinner animate-spin text-[10px]"></i>
              ) : (
                <i className="fa-solid fa-arrow-up text-[10px]"></i>
              )}
            </button>
          </div>
        </div>

        {/* Minimal Auxiliary Controls */}
        <div className="flex items-center gap-2 px-1">
          <div className="relative" ref={focusMenuRef}>
            <button 
              type="button" 
              onClick={() => setIsFocusOpen(!isFocusOpen)}
              className={`h-6 px-2 rounded-lg transition-all text-[9px] font-bold flex items-center gap-1 border shadow-xs ${
                focusMode !== 'All' 
                ? 'text-teal-600 bg-white border-teal-200' 
                : 'text-slate-400 bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <i className="fa-solid fa-crosshairs text-[8px]"></i>
              <span>{focusMode === 'All' ? 'Focus' : focusMode}</span>
            </button>

            {isFocusOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-52 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="p-1.5 border-b border-slate-50 bg-slate-50/50">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Source Filter</span>
                </div>
                <div className="p-1 space-y-0.5">
                  {focusOptions.map((opt) => (
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => {
                        setFocusMode(opt.mode);
                        setIsFocusOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 flex items-start gap-2 rounded-lg transition-all ${
                        focusMode === opt.mode ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <i className={`fa-solid ${opt.icon} mt-0.5 w-3 text-center text-[10px] ${focusMode === opt.mode ? 'text-teal-600' : 'text-slate-400'}`}></i>
                      <div>
                        <p className="text-[10px] font-bold leading-none mb-0.5">{opt.mode}</p>
                        <p className="text-[7px] text-slate-400 font-medium leading-tight">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 px-1.5 bg-white border border-slate-200 rounded-lg h-6 transition-all shadow-xs">
            <span className={`text-[8px] font-black uppercase tracking-widest ${isPro ? 'text-teal-600' : 'text-slate-400'}`}>Deep</span>
            <button 
              type="button"
              onClick={() => setIsPro(!isPro)}
              className={`w-5 h-3 rounded-full relative transition-all border ${
                isPro ? 'bg-teal-600 border-teal-600' : 'bg-slate-300 border-slate-300'
              }`}
            >
               <div className={`absolute top-0 w-1.5 h-1.5 bg-white rounded-full transition-all shadow-sm ${isPro ? 'left-[0.6rem]' : 'left-0'}`}></div>
            </button>
          </div>
        </div>
      </form>
      
      {!isFloating && (
         <div className="mt-4 flex flex-wrap justify-center gap-1 animate-in fade-in slide-in-from-top-4 duration-700 fill-mode-both">
            {["Salat", "Hazrat Ibrahim", "Parents Rights", "Ramadan"].map(tag => (
              <button 
                key={tag}
                type="button"
                onClick={() => onSendMessage(`Tell me about ${tag}`)}
                className="px-2.5 py-0.5 bg-white text-slate-500 rounded-full text-[9px] font-bold border border-slate-200 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/20 transition-all active:scale-95 shadow-xs"
              >
                {tag}
              </button>
            ))}
         </div>
      )}
    </div>
  );
};
