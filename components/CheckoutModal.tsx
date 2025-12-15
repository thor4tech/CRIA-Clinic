import React, { useState, useEffect } from 'react';
import { Appointment, Transaction } from '../types';
import { Modal, Button, Input, Select } from './Shared';
import { DollarSign, User, Calculator, CreditCard, Sparkles } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onConfirm: (transaction: Transaction) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, appointment, onConfirm }) => {
  const [items, setItems] = useState<{desc: string, val: number}[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  
  // Reset when appointment changes
  useEffect(() => {
    if (appointment) {
        if (appointment.consumption && appointment.consumption.length > 0) {
            // Load items from Prontuário/FaceMap
            setItems(appointment.consumption.map(c => ({
                desc: `${c.name} (${c.quantity})`,
                val: c.total
            })));
        } else {
            // Default generic item
            setItems([{ desc: appointment.type, val: appointment.price }]);
        }
        setDiscount(0);
    }
  }, [appointment]);

  if (!appointment) return null;

  const subtotal = items.reduce((acc, item) => acc + item.val, 0);
  const total = subtotal - discount;
  
  // Business Rule: Split Calculation (Example: 70% Clinic, 30% Doctor)
  const commissionRate = 0.3; 
  const doctorShare = total * commissionRate;
  const clinicShare = total - doctorShare;

  const handleConfirm = () => {
    const transaction: Transaction = {
        id: Math.random().toString(36),
        date: new Date().toISOString(),
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        service: items.map(i => i.desc).join(', '),
        amount: total,
        type: 'Income',
        status: 'Paid',
        method: paymentMethod as any,
        clinicShare,
        doctorShare
    };
    onConfirm(transaction);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout & Pagamento" footer={
        <>
            <Button variant="secondary" onClick={onClose}>Voltar</Button>
            <Button variant="primary" onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700">
                <DollarSign size={16} className="mr-2"/> Receber R$ {total.toLocaleString()}
            </Button>
        </>
    }>
        <div className="space-y-6">
            {/* Header Summary */}
            <div className="flex items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                <div className="h-12 w-12 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden mr-4">
                     <User size={24} className="text-stone-400" />
                </div>
                <div>
                    <h4 className="font-bold text-stone-800">{appointment.patientName}</h4>
                    <p className="text-sm text-stone-500">{appointment.type} • {appointment.durationMinutes} min</p>
                </div>
            </div>

            {/* Items List */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h5 className="text-xs font-bold text-stone-500 uppercase">Itens do Pedido</h5>
                    {appointment.consumption && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded flex items-center">
                            <Sparkles size={10} className="mr-1"/> Importado do FaceMap
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white border border-stone-100 rounded">
                            <span>{item.desc}</span>
                            <span className="font-mono font-medium">R$ {item.val.toLocaleString()}</span>
                        </div>
                    ))}
                    {/* Simulator for adding product */}
                    <button 
                        onClick={() => setItems([...items, {desc: 'Creme Home Care', val: 150}])}
                        className="text-xs text-primary-600 hover:underline flex items-center mt-2"
                    >
                        + Adicionar Produto (Simulação)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <Input 
                    label="Desconto (R$)" 
                    type="number" 
                    value={discount} 
                    onChange={(e: any) => setDiscount(Number(e.target.value))} 
                />
                <Select 
                    label="Forma de Pagamento" 
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    options={[
                        {value: 'Credit Card', label: 'Cartão Crédito (até 12x)'},
                        {value: 'Pix', label: 'Pix (À vista)'},
                        {value: 'Cash', label: 'Dinheiro'},
                        {value: 'Split', label: 'Misto (Pix + Cartão)'}
                    ]} 
                />
            </div>

            {/* Financial Split Preview */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center text-blue-800 font-medium text-sm mb-3">
                    <Calculator size={16} className="mr-2"/> Simulação de Repasse (30%)
                </div>
                <div className="flex gap-4">
                    <div className="flex-1 bg-white p-2 rounded border border-blue-100 shadow-sm">
                        <p className="text-xs text-stone-500">Clínica</p>
                        <p className="font-bold text-stone-800">R$ {clinicShare.toLocaleString()}</p>
                    </div>
                     <div className="flex-1 bg-white p-2 rounded border border-blue-100 shadow-sm">
                        <p className="text-xs text-stone-500">Profissional</p>
                        <p className="font-bold text-stone-800">R$ {doctorShare.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
  );
};

export default CheckoutModal;