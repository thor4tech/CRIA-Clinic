import React, { useState } from 'react';
import { 
    Gift, Share2, Copy, Check, Clock, AlertTriangle, 
    TrendingUp, Shield, Crown, ChevronRight, Info, Award
} from 'lucide-react';
import { Referral, ReferralStatus, ReferralTier } from '../types';
import { Button, Toast, Modal } from './Shared';

interface ReferralsProps {
    referrals: Referral[];
    referralCode: string;
    onInvite: () => void; // Tracking purpose
}

const Referrals: React.FC<ReferralsProps> = ({ referrals, referralCode, onInvite }) => {
    const [copied, setCopied] = useState(false);
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

    // --- LOGIC & CALCULATIONS ---
    const validCount = referrals.filter(r => r.status === ReferralStatus.VALID).length;
    const validatingCount = referrals.filter(r => r.status === ReferralStatus.VALIDATING).length;
    const totalEarned = referrals.filter(r => r.rewardReleased).reduce((sum, r) => sum + r.rewardAmount, 0);
    const pendingRewards = referrals.filter(r => r.status === ReferralStatus.VALIDATING).reduce((sum, r) => sum + r.rewardAmount, 0);

    // Tier Logic
    let currentTier = ReferralTier.BRONZE;
    let nextTier = ReferralTier.SILVER;
    let progress = 0;
    let target = 1;
    let nextReward = "1 Mensalidade Grátis";

    if (validCount >= 10) {
        currentTier = ReferralTier.DIAMOND;
        nextTier = ReferralTier.DIAMOND;
        progress = 100;
        target = 10;
        nextReward = "Parceiro Vitalício (Benefícios Máximos)";
    } else if (validCount >= 5) {
        currentTier = ReferralTier.GOLD;
        nextTier = ReferralTier.DIAMOND;
        progress = ((validCount - 5) / (10 - 5)) * 100;
        target = 10;
        nextReward = "Mensalidade Reduzida";
    } else if (validCount >= 3) {
        currentTier = ReferralTier.SILVER;
        nextTier = ReferralTier.GOLD;
        progress = ((validCount - 3) / (5 - 3)) * 100;
        target = 5;
        nextReward = "Upgrade Permanente de Plano";
    } else if (validCount >= 1) {
        currentTier = ReferralTier.BRONZE;
        nextTier = ReferralTier.SILVER;
        progress = ((validCount - 1) / (3 - 1)) * 100;
        target = 3;
        nextReward = "1 Mensalidade Grátis";
    } else {
        // Starter
        progress = (validCount / 1) * 100;
        target = 1;
        nextReward = "R$ 100,00 em Créditos";
    }

    // --- HANDLERS ---
    const referralLink = `https://aesthetikflow.app/convite/${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsAppShare = () => {
        const msg = `Olá! Estou usando o Aesthetik Flow na minha clínica e está transformando minha gestão. \n\nConsegui um link especial para você testar:\n${referralLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
        onInvite();
    };

    const getStatusBadge = (status: ReferralStatus) => {
        switch (status) {
            case ReferralStatus.VALID:
                return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase flex items-center w-fit"><Check size={10} className="mr-1"/> Válida</span>;
            case ReferralStatus.VALIDATING:
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase flex items-center w-fit"><Clock size={10} className="mr-1"/> Em Validação (30d)</span>;
            case ReferralStatus.INVITED:
                return <span className="px-2 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase flex items-center w-fit">Convite Enviado</span>;
            case ReferralStatus.FRAUD:
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase flex items-center w-fit"><Shield size={10} className="mr-1"/> Bloqueado</span>;
            default:
                return <span className="px-2 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase flex items-center w-fit">{status}</span>;
        }
    };

    const getTierIcon = (tier: ReferralTier) => {
        switch (tier) {
            case ReferralTier.DIAMOND: return <Crown size={24} className="text-cyan-400" fill="currentColor"/>;
            case ReferralTier.GOLD: return <Award size={24} className="text-yellow-400" fill="currentColor"/>;
            case ReferralTier.SILVER: return <Award size={24} className="text-stone-300" fill="currentColor"/>;
            default: return <Award size={24} className="text-orange-400" fill="currentColor"/>;
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* 1. HERO & GAMIFICATION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Current Status Card */}
                <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-[60px] opacity-20"></div>
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Nível Atual</p>
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                {getTierIcon(currentTier)}
                                {currentTier}
                            </h3>
                        </div>
                        <div className="text-right">
                             <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Créditos Disponíveis</p>
                             <h3 className="text-3xl font-bold text-emerald-400">R$ {totalEarned}</h3>
                             {pendingRewards > 0 && <p className="text-xs text-stone-400">R$ {pendingRewards} pendentes</p>}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-stone-300">Progresso para {nextTier}</span>
                            <span className="text-primary-300 font-bold">{validCount} / {target} Validadas</span>
                        </div>
                        <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="mt-3 text-xs text-stone-400 flex items-center">
                            <Gift size={12} className="mr-1.5 text-primary-400"/>
                            Próxima recompensa: <strong className="text-white ml-1">{nextReward}</strong>
                        </p>
                    </div>
                </div>

                {/* Share Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-stone-900">Indique e Ganhe</h3>
                                <p className="text-stone-500 text-sm">Convide amigos donos de clínica. Você ganha créditos e eles ganham isenção na implantação.</p>
                            </div>
                            <button onClick={() => setIsRulesModalOpen(true)} className="text-primary-600 text-xs font-bold hover:underline flex items-center">
                                <Info size={12} className="mr-1"/> Como funciona?
                            </button>
                        </div>
                        
                        <div className="flex gap-3 mb-4">
                            <div className="flex-1 relative">
                                <input 
                                    readOnly 
                                    value={referralLink} 
                                    className="w-full bg-stone-50 border border-stone-200 text-stone-600 text-sm rounded-lg px-4 py-3 focus:outline-none"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                     <button 
                                        onClick={handleCopy}
                                        className="p-1.5 hover:bg-white rounded-md text-stone-400 hover:text-primary-600 transition-colors shadow-sm"
                                        title="Copiar Link"
                                     >
                                         {copied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                                     </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                         <Button onClick={handleWhatsAppShare} className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-[#25D366]/20">
                             <Share2 size={16} className="mr-2"/> Enviar no WhatsApp
                         </Button>
                         <Button variant="secondary" onClick={handleCopy} className="flex-1">
                             <Copy size={16} className="mr-2"/> Copiar Código: {referralCode}
                         </Button>
                    </div>
                </div>
            </div>

            {/* 2. REFERRALS LIST */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-stone-800 flex items-center">
                        Minhas Indicações 
                        <span className="ml-2 bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full text-xs">{referrals.length}</span>
                    </h3>
                    <div className="flex gap-2">
                        {/* Legend */}
                        <div className="flex items-center gap-2 text-[10px] text-stone-500">
                             <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div> Válida</span>
                             <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div> Em Validação</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50 text-xs text-stone-500 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Clínica Indicada</th>
                                <th className="px-6 py-4">Data Convite</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Recompensa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {referrals.map(referral => (
                                <tr key={referral.id} className="hover:bg-stone-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-stone-800 text-sm">{referral.referredClinicName}</p>
                                        <p className="text-xs text-stone-500">{referral.contactName}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-stone-600">
                                        {new Date(referral.dateInvited).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(referral.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-bold text-sm ${referral.status === ReferralStatus.VALID ? 'text-emerald-600' : 'text-stone-400'}`}>
                                            R$ {referral.rewardAmount}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {referrals.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-stone-400">
                                        <Gift size={32} className="mx-auto mb-2 opacity-50"/>
                                        <p>Você ainda não fez indicações.</p>
                                        <p className="text-xs mt-1">Compartilhe seu link acima para começar a ganhar.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* RULES MODAL */}
            <Modal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} title="Regras do Programa de Indicação">
                <div className="space-y-4">
                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-100">
                        <h4 className="font-bold text-stone-800 mb-2">Como ganho a recompensa?</h4>
                        <ol className="list-decimal list-inside text-sm text-stone-600 space-y-2">
                            <li>Você compartilha seu link exclusivo.</li>
                            <li>A clínica indicada se cadastra e <strong>ativa a assinatura</strong>.</li>
                            <li>O sistema aguarda um período de <strong>30 dias de permanência</strong> (período antifraude).</li>
                            <li>Após 30 dias, a indicação se torna <strong className="text-emerald-600">VÁLIDA</strong> e o crédito é liberado automaticamente na sua conta.</li>
                        </ol>
                    </div>

                    <div>
                        <h4 className="font-bold text-stone-800 mb-2">Importante</h4>
                        <ul className="text-sm text-stone-600 space-y-2">
                            <li className="flex items-start">
                                <AlertTriangle size={14} className="mr-2 mt-0.5 text-amber-500 shrink-0"/>
                                Indicações canceladas antes de 30 dias não geram recompensa.
                            </li>
                             <li className="flex items-start">
                                <Shield size={14} className="mr-2 mt-0.5 text-blue-500 shrink-0"/>
                                O sistema bloqueia automaticamente tentativas de auto-indicação ou dados duplicados (CPF/CNPJ).
                            </li>
                             <li className="flex items-start">
                                <TrendingUp size={14} className="mr-2 mt-0.5 text-primary-500 shrink-0"/>
                                Os créditos são aplicados automaticamente na sua próxima fatura.
                            </li>
                        </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-stone-100">
                        <Button className="w-full" onClick={() => setIsRulesModalOpen(false)}>Entendi</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Referrals;