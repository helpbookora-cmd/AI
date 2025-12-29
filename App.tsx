
import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { UserDrawer } from './components/UserDrawer';
import { Message, Role, ChatSession, UserPreferences } from './types';
import { geminiService } from './services/geminiService';

const translations = {
  English: {
    hero: "Where knowledge begins",
    sub: "Pure Islamic knowledge, cited directly from the Qur'an and Sunnah of Hazrat Muhammad (PBUH).",
    tags: ["Salat", "Hazrat Ibrahim", "Parents Rights", "Ramadan"]
  },
  Urdu: {
    hero: "جہاں سے علم شروع ہوتا ہے",
    sub: "خالص اسلامی علم، جو براہ راست قرآن اور حضرت محمد صلی اللہ علیہ وسلم کی سنت سے لیا گیا ہے۔",
    tags: ["نماز", "حضرت ابراہیمؑ", "والدین کے حقوق", "رمضان"]
  },
  Arabic: {
    hero: "من هنا يبدأ العلم",
    sub: "علم إسلامي نقي، مقتبس مباشرة من القرآن وسنة حضرة محمد صلى الله عليه وسلم.",
    tags: ["الصلاة", "حياة إبراهيمؑ", "حقوق الوالدين", "رمضان"]
  }
};

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Discover' | 'Library'>('Discover');
  
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('almuwaffaq_prefs');
    return saved ? JSON.parse(saved) : {
      name: '',
      location: '',
      depthPreference: 'detailed',
      language: 'English'
    };
  });

  const t = translations[preferences.language as keyof typeof translations] || translations.English;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('almuwaffaq_sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('almuwaffaq_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('almuwaffaq_prefs', JSON.stringify(preferences));
  }, [preferences]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];
  const isChatStarted = messages.length > 0;

  useEffect(() => {
    if (isChatStarted) {
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isChatStarted]);

  const handleNewThread = () => {
    setCurrentSessionId(null);
    geminiService.resetChat();
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    geminiService.resetChat();
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  };

  const handleSendMessage = async (content: string, image?: { data: string, mimeType: string }) => {
    let targetSessionId = currentSessionId;

    if (!targetSessionId) {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: content.slice(0, 40) + (content.length > 40 ? '...' : ''),
        messages: [],
        updatedAt: Date.now()
      };
      setSessions(prev => [...prev, newSession]);
      targetSessionId = newId;
      setCurrentSessionId(newId);
    }

    const userMessage: Message = {
      role: Role.USER,
      content,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => 
      s.id === targetSessionId 
        ? { ...s, messages: [...s.messages, userMessage], updatedAt: Date.now() } 
        : s
    ));

    setIsLoading(true);

    try {
      let fullResponse = '';
      
      const personalizedPrompt = `
[Language: ${preferences.language}]
[Depth: ${preferences.depthPreference}]
${content}
      `.trim();

      await geminiService.streamMessage(personalizedPrompt, (chunk) => {
        fullResponse += chunk;
        setSessions(prev => prev.map(s => {
          if (s.id !== targetSessionId) return s;
          const lastMsg = s.messages[s.messages.length - 1];
          if (lastMsg.role === Role.ASSISTANT && lastMsg.timestamp > userMessage.timestamp) {
            const newMessages = [...s.messages.slice(0, -1), { ...lastMsg, content: fullResponse }];
            return { ...s, messages: newMessages, updatedAt: Date.now() };
          } else {
            const newAssistantMsg: Message = {
              role: Role.ASSISTANT,
              content: fullResponse,
              timestamp: Date.now()
            };
            return { ...s, messages: [...s.messages, newAssistantMsg], updatedAt: Date.now() };
          }
        }));
      }, image);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: Role.ASSISTANT,
        content: preferences.language === 'Urdu' ? "معذرت، ایک غلطی ہوئی ہے۔ اللہ بہتر جانتا ہے۔" : "I am sorry, but an error occurred. Allah knows best.",
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => 
        s.id === targetSessionId 
          ? { ...s, messages: [...s.messages, errorMessage], updatedAt: Date.now() } 
          : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FCFCF9] text-slate-900 selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-64 bg-[#F3F3EE] border-r border-slate-200 flex-col sticky top-0 h-screen p-4 z-50">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-teal-100">
            <i className="fa-solid fa-kaaba text-sm"></i>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Al-Muwaffaq</span>
        </div>
        
        <button 
          onClick={handleNewThread}
          className="flex items-center justify-between w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-teal-400 transition-all mb-6"
        >
          <span>New Thread</span>
          <span className="text-slate-400 text-[10px] border border-slate-200 px-1.5 py-0.5 rounded uppercase font-bold">Ctrl I</span>
        </button>

        <nav className="flex-grow space-y-1.5">
          <button 
            onClick={() => setActiveTab('Discover')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 transition-all rounded-xl font-semibold text-sm ${
              activeTab === 'Discover' ? 'text-slate-900 bg-white shadow-sm border border-slate-200/50' : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>Discover</span>
          </button>
          <button 
            onClick={() => setActiveTab('Library')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 transition-all rounded-xl font-semibold text-sm ${
              activeTab === 'Library' ? 'text-slate-900 bg-white shadow-sm border border-slate-200/50' : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            <i className="fa-solid fa-folder-open"></i>
            <span>Library</span>
          </button>
        </nav>

        <div className="mt-auto p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Access Tools</p>
           <button onClick={() => setIsDrawerOpen(true)} className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-teal-600 transition-all">Settings</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col relative min-h-screen">
        <Header onOpenMenu={() => setIsDrawerOpen(true)} />
        
        <main className={`flex-grow flex flex-col ${!isChatStarted ? 'justify-center items-center px-4' : ''} pb-4 md:pb-0`}>
          
          {!isChatStarted ? (
            <div className="w-full max-w-2xl px-4 text-center mb-8 md:mb-12 animate-in fade-in zoom-in-95 duration-700">
               <h1 className={`text-2xl md:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight mb-4 leading-tight break-words ${preferences.language !== 'English' ? (preferences.language === 'Urdu' ? 'urdu-text' : 'arabic-text') : ''}`}>
                 {t.hero}
               </h1>
               <p className={`text-slate-500 text-sm md:text-xl font-medium max-w-lg mx-auto leading-relaxed ${preferences.language !== 'English' ? (preferences.language === 'Urdu' ? 'urdu-text' : 'arabic-text') : ''}`}>
                 {t.sub}
               </p>
               <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                  {t.tags.map(tag => (
                    <button 
                      key={tag}
                      type="button"
                      onClick={() => handleSendMessage(`Tell me about ${tag}`)}
                      className={`px-3 py-1 bg-white text-slate-500 rounded-full text-[10px] font-bold border border-slate-200 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/20 transition-all active:scale-95 shadow-xs ${preferences.language === 'Urdu' ? 'urdu-text' : preferences.language === 'Arabic' ? 'arabic-text' : ''}`}
                    >
                      {tag}
                    </button>
                  ))}
               </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl pt-4 md:pt-6 pb-48 md:pb-56 mx-auto">
              {messages.map((msg, index) => (
                <MessageBubble key={index} message={msg} />
              ))}
              {isLoading && messages.length > 0 && messages[messages.length - 1].role === Role.USER && (
                <div className="mt-8 space-y-4 animate-pulse px-4">
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Persistent Floating Input */}
          <div className={`${
            isChatStarted 
              ? 'fixed bottom-0 left-0 lg:left-64 right-0 bg-gradient-to-t from-[#FCFCF9] via-[#FCFCF9] to-transparent pt-8 pb-4 z-40' 
              : 'w-full relative z-10'
          } transition-all duration-300`}>
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} isFloating={isChatStarted} />
          </div>
        </main>
      </div>

      <UserDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        preferences={preferences}
        onUpdatePreferences={setPreferences}
      />
    </div>
  );
};

export default App;
