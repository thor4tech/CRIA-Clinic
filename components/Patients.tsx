import React, { useState, useMemo } from 'react';
import { 
    Search, Plus, Phone, MessageCircle, FileText, Clock, AlertTriangle, 
    MoreHorizontal, User, Wallet, ChevronRight, PenTool, Image as ImageIcon, 
    FileCheck, Filter, Trash2, Edit, Calendar, MapPin, Tag, Lock, 
    Eye, EyeOff, Cake, UploadCloud, Download, X
} from 'lucide-react';
import { Patient, Appointment } from '../types';
import { Modal, Button, Input, EmptyState, Toast, Select } from './Shared';

interface PatientsProps {
  patients: Patient[];
  appointments: Appointment[];
  onAddPatient: (p: Patient) => void;
  onUpdatePatient: (p: Patient) => void; // Now actually used
  onOpenFaceMap: (id: string) => void;
}

// --- UTILS ---
const formatPhone = (val: string) => val.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
const formatCPF = (val: string) => val.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

const Patients: React.FC<PatientsProps> = ({ patients, appointments, onAddPatient, onUpdatePatient, onOpenFaceMap }) => {
  // State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Blocked' | 'Inactive'>('All');
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline' | 'gallery' | 'docs'>('summary');
  const [showValues, setShowValues] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Partial<Patient>>({});

  // Computed
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.phone.includes(searchTerm) || 
                              p.cpf?.includes(searchTerm);
        const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [patients, searchTerm, filterStatus]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  
  const patientHistory = useMemo(() => {
      if (!selectedPatientId) return [];
      return appointments
        .filter(a => a.patientId === selectedPatientId)
        .sort((a,b) => b.start.getTime() - a.start.getTime());
  }, [selectedPatientId, appointments]);

  // Handlers
  const handleOpenModal = (mode: 'create' | 'edit', patient?: Patient) => {
      setModalMode(mode);
      if (mode === 'edit' && patient) {
          setFormData({ ...patient });
      } else {
          setFormData({ 
              name: '', phone: '', cpf: '', email: '', 
              status: 'Active', tags: [], anamnesisStatus: 'Pending' 
          });
      }
      setIsModalOpen(true);
  };

  const handleSavePatient = () => {
      if (!formData.name || !formData.phone) return alert("Nome e Telefone obrigatórios");

      if (modalMode === 'create') {
          const newPatient: Patient = {
              id: Math.random().toString(36).substr(2, 9),
              name: formData.name,
              phone: formData.phone,
              cpf: formData.cpf,
              email: formData.email,
              avatarUrl: `https://picsum.photos/seed/${formData.name}/200`,
              totalSpent: 0,
              visitCount: 0,
              lastVisit: 'Nunca',
              status: 'Active',
              tags: [],
              anamnesisStatus: 'Pending',
              ...formData as any
          };
          onAddPatient(newPatient);
          setSelectedPatientId(newPatient.id);
      } else {
          // Edit Mode
          onUpdatePatient({ ...selectedPatient!, ...formData } as Patient);
      }
      setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if(confirm("Tem certeza? Esta ação arquivará o paciente.")) {
         // In a real app, this would verify dependencies.
         // Here we just simulate an update to 'Inactive'
         const p = patients.find(p => p.id === id);
         if(p) onUpdatePatient({ ...p, status: 'Inactive' });
      }
  };

  const openWhatsApp = () => {
      if (!selectedPatient) return;
      const msg = `Olá ${selectedPatient.name.split(' ')[0]}, tudo bem? Gostaria de confirmar seu horário...`;
      window.open(`https://wa.me/55${selectedPatient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-all ${
            activeTab === id ? 'border-primary-500 text-primary-700 bg-primary-50/50' : 'border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50'
        }`}
      >
          <Icon size={16} className="mr-2"/> {label}
      </button>
  );

  return (
    <div className="flex h-full gap-6">
      {/* 1. SIDEBAR LIST */}
      <div className="w-1/3 min-w-[320px] bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col overflow-hidden">
        {/* List Header */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/30">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg text-stone-800 flex items-center">
                    Pacientes 
                    <span className="ml-2 text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">{filteredPatients.length}</span>
                </h2>
                <div className="flex space-x-2">
                    <button onClick={() => setShowValues(!showValues)} className="p-2 text-stone-400 hover:text-stone-600" title={showValues ? "Ocultar Valores" : "Mostrar Valores"}>
                        {showValues ? <Eye size={18}/> : <EyeOff size={18}/>}
                    </button>
                    <button onClick={() => handleOpenModal('create')} className="p-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-sm">
                        <Plus size={18} />
                    </button>
                </div>
            </div>
            
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input 
                        type="text"
                        placeholder="Buscar por nome, CPF ou tel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-shadow"
                    />
                </div>
                {/* Quick Filters */}
                <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                    {['All', 'Active', 'Blocked', 'Inactive'].map(s => (
                        <button 
                            key={s}
                            onClick={() => setFilterStatus(s as any)}
                            className={`text-[10px] px-3 py-1 rounded-full border whitespace-nowrap transition-colors ${
                                filterStatus === s 
                                ? 'bg-stone-800 text-white border-stone-800' 
                                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                            }`}
                        >
                            {s === 'All' ? 'Todos' : s === 'Active' ? 'Ativos' : s === 'Blocked' ? 'Bloqueados' : 'Inativos'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        
        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
            {filteredPatients.length === 0 ? (
                 <div className="p-8 text-center text-stone-400 flex flex-col items-center">
                    <div className="bg-stone-50 p-4 rounded-full mb-3">
                        <User size={24} className="opacity-50" />
                    </div>
                    <p className="text-sm">Nenhum paciente encontrado.</p>
                 </div>
            ) : (
                <div className="divide-y divide-stone-50">
                    {filteredPatients.map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => setSelectedPatientId(p.id)}
                            className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-stone-50 transition-all group ${selectedPatientId === p.id ? 'bg-primary-50/40 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="relative shrink-0">
                                <div className="h-10 w-10 rounded-full bg-stone-200 overflow-hidden">
                                    <img src={p.avatarUrl} alt={p.name} className="h-full w-full object-cover" />
                                </div>
                                {p.status === 'Blocked' && (
                                    <div className="absolute -bottom-1 -right-1 bg-red-500 border-2 border-white rounded-full p-0.5">
                                        <Lock size={8} className="text-white"/>
                                    </div>
                                )}
                            </div>
                            
                            <div className="overflow-hidden flex-1">
                                <h4 className={`font-semibold text-sm truncate ${selectedPatientId === p.id ? 'text-primary-900' : 'text-stone-900'}`}>
                                    {p.name}
                                </h4>
                                <p className="text-xs text-stone-500 truncate flex items-center">
                                    {p.lastVisit === 'Nunca' ? 'Novo Paciente' : `Última: ${p.lastVisit}`}
                                </p>
                            </div>
                            
                            {/* Hover Actions */}
                            <div className="hidden group-hover:flex items-center space-x-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal('edit', p); }}
                                    className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded"
                                >
                                    <Edit size={14}/>
                                </button>
                            </div>
                            <ChevronRight size={14} className={`text-stone-300 ${selectedPatientId === p.id ? 'text-primary-300' : ''}`} />
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* 2. DETAIL VIEW */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col overflow-hidden relative">
        {selectedPatient ? (
            <>
                {/* Detail Header */}
                <div className="p-6 border-b border-stone-100 bg-stone-50/50">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-5">
                            <div className="relative group cursor-pointer">
                                <div className="h-24 w-24 rounded-2xl bg-stone-200 overflow-hidden shadow-sm border-4 border-white">
                                    <img src={selectedPatient.avatarUrl} alt={selectedPatient.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <UploadCloud size={20} className="text-white"/>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h2 className="text-2xl font-bold text-stone-900">{selectedPatient.name}</h2>
                                    {selectedPatient.status === 'Blocked' && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded uppercase flex items-center">
                                            <Lock size={10} className="mr-1"/> Bloqueado
                                        </span>
                                    )}
                                    {selectedPatient.totalSpent && selectedPatient.totalSpent > 5000 && (
                                         <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded uppercase flex items-center">
                                            <Tag size={10} className="mr-1"/> VIP
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-stone-500">
                                    <span className="flex items-center hover:text-stone-800 cursor-pointer transition-colors" title="Copiar">
                                        <Phone size={14} className="mr-1.5 text-stone-400"/> {selectedPatient.phone}
                                    </span>
                                    <span className="flex items-center">
                                        <Cake size={14} className="mr-1.5 text-stone-400"/> 
                                        {selectedPatient.birthDate ? new Date(selectedPatient.birthDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                    <span className="flex items-center">
                                        <Wallet size={14} className="mr-1.5 text-stone-400"/> 
                                        LTV: {showValues ? `R$ ${selectedPatient.totalSpent?.toLocaleString('pt-BR') || '0'}` : '••••'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex space-x-2">
                                <Button variant="secondary" onClick={() => onOpenFaceMap(selectedPatient.id)}>
                                    <PenTool size={16} className="mr-2 text-violet-600"/> Prontuário
                                </Button>
                                <Button variant="secondary" className="!px-3 bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" onClick={openWhatsApp}>
                                    <MessageCircle size={18} />
                                </Button>
                            </div>
                            <Button variant="ghost" className="text-xs text-stone-400 hover:text-stone-600" onClick={() => handleOpenModal('edit', selectedPatient)}>
                                Editar Cadastro
                            </Button>
                        </div>
                    </div>
                    
                    {/* Tabs Navigation */}
                    <div className="flex space-x-2 border-b border-stone-200 -mb-6 pb-0">
                        <TabButton id="summary" label="Resumo Clínico" icon={User} />
                        <TabButton id="timeline" label="Linha do Tempo" icon={Clock} />
                        <TabButton id="gallery" label="Galeria" icon={ImageIcon} />
                        <TabButton id="docs" label="Documentos" icon={FileCheck} />
                    </div>
                </div>

                {/* Tabs Content */}
                <div className="p-6 flex-1 overflow-y-auto mt-4 bg-stone-50/20">
                    
                    {activeTab === 'summary' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                             {/* Stats Cards */}
                             <div className="grid grid-cols-2 gap-4 col-span-2 lg:col-span-2">
                                 <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
                                     <div>
                                         <p className="text-xs text-stone-500 font-medium uppercase">Total Investido</p>
                                         <p className="text-xl font-bold text-stone-900">{showValues ? `R$ ${selectedPatient.totalSpent?.toLocaleString()}` : '••••'}</p>
                                     </div>
                                     <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Wallet size={20}/></div>
                                 </div>
                                 <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between">
                                     <div>
                                         <p className="text-xs text-stone-500 font-medium uppercase">Visitas Realizadas</p>
                                         <p className="text-xl font-bold text-stone-900">{selectedPatient.visitCount || 0}</p>
                                     </div>
                                     <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Calendar size={20}/></div>
                                 </div>
                             </div>

                             {/* Medical Alerts */}
                             <div className="p-5 rounded-xl border border-stone-100 bg-white shadow-sm h-fit">
                                <h4 className="font-bold text-stone-800 mb-4 flex items-center justify-between">
                                    Alertas & Tags
                                    <button className="text-xs text-primary-600 hover:underline">+ Gerenciar</button>
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedPatient.tags?.length ? selectedPatient.tags.map(t => (
                                        <span key={t} className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded border border-stone-200">{t}</span>
                                    )) : <span className="text-stone-400 text-xs italic">Nenhuma tag...</span>}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100">
                                        <AlertTriangle size={16} className="mr-2 shrink-0"/>
                                        <span>Alergia à Dipirona</span>
                                    </div>
                                    <div className={`flex items-center p-3 rounded-lg text-sm border ${selectedPatient.anamnesisStatus === 'Valid' ? 'bg-green-50 text-green-800 border-green-100' : 'bg-amber-50 text-amber-800 border-amber-100'}`}>
                                        <FileText size={16} className="mr-2 shrink-0"/>
                                        <div className="flex-1">
                                            <p className="font-bold">Anamnese {selectedPatient.anamnesisStatus === 'Valid' ? 'Válida' : 'Pendente'}</p>
                                            <p className="text-xs opacity-80">Atualizada há 2 meses</p>
                                        </div>
                                        <button className="text-xs underline">Ver</button>
                                    </div>
                                </div>
                             </div>

                             {/* Next Appointments */}
                             <div className="p-5 rounded-xl border border-stone-100 bg-white shadow-sm h-fit">
                                <h4 className="font-bold text-stone-800 mb-4 flex items-center justify-between">
                                    Próximos Agendamentos
                                    <button className="p-1 bg-stone-100 rounded hover:bg-stone-200"><Plus size={14}/></button>
                                </h4>
                                {patientHistory.filter(a => a.start > new Date()).length === 0 ? (
                                    <p className="text-sm text-stone-400 italic text-center py-4">Nenhum agendamento futuro.</p>
                                ) : (
                                    <div className="space-y-3">
                                         {patientHistory.filter(a => a.start > new Date()).map(a => (
                                             <div key={a.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100">
                                                 <div>
                                                     <p className="font-bold text-sm text-stone-800">{a.type}</p>
                                                     <p className="text-xs text-stone-500">{new Date(a.start).toLocaleDateString()} às {a.start.getHours()}:{a.start.getMinutes()}</p>
                                                 </div>
                                                 <span className="px-2 py-0.5 bg-white border border-stone-200 rounded text-[10px] font-bold text-stone-500">{a.status}</span>
                                             </div>
                                         ))}
                                    </div>
                                )}
                             </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div className="space-y-6 relative ml-2 animate-in fade-in">
                             <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-stone-200"></div>
                             {patientHistory.length === 0 ? <p className="text-stone-400 pl-8">Sem histórico de visitas.</p> : patientHistory.map(appt => (
                                <div key={appt.id} className="relative pl-8">
                                    <div className={`absolute -left-[4px] top-1.5 h-4 w-4 rounded-full border-2 border-white z-10 ${appt.status === 'Concluído' ? 'bg-emerald-500 shadow-sm' : 'bg-stone-300'}`}></div>
                                    <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-stone-800 text-base">{appt.type}</h4>
                                                <p className="text-sm text-stone-500 flex items-center mt-1">
                                                    <Calendar size={12} className="mr-1"/> 
                                                    {new Date(appt.start).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${appt.status === 'Concluído' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100'}`}>{appt.status}</span>
                                        </div>
                                        <div className="flex items-center text-xs text-stone-400 mt-2 space-x-3">
                                            <span className="flex items-center"><MapPin size={12} className="mr-1"/> {appt.room}</span>
                                            <span className="flex items-center"><Clock size={12} className="mr-1"/> {appt.durationMinutes} min</span>
                                        </div>
                                        {/* Mock Notes */}
                                        <div className="mt-4 p-3 bg-stone-50 rounded-lg text-sm text-stone-600 italic border border-stone-100">
                                            "Paciente relatou sensibilidade leve na região frontal. Aplicado anestésico tópico 15min antes."
                                        </div>
                                    </div>
                                </div>
                             ))}
                        </div>
                    )}
                    
                    {activeTab === 'gallery' && (
                        <div className="animate-in fade-in">
                            <div className="flex justify-end mb-4">
                                <Button variant="secondary" className="text-xs">
                                    <UploadCloud size={14} className="mr-2"/> Upload de Fotos
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="aspect-square bg-stone-100 rounded-xl relative overflow-hidden group cursor-pointer border border-stone-200">
                                        <img src={`https://picsum.photos/seed/${selectedPatient.id + i}/500/500`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <span className="text-white text-sm font-bold">15/10/2023</span>
                                            <span className="text-white/80 text-xs">Pós-Procedimento</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="aspect-square border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-400 cursor-pointer hover:bg-stone-50 hover:border-primary-300 hover:text-primary-500 transition-colors">
                                    <Plus size={32} className="mb-2"/>
                                    <span className="text-xs font-medium">Adicionar Foto</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'docs' && (
                        <div className="space-y-3 animate-in fade-in">
                            <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 cursor-pointer transition-colors">
                                <UploadCloud size={32} className="mb-2 text-stone-300"/>
                                <p className="text-sm font-medium">Arraste arquivos aqui ou clique para enviar</p>
                                <p className="text-xs mt-1">PDF, JPG ou PNG</p>
                            </div>

                            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer group">
                                   <div className="flex items-center">
                                       <div className="p-2 bg-red-50 text-red-600 rounded-lg mr-3"><FileText size={20}/></div>
                                       <div>
                                           <p className="text-sm font-bold text-stone-800">Termo de Consentimento - Toxina.pdf</p>
                                           <p className="text-xs text-stone-500">Adicionado em 10/10/2023</p>
                                       </div>
                                   </div>
                                   <div className="flex items-center space-x-3">
                                       <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Assinado</span>
                                       <button className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity"><Download size={16}/></button>
                                   </div>
                               </div>
                               <div className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors cursor-pointer group">
                                   <div className="flex items-center">
                                       <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3"><FileCheck size={20}/></div>
                                       <div>
                                           <p className="text-sm font-bold text-stone-800">Ficha de Anamnese.pdf</p>
                                           <p className="text-xs text-stone-500">Adicionado em 05/01/2023</p>
                                       </div>
                                   </div>
                                   <div className="flex items-center space-x-3">
                                       <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold rounded uppercase">Arquivo</span>
                                        <button className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity"><Download size={16}/></button>
                                   </div>
                               </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <EmptyState 
                title="Nenhum paciente selecionado"
                description="Selecione um paciente na lista ao lado para ver detalhes, histórico, fotos e documentos."
                icon={User}
            />
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === 'create' ? "Novo Paciente" : "Editar Paciente"} 
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSavePatient}>
                {modalMode === 'create' ? 'Cadastrar' : 'Salvar Alterações'}
            </Button>
          </>
      }>
        <div className="space-y-4">
             {/* Avatar Uploader Mock */}
             <div className="flex justify-center mb-6">
                 <div className="relative group cursor-pointer">
                    <div className="h-24 w-24 rounded-full bg-stone-100 flex items-center justify-center text-stone-300 border-2 border-dashed border-stone-300 overflow-hidden">
                        {formData.avatarUrl ? <img src={formData.avatarUrl} className="w-full h-full object-cover"/> : <User size={32} />}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PenTool size={16} className="text-white"/>
                    </div>
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <Input label="Nome Completo" placeholder="Ex: Maria Silva" value={formData.name || ''} onChange={(e: any) => setFormData({...formData, name: e.target.value})} autoFocus />
                 </div>
                 <Input 
                    label="Celular / WhatsApp" 
                    placeholder="(00) 00000-0000" 
                    value={formData.phone || ''} 
                    onChange={(e: any) => setFormData({...formData, phone: formatPhone(e.target.value)})} 
                />
                 <Input 
                    label="CPF" 
                    placeholder="000.000.000-00" 
                    value={formData.cpf || ''} 
                    onChange={(e: any) => setFormData({...formData, cpf: formatCPF(e.target.value)})} 
                />
                 <Input 
                    label="Data de Nascimento" 
                    type="date" 
                    value={formData.birthDate || ''} 
                    onChange={(e: any) => setFormData({...formData, birthDate: e.target.value})} 
                />
                 <Select 
                    label="Status" 
                    value={formData.status || 'Active'} 
                    onChange={(e: any) => setFormData({...formData, status: e.target.value})}
                    options={[
                        {value: 'Active', label: 'Ativo'},
                        {value: 'Blocked', label: 'Bloqueado (Inadimplente)'},
                        {value: 'Inactive', label: 'Inativo/Arquivado'}
                    ]}
                 />
                 <div className="col-span-2">
                     <Input label="Email" placeholder="exemplo@email.com" type="email" value={formData.email || ''} onChange={(e: any) => setFormData({...formData, email: e.target.value})} />
                 </div>
             </div>

             {modalMode === 'edit' && (
                 <div className="pt-4 border-t border-stone-100 mt-4">
                     <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">Endereço</h4>
                     <div className="grid grid-cols-3 gap-3">
                         <div className="col-span-1"><Input label="CEP" placeholder="00000-000" /></div>
                         <div className="col-span-2"><Input label="Rua" placeholder="Av. Paulista" /></div>
                         <div><Input label="Número" placeholder="123" /></div>
                         <div className="col-span-2"><Input label="Bairro" placeholder="Bela Vista" /></div>
                     </div>
                 </div>
             )}
        </div>
      </Modal>
    </div>
  );
};

export default Patients;