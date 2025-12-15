import React, { useState } from 'react';
import { 
    TrendingUp, Users, CalendarCheck, AlertCircle, ArrowRight, Eye, EyeOff, 
    Zap, Plus, DollarSign, Activity, Star, Clock, MapPin, 
    MessageCircle, CheckCircle, Package, Target, BarChart2,
    Sun, Download, Bell, FileText
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid 
} from 'recharts';
import { Appointment, Transaction, AppointmentStatus } from '../types';
import { Button, Card, EmptyState } from './Shared';

interface DashboardProps {
    appointments: Appointment[];
    transactions: Transaction[];
    onNavigate: (view: any) => void;
}

const PROCEDURE_DATA = [
    { name: 'Toxina', value: 45, color: '#f43f5e' }, 
    { name: 'Preench.', value: 30, color: '#8b5cf6' },
    { name: 'Fios', value: 15, color: '#f59e0b' },
    { name: 'Laser', value: 10, color: '#10b981' },
];

const FUNNEL_DATA = [
    { name: 'Leads', value: 120 },
    { name: 'Agendados', value: 45 },
    { name: 'Compareceram', value: 40 },
    { name: 'Vendas', value: 32 },
];

const Dashboard: React.FC<DashboardProps> = ({ appointments, transactions, onNavigate }) => {
  const [privacyMode, setPrivacyMode] = useState(false);
  
  const today = new Date();
  const nextAppt = appointments
    .filter(a => a.start > new Date() && a.status !== AppointmentStatus.CANCELED)
    .sort((a,b) => a.start.getTime() - b.start.getTime())[0];

  const currentRevenue = 45200; 
  const monthlyGoal = 80000;
  const goalProgress = (currentRevenue / monthlyGoal) * 100;
  const healthScore = 85;

  const formatCurrency = (val: number) => privacyMode ? '••••••' : `R$ ${val.toLocaleString('pt-BR')}`;

  const KPICard = ({ title, value, subtext, icon: Icon, color, trend }: any) => (
      <Card className="relative overflow-hidden">
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${color.replace('text-', 'bg-')}`}></div>
          <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 text-current`}>
                  <Icon size={22} />
              </div>
              {trend && (
                   <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center ${trend > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
                      <TrendingUp size={12} className="mr-1"/> {Math.abs(trend)}%
                   </span>
              )}
          </div>
          <div>
              <p className="text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-wide mb-1">{title}</p>
              <h3 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">{privacyMode && title.includes('Faturamento') ? '••••••' : value}</h3>
              <p className="text-xs text-stone-400 mt-2">{subtext}</p>
          </div>
      </Card>
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
              <h1 className="text-3xl font-bold text-stone-900 dark:text-white flex items-center tracking-tight">
                  Bom dia, Dr(a). Gestor 
                  <span className="ml-3 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs rounded-full font-bold flex items-center border border-amber-200 dark:border-amber-800">
                      <Sun size={12} className="mr-1.5"/> Ensolarado 24°C
                  </span>
              </h1>
              <p className="text-stone-500 dark:text-stone-400 mt-2">
                 Resumo operacional de {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}.
              </p>
          </div>

          <div className="flex items-center gap-3">
              <button onClick={() => setPrivacyMode(!privacyMode)} className="p-2.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-sm transition-all hover:shadow-md">
                  {privacyMode ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
              <Button variant="secondary" onClick={() => window.print()} className="!px-3">
                  <Download size={20}/>
              </Button>
              <Button onClick={() => onNavigate('SCHEDULE')}>
                  <Plus size={20} className="mr-2"/> Novo Agendamento
              </Button>
          </div>
      </div>

      {/* HERO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Patient */}
          <div className="lg:col-span-2 relative group cursor-pointer overflow-hidden rounded-3xl bg-stone-900 dark:bg-black text-white shadow-2xl transition-all hover:shadow-glow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
              
              <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[260px]">
                  <div className="flex justify-between items-start">
                      <div>
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10 backdrop-blur-md">
                              <Clock size={12} className="mr-2"/> Próximo: 14:00
                          </div>
                          {nextAppt ? (
                              <>
                                  <h2 className="text-4xl font-bold mb-2 tracking-tight">{nextAppt.patientName}</h2>
                                  <p className="text-stone-300 text-lg flex items-center">
                                      {nextAppt.type} <span className="mx-2 opacity-50">•</span> {nextAppt.room}
                                  </p>
                              </>
                          ) : (
                              <h2 className="text-3xl font-bold text-stone-300">Agenda livre por hoje</h2>
                          )}
                      </div>
                      {nextAppt && (
                           <div className="h-16 w-16 rounded-2xl border-2 border-white/20 bg-white/10 overflow-hidden shadow-lg">
                               <img src={`https://picsum.photos/seed/${nextAppt.patientName}/200`} className="h-full w-full object-cover"/>
                           </div>
                      )}
                  </div>

                  {nextAppt && (
                      <div className="flex gap-4 mt-8">
                          <button className="flex-1 bg-white text-stone-900 py-3.5 rounded-xl font-bold text-sm hover:bg-stone-100 hover:scale-[1.02] transition-all flex items-center justify-center shadow-lg">
                              <CheckCircle size={18} className="mr-2 text-emerald-600"/> Realizar Check-in
                          </button>
                          <button className="px-5 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all backdrop-blur-md">
                              <MessageCircle size={20}/>
                          </button>
                      </div>
                  )}
              </div>
          </div>

          {/* Health Score & Alerts */}
          <div className="flex flex-col gap-6">
              <Card className="flex-1 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-white to-stone-50 dark:from-stone-800 dark:to-stone-900">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-stone-800 dark:text-stone-200">Saúde da Clínica</h3>
                      <Activity size={18} className="text-primary-500"/>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-5xl font-bold text-stone-900 dark:text-white tracking-tighter">{healthScore}</span>
                      <span className="text-sm text-stone-400 font-medium">/ 100</span>
                  </div>
                  <div className="w-full bg-stone-200 dark:bg-stone-700 h-3 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" style={{width: `${healthScore}%`}}></div>
                  </div>
              </Card>

              <Card className="flex-1 overflow-hidden" noPadding>
                   <div className="p-4 bg-stone-50/50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-700">
                        <h3 className="font-bold text-stone-800 dark:text-stone-200 text-xs uppercase flex items-center">
                            <Bell size={12} className="mr-2 text-amber-500"/> Alertas
                        </h3>
                   </div>
                   <div className="p-4 space-y-3">
                       <div className="flex items-start gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                           <div>
                               <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Estoque Baixo: Botox</p>
                               <p className="text-[10px] text-stone-500">2 frascos restantes.</p>
                           </div>
                       </div>
                       <div className="flex items-start gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                           <div>
                               <p className="text-xs font-bold text-stone-800 dark:text-stone-200">3 Aniversariantes</p>
                               <p className="text-[10px] text-stone-500">Enviar mensagem.</p>
                           </div>
                       </div>
                   </div>
              </Card>
          </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Faturamento" value={formatCurrency(currentRevenue)} subtext="Meta: 56% atingida" icon={DollarSign} color="text-emerald-600 bg-emerald-100" trend={12} />
          <KPICard title="Ticket Médio" value={formatCurrency(1850)} subtext="+ R$ 150 vs mês passado" icon={Target} color="text-violet-600 bg-violet-100" trend={5} />
          <KPICard title="Taxa de Retenção" value="68%" subtext="Pacientes recorrentes" icon={Users} color="text-blue-600 bg-blue-100" trend={-2} />
          <KPICard title="NPS (Satisfação)" value="95" subtext="4.9 Estrelas (Google)" icon={Star} color="text-amber-600 bg-amber-100" trend={0} />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
              <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-white text-lg">Performance Financeira</h3>
                    <p className="text-xs text-stone-500">Receita por categoria de tratamento</p>
                  </div>
                  <div className="flex gap-2">
                      {PROCEDURE_DATA.map(d => (
                          <div key={d.name} className="flex items-center text-xs px-2 py-1 bg-stone-50 dark:bg-stone-800 rounded border border-stone-100 dark:border-stone-700">
                              <div className="w-2 h-2 rounded-full mr-1.5" style={{background: d.color}}></div>
                              <span className="text-stone-600 dark:text-stone-400">{d.name}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{name: '1', v: 4000}, {name: '2', v: 3000}, {name: '3', v: 5000}, {name: '4', v: 4500}, {name: '5', v: 6000}, {name: '6', v: 5500}, {name: '7', v: 7000}]}>
                          <defs>
                              <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="rgb(var(--primary-500))" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="rgb(var(--primary-500))" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#a8a29e'}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#a8a29e'}} tickFormatter={(v) => `R$${v/1000}k`} />
                          <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} cursor={{stroke: 'rgb(var(--primary-200))', strokeWidth: 1, strokeDasharray: '4 4'}} />
                          <Area type="monotone" dataKey="v" stroke="rgb(var(--primary-500))" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </Card>

          <Card>
              <h3 className="font-bold text-stone-900 dark:text-white mb-6">Funil de Vendas</h3>
              <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={FUNNEL_DATA} layout="vertical" barSize={24} margin={{left: 0}}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#78716c', fontWeight: 500}} axisLine={false} tickLine={false}/>
                          <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border:'none'}}/>
                          <Bar dataKey="value" fill="rgb(var(--primary-500))" radius={[0, 6, 6, 0]} background={{ fill: '#f5f5f4' }} />
                      </BarChart>
                   </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between text-xs font-medium text-stone-500">
                   <span>Taxa de Conversão</span>
                   <span className="text-stone-900 dark:text-white">26%</span>
              </div>
          </Card>
      </div>
    </div>
  );
};

export default Dashboard;