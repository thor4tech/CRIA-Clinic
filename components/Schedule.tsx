import React, { useState, useEffect, useMemo } from 'react';
import { 
    ChevronLeft, ChevronRight, Clock, MapPin, XCircle, Check, 
    Calendar as CalIcon, Filter, Info, Plus, User, FileText, 
    DollarSign, MessageCircle, Lock, Tag, Stethoscope, Repeat,
    ChevronDown, LayoutGrid, List, SlidersHorizontal, Search,
    MoreVertical, ArrowRight, Zap
} from 'lucide-react';
import { Appointment, AppointmentStatus, TreatmentType, Patient, Room } from '../types';
import { Modal, Button, Select, Input, Card } from './Shared';

interface ScheduleProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (appt: Appointment) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}

const START_HOUR = 8;
const END_HOUR = 19;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

// --- HELPER COMPONENTS ---
const LegendBadge = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color} shadow-sm`}></div>
        <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">{label}</span>
    </div>
);

const Schedule: React.FC<ScheduleProps> = ({ appointments, patients, onAddAppointment, onUpdateStatus }) => {
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [filterRoom, setFilterRoom] = useState<Room | 'All'>('All');
  const [filterProfessional, setFilterProfessional] = useState<string>('All');
  
  // Modal State (Enhanced)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
      patientName: string;
      phone: string;
      treatment: TreatmentType;
      date: string;
      startTime: string;
      duration: string;
      room: Room;
      price: number;
      notes: string;
      isRecurring: boolean;
      sendWhatsApp: boolean;
      isBlock: boolean;
      professional: string;
      tags: string[];
      status: AppointmentStatus;
  }>({
      patientName: '', phone: '', treatment: TreatmentType.BOTOX, 
      date: new Date().toISOString().split('T')[0], startTime: '09:00', 
      duration: '30', room: Room.ROOM_1, price: 0, notes: '', 
      isRecurring: false, sendWhatsApp: true, isBlock: false, 
      professional: 'Dr. Gestor', tags: [], status: AppointmentStatus.SCHEDULED
  });

  // --- DERIVED DATA ---
  const dayAppointments = useMemo(() => {
      return appointments.filter(a => 
          new Date(a.start).getDate() === currentDate.getDate() &&
          new Date(a.start).getMonth() === currentDate.getMonth() &&
          new Date(a.start).getFullYear() === currentDate.getFullYear() &&
          (filterRoom === 'All' || a.room === filterRoom)
      );
  }, [appointments, currentDate, filterRoom]);

  const stats = useMemo(() => {
      const total = dayAppointments.length;
      const confirmed = dayAppointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length;
      const billing = dayAppointments.reduce((sum, a) => sum + (a.price || 0), 0);
      return { total, confirmed, billing };
  }, [dayAppointments]);

  // --- HANDLERS ---
  const changeDate = (days: number) => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + days);
      setCurrentDate(newDate);
  };
  
  const changeMonth = (months: number) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + months);
      setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleSlotClick = (hour: number, room: Room) => {
      setFormData({
          ...formData,
          date: currentDate.toISOString().split('T')[0],
          startTime: `${hour < 10 ? '0' + hour : hour}:00`,
          room,
          price: 0,
          notes: '',
          isBlock: false,
          patientName: '',
          treatment: TreatmentType.BOTOX,
          professional: 'Dr. Gestor'
      });
      setIsModalOpen(true);
  };

  // 10 Novelties: Enhanced Pricing Logic
  const handleTreatmentChange = (t: TreatmentType) => {
      let suggestedPrice = 0;
      let duration = '30';
      switch(t) {
          case TreatmentType.BOTOX: suggestedPrice = 1200; duration = '30'; break;
          case TreatmentType.FILLER: suggestedPrice = 1500; duration = '45'; break;
          case TreatmentType.THREADS: suggestedPrice = 2500; duration = '60'; break;
          case TreatmentType.LASER: suggestedPrice = 800; duration = '30'; break;
          case TreatmentType.BIOSTIMULATOR: suggestedPrice = 1800; duration = '45'; break;
          case TreatmentType.EVALUATION: suggestedPrice = 200; duration = '30'; break;
          default: suggestedPrice = 0; duration = '30'; break;
      }
      setFormData(prev => ({ ...prev, treatment: t, price: suggestedPrice, duration }));
  };

  const handleSave = () => {
      const [h, m] = formData.startTime.split(':').map(Number);
      const [y, mon, d] = formData.date.split('-').map(Number);
      const start = new Date(y, mon - 1, d, h, m);
      
      const newAppt: Appointment = {
          id: Math.random().toString(36),
          patientId: formData.isBlock ? 'BLOCK' : 'new-id',
          patientName: formData.isBlock ? 'BLOQUEIO ADMINISTRATIVO' : formData.patientName,
          start,
          durationMinutes: parseInt(formData.duration),
          type: formData.treatment,
          status: formData.status,
          room: formData.room,
          price: formData.isBlock ? 0 : formData.price,
          notes: formData.notes
      };

      onAddAppointment(newAppt);
      if (formData.sendWhatsApp && !formData.isBlock) {
          alert(`Simulação: WhatsApp de confirmação enviado para ${formData.patientName}`);
      }
      if (formData.isRecurring) {
          alert("Simulação: Agendamento de retorno criado para daqui a 15 dias.");
      }
      setIsModalOpen(false);
  };

  return (
    <div className="h-full flex gap-4 md:gap-6">
      {/* 1. LEFT SIDEBAR: CONTROLS & STATS */}
      <div className="hidden md:flex w-72 flex-col gap-6">
          {/* Mini Calendar */}
          <Card className="p-4" noPadding>
             <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                 <h3 className="font-bold text-stone-800 dark:text-stone-200">Calendário</h3>
                 <button onClick={goToToday} className="text-xs text-primary-600 hover:underline">Hoje</button>
             </div>
             <div className="p-4">
                 <div className="flex justify-between items-center mb-4">
                     <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-stone-400"><ChevronLeft size={16}/></button>
                     <span className="text-sm font-bold text-stone-800 dark:text-stone-200 capitalize">
                         {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                     </span>
                     <button onClick={() => changeMonth(1)} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-stone-400"><ChevronRight size={16}/></button>
                 </div>
                 <div className="grid grid-cols-7 gap-1 text-center mb-2">
                     {['D','S','T','Q','Q','S','S'].map(d => <span key={d} className="text-[10px] text-stone-400 font-bold">{d}</span>)}
                 </div>
                 <div className="grid grid-cols-7 gap-1 text-center">
                     {Array.from({length: 30}, (_, i) => i + 1).map(d => (
                         <div 
                            key={d} 
                            onClick={() => { const n = new Date(currentDate); n.setDate(d); setCurrentDate(n); }}
                            className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-colors ${d === currentDate.getDate() ? 'bg-primary-600 text-white shadow-md' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                         >
                             {d}
                         </div>
                     ))}
                 </div>
             </div>
          </Card>

          {/* Filters & Stats */}
          <Card className="flex-1" noPadding>
             <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                 <h3 className="font-bold text-stone-800 dark:text-stone-200">Filtros & Resumo</h3>
                 <SlidersHorizontal size={14} className="text-stone-400"/>
             </div>
             <div className="p-4 space-y-6">
                 <div>
                     <label className="text-xs font-bold text-stone-500 uppercase mb-2 block flex items-center"><MapPin size={10} className="mr-1"/> Salas</label>
                     <select 
                        value={filterRoom} 
                        onChange={(e) => setFilterRoom(e.target.value as any)}
                        className="w-full text-sm p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                     >
                         <option value="All">Todas as Salas</option>
                         {Object.values(Room).map(r => <option key={r} value={r}>{r}</option>)}
                     </select>
                 </div>
                 <div>
                     <label className="text-xs font-bold text-stone-500 uppercase mb-2 block flex items-center"><User size={10} className="mr-1"/> Profissional</label>
                     <select 
                        value={filterProfessional}
                        onChange={(e) => setFilterProfessional(e.target.value)}
                        className="w-full text-sm p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                     >
                         <option value="All">Todos</option>
                         <option value="Dr. Gestor">Dr. Gestor</option>
                         <option value="Dra. Ana">Dra. Ana</option>
                     </select>
                 </div>
                 
                 <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                     <p className="text-xs font-bold text-stone-500 uppercase mb-3 flex items-center"><Zap size={10} className="mr-1 text-amber-500"/> Performance do Dia</p>
                     <div className="space-y-3">
                         <div className="flex justify-between items-center p-2 bg-stone-50 dark:bg-stone-800 rounded-lg">
                             <span className="text-sm text-stone-500">Agendados</span>
                             <span className="font-bold text-stone-800 dark:text-stone-200">{stats.total}</span>
                         </div>
                         <div className="flex justify-between items-center p-2 bg-stone-50 dark:bg-stone-800 rounded-lg">
                             <span className="text-sm text-stone-500">Confirmados</span>
                             <span className="font-bold text-emerald-600">{stats.confirmed}</span>
                         </div>
                         <div className="flex justify-between items-center p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
                             <span className="text-sm text-primary-700 dark:text-primary-400 font-medium">Previsão</span>
                             <span className="font-bold text-primary-700 dark:text-primary-400">R$ {stats.billing.toLocaleString()}</span>
                         </div>
                     </div>
                 </div>
                 
                 <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                     <p className="text-xs font-bold text-stone-500 uppercase mb-3">Legenda</p>
                     <div className="grid grid-cols-2 gap-y-3">
                         <LegendBadge color="bg-stone-300" label="Agendado" />
                         <LegendBadge color="bg-emerald-500" label="Confirmado" />
                         <LegendBadge color="bg-blue-500" label="Em Sala" />
                         <LegendBadge color="bg-red-500" label="Cancelado" />
                     </div>
                 </div>
             </div>
          </Card>
      </div>

      {/* 2. MAIN SCHEDULE GRID */}
      <div className="flex-1 flex flex-col bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden relative">
          {/* Top Bar */}
          <div className="h-16 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-6 bg-white dark:bg-stone-900 z-10">
              <div className="flex items-center gap-6">
                   <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
                       <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-white dark:hover:bg-stone-700 rounded-md shadow-sm transition-all text-stone-500"><ChevronLeft size={16}/></button>
                       <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-white dark:hover:bg-stone-700 rounded-md shadow-sm transition-all text-stone-500"><ChevronRight size={16}/></button>
                   </div>
                   <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 capitalize flex items-center">
                       {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                   </h2>
              </div>
              <div className="flex items-center gap-3">
                  <div className="hidden lg:flex bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
                      <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'day' ? 'bg-white dark:bg-stone-700 shadow-sm text-primary-600' : 'text-stone-500'}`}>Dia</button>
                      <button onClick={() => setViewMode('week')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'week' ? 'bg-white dark:bg-stone-700 shadow-sm text-primary-600' : 'text-stone-500'}`}>Semana</button>
                      <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'month' ? 'bg-white dark:bg-stone-700 shadow-sm text-primary-600' : 'text-stone-500'}`}>Mês</button>
                  </div>
                  <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary-500/20"><Plus size={18} className="mr-2"/> Novo Agendamento</Button>
              </div>
          </div>

          {/* Grid Content */}
          <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-stone-50/50 dark:bg-stone-950/30">
              {viewMode === 'month' ? (
                  <div className="flex items-center justify-center h-full text-stone-400 flex-col">
                      <div className="p-6 bg-stone-100 dark:bg-stone-800 rounded-full mb-4">
                          <CalIcon size={48} className="opacity-40"/>
                      </div>
                      <p className="font-medium">Visualização Mensal (Em Breve)</p>
                      <p className="text-sm mt-2 opacity-60">Use a visualização diária para gerenciar detalhes.</p>
                  </div>
              ) : (
                  <div className="relative min-w-[600px]" style={{ height: `${HOURS.length * 100}px` }}>
                      {HOURS.map((h, i) => (
                          <div key={h} className="absolute w-full flex" style={{ top: `${i * 100}px`, height: `100px` }}>
                              <div className="w-20 flex-shrink-0 flex justify-center pt-3 text-xs font-bold text-stone-400 border-r border-stone-200 dark:border-stone-800 border-b border-stone-100 dark:border-stone-800">{h}:00</div>
                              <div className="flex-1 border-b border-stone-100 dark:border-stone-800 flex relative">
                                  {Object.values(Room).filter(r => filterRoom === 'All' || r === filterRoom).map(r => (
                                      <div key={r} className="flex-1 h-full border-r border-stone-100 dark:border-stone-800 hover:bg-white dark:hover:bg-stone-800 transition-colors cursor-crosshair relative group" onClick={() => handleSlotClick(h, r)}>
                                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                              <div className="bg-primary-50 text-primary-600 rounded-full p-1 shadow-sm"><Plus size={16}/></div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                      
                      {/* Current Time Indicator */}
                      <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: `${((new Date().getHours() - START_HOUR) * 100) + ((new Date().getMinutes()/60)*100)}px` }}>
                          <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 shadow-md border-2 border-white dark:border-stone-900"></div>
                          <div className="h-0.5 bg-red-500 w-full shadow-sm opacity-50"></div>
                      </div>

                      {/* Appointments */}
                      {dayAppointments.map(appt => {
                          const roomCount = filterRoom === 'All' ? Object.values(Room).length : 1;
                          const roomIndex = filterRoom === 'All' ? Object.values(Room).indexOf(appt.room) : 0;
                          const isBlock = appt.patientId === 'BLOCK';
                          
                          return (
                              <div 
                                key={appt.id}
                                className={`absolute mx-1.5 rounded-xl border p-3 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:-translate-y-0.5 hover:z-30 transition-all bg-white dark:bg-stone-800 border-l-[6px] group overflow-hidden shadow-sm`}
                                style={{ 
                                    top: `${((appt.start.getHours() - START_HOUR) * 100) + ((appt.start.getMinutes()/60) * 100)}px`, 
                                    height: `${(appt.durationMinutes / 60) * 100 - 4}px`, 
                                    left: `${(roomIndex * (100 / roomCount))}%`, 
                                    width: `calc(${100 / roomCount}% - 12px)`,
                                    borderLeftColor: isBlock ? '#78716c' : appt.status === AppointmentStatus.CONFIRMED ? '#10b981' : appt.status === AppointmentStatus.CANCELED ? '#ef4444' : '#d6d3d1'
                                }}
                                onClick={() => alert(`Detalhes: ${appt.patientName}`)}
                              >
                                  <div className="flex justify-between items-start">
                                      <span className={`font-bold text-xs truncate ${isBlock ? 'text-stone-500 uppercase tracking-wider' : 'text-stone-800 dark:text-stone-200'}`}>
                                          {isBlock ? 'BLOQUEADO' : appt.patientName}
                                      </span>
                                      {appt.status === AppointmentStatus.CHECKED_IN && <MapPin size={12} className="text-blue-500"/>}
                                  </div>
                                  
                                  {!isBlock && (
                                    <div className="text-[10px] opacity-80 dark:text-stone-400 flex flex-col gap-0.5 mt-1">
                                        <div className="flex items-center gap-1 font-medium text-stone-600 dark:text-stone-300">
                                            <Tag size={10}/> {appt.type}
                                        </div>
                                        <div className="flex items-center gap-1 text-stone-400">
                                            <Clock size={10}/> {appt.durationMinutes} min
                                        </div>
                                    </div>
                                  )}

                                  {isBlock && <div className="text-[10px] text-stone-400 italic">{appt.notes || 'Manutenção/Intervalo'}</div>}
                                  
                                  {/* Quick Actions on Hover */}
                                  <div className="absolute right-2 top-2 bottom-2 flex flex-col justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {!isBlock && (
                                        <>
                                            <button title="Confirmar" onClick={(e) => {e.stopPropagation(); onUpdateStatus(appt.id, AppointmentStatus.CONFIRMED)}} className="bg-white dark:bg-stone-700 shadow-md text-emerald-500 hover:bg-emerald-50 rounded-full p-1.5"><Check size={12}/></button>
                                            <button title="Cancelar" onClick={(e) => {e.stopPropagation(); onUpdateStatus(appt.id, AppointmentStatus.CANCELED)}} className="bg-white dark:bg-stone-700 shadow-md text-red-500 hover:bg-red-50 rounded-full p-1.5"><XCircle size={12}/></button>
                                        </>
                                      )}
                                      <button title="Editar" className="bg-white dark:bg-stone-700 shadow-md text-stone-400 hover:text-stone-600 rounded-full p-1.5"><MoreVertical size={12}/></button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>
      </div>

      {/* 3. ADVANCED APPOINTMENT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Agendamento" footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className={formData.isBlock ? "bg-stone-600 hover:bg-stone-700" : ""}>
                {formData.isBlock ? 'Criar Bloqueio' : `Agendar (R$ ${formData.price})`}
            </Button>
          </>
      }>
          <div className="space-y-5">
              {/* Top Toggle: Appointment vs Block */}
              <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mb-6">
                  <button onClick={() => setFormData({...formData, isBlock: false})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${!formData.isBlock ? 'bg-white dark:bg-stone-700 shadow-sm text-primary-600' : 'text-stone-500'}`}>
                      <User size={14}/> Paciente
                  </button>
                  <button onClick={() => setFormData({...formData, isBlock: true})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formData.isBlock ? 'bg-white dark:bg-stone-700 shadow-sm text-red-600' : 'text-stone-500'}`}>
                      <Lock size={14}/> Bloqueio / Admin
                  </button>
              </div>

              {!formData.isBlock ? (
                  <div className="space-y-5 animate-in fade-in">
                      {/* Novelty 1: Patient Search (Simulated) */}
                      <div className="relative group">
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Paciente</label>
                          <div className="relative">
                              <Search className="absolute left-3 top-3 text-stone-400 group-focus-within:text-primary-500 transition-colors" size={18}/>
                              <input 
                                list="patients-list" 
                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium" 
                                placeholder="Buscar nome, CPF ou telefone..."
                                value={formData.patientName}
                                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                                autoFocus
                              />
                              <datalist id="patients-list">
                                  {patients.map(p => <option key={p.id} value={p.name} />)}
                              </datalist>
                          </div>
                      </div>

                      {/* Novelty 2 & 8: Procedure & Professional */}
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                               <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Procedimento</label>
                               <select 
                                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-primary-500"
                                    value={formData.treatment}
                                    onChange={(e) => handleTreatmentChange(e.target.value as TreatmentType)}
                                >
                                   {Object.values(TreatmentType).map(t => <option key={t} value={t}>{t}</option>)}
                               </select>
                          </div>
                          <div>
                               <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Profissional</label>
                               <div className="relative">
                                   <Stethoscope className="absolute left-3 top-3 text-stone-400" size={18}/>
                                   <select 
                                        className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-primary-500"
                                        value={formData.professional}
                                        onChange={(e) => setFormData({...formData, professional: e.target.value})}
                                   >
                                       <option>Dr. Gestor</option>
                                       <option>Dra. Ana</option>
                                       <option>Enf. Esteta Julia</option>
                                   </select>
                               </div>
                          </div>
                      </div>

                      {/* Novelty 3 & 10: Date/Time/Duration & Price */}
                      <div className="p-4 bg-stone-50/50 rounded-xl border border-stone-100">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                              <Input label="Data" type="date" value={formData.date} onChange={(e: any) => setFormData({...formData, date: e.target.value})} className="bg-white" />
                              <Input label="Hora" type="time" value={formData.startTime} onChange={(e: any) => setFormData({...formData, startTime: e.target.value})} className="bg-white" />
                              <div>
                                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Duração</label>
                                   <select 
                                        className="w-full p-3 bg-white border border-stone-200 rounded-xl text-sm outline-none"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                    >
                                       <option value="15">15 min</option>
                                       <option value="30">30 min</option>
                                       <option value="45">45 min</option>
                                       <option value="60">60 min</option>
                                       <option value="90">1h 30m</option>
                                   </select>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Sala</label>
                                   <select 
                                        className="w-full p-3 bg-white border border-stone-200 rounded-xl text-sm outline-none"
                                        value={formData.room}
                                        onChange={(e) => setFormData({...formData, room: e.target.value as any})}
                                    >
                                       {Object.values(Room).map(r => <option key={r} value={r}>{r}</option>)}
                                   </select>
                              </div>
                              <div className="relative">
                                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Valor Estimado (R$)</label>
                                  <input 
                                    type="number" 
                                    className="w-full p-3 pl-8 bg-white border border-stone-200 rounded-xl text-sm font-bold text-emerald-600 outline-none"
                                    value={formData.price} 
                                    onChange={(e: any) => setFormData({...formData, price: Number(e.target.value)})} 
                                   />
                                   <DollarSign className="absolute left-3 bottom-3.5 text-emerald-500" size={14}/>
                              </div>
                          </div>
                      </div>

                      {/* Novelty 9: Notes */}
                      <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Observações Internas</label>
                          <textarea 
                             className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none h-20 resize-none placeholder-stone-400"
                             placeholder="Alergias, preferências, histórico..."
                             value={formData.notes}
                             onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          ></textarea>
                      </div>

                      {/* Novelty 4, 5, 7: Toggles */}
                      <div className="space-y-3 pt-2">
                          <label className="flex items-center space-x-3 text-sm text-stone-700 cursor-pointer p-3 hover:bg-emerald-50/50 rounded-xl transition-colors border border-stone-100 hover:border-emerald-100">
                              <input type="checkbox" checked={formData.sendWhatsApp} onChange={(e) => setFormData({...formData, sendWhatsApp: e.target.checked})} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"/>
                              <div className="flex items-center text-emerald-700 font-medium">
                                  <MessageCircle size={16} className="mr-2"/>
                                  Enviar confirmação automática (WhatsApp)
                              </div>
                          </label>
                          <label className="flex items-center space-x-3 text-sm text-stone-700 cursor-pointer p-3 hover:bg-blue-50/50 rounded-xl transition-colors border border-stone-100 hover:border-blue-100">
                              <input type="checkbox" checked={formData.isRecurring} onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"/>
                              <div className="flex items-center text-blue-700 font-medium">
                                  <Repeat size={16} className="mr-2"/>
                                  Agendar retorno automático (15 dias)
                              </div>
                          </label>
                          <div className="flex gap-2 pt-2">
                              {['VIP', '1ª Vez', 'Retorno'].map(tag => (
                                  <span key={tag} onClick={() => {}} className="px-2.5 py-1 bg-stone-100 text-stone-500 text-xs font-bold rounded-full border border-stone-200 cursor-pointer hover:bg-stone-200 transition-colors uppercase tracking-wide">{tag}</span>
                              ))}
                              <button className="px-2 py-1 text-xs text-primary-600 hover:underline">+ Tag</button>
                          </div>
                      </div>
                  </div>
              ) : (
                  // BLOCK MODE
                  <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-100 flex items-start">
                          <Lock size={16} className="mr-2 shrink-0 mt-0.5"/>
                          <div>
                              <p className="font-bold">Bloqueio de Agenda</p>
                              <p className="opacity-90 mt-1">Isso impedirá novos agendamentos nesta sala/horário. Pacientes não poderão agendar online.</p>
                          </div>
                      </div>
                      
                      <Input label="Motivo do Bloqueio" placeholder="Ex: Almoço, Manutenção, Feriado" value={formData.notes} onChange={(e: any) => setFormData({...formData, notes: e.target.value})} />
                      
                      <div className="grid grid-cols-2 gap-4">
                          <Input label="Data" type="date" value={formData.date} onChange={(e: any) => setFormData({...formData, date: e.target.value})} />
                          <Input label="Início" type="time" value={formData.startTime} onChange={(e: any) => setFormData({...formData, startTime: e.target.value})} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Duração (min)" type="number" value={formData.duration} onChange={(e: any) => setFormData({...formData, duration: e.target.value})} />
                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Sala Bloqueada</label>
                           <select 
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none"
                                value={formData.room}
                                onChange={(e) => setFormData({...formData, room: e.target.value as any})}
                            >
                               {Object.values(Room).map(r => <option key={r} value={r}>{r}</option>)}
                           </select>
                        </div>
                      </div>
                  </div>
              )}
          </div>
      </Modal>
    </div>
  );
};

export default Schedule;