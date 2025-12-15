import React, { useState, useEffect, useRef } from 'react';
import { 
    ArrowRight, Check, Sparkles, Building2, MapPin, 
    Palette, Target, ChevronLeft, Upload, Zap, ShieldCheck,
    Users, Briefcase, Wand2, ArrowUpRight
} from 'lucide-react';
import { Input, Select, Button } from './Shared';

export interface OnboardingData {
    clinicName: string;
    ownerName: string;
    role: string;
    phone: string;
    cep: string;
    address: string;
    specialties: string[];
    primaryGoal: string;
    teamSize: string;
    theme: 'rose' | 'gold' | 'emerald' | 'blue' | 'violet';
    demoData: boolean;
}

interface Props {
  onComplete: (data: OnboardingData) => void;
}

const THEMES: {id: OnboardingData['theme'], color: string, label: string}[] = [
    { id: 'rose', color: 'bg-rose-500', label: 'Rose Premium' },
    { id: 'gold', color: 'bg-amber-400', label: 'Gold Luxury' },
    { id: 'emerald', color: 'bg-emerald-500', label: 'Clinical Green' },
    { id: 'blue', color: 'bg-blue-500', label: 'Tech Blue' },
    { id: 'violet', color: 'bg-violet-500', label: 'Creative Violet' },
];

const SPECIALTIES = [
    "Harmonização Facial", "Dermatologia", "Estética Corporal", 
    "Depilação a Laser", "Odontologia Estética", "Cirurgia Plástica",
    "Spa & Relaxamento", "Tricologia"
];

const GOALS = [
    { id: 'finance', icon: ArrowUpRight, label: 'Organizar Financeiro' },
    { id: 'growth', icon: Zap, label: 'Atrair Mais Pacientes' },
    { id: 'organize', icon: Building2, label: 'Profissionalizar Gestão' },
    { id: 'time', icon: ClockIcon, label: 'Ganhar Tempo' },
];

// Mock Icon component
function ClockIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
      clinicName: '', ownerName: '', role: 'owner', phone: '',
      cep: '', address: '', specialties: [], primaryGoal: '',
      teamSize: '1-5', theme: 'rose', demoData: true
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const processMessages = [
      "Criando banco de dados criptografado...",
      "Configurando agenda inteligente...",
      "Importando protocolos de estética...",
      "Aplicando identidade visual...",
      "Finalizando..."
  ];

  const handleNext = () => {
      if (step < 5) setStep(s => s + 1);
      else startProcessing();
  };

  const handleBack = () => {
      if (step > 1) setStep(s => s - 1);
  };

  const startProcessing = () => {
      setIsProcessing(true);
      let i = 0;
      const interval = setInterval(() => {
          setProcessStep(i);
          i++;
          if (i >= processMessages.length) {
              clearInterval(interval);
              setTimeout(() => onComplete(data), 800);
          }
      }, 800);
  };

  const toggleSpecialty = (spec: string) => {
      if (data.specialties.includes(spec)) {
          setData({...data, specialties: data.specialties.filter(s => s !== spec)});
      } else {
          setData({...data, specialties: [...data.specialties, spec]});
      }
  };

  const handleCepBlur = () => {
      if (data.cep.length >= 8) {
          setData(prev => ({...prev, address: 'Av. Brasil, 1500 - Jardins, São Paulo'}));
      }
  };

  const getThemeGlow = () => {
      switch(data.theme) {
          case 'gold': return 'shadow-amber-500/20 border-amber-500/50';
          case 'emerald': return 'shadow-emerald-500/20 border-emerald-500/50';
          case 'blue': return 'shadow-blue-500/20 border-blue-500/50';
          case 'violet': return 'shadow-violet-500/20 border-violet-500/50';
          default: return 'shadow-rose-500/20 border-rose-500/50';
      }
  };

  const getThemeText = () => {
      switch(data.theme) {
          case 'gold': return 'text-amber-400';
          case 'emerald': return 'text-emerald-400';
          case 'blue': return 'text-blue-400';
          case 'violet': return 'text-violet-400';
          default: return 'text-rose-400';
      }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 md:p-8 text-white relative overflow-hidden font-sans selection:bg-rose-500/30">
       
       {/* Mesh Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
         <div className={`absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] opacity-10 transition-colors duration-1000 ${data.theme === 'rose' ? 'bg-rose-600' : data.theme === 'gold' ? 'bg-amber-600' : 'bg-blue-600'}`}></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-900/40 rounded-full blur-[150px] opacity-20"></div>
         <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px]"></div>
      </div>

      <div className={`max-w-2xl w-full z-10 transition-all duration-500 ${isProcessing ? 'scale-95 opacity-90' : 'scale-100'}`}>
        
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md">
                    <Sparkles size={24} className={getThemeText()} />
                </div>
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/5 text-stone-400">Setup Wizard 2.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-white">
                Aesthetik<span className={`font-light ${getThemeText()}`}>Flow</span>
            </h1>
            <p className="text-stone-400 text-lg">A plataforma definitiva para clínicas de alta performance.</p>
        </div>

        {/* Main Card */}
        <div className={`bg-stone-900/40 backdrop-blur-2xl border border-white/10 p-1 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-500 ${isProcessing ? 'h-[400px]' : 'min-h-[500px]'}`}>
            
            {!isProcessing && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
                    <div 
                        className={`h-full transition-all duration-500 ease-out ${data.theme === 'gold' ? 'bg-amber-500' : data.theme === 'emerald' ? 'bg-emerald-500' : data.theme === 'blue' ? 'bg-blue-500' : data.theme === 'violet' ? 'bg-violet-500' : 'bg-rose-500'}`} 
                        style={{ width: `${(step / 5) * 100}%` }}
                    ></div>
                </div>
            )}

            <div className="p-6 md:p-8 h-full flex flex-col">
                {isProcessing ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
                        <div className="relative mb-8">
                            <div className={`w-24 h-24 rounded-full border-4 border-t-transparent animate-spin ${data.theme === 'gold' ? 'border-amber-500' : 'border-rose-500'}`}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Wand2 size={32} className="text-white opacity-80" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-white">{processMessages[processStep]}</h3>
                        <p className="text-stone-500">Isso leva menos de um minuto.</p>
                    </div>
                ) : (
                    <>
                        {/* STEPS SIMPLIFIED FOR BREVITY - RETAINING LOGIC */}
                        {step === 1 && (
                            <div className="flex-1 animate-slide-in-right space-y-6">
                                <div><h2 className="text-2xl font-bold mb-1">Identidade da Clínica</h2></div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-stone-500 uppercase ml-1">Nome da Clínica</label>
                                        <input autoFocus value={data.clinicName} onChange={(e) => setData({...data, clinicName: e.target.value})} className="w-full bg-stone-800/50 border border-stone-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50" placeholder="Ex: Belle Clinic"/>
                                    </div>
                                    <input value={data.ownerName} onChange={(e) => setData({...data, ownerName: e.target.value})} className="w-full bg-stone-800/50 border border-stone-700 rounded-xl px-4 py-3 text-white" placeholder="Seu Nome"/>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                             <div className="flex-1 animate-slide-in-right space-y-6">
                                <div><h2 className="text-2xl font-bold mb-1">Localização</h2></div>
                                <input value={data.cep} onChange={(e) => setData({...data, cep: e.target.value})} onBlur={handleCepBlur} className="w-full bg-stone-800/50 border border-stone-700 rounded-xl px-4 py-3.5 text-white" placeholder="CEP"/>
                                <input value={data.address} onChange={(e) => setData({...data, address: e.target.value})} className="w-full bg-stone-800/50 border border-stone-700 rounded-xl px-4 py-3.5 text-white" placeholder="Endereço"/>
                             </div>
                        )}

                        {step === 3 && (
                            <div className="flex-1 animate-slide-in-right space-y-6">
                                <div><h2 className="text-2xl font-bold mb-1">Especialidades</h2></div>
                                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {SPECIALTIES.map(spec => (
                                        <button key={spec} onClick={() => toggleSpecialty(spec)} className={`p-4 rounded-xl border text-left flex items-center justify-between ${data.specialties.includes(spec) ? `bg-white text-black border-white` : 'bg-stone-800/30 border-stone-700 text-stone-300'}`}>
                                            <span className="text-sm font-medium">{spec}</span>
                                            {data.specialties.includes(spec) && <Check size={16} className="text-black"/>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="flex-1 animate-slide-in-right space-y-6">
                                <div><h2 className="text-2xl font-bold mb-1">Foco Principal</h2></div>
                                <div className="space-y-3">
                                    {GOALS.map(goal => (
                                        <button key={goal.id} onClick={() => setData({...data, primaryGoal: goal.id})} className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 ${data.primaryGoal === goal.id ? `bg-gradient-to-r from-rose-500 to-rose-600 border-rose-500 text-white` : 'bg-stone-800/30 border-stone-700 text-stone-300'}`}>
                                            <goal.icon size={20} /> <span className="block font-bold text-sm">{goal.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="flex-1 animate-slide-in-right space-y-6">
                                <div><h2 className="text-2xl font-bold mb-1">Estilo Visual</h2></div>
                                <div className="grid grid-cols-1 gap-3">
                                    {THEMES.map(theme => (
                                        <button key={theme.id} onClick={() => setData({...data, theme: theme.id})} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${data.theme === theme.id ? `bg-stone-800 border-white/20 ring-1 ring-white/10` : 'border-transparent hover:bg-white/5'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${theme.color} shadow-lg`}></div>
                                                <span className={`font-medium ${data.theme === theme.id ? 'text-white' : 'text-stone-400'}`}>{theme.label}</span>
                                            </div>
                                            {data.theme === theme.id && <div className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold uppercase">Ativo</div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 mt-2 border-t border-white/5 flex items-center justify-between">
                            {step > 1 ? <button onClick={handleBack} className="text-stone-500 hover:text-white flex items-center px-2 py-2 text-sm font-medium"><ChevronLeft size={16} className="mr-1"/> Voltar</button> : <div></div>}
                            <button onClick={handleNext} disabled={step === 1 && !data.clinicName} className={`flex items-center px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 ${data.theme === 'rose' ? 'bg-rose-600' : 'bg-stone-700'} text-white`}>
                                {step === 5 ? 'Finalizar Setup' : 'Continuar'} <ArrowRight size={18} className="ml-2" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;