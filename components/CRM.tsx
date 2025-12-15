import React, { useState, useRef, useEffect } from 'react';
import { 
    MoreHorizontal, Plus, DollarSign, Clock, MessageCircle, 
    Calendar, Search, Filter, AlertCircle, Trash2, Edit2, 
    ArrowRightCircle, X, GripVertical 
} from 'lucide-react';
import { Lead, KanbanStage } from '../types';
import { Button, Modal, Input, Select, Toast } from './Shared';

interface CRMProps {
  leads: Lead[];
  onAddLead: (lead: Lead) => void;
  onUpdateStage: (id: string, stage: KanbanStage) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

const CRM: React.FC<CRMProps> = ({ leads, onAddLead, onUpdateStage, onEditLead, onDeleteLead }) => {
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Drag & Drop State
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
      name: '',
      phone: '',
      source: 'Instagram',
      value: 0,
      notes: ''
  });

  // Derived Data
  const filteredLeads = leads.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.phone.includes(searchTerm)
  );
  
  const columns = Object.values(KanbanStage);

  // --- Handlers ---

  const openNewLeadModal = () => {
      setEditingLeadId(null);
      setFormData({ name: '', phone: '', source: 'Instagram', value: 0, notes: '' });
      setIsModalOpen(true);
  };

  const openEditLeadModal = (lead: Lead) => {
      setEditingLeadId(lead.id);
      setFormData({
          name: lead.name,
          phone: lead.phone,
          source: lead.source,
          value: lead.value,
          notes: lead.notes || ''
      });
      setActiveMenuId(null);
      setIsModalOpen(true);
  };

  const handleSave = () => {
      if (editingLeadId) {
          // Edit Mode
          const existingLead = leads.find(l => l.id === editingLeadId);
          if (existingLead) {
              onEditLead({
                  ...existingLead,
                  name: formData.name,
                  phone: formData.phone,
                  source: formData.source as any,
                  value: formData.value,
                  notes: formData.notes
              });
          }
      } else {
          // Create Mode
          onAddLead({
              id: Math.random().toString(36).substr(2, 9),
              name: formData.name,
              phone: formData.phone,
              source: formData.source as any,
              stage: KanbanStage.NEW,
              value: formData.value,
              daysInStage: 0,
              lastContact: new Date().toLocaleDateString(),
              tags: ['Warm'],
              notes: formData.notes
          });
      }
      setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if (confirm('Tem certeza que deseja excluir este lead?')) {
          onDeleteLead(id);
      }
      setActiveMenuId(null);
  };

  // --- Drag & Drop Logic ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
      setDraggedLeadId(id);
      e.dataTransfer.effectAllowed = 'move';
      // Create a transparent drag image or use default
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stage: KanbanStage) => {
      e.preventDefault();
      if (draggedLeadId) {
          onUpdateStage(draggedLeadId, stage);
          setDraggedLeadId(null);
      }
  };

  const getColumnColor = (stage: KanbanStage) => {
    switch (stage) {
        case KanbanStage.NEW: return 'border-t-4 border-blue-400 bg-blue-50/30';
        case KanbanStage.SCHEDULED: return 'border-t-4 border-amber-400 bg-amber-50/30';
        case KanbanStage.BUDGET: return 'border-t-4 border-violet-400 bg-violet-50/30';
        case KanbanStage.CLOSED: return 'border-t-4 border-emerald-400 bg-emerald-50/30';
        default: return 'border-t-4 border-stone-300 bg-stone-50/30';
    }
  };

  const getTotalValue = (stage: KanbanStage) => {
      return filteredLeads
        .filter(l => l.stage === stage)
        .reduce((sum, l) => sum + l.value, 0);
  };

  return (
    <div className="h-full flex flex-col">
       {/* Header Toolbar */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
           <div>
                <h2 className="text-xl font-bold text-stone-800">Funil de Vendas</h2>
                <p className="text-sm text-stone-500">Gerencie leads, negociações e oportunidades.</p>
           </div>
           
           <div className="flex gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:flex-none">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                   <input 
                        type="text" 
                        placeholder="Filtrar leads..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-primary-100 outline-none"
                   />
               </div>
               <Button onClick={openNewLeadModal}>
                   <Plus size={18} className="mr-2"/> Novo Lead
               </Button>
           </div>
       </div>

       {/* Kanban Board */}
       <div className="flex-1 overflow-x-auto pb-4">
           <div className="flex gap-4 min-w-[1400px] h-full">
               {columns.map(stage => {
                   const stageLeads = filteredLeads.filter(l => l.stage === stage);
                   const total = getTotalValue(stage);
                   
                   return (
                       <div 
                            key={stage} 
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage)}
                            className={`flex-1 rounded-xl flex flex-col min-w-[300px] shadow-sm transition-colors ${getColumnColor(stage)}`}
                       >
                           {/* Column Header */}
                           <div className="p-3 border-b border-stone-200/50 bg-white/50 backdrop-blur-sm rounded-t-xl">
                               <div className="flex justify-between items-center mb-1">
                                   <span className="font-bold text-xs text-stone-700 uppercase tracking-wide">{stage}</span>
                                   <span className="bg-stone-200 text-stone-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                       {stageLeads.length}
                                   </span>
                               </div>
                               <div className="flex items-center text-xs font-medium text-stone-500">
                                    Total: <span className="text-stone-800 ml-1">R$ {total.toLocaleString('pt-BR')}</span>
                               </div>
                           </div>

                           {/* Cards Container */}
                           <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                               {stageLeads.length === 0 && (
                                   <div className="h-24 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-400 text-xs">
                                       Arraste leads aqui
                                   </div>
                               )}
                               
                               {stageLeads.map(lead => (
                                   <div 
                                        key={lead.id} 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, lead.id)}
                                        className={`bg-white p-3 rounded-lg shadow-sm border border-stone-100 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative ${draggedLeadId === lead.id ? 'opacity-50' : 'opacity-100'}`}
                                   >
                                       {/* Header: Avatar + Menu */}
                                       <div className="flex justify-between items-start mb-2">
                                           <div className="flex items-center gap-2">
                                               <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600 border border-stone-200">
                                                    {lead.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                                               </div>
                                               <div>
                                                   <h4 className="font-bold text-stone-800 text-sm leading-tight">{lead.name}</h4>
                                                   <span className="text-[10px] text-stone-400">{lead.phone}</span>
                                               </div>
                                           </div>
                                           <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === lead.id ? null : lead.id); }}
                                                className="text-stone-300 hover:text-stone-600 p-1 rounded hover:bg-stone-100"
                                           >
                                               <MoreHorizontal size={16}/>
                                           </button>
                                           
                                           {/* Dropdown Menu */}
                                           {activeMenuId === lead.id && (
                                                <div className="absolute right-2 top-8 bg-white shadow-xl border border-stone-100 rounded-lg z-20 w-32 py-1 animate-in zoom-in-95 duration-100">
                                                    <button onClick={() => openEditLeadModal(lead)} className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center">
                                                        <Edit2 size={12} className="mr-2"/> Editar
                                                    </button>
                                                    <button onClick={() => handleDelete(lead.id)} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center">
                                                        <Trash2 size={12} className="mr-2"/> Excluir
                                                    </button>
                                                </div>
                                           )}
                                           
                                           {/* Invisible Backdrop to close menu */}
                                           {activeMenuId === lead.id && (
                                               <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                                           )}
                                       </div>

                                       {/* Tags & Meta */}
                                       <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center ${lead.source === 'Instagram' ? 'bg-purple-50 text-purple-700 border-purple-100' : lead.source === 'Google' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                                {lead.source}
                                            </span>
                                            {lead.daysInStage > 7 && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-100 flex items-center" title="Estagnado">
                                                    <Clock size={10} className="mr-1"/> {lead.daysInStage}d
                                                </span>
                                            )}
                                            {lead.value > 0 && (
                                               <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">
                                                   R$ {lead.value.toLocaleString()}
                                               </span>
                                            )}
                                       </div>

                                       {/* Footer Actions */}
                                       <div className="flex items-center gap-2 pt-2 border-t border-stone-50">
                                            <a 
                                                href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex-1 py-1.5 text-xs bg-stone-50 hover:bg-green-50 text-stone-600 hover:text-green-700 rounded border border-stone-100 flex items-center justify-center transition-colors"
                                            >
                                                <MessageCircle size={12} className="mr-1"/> WhatsApp
                                            </a>
                                            {stage !== KanbanStage.CLOSED && (
                                                <button 
                                                    onClick={() => {
                                                        const idx = columns.indexOf(stage);
                                                        if (idx < columns.length - 1) onUpdateStage(lead.id, columns[idx+1]);
                                                    }}
                                                    className="p-1.5 text-stone-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                                    title="Avançar Fase"
                                                >
                                                    <ArrowRightCircle size={16} />
                                                </button>
                                            )}
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                   );
               })}
           </div>
       </div>

       {/* Edit/Create Modal */}
       <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title={editingLeadId ? "Editar Lead" : "Novo Lead"} 
            footer={
                <>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>{editingLeadId ? "Salvar Alterações" : "Criar Lead"}</Button>
                </>
            }
        >
           <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                        <Input label="Nome do Cliente" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <Input label="WhatsApp" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
                   <Select 
                        label="Origem" 
                        value={formData.source}
                        onChange={(e: any) => setFormData({...formData, source: e.target.value})}
                        options={[
                            {value: 'Instagram', label: 'Instagram'}, 
                            {value: 'Indicação', label: 'Indicação'}, 
                            {value: 'Google', label: 'Google Ads'}
                        ]} 
                    />
                   <Input label="Valor Potencial (R$)" type="number" value={formData.value} onChange={(e: any) => setFormData({...formData, value: Number(e.target.value)})} />
                   <div className="col-span-2">
                       <label className="block text-sm font-medium text-stone-700 mb-1.5">Anotações</label>
                       <textarea 
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Interesses, horários preferidos, etc..."
                       ></textarea>
                   </div>
               </div>
           </div>
       </Modal>
    </div>
  );
};

export default CRM;