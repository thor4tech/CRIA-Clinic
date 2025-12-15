import React, { useState, useMemo } from 'react';
import { 
    Download, Filter, Search, PlusCircle, CreditCard, TrendingUp, TrendingDown, 
    ArrowUpRight, ArrowDownRight, PieChart, Calendar, DollarSign, Users, 
    FileText, CheckCircle, Clock, AlertCircle, ChevronDown, MoreHorizontal,
    Printer, Share2, Paperclip, RefreshCw, BarChart3, Calculator
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../types';
import { Button, EmptyState, Modal, Input, Select, Toast } from './Shared';

interface FinanceProps {
    transactions: Transaction[];
    onAddTransaction: (t: Transaction) => void;
}

// ... (Mock Data omitted for brevity, assume existing) ...
const generateChartData = (transactions: Transaction[]) => [
    { name: '01', income: 4000, expense: 2400 },
    { name: '15', income: 3908, expense: 2780 },
    { name: '30', income: 7300, expense: 3490 },
]; // Simplified

const Finance: React.FC<FinanceProps> = ({ transactions, onAddTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [installments, setInstallments] = useState(1); // NEW: Installments

  const handleAdd = () => {
    const totalVal = Number(amount);
    const valPerInst = totalVal / installments;
    
    // Create multiple transactions if installments > 1
    for(let i=0; i<installments; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        
        onAddTransaction({
            id: Math.random().toString(36),
            date: date.toISOString(),
            patientId: 'manual',
            patientName: `${description} (${i+1}/${installments})`,
            service: 'Lançamento Manual',
            amount: valPerInst,
            type: 'Income',
            status: i === 0 ? 'Paid' : 'Pending', // First one paid, rest pending
            method: 'Credit Card',
            clinicShare: valPerInst,
            doctorShare: 0
        });
    }
    setIsModalOpen(false);
    setAmount(''); setDescription(''); setInstallments(1);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Gestão Financeira</h1>
          <Button onClick={() => setIsModalOpen(true)} className="bg-stone-900 text-white"><PlusCircle size={16} className="mr-2"/> Novo Lançamento</Button>
      </div>

      {/* Simplified Chart for space */}
      <div className="h-64 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generateChartData(transactions)}>
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 dark:bg-stone-800 text-xs text-stone-500 uppercase font-semibold">
                  <tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Descrição</th><th className="px-6 py-4 text-right">Valor</th><th className="px-6 py-4 text-center">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
                  {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                          <td className="px-6 py-4 text-stone-500">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-bold text-stone-800 dark:text-stone-200">{t.patientName}</td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600">R$ {t.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                              {t.status === 'Pending' && new Date(t.date) < new Date() ? (
                                  <span className="text-red-500 text-xs font-bold flex items-center justify-center"><AlertCircle size={12} className="mr-1"/> Vencido</span>
                              ) : (
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Lançamento com Parcelamento" footer={<Button onClick={handleAdd}>Lançar</Button>}>
        <div className="space-y-4">
            <Input label="Descrição" value={description} onChange={(e: any) => setDescription(e.target.value)} />
            <Input label="Valor Total (R$)" type="number" value={amount} onChange={(e: any) => setAmount(e.target.value)} />
            
            <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-100 dark:border-stone-700">
                <div className="flex items-center text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                    <Calculator size={16} className="mr-2"/> Simular Parcelamento
                </div>
                <input 
                    type="range" min="1" max="12" 
                    value={installments} 
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-xs text-stone-500">
                    <span>1x</span>
                    <span className="font-bold text-primary-600 text-lg">{installments}x de R$ {(Number(amount)/installments || 0).toFixed(2)}</span>
                    <span>12x</span>
                </div>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Finance;