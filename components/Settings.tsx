import React, { useState } from 'react';
import { 
  Facebook, Instagram, MessageCircle, CreditCard, FileText, CheckCircle, 
  AlertCircle, RefreshCw, Lock, Activity, User, Building2, Palette, Shield, 
  Clock, Globe, PenTool, Save, Trash2, Smartphone, Moon, Upload, Download, 
  HelpCircle, Sun, Link, Plug, Zap
} from 'lucide-react';
import { Integration, IntegrationStatus, IntegrationLog, IntegrationProvider } from '../types';
import { OnboardingData } from './Onboarding';
import { Button, Modal, Input, Select, Card } from './Shared';

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

const MOCK_INTEGRATIONS: Integration[] = [
    { id: '1', name: 'WhatsApp Business', provider: IntegrationProvider.WHATSAPP, icon: 'whatsapp', status: IntegrationStatus.CONNECTED, description: 'Confirmação automática de agendamentos e lembretes.', features: ['Bot de Agendamento', 'Lembretes 24h', 'Campanhas em Massa'] },
    { id: '2', name: 'Google Calendar', provider: IntegrationProvider.GOOGLE, icon: 'google', status: IntegrationStatus.CONNECTED, description: 'Sincronize sua agenda pessoal com a da clínica.', features: ['Sync Bidirecional', 'Bloqueio Automático'] },
    { id: '3', name: 'Meta Ads (Facebook)', provider: IntegrationProvider.META, icon: 'facebook', status: IntegrationStatus.DISCONNECTED, description: 'Rastreie conversões de leads direto do Instagram.', features: ['Pixel de Conversão', 'Lead Gen Forms'] },
    { id: '4', name: 'Asaas Pagamentos', provider: IntegrationProvider.PAYMENT, icon: 'credit-card', status: IntegrationStatus.CONNECTED, description: 'Emissão de boletos e cobrança no cartão.', features: ['Split de Pagamento', 'Régua de Cobrança'] },
    { id: '5', name: 'eNotas', provider: IntegrationProvider.NFE, icon: 'file-text', status: IntegrationStatus.DISCONNECTED, description: 'Emissão automática de NFS-e.', features: ['Emissão Automática', 'Envio por Email'] },
];

const Settings: React.FC<SettingsProps> = ({ integrations, logs, config, onUpdateConfig, onConnect, onDisconnect, isDark, onToggleDark, onBackup, onReset }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'connections' | 'billing'>('general');
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'system'>('profile');

  // Helper to render icon based on string
  const renderIcon = (name: string) => {
      switch(name) {
          case 'whatsapp': return <MessageCircle size={24} className="text-emerald-500"/>;
          case 'google': return <Globe size={24} className="text-blue-500"/>;
          case 'facebook': return <Facebook size={24} className="text-blue-600"/>;
          case 'credit-card': return <CreditCard size={24} className="text-stone-600"/>;
          default: return <Plug size={24} className="text-stone-400"/>;
      }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Top Tabs */}
      <div className="flex space-x-1 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-xl w-fit">
        <button onClick={() => setActiveTab('general')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-800 dark:text-stone-100' : 'text-stone-500 hover:text-stone-700'}`}>
            <User size={16}/> Geral
        </button>
        <button onClick={() => setActiveTab('connections')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'connections' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-800 dark:text-stone-100' : 'text-stone-500 hover:text-stone-700'}`}>
            <Link size={16}/> Integrações
        </button>
        <button onClick={() => setActiveTab('billing')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-800 dark:text-stone-100' : 'text-stone-500 hover:text-stone-700'}`}>
            <CreditCard size={16}/> Planos
        </button>
      </div>

      <div className="flex gap-8 h-full overflow-hidden">
          {activeTab === 'general' && (
              <>
                <div className="w-64 flex flex-col space-y-2">
                    <button onClick={() => setActiveSubTab('profile')} className={`text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center transition-colors ${activeSubTab === 'profile' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800'}`}><User size={18} className="mr-3"/> Perfil da Clínica</button>
                    <button onClick={() => setActiveSubTab('system')} className={`text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center transition-colors ${activeSubTab === 'system' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800'}`}><Palette size={18} className="mr-3"/> Aparência & Sistema</button>
                </div>

                <div className="flex-1 bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-y-auto custom-scrollbar">
                    <div className="p-8 max-w-3xl">
                        {activeSubTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">Perfil da Clínica</h3>
                                    <p className="text-sm text-stone-500 mb-6">Informações visíveis nos orçamentos e agendamentos.</p>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="h-20 w-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 border-2 border-dashed border-stone-300">
                                                <Upload size={24}/>
                                            </div>
                                            <Button variant="secondary" className="text-xs">Alterar Logo</Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Nome da Clínica" value={config?.clinicName || ''} onChange={(e:any) => onUpdateConfig({clinicName: e.target.value})} />
                                            <Input label="Responsável Técnico" value={config?.ownerName || ''} onChange={(e:any) => onUpdateConfig({ownerName: e.target.value})} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Telefone / WhatsApp" value={config?.phone || ''} onChange={(e:any) => onUpdateConfig({phone: e.target.value})} />
                                            <Input label="CNPJ" placeholder="00.000.000/0001-00" />
                                        </div>
                                        <Input label="Endereço Completo" value={config?.address || ''} onChange={(e:any) => onUpdateConfig({address: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'system' && (
                             <div className="space-y-8 animate-in fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">Personalização</h3>
                                    <div className="bg-stone-50 dark:bg-stone-950 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <span className="flex items-center text-sm font-bold text-stone-800 dark:text-stone-200 mb-1">
                                                    {isDark ? <Moon size={16} className="mr-2"/> : <Sun size={16} className="mr-2"/>}
                                                    Tema Escuro
                                                </span>
                                                <p className="text-xs text-stone-500">Alterne entre modo claro e escuro para conforto visual.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={isDark} onChange={onToggleDark} />
                                                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                            </label>
                                        </div>
                                        
                                        <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">Cor de Destaque</h4>
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
                                    <h4 className="font-bold text-stone-800 dark:text-stone-200 mb-4">Zona de Perigo</h4>
                                    <div className="flex gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
                                        <Button onClick={onBackup} variant="secondary" className="bg-white"><Download size={16} className="mr-2"/> Backup JSON</Button>
                                        <Button onClick={onReset} variant="danger"><Trash2 size={16} className="mr-2"/> Reset Fábrica</Button>
                                    </div>
                                </div>
                             </div>
                        )}
                    </div>
                </div>
              </>
          )}

          {activeTab === 'connections' && (
              <div className="flex-1 bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-y-auto custom-scrollbar animate-in fade-in">
                  <div className="p-8 max-w-5xl mx-auto">
                      <div className="mb-8">
                          <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Integrações API</h3>
                          <p className="text-stone-500">Conecte o Aesthetik Flow às ferramentas que você já usa.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {MOCK_INTEGRATIONS.map(integration => (
                              <div key={integration.id} className="p-6 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-primary-200 hover:shadow-lg transition-all bg-white dark:bg-stone-800 group">
                                  <div className="flex justify-between items-start mb-4">
                                      <div className="p-3 bg-stone-50 dark:bg-stone-700 rounded-xl">
                                          {renderIcon(integration.icon)}
                                      </div>
                                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${integration.status === IntegrationStatus.CONNECTED ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                                          {integration.status}
                                      </div>
                                  </div>
                                  
                                  <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">{integration.name}</h4>
                                  <p className="text-sm text-stone-500 mb-4 h-10">{integration.description}</p>
                                  
                                  <div className="space-y-2 mb-6">
                                      {integration.features.map(feat => (
                                          <div key={feat} className="flex items-center text-xs text-stone-600 dark:text-stone-400">
                                              <CheckCircle size={12} className="text-primary-500 mr-2"/> {feat}
                                          </div>
                                      ))}
                                  </div>

                                  <Button 
                                    className={`w-full ${integration.status === IntegrationStatus.CONNECTED ? 'bg-white border border-stone-200 text-red-500 hover:bg-red-50 hover:border-red-200' : ''}`}
                                    onClick={() => integration.status === IntegrationStatus.CONNECTED ? onDisconnect(integration.id) : onConnect(integration.id)}
                                  >
                                      {integration.status === IntegrationStatus.CONNECTED ? 'Desconectar' : 'Conectar'}
                                  </Button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'billing' && (
               <div className="flex-1 flex items-center justify-center text-stone-400 flex-col">
                   <div className="bg-stone-100 p-6 rounded-full mb-4">
                       <CreditCard size={48} className="opacity-50"/>
                   </div>
                   <h3 className="text-lg font-bold text-stone-600">Gestão de Assinatura</h3>
                   <p className="text-sm">Em breve você poderá gerenciar seu plano por aqui.</p>
               </div>
          )}
      </div>
    </div>
  );
};

export default Settings;