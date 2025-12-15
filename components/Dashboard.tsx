import React, { useState, useMemo } from 'react';
import { 
    TrendingUp, Users, CalendarCheck, AlertCircle, ArrowRight, Eye, EyeOff, 
    Zap, Plus, DollarSign, Activity, Star, Clock, MapPin, 
    MessageCircle, CheckCircle, Package, Award, Target, BarChart2,
    PieChart as PieIcon, Sun, Download, ChevronRight, Bell, FileText
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { Appointment, Transaction, AppointmentStatus, TreatmentType, Room } from '../types';
import { Button } from './Shared';

interface DashboardProps {
    appointments: Appointment[];
    transactions: Transaction[];
    onNavigate: (view: any) => void;
}

// --- MOCK DATA FOR CHARTS ---
const PROCEDURE_DATA = [
    { name: 'Toxina', value: 45, color: '#f43f5e' }, // Rose
    { name: 'Preench.', value: 30, color: '#8b5cf6' }, // Violet
    { name: 'Fios', value: 15, color: '#f59e0b' }, // Amber
    { name: 'Laser', value: 10, color: '#10b981' }, // Emerald
];

const FUNNEL_DATA = [
    { name: 'Leads', value: 120 },
    { name: 'Agendados', value: 45 },
    { name: 'Compareceram', value: 40 },
    { name: 'Vendas', value: 32 },
];

const Dashboard: React.FC<DashboardProps> = ({ appointments, transactions, onNavigate }) => {
  // State
  const [privacyMode, setPrivacyMode] = useState(false);
  const [timeRange, setTimeRange] = useState('Month');
  
  // --- CALCULATIONS & LOGIC ---
  const today = new Date();
  const nextAppt = appointments
    .filter(a => a.start > new Date() && a.status !== AppointmentStatus.CANCELED)
    .sort((a,b) => a.start.getTime() - b.start.getTime())[0];

  const revenueToday = transactions.reduce((acc, t) => acc + t.amount, 0); 
  const monthlyGoal = 80000;
  const currentRevenue = 45200; // Mock cumulative
  const goalProgress = (currentRevenue / monthlyGoal) * 100;
  
  // Health Score Algorithm (Mock)
  // Factors: Occupancy (40%), Revenue Pace (40%), NPS (20%)
  const occupancy = 65; 
  const healthScore = Math.round((occupancy * 0.4) + (goalProgress * 0.4) + (95 * 0.2)); // 95 is NPS normalized

  const formatCurrency = (val: number) => {
      return privacyMode ? '••••••' : `R$ ${val.toLocaleString('pt-BR')}`;
  };

  // --- SUB-COMPONENTS ---

  const KPICard = ({ title, value, subtext, icon: Icon, color, trend }: any) => (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
              <Icon size={64} />
          </div>
          <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-current`}>
                  <Icon size={20} />
              </div>
              {trend && (
                   <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      <TrendingUp size={10} className="mr-1"/> {Math.abs(trend)}%
                   </span>
              )}
          </div>
          <div>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-wide mb-1">{title}</p>
              <h3 className="text-2xl font-bold text-stone-900">{privacyMode && title.includes('Faturamento') ? '••••••' : value}</h3>
              <p className="text-xs text-stone-400 mt-1">{subtext}</p>
          </div>
          {/* Mini Sparkline Decoration */}
          <div className="h-1 w-full bg-stone-100 mt-3 rounded-full overflow-hidden">
               <div className={`h-full ${color.replace('text-', 'bg-').replace('bg-', '')} opacity-50`} style={{width: `${Math.random() * 100}%`}}></div>
          </div>
      </div>
  );

  const QuickAction = ({ icon: Icon, label, onClick, color }: any) => (
      <button onClick={onClick} className="flex flex-col items-center justify-center p-3 bg-white border border-stone-100 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm group w-24">
          <div className={`p-2 rounded-full mb-2 group-hover:scale-110 transition-transform ${color}`}>
              <Icon size={20} className="text-white"/>
          </div>
          <span className="text-[10px] font-bold text-stone-600 text-center leading-tight">{label}</span>
      </button>
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
              <h1 className="text-2xl font-bold text-stone-800 flex items-center">
                  {today.getHours() < 12 ? 'Bom dia' : today.getHours() < 18 ? 'Boa tarde' : 'Boa noite'}, Dr(a). Gestor 
                  <Sun size={20} className="ml-2 text-amber-500 animate-pulse-slow"/>
              </h1>
              <p className="text-sm text-stone-500 flex items-center mt-1">
                  <CalendarCheck size={14} className="mr-1.5"/>
                  {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  <span className="mx-2">•</span>
                  Clínica Operando Normalmente
              </p>
          </div>

          <div className="flex items-center gap-2">
              <button onClick={() => setPrivacyMode(!privacyMode)} className="p-2 text-stone-400 hover:text-stone-800 bg-white border border-stone-200 rounded-lg shadow-sm" title={privacyMode ? "Mostrar Valores" : "Ocultar Valores"}>
                  {privacyMode ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
              <div className="h-8 w-px bg-stone-200 mx-1"></div>
              <div className="bg-stone-100 p-1 rounded-lg flex text-xs font-bold">
                  {['Hoje', 'Semana', 'Mês'].map(r => (
                      <button 
                        key={r} 
                        onClick={() => setTimeRange(r)}
                        className={`px-3 py-1.5 rounded-md transition-all ${timeRange === r ? 'bg-white shadow text-primary-600' : 'text-stone-500 hover:text-stone-700'}`}
                      >
                          {r}
                      </button>
                  ))}
              </div>
              <Button variant="secondary" className="!p-2" title="Exportar Relatório" onClick={() => window.print()}>
                  <Download size={18}/>
              </Button>
          </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <QuickAction icon={Plus} label="Novo Agendamento" color="bg-primary-500" onClick={() => onNavigate('SCHEDULE')} />
          <QuickAction icon={Users} label="Cadastrar Paciente" color="bg-blue-500" onClick={() => onNavigate('PATIENTS')} />
          <QuickAction icon={DollarSign} label="Lançar Venda" color="bg-emerald-500" onClick={() => onNavigate('FINANCE')} />
          <QuickAction icon={MessageCircle} label="Disparo WhatsApp" color="bg-green-500" onClick={() => onNavigate('CRM')} />
          <QuickAction icon={Package} label="Entrada Estoque" color="bg-amber-500" onClick={() => {}} />
      </div>

      {/* 3. HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Next Patient Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                  <div>
                      <div className="inline-flex items-center px-2 py-1 rounded bg-white/10 text-[10px] font-bold uppercase tracking-wider mb-2 border border-white/10">
                          <Clock size={10} className="mr-1.5"/> Próximo Atendimento
                      </div>
                      {nextAppt ? (
                          <>
                              <h2 className="text-3xl font-bold mb-1">{nextAppt.patientName}</h2>
                              <p className="text-stone-300 flex items-center">
                                  {nextAppt.type} • Sala {nextAppt.room} • <span className="text-white font-bold ml-1">{nextAppt.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </p>
                          </>
                      ) : (
                          <h2 className="text-2xl font-bold text-stone-300">Sem agendamentos futuros hoje</h2>
                      )}
                  </div>
                  {nextAppt && (
                       <div className="h-12 w-12 rounded-full border-2 border-white/20 bg-white/10 overflow-hidden">
                           <img src={`https://picsum.photos/seed/${nextAppt.patientName}/200`} alt="Avatar" className="h-full w-full object-cover"/>
                       </div>
                  )}
              </div>

              {nextAppt && (
                  <div className="relative z-10 flex gap-3 mt-6">
                      <button className="flex-1 bg-white text-stone-900 py-3 rounded-xl font-bold text-sm hover:bg-stone-100 transition-colors flex items-center justify-center">
                          <CheckCircle size={16} className="mr-2 text-emerald-600"/> Realizar Check-in
                      </button>
                      <button className="px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
                          <MessageCircle size={18}/>
                      </button>
                      <button className="px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
                          <FileText size={18}/>
                      </button>
                  </div>
              )}
          </div>

          {/* Health Score & Alerts */}
          <div className="flex flex-col gap-4">
              {/* Health Score */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex-1 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-stone-800 text-sm">Saúde da Clínica</h3>
                      <Activity size={16} className="text-primary-500"/>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                      <span className="text-4xl font-bold text-stone-900">{healthScore}</span>
                      <span className="text-sm text-stone-400 mb-1">/ 100</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full ${healthScore > 80 ? 'bg-emerald-500' : healthScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{width: `${healthScore}%`}}
                      ></div>
                  </div>
                  <p className="text-[10px] text-stone-500">Baseado em Ocupação, Faturamento e NPS.</p>
              </div>

              {/* Smart Alerts */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex-1 overflow-y-auto max-h-[160px] custom-scrollbar">
                   <h3 className="font-bold text-stone-800 text-xs uppercase mb-3 flex items-center">
                       <Bell size={12} className="mr-1.5 text-amber-500"/> Alertas Inteligentes
                   </h3>
                   <div className="space-y-2">
                       <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                           <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0"/>
                           <div>
                               <p className="text-xs font-bold text-red-800">Estoque Baixo: Botox</p>
                               <p className="text-[10px] text-red-600">Restam apenas 2 frascos.</p>
                           </div>
                       </div>
                       <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                           <Users size={14} className="text-blue-500 mt-0.5 shrink-0"/>
                           <div>
                               <p className="text-xs font-bold text-blue-800">2 Aniversariantes</p>
                               <p className="text-[10px] text-blue-600">Enviar mensagem automática.</p>
                           </div>
                       </div>
                       <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                           <Clock size={14} className="text-amber-500 mt-0.5 shrink-0"/>
                           <div>
                               <p className="text-xs font-bold text-amber-800">3 Agend. Pendentes</p>
                               <p className="text-[10px] text-amber-600">Confirmar para amanhã.</p>
                           </div>
                       </div>
                   </div>
              </div>
          </div>
      </div>

      {/* 4. KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="Faturamento Real" 
            value={formatCurrency(currentRevenue)} 
            subtext="Meta: 56% atingida" 
            icon={DollarSign} 
            color="text-emerald-600 bg-emerald-100"
            trend={12}
          />
          <KPICard 
            title="Ticket Médio" 
            value={formatCurrency(1850)} 
            subtext="+ R$ 150 vs mês passado" 
            icon={Target} 
            color="text-violet-600 bg-violet-100"
            trend={5}
          />
          <KPICard 
            title="Taxa de Retenção" 
            value="68%" 
            subtext="Pacientes recorrentes" 
            icon={RefreshCwIcon} 
            color="text-blue-600 bg-blue-100"
            trend={-2}
          />
          <KPICard 
            title="NPS (Satisfação)" 
            value="95" 
            subtext="4.9 Estrelas (Google)" 
            icon={Star} 
            color="text-amber-600 bg-amber-100"
            trend={0}
          />
      </div>

      {/* 5. CHARTS & OPERATIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart + Goal */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                  <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-bold text-stone-800 text-lg">Mix de Procedimentos</h3>
                        <p className="text-xs text-stone-400">Receita por tipo de tratamento</p>
                      </div>
                      <div className="flex gap-4">
                          {PROCEDURE_DATA.map(d => (
                              <div key={d.name} className="flex items-center text-xs">
                                  <div className="w-2 h-2 rounded-full mr-1.5" style={{background: d.color}}></div>
                                  <span className="text-stone-600">{d.name}</span>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="h-64 flex">
                      <div className="w-1/3 flex flex-col justify-center items-center relative">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={PROCEDURE_DATA}
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                  >
                                      {PROCEDURE_DATA.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                      ))}
                                  </Pie>
                                  <RechartsTooltip />
                              </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-2xl font-bold text-stone-800">{PROCEDURE_DATA.length}</span>
                              <span className="text-[10px] text-stone-400 uppercase">Tipos</span>
                          </div>
                      </div>
                      <div className="w-2/3 h-full pl-4 border-l border-stone-100">
                           <h4 className="font-bold text-stone-800 text-sm mb-4">Top Performance (Staff)</h4>
                           <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">AS</div>
                                       <div>
                                           <p className="text-sm font-bold text-stone-800">Dra. Ana Silva</p>
                                           <p className="text-xs text-stone-400">24 Atendimentos</p>
                                       </div>
                                   </div>
                                   <span className="font-bold text-emerald-600 text-sm">{formatCurrency(28000)}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">CM</div>
                                       <div>
                                           <p className="text-sm font-bold text-stone-800">Dr. Carlos Mendez</p>
                                           <p className="text-xs text-stone-400">18 Atendimentos</p>
                                       </div>
                                   </div>
                                   <span className="font-bold text-emerald-600 text-sm">{formatCurrency(17200)}</span>
                               </div>
                           </div>
                           
                           <div className="mt-6 pt-4 border-t border-stone-100">
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-xs font-bold text-stone-500 uppercase">Meta Mensal</span>
                                   <span className="text-xs font-bold text-stone-800">{goalProgress.toFixed(0)}%</span>
                               </div>
                               <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-primary-500 rounded-full" style={{width: `${goalProgress}%`}}></div>
                               </div>
                           </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Operations & Tasks */}
          <div className="flex flex-col gap-6">
              {/* Marketing Funnel */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex-1">
                  <h3 className="font-bold text-stone-800 text-sm mb-4 flex items-center">
                      <BarChart2 size={16} className="mr-2 text-blue-500"/> Funil de Vendas (Mês)
                  </h3>
                  <div className="h-40 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={FUNNEL_DATA} layout="vertical" barSize={16}>
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fill: '#78716c'}} axisLine={false} tickLine={false}/>
                              <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/>
                              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} background={{ fill: '#f5f5f4' }} />
                          </BarChart>
                       </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-stone-500 border-t border-stone-100 pt-2">
                       <span>Conversão Geral: <strong>26%</strong></span>
                       <span>Custo/Lead: <strong>R$ 15</strong></span>
                  </div>
              </div>

              {/* Quick Tasks */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex-1">
                   <h3 className="font-bold text-stone-800 text-sm mb-3 flex items-center">
                      <CheckCircle size={16} className="mr-2 text-primary-500"/> Tarefas do Dia
                  </h3>
                  <div className="space-y-2">
                      <TaskItem label="Confirmar agenda de amanhã" done={true} />
                      <TaskItem label="Lançar notas fiscais pendentes" done={false} />
                      <TaskItem label="Responder directs do Instagram" done={false} />
                  </div>
              </div>
          </div>
      </div>

      {/* 6. DAILY TIMELINE VISUALIZATION */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide">Fluxo de Hoje (Timeline)</h3>
              <div className="flex gap-4 text-xs">
                  <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Livre</span>
                  <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div> Ocupado</span>
              </div>
          </div>
          <div className="relative pt-6 pb-2 overflow-x-auto">
               <div className="absolute top-1/2 left-0 right-0 h-px bg-stone-200 -z-10"></div>
               <div className="flex justify-between min-w-[600px]">
                   {Array.from({length: 10}, (_, i) => i + 9).map(hour => (
                       <div key={hour} className="flex flex-col items-center relative group cursor-pointer">
                           <div className={`w-3 h-3 rounded-full border-2 border-white mb-2 z-10 ${hour === 14 ? 'bg-red-400 scale-125 ring-2 ring-red-100' : 'bg-emerald-500'}`}></div>
                           <span className="text-xs font-mono text-stone-400">{hour}:00</span>
                           
                           {/* Tooltip Simulation */}
                           {hour === 14 && (
                               <div className="absolute bottom-full mb-2 bg-stone-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                   Ana Silva - Botox
                               </div>
                           )}
                       </div>
                   ))}
               </div>
          </div>
      </div>

      {/* 7. ROOM STATUS & TIPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
               <h3 className="font-bold text-stone-800 text-sm mb-4">Status das Salas</h3>
               <div className="flex gap-4">
                   <div className="flex-1 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center justify-between">
                       <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                           <span className="text-sm font-bold text-red-900">Sala 1</span>
                       </div>
                       <span className="text-[10px] text-red-600 font-medium">EM USO</span>
                   </div>
                   <div className="flex-1 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between">
                       <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                           <span className="text-sm font-bold text-emerald-900">Sala 2</span>
                       </div>
                       <span className="text-[10px] text-emerald-600 font-medium">LIVRE</span>
                   </div>
               </div>
           </div>
           
           <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-5 rounded-2xl shadow-lg shadow-primary-200 text-white flex items-center justify-between relative overflow-hidden">
               <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-1 opacity-90">
                       <Zap size={14} className="text-yellow-300 fill-yellow-300"/>
                       <span className="text-xs font-bold uppercase tracking-wide">Dica do Dia</span>
                   </div>
                   <p className="text-sm font-medium leading-relaxed max-w-xs">
                       Confirme os agendamentos via WhatsApp 24h antes para reduzir o No-Show em até 40%.
                   </p>
               </div>
               <div className="bg-white/20 p-2 rounded-lg cursor-pointer hover:bg-white/30 transition-colors z-10">
                   <ChevronRight size={20}/>
               </div>
               {/* Decor */}
               <div className="absolute -right-4 -bottom-8 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
           </div>
      </div>

    </div>
  );
};

const RefreshCwIcon = ({size, className}: {size: number, className: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
);

const TaskItem = ({ label, done }: { label: string, done: boolean }) => (
    <div className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer group">
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${done ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 bg-white group-hover:border-primary-400'}`}>
            {done && <CheckCircle size={12} className="text-white"/>}
        </div>
        <span className={`text-sm ${done ? 'text-stone-400 line-through' : 'text-stone-700'}`}>{label}</span>
    </div>
);

export default Dashboard;