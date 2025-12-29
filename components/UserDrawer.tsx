
import React, { useState } from 'react';
import { ChatSession, UserPreferences } from '../types';

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

export const UserDrawer: React.FC<UserDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
  preferences,
  onUpdatePreferences
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'personalization' | 'settings'>('history');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Account & Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-2 border-b border-slate-50">
          {[
            { id: 'history', label: 'History', icon: 'fa-clock-rotate-left' },
            { id: 'personalization', label: 'Personalization', icon: 'fa-user-gear' },
            { id: 'settings', label: 'Settings', icon: 'fa-gear' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-1 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === tab.id 
                ? 'border-teal-600 text-teal-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar p-6">
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Threads</span>
              </div>
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fa-solid fa-message text-slate-200 text-4xl mb-4"></i>
                  <p className="text-slate-500 text-sm">No recent chats found.</p>
                </div>
              ) : (
                sessions.sort((a,b) => b.updatedAt - a.updatedAt).map((s) => (
                  <div key={s.id} className="group flex items-center gap-2">
                    <button
                      onClick={() => { onSelectSession(s.id); onClose(); }}
                      className="flex-grow text-left p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all truncate"
                    >
                      <p className="text-sm font-bold text-slate-700 truncate">{s.title || "Untitled Thread"}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(s.updatedAt).toLocaleDateString()}
                      </p>
                    </button>
                    <button 
                      onClick={() => onDeleteSession(s.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'personalization' && (
            <div className="space-y-8">
              <section>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">How should Al-Muwaffaq respond?</label>
                <div className="space-y-3">
                  {['simple', 'detailed', 'scholarly'].map((depth) => (
                    <button
                      key={depth}
                      onClick={() => onUpdatePreferences({ ...preferences, depthPreference: depth as any })}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        preferences.depthPreference === depth 
                        ? 'border-teal-600 bg-teal-50/50' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <p className="text-sm font-bold capitalize text-slate-800">{depth}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {depth === 'simple' && 'Plain language, suitable for children or new Muslims.'}
                        {depth === 'detailed' && 'Includes full context and moderate background information.'}
                        {depth === 'scholarly' && 'Cites multiple legal opinions and detailed linguistic nuances.'}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={preferences.name}
                  onChange={(e) => onUpdatePreferences({ ...preferences, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-600 transition-all"
                />
              </section>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Language</p>
                    <p className="text-xs text-slate-500">System display language</p>
                  </div>
                  <select 
                    value={preferences.language}
                    onChange={(e) => onUpdatePreferences({ ...preferences, language: e.target.value as any })}
                    className="bg-white border border-slate-200 rounded-lg text-xs font-bold p-1"
                  >
                    <option value="English">English</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Theme</p>
                    <p className="text-xs text-slate-500">Customize appearance</p>
                  </div>
                  <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">
                    Light (Default)
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Al-Muwaffaq v2.4.0 • Built for the Ummah</p>
        </div>
      </div>
    </div>
  );
};
