import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, DollarSign, Settings as SettingsIcon, 
  Menu, Sparkles, LogOut, Kanban as KanbanIcon, Gift, Search, Command, X
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
    
    // Toggle Dark Class
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');

    // Apply Primary Brand Colors
    Object.keys(colors).forEach(shade => {
        root.style.setProperty(`--primary-${shade}`, colors[shade]);
    });
};

// --- DATA INITIALIZATION & PERSISTENCE ---
const loadData = (key: string, initial: any) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
};

// Initial Mock Data (used if localStorage is empty)
const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Ana Silva', phone: '(11) 98765-4321', avatarUrl: 'https://picsum.photos/seed/p1/200', status: 'Active', birthDate: '1990-05-12', tags: ['VIP'] },
  { id: 'p2', name: 'Carlos Mendez', phone: '(11) 91234-5678', avatarUrl: 'https://picsum.photos/seed/p2/200', status: 'Active', birthDate: '1985-08-20', tags: ['Botox'] }
];
const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: 'p1', patientName: 'Ana Silva', start: new Date(new Date().setHours(9, 0, 0, 0)), durationMinutes: 30, type: TreatmentType.BOTOX, status: AppointmentStatus.CONFIRMED, room: Room.ROOM_1, price: 1200 }
];

enum View { ONBOARDING='ONBOARDING', DASHBOARD='DASHBOARD', SCHEDULE='SCHEDULE', PATIENTS='PATIENTS', FACEMAP='FACEMAP', FINANCE='FINANCE', CRM='CRM', SETTINGS='SETTINGS', REFERRALS='REFERRALS' }

const App: React.FC = () => {
  // --- STATE ---
  const [currentView, setCurrentView] = useState<View>(View.ONBOARDING);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  // Data State with Persistence
  const [clinicConfig, setClinicConfig] = useState<OnboardingData | null>(() => loadData('af_config', null));
  const [patients, setPatients] = useState<Patient[]>(() => loadData('af_patients', MOCK_PATIENTS));
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
      const saved = loadData('af_appointments', MOCK_APPOINTMENTS);
      return saved.map((a: any) => ({ ...a, start: new Date(a.start) })); // Restore Date objects
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadData('af_transactions', []));
  const [leads, setLeads] = useState<Lead[]>(() => loadData('af_leads', []));
  const [integrations, setIntegrations] = useState<Integration[]>(() => loadData('af_integrations', [])); // Use mock from Settings/Init
  
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAppt, setCheckoutAppt] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  // --- EFFECTS: PERSISTENCE & THEME ---
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

  // --- SHORTCUTS ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              setShowCommandPalette(prev => !prev);
          }
          if (e.key === 'Escape') setShowCommandPalette(false);
          // Only if not typing in inputs
          if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
              if (e.key === 'n' || e.key === 'N') { e.preventDefault(); setCurrentView(View.SCHEDULE); setToast({message: 'Novo Agendamento (Atalho)', type: 'info'}); }
              if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setCurrentView(View.PATIENTS); }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- ACTIONS ---
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

  // --- COMMAND PALETTE COMPONENT ---
  const CommandPalette = () => {
      if (!showCommandPalette) return null;
      const commands = [
          { icon: Calendar, label: 'Ir para Agenda', action: () => setCurrentView(View.SCHEDULE) },
          { icon: Users, label: 'Gerenciar Pacientes', action: () => setCurrentView(View.PATIENTS) },
          { icon: DollarSign, label: 'Financeiro', action: () => setCurrentView(View.FINANCE) },
          { icon: KanbanIcon, label: 'CRM / Leads', action: () => setCurrentView(View.CRM) },
          { icon: LogOut, label: 'Sair / Bloquear', action: () => alert('Tela bloqueada') },
      ];
      return (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-32">
              <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800 animate-in zoom-in-95">
                  <div className="flex items-center p-4 border-b border-stone-100 dark:border-stone-800">
                      <Search className="text-stone-400 mr-3" />
                      <input 
                        className="flex-1 bg-transparent outline-none text-lg text-stone-800 dark:text-stone-200 placeholder-stone-400" 
                        placeholder="O que você procura?" 
                        autoFocus
                      />
                      <div className="flex items-center gap-1">
                          <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-1 rounded">ESC</span>
                      </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                      <div className="text-xs font-bold text-stone-400 px-2 py-1 uppercase">Ações Rápidas</div>
                      {commands.map((cmd, i) => (
                          <button key={i} onClick={() => { cmd.action(); setShowCommandPalette(false); }} className="w-full flex items-center p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors text-left text-stone-700 dark:text-stone-300">
                              <cmd.icon size={18} className="mr-3 text-primary-500"/>
                              {cmd.label}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        currentView === view
          ? 'bg-primary-50 text-primary-700 font-medium shadow-sm border border-primary-100 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'
          : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200'
      }`}
    >
      <Icon size={20} />
      {isSidebarOpen && <span>{label}</span>}
    </button>
  );

  const patientsWithHistory = useMemo(() => {
    return patients.map(p => {
        const patientTrans = transactions.filter(t => t.patientId === p.id && t.type === 'Income');
        const totalSpent = patientTrans.reduce((sum, t) => sum + t.amount, 0);
        return { ...p, totalSpent };
    });
  }, [patients, transactions]);

  // Handlers for specific modules logic
  const handleAddAppointment = (appt: Appointment) => {
      // Basic conflict check
      setAppointments([...appointments, appt]);
      setToast({ message: 'Agendamento realizado!', type: 'success' });
  };

  const handleUpdateApptStatus = (id: string, status: AppointmentStatus) => {
      if (status === AppointmentStatus.COMPLETED) {
          const appt = appointments.find(a => a.id === id);
          if (appt) { setCheckoutAppt(appt); setIsCheckoutOpen(true); }
      } else {
          setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      }
  };

  if (currentView === View.ONBOARDING && !clinicConfig) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className={`flex h-screen bg-stone-50 dark:bg-stone-950 overflow-hidden text-stone-800 dark:text-stone-200 font-sans ${isDark ? 'dark' : ''}`}>
      <CommandPalette />
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-surface border-r border-stone-200 dark:border-stone-800 flex flex-col transition-all duration-300 z-20`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center space-x-2 cursor-pointer overflow-hidden" onClick={() => setCurrentView(View.DASHBOARD)}>
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-md">
              <Sparkles size={18} />
            </div>
            {isSidebarOpen && <span className="font-bold text-lg tracking-tight whitespace-nowrap">Aesthetik<span className="text-primary-500 font-light">Flow</span></span>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"><Menu size={16} /></button>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Cockpit" />
          <NavItem view={View.SCHEDULE} icon={Calendar} label="Agenda" />
          <NavItem view={View.CRM} icon={KanbanIcon} label="Funil CRM" />
          <NavItem view={View.PATIENTS} icon={Users} label="Pacientes" />
          <NavItem view={View.FINANCE} icon={DollarSign} label="Financeiro" />
          <div className="my-2 border-t border-stone-100 dark:border-stone-800"></div>
          <NavItem view={View.REFERRALS} icon={Gift} label="Indique e Ganhe" />
        </nav>
        <div className="p-3 border-t border-stone-200 dark:border-stone-800">
          <NavItem view={View.SETTINGS} icon={SettingsIcon} label="Configurações" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{currentView === View.DASHBOARD ? `Olá, ${clinicConfig?.ownerName || 'Gestor'}` : currentView}</h1>
              <div 
                className="hidden md:flex items-center bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-200 transition-colors group"
                onClick={() => setShowCommandPalette(true)}
              >
                  <Search size={14} className="text-stone-400 mr-2"/>
                  <span className="text-xs text-stone-500 mr-4">Buscar (Ctrl+K)</span>
                  <Command size={10} className="text-stone-400"/>
              </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{clinicConfig?.clinicName || 'My Clinic'}</p>
              <p className="text-xs text-stone-500">Pro Plan</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden cursor-pointer hover:ring-2 ring-primary-200"><img src="https://picsum.photos/100/100" className="h-full w-full object-cover" /></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-stone-50/50 dark:bg-stone-950">
          <div className="max-w-7xl mx-auto h-full">
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