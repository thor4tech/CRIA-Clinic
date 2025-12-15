import React, { useState } from 'react';
import { 
  Facebook, Instagram, MessageCircle, CreditCard, FileText, CheckCircle, 
  AlertCircle, RefreshCw, Lock, Activity, User, Building2, Palette, Shield, 
  Clock, Globe, PenTool, Save, Trash2, Smartphone, Moon, Upload, Download, 
  HelpCircle, Sun
} from 'lucide-react';
import { Integration, IntegrationStatus, IntegrationLog, IntegrationProvider } from '../types';
import { OnboardingData } from './Onboarding';
import { Button, Modal, Input, Select } from './Shared';

interface SettingsProps {
  integrations: Integration[];
  logs: IntegrationLog[];
  config: OnboardingData | null;
  onUpdateConfig: (newConfig: Partial<OnboardingData>) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
  onBackup: () => void;
  onReset: () => void;
}

const THEMES = [
    { id: 'rose', color: 'bg-rose-500', label: 'Rose Premium' },
    { id: 'gold', color: 'bg-amber-400', label: 'Gold Luxury' },
    { id: 'emerald', color: 'bg-emerald-500', label: 'Clinical Green' },
    { id: 'blue', color: 'bg-blue-500', label: 'Tech Blue' },
    { id: 'violet', color: 'bg-violet-500', label: 'Creative Violet' },
];

const Settings: React.FC<SettingsProps> = ({ config, onUpdateConfig, isDark, onToggleDark, onBackup, onReset }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'connections' | 'billing'>('general');
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'clinic' | 'system'>('profile');

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex space-x-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-white dark:bg-stone-700 shadow-sm' : 'text-stone-500'}`}>Geral</button>
      </div>

      <div className="flex gap-6 h-full overflow-hidden">
          <div className="w-64 flex flex-col space-y-1">
              <button onClick={() => setActiveSubTab('profile')} className={`text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center ${activeSubTab === 'profile' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800'}`}><User size={18} className="mr-3"/> Perfil</button>
              <button onClick={() => setActiveSubTab('system')} className={`text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center ${activeSubTab === 'system' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800'}`}><Palette size={18} className="mr-3"/> Sistema</button>
          </div>

          <div className="flex-1 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-y-auto custom-scrollbar">
              <div className="p-8 max-w-3xl">
                  {activeSubTab === 'profile' && (
                      <div className="space-y-8 animate-in fade-in">
                          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Perfil</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <Input label="Nome Completo" value={config?.ownerName || ''} onChange={(e:any) => onUpdateConfig({ownerName: e.target.value})} />
                              <Input label="Celular" value={config?.phone || ''} onChange={(e:any) => onUpdateConfig({phone: e.target.value})} />
                          </div>
                      </div>
                  )}

                  {activeSubTab === 'system' && (
                       <div className="space-y-8 animate-in fade-in">
                          <div>
                              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">Aparência</h3>
                              <div className="bg-stone-50 dark:bg-stone-950 p-5 rounded-xl border border-stone-100 dark:border-stone-800">
                                  <div className="flex items-center justify-between mb-6">
                                      <span className="flex items-center text-sm font-bold text-stone-800 dark:text-stone-200">
                                          {isDark ? <Moon size={18} className="mr-2"/> : <Sun size={18} className="mr-2"/>}
                                          Modo {isDark ? 'Escuro' : 'Claro'}
                                      </span>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" className="sr-only peer" checked={isDark} onChange={onToggleDark} />
                                          <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                      </label>
                                  </div>
                                  
                                  <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">Cor do Tema</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {THEMES.map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => onUpdateConfig({ theme: theme.id as any })}
                                            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${config?.theme === theme.id ? `bg-white dark:bg-stone-800 border-primary-500 ring-1 ring-primary-500` : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${theme.color} shadow-sm`}></div>
                                                <span className={`font-medium ${config?.theme === theme.id ? 'text-primary-700 dark:text-primary-400' : 'text-stone-600 dark:text-stone-400'}`}>{theme.label}</span>
                                            </div>
                                            {config?.theme === theme.id && <CheckCircle size={16} className="text-primary-500"/>}
                                        </button>
                                    ))}
                                </div>
                              </div>
                          </div>

                          <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                              <h4 className="font-bold text-stone-800 dark:text-stone-200 mb-4">Dados & Privacidade</h4>
                              <div className="flex gap-4">
                                  <Button onClick={onBackup} variant="secondary"><Download size={16} className="mr-2"/> Backup JSON</Button>
                                  <Button onClick={onReset} variant="danger"><Trash2 size={16} className="mr-2"/> Reset Fábrica</Button>
                              </div>
                          </div>
                       </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;