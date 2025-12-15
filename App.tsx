import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, DollarSign, Settings as SettingsIcon, 
  Menu, Sparkles, LogOut, Kanban as KanbanIcon, Gift, Search, Command, X,
  ChevronRight, Bell, HelpCircle
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import FaceMap from './components/FaceMap';
import Finance from './components/Finance';
import Patients from './components/Patients';
import CRM from './components/CRM';
import Settings from './components/Settings';
import Onboarding, { OnboardingData } from './components/Onboarding';
import CheckoutModal from './components/CheckoutModal';
import Referrals from './components/Referrals';
import { Toast, Modal } from './components/Shared';
import { 
    Appointment, Patient, Transaction, AppointmentStatus, TreatmentType, 
    Room, Lead, KanbanStage, Integration, IntegrationStatus, IntegrationProvider, 
    IntegrationLog, ConsumptionItem, Referral, ReferralStatus
} from './types';

// --- THEME ENGINE ---
const THEME_COLORS: Record<string, any> = {
    rose: { 50: '255 241 242', 500: '244 63 94', 600: '225 29 72', 900: '136 19 55' },
    gold: { 50: '255 251 235', 500: '245 158 11', 600: '217 119 6', 900: '120 53 15' },
    emerald: { 50: '236 253 245', 500: '16 185 129', 600: '5 150 105', 900: '6 78 59' },
    blue: { 50: '239 246 255', 500: '59 130 246', 600: '37 99 235', 900: '30 58 138' },
    violet: { 50: '245 243 255', 500: '139 92 246', 600: '124 58 237', 900: '76 29 149' }
};

const applyTheme = (themeName: string, isDark: boolean) => {
    const root = document.documentElement;
    const colors = THEME_COLORS[themeName] || THEME_COLORS['rose'];
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
    Object.keys(colors).forEach(shade => {
        root.style.setProperty(`--primary-${shade}`, colors[shade]);
    });
};

const loadData = (key: string, initial: any) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
};

// Initial Mock Data (unchanged)
const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Ana Silva', phone: '(11) 98765-4321', avatarUrl: 'https://picsum.photos/seed/p1/200', status: 'Active', birthDate: '1990-05-12', tags: ['VIP'] },
  { id: 'p2', name: 'Carlos Mendez', phone: '(11) 91234-5678', avatarUrl: 'https://picsum.photos/seed/p2/200', status: 'Active', birthDate: '1985-08-20', tags: ['Botox'] }
];
const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: 'p1', patientName: 'Ana Silva', start: new Date(new Date().setHours(9, 0, 0, 0)), durationMinutes: 30, type: TreatmentType.BOTOX, status: AppointmentStatus.CONFIRMED, room: Room.ROOM_1, price: 1200 }
];

enum View { ONBOARDING='ONBOARDING', DASHBOARD='DASHBOARD', SCHEDULE='SCHEDULE', PATIENTS='PATIENTS', FACEMAP='FACEMAP', FINANCE='FINANCE', CRM='CRM', SETTINGS='SETTINGS', REFERRALS='REFERRALS' }

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.ONBOARDING);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  const [clinicConfig, setClinicConfig] = useState<OnboardingData | null>(() => loadData('af_config', null));
  const [patients, setPatients] = useState<Patient[]>(() => loadData('af_patients', MOCK_PATIENTS));
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
      const saved = loadData('af_appointments', MOCK_APPOINTMENTS);
      return saved.map((a: any) => ({ ...a, start: new Date(a.start) })); 
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadData('af_transactions', []));
  const [leads, setLeads] = useState<Lead[]>(() => loadData('af_leads', []));
  const [integrations, setIntegrations] = useState<Integration[]>(() => loadData('af_integrations', []));
  
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAppt, setCheckoutAppt] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  useEffect(() => {
      if (clinicConfig) {
          applyTheme(clinicConfig.theme, isDark);
          localStorage.setItem('af_config', JSON.stringify(clinicConfig));
          if (currentView === View.ONBOARDING) setCurrentView(View.DASHBOARD);
      }
  }, [clinicConfig, isDark]);

  useEffect(() => localStorage.setItem('af_patients', JSON.stringify(patients)), [patients]);
  useEffect(() => localStorage.setItem('af_appointments', JSON.stringify(appointments)), [appointments]);
  useEffect(() => localStorage.setItem('af_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('af_leads', JSON.stringify(leads)), [leads]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowCommandPalette(prev => !prev); }
          if (e.key === 'Escape') setShowCommandPalette(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOnboardingComplete = (data: OnboardingData) => {
    setClinicConfig(data);
    setCurrentView(View.DASHBOARD);
    setToast({ message: `Bem-vindo à ${data.clinicName}!`, type: 'success' });
  };

  const handleBackup = () => {
      const backup = { config: clinicConfig, patients, appointments, transactions, leads };
      const blob = new Blob([JSON.stringify(backup)], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      setToast({message: 'Backup gerado com sucesso!', type: 'success'});
  };

  const handleResetData = () => {
      if(confirm('ATENÇÃO: Isso apagará TODOS os dados locais. Continuar?')) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const CommandPalette = () => {
      if (!showCommandPalette) return null;
      return (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-32 animate-enter">
              <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
                  <div className="flex items-center p-4 border-b border-stone-100 dark:border-stone-800">
                      <Search className="text-stone-400 mr-3" />
                      <input className="flex-1 bg-transparent outline-none text-lg text-stone-800 dark:text-stone-200 placeholder-stone-400" placeholder="O que você procura?" autoFocus />
                      <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-1 rounded">ESC</span>
                  </div>
                  <div className="p-2">
                       <p className="text-xs font-bold text-stone-400 px-2 py-2 uppercase tracking-wider">Ações</p>
                       {[
                           {icon: LayoutDashboard, l: 'Dashboard', v: View.DASHBOARD},
                           {icon: Calendar, l: 'Agenda', v: View.SCHEDULE},
                           {icon: Users, l: 'Pacientes', v: View.PATIENTS},
                           {icon: DollarSign, l: 'Financeiro', v: View.FINANCE}
                       ].map(i => (
                           <button key={i.l} onClick={() => {setCurrentView(i.v); setShowCommandPalette(false)}} className="w-full flex items-center p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors text-stone-700 dark:text-stone-300">
                               <i.icon size={18} className="mr-3 text-primary-500"/> {i.l}
                           </button>
                       ))}
                  </div>
              </div>
          </div>
      );
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => {
      const active = currentView === view;
      return (
        <button
          onClick={() => setCurrentView(view)}
          className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
            active
              ? 'bg-primary-50/50 text-primary-700 font-semibold dark:bg-primary-900/10 dark:text-primary-300'
              : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/50 dark:hover:text-stone-200'
          }`}
        >
          {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(var(--primary-500),0.5)]"></div>}
          <Icon size={20} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
          {isSidebarOpen && <span className="tracking-tight">{label}</span>}
          {active && isSidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>}
        </button>
      );
  };

  const patientsWithHistory = useMemo(() => {
    return patients.map(p => {
        const patientTrans = transactions.filter(t => t.patientId === p.id && t.type === 'Income');
        const totalSpent = patientTrans.reduce((sum, t) => sum + t.amount, 0);
        return { ...p, totalSpent };
    });
  }, [patients, transactions]);

  // View Handlers (Simplified for brevity)
  const handleAddAppointment = (appt: Appointment) => { setAppointments([...appointments, appt]); setToast({ message: 'Agendamento realizado!', type: 'success' }); };
  const handleUpdateApptStatus = (id: string, status: AppointmentStatus) => {
      if (status === AppointmentStatus.COMPLETED) { const appt = appointments.find(a => a.id === id); if (appt) { setCheckoutAppt(appt); setIsCheckoutOpen(true); } }
      else { setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a)); }
  };

  if (currentView === View.ONBOARDING && !clinicConfig) return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div className={`flex h-screen bg-stone-100 dark:bg-black font-sans selection:bg-primary-100 selection:text-primary-900 ${isDark ? 'dark' : ''}`}>
      <CommandPalette />
      
      {/* Sidebar with Glassmorphism */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} transition-all duration-500 z-30 h-screen py-4 pl-4 hidden md:flex flex-col`}>
          <div className="h-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-white/20 dark:border-stone-800 rounded-3xl flex flex-col shadow-2xl dark:shadow-none relative overflow-hidden">
             
             {/* Logo Area */}
             <div className="h-20 flex items-center px-6 border-b border-stone-100 dark:border-stone-800/50">
                <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentView(View.DASHBOARD)}>
                    <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
                        <Sparkles size={20} />
                    </div>
                    {isSidebarOpen && (
                        <div>
                             <h1 className="font-bold text-lg leading-none tracking-tight text-stone-800 dark:text-stone-100">Aesthetik</h1>
                             <span className="text-xs text-stone-400 font-medium tracking-widest uppercase">Flow</span>
                        </div>
                    )}
                </div>
             </div>

             {/* Navigation */}
             <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                <p className="px-4 mb-2 text-xs font-bold text-stone-400 uppercase tracking-wider">{isSidebarOpen ? 'Principal' : '•'}</p>
                <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Cockpit" />
                <NavItem view={View.SCHEDULE} icon={Calendar} label="Agenda" />
                <NavItem view={View.CRM} icon={KanbanIcon} label="Funil CRM" />
                <NavItem view={View.PATIENTS} icon={Users} label="Pacientes" />
                <NavItem view={View.FINANCE} icon={DollarSign} label="Financeiro" />
                
                <p className="px-4 mt-8 mb-2 text-xs font-bold text-stone-400 uppercase tracking-wider">{isSidebarOpen ? 'Crescimento' : '•'}</p>
                <NavItem view={View.REFERRALS} icon={Gift} label="Indique e Ganhe" />
             </nav>

             {/* Bottom Profile */}
             <div className="p-4 border-t border-stone-100 dark:border-stone-800/50">
                 <button onClick={() => setCurrentView(View.SETTINGS)} className={`flex items-center w-full p-2 rounded-xl transition-colors hover:bg-stone-50 dark:hover:bg-stone-800 ${!isSidebarOpen && 'justify-center'}`}>
                     <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden border-2 border-white dark:border-stone-600 shadow-sm shrink-0">
                         <img src="https://picsum.photos/100/100" className="w-full h-full object-cover"/>
                     </div>
                     {isSidebarOpen && (
                         <div className="ml-3 text-left overflow-hidden">
                             <p className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">{clinicConfig?.ownerName || 'Dr. Gestor'}</p>
                             <p className="text-[10px] text-stone-500 dark:text-stone-400">Configurações</p>
                         </div>
                     )}
                 </button>
             </div>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Floating Header */}
        <header className="h-20 flex items-center justify-between px-8 z-20">
            <div className="flex items-center gap-4 text-stone-400">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 bg-white dark:bg-stone-800 rounded-lg shadow-sm">
                    <Menu size={20}/>
                </button>
                <div className="flex items-center text-sm font-medium">
                    <span className="text-stone-500 dark:text-stone-400 hover:text-stone-800 transition-colors cursor-pointer">Home</span>
                    <ChevronRight size={14} className="mx-2"/>
                    <span className="text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 px-3 py-1 rounded-full shadow-sm border border-stone-100 dark:border-stone-700">
                        {currentView.charAt(0) + currentView.slice(1).toLowerCase()}
                    </span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div 
                    onClick={() => setShowCommandPalette(true)}
                    className="hidden md:flex items-center bg-white dark:bg-stone-800 px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700 shadow-sm cursor-pointer hover:shadow-md transition-all group w-64"
                >
                    <Search size={16} className="text-stone-400 mr-2 group-hover:text-primary-500 transition-colors"/>
                    <span className="text-sm text-stone-400 flex-1">Buscar...</span>
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-500 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-600 font-mono">⌘K</span>
                    </div>
                </div>
                
                <button className="relative p-2.5 bg-white dark:bg-stone-800 rounded-full shadow-sm border border-stone-100 dark:border-stone-700 hover:bg-stone-50 transition-colors text-stone-600 dark:text-stone-300">
                    <Bell size={18}/>
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-stone-800 rounded-full"></span>
                </button>
            </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto h-full animate-slide-up">
                 {currentView === View.DASHBOARD && <Dashboard appointments={appointments} transactions={transactions} onNavigate={setCurrentView} />}
                 {currentView === View.SCHEDULE && <Schedule appointments={appointments} patients={patientsWithHistory} onAddAppointment={handleAddAppointment} onUpdateStatus={handleUpdateApptStatus} />}
                 {currentView === View.PATIENTS && <Patients patients={patientsWithHistory} appointments={appointments} onAddPatient={(p) => setPatients([...patients, p])} onUpdatePatient={(p) => setPatients(patients.map(x => x.id === p.id ? p : x))} onOpenFaceMap={(id) => { setActivePatientId(id); setCurrentView(View.FACEMAP); }} />}
                 {currentView === View.FINANCE && <Finance transactions={transactions} onAddTransaction={(t) => setTransactions([...transactions, t])} />}
                 {currentView === View.FACEMAP && <FaceMap patientId={activePatientId} patients={patients} onBack={() => setCurrentView(View.PATIENTS)} onSaveSession={() => setToast({message: 'Sessão Salva!', type: 'success'})} />}
                 {currentView === View.SETTINGS && <Settings integrations={integrations} logs={[]} config={clinicConfig} onUpdateConfig={setClinicConfig} onConnect={() => {}} onDisconnect={() => {}} isDark={isDark} onToggleDark={() => setIsDark(!isDark)} onBackup={handleBackup} onReset={handleResetData} />}
                 {currentView === View.CRM && <CRM leads={leads} onAddLead={(l) => setLeads([...leads, l])} onUpdateStage={(id, s) => setLeads(leads.map(l => l.id === id ? { ...l, stage: s } : l))} onEditLead={(l) => setLeads(leads.map(x => x.id === l.id ? l : x))} onDeleteLead={(id) => setLeads(leads.filter(l => l.id !== id))} />}
                 {currentView === View.REFERRALS && <Referrals referrals={[]} referralCode="AF-DEMO" onInvite={() => {}} />}
            </div>
        </div>

        <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} appointment={checkoutAppt} onConfirm={(t) => { setTransactions([...transactions, t]); setIsCheckoutOpen(false); setToast({message: 'Pagamento Confirmado!', type: 'success'}); }} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </main>
    </div>
  );
};

export default App;