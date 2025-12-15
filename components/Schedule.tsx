import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, MoreVertical, Calendar as CalIcon, MapPin, XCircle, Check, GripVertical, Star, Users } from 'lucide-react';
import { Appointment, AppointmentStatus, TreatmentType, Patient, Room } from '../types';
import { Modal, Button, Select, Input } from './Shared';

interface ScheduleProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (appt: Appointment) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}

const HOUR_HEIGHT = 100;
const START_HOUR = 8;
const END_HOUR = 19;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

const Schedule: React.FC<ScheduleProps> = ({ appointments, patients, onAddAppointment, onUpdateStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, id: string} | null>(null); // NEW: Context Menu
  const [formTime, setFormTime] = useState('09:00');
  const [formRoom, setFormRoom] = useState<Room>(Room.ROOM_1);

  // Close context menu on click elsewhere
  useEffect(() => {
      const handleClick = () => setContextMenu(null);
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, id });
  };

  const handleSlotClick = (hour: number, room: Room) => {
    setFormTime(`${hour < 10 ? '0' + hour : hour}:00`);
    setFormRoom(room);
    setIsModalOpen(true);
  };

  const handleSave = () => {
      const [h, m] = formTime.split(':').map(Number);
      const start = new Date(); start.setHours(h, m, 0, 0);
      onAddAppointment({
          id: Math.random().toString(), patientId: 'walk-in', patientName: 'Novo Paciente',
          start, durationMinutes: 30, type: TreatmentType.BOTOX, status: AppointmentStatus.SCHEDULED, room: formRoom, price: 500
      });
      setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden relative">
      
      {/* CONTEXT MENU */}
      {contextMenu && (
          <div 
            className="fixed bg-white dark:bg-stone-800 shadow-xl border border-stone-200 dark:border-stone-700 rounded-lg py-1 z-50 w-40 animate-in zoom-in-95 duration-75"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
              <div className="px-3 py-2 text-xs font-bold text-stone-400 uppercase border-b border-stone-100 dark:border-stone-700">Ações Rápidas</div>
              <button onClick={() => onUpdateStatus(contextMenu.id, AppointmentStatus.CONFIRMED)} className="w-full text-left px-4 py-2 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 text-emerald-600 flex items-center"><Check size={14} className="mr-2"/> Confirmar</button>
              <button onClick={() => onUpdateStatus(contextMenu.id, AppointmentStatus.CHECKED_IN)} className="w-full text-left px-4 py-2 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 text-blue-600 flex items-center"><MapPin size={14} className="mr-2"/> Check-in</button>
              <button onClick={() => onUpdateStatus(contextMenu.id, AppointmentStatus.CANCELED)} className="w-full text-left px-4 py-2 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 text-red-600 flex items-center"><XCircle size={14} className="mr-2"/> Cancelar</button>
          </div>
      )}

      <div className="flex-1 overflow-y-auto relative bg-stone-50/30 dark:bg-stone-950/30 custom-scrollbar">
          <div className="relative" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}> 
              {HOURS.map((h, i) => (
                  <div key={h} className="absolute w-full flex" style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}>
                      <div className="w-16 flex-shrink-0 flex justify-center pt-2 text-xs font-bold text-stone-400 border-r border-stone-200 dark:border-stone-800 border-b border-stone-100 dark:border-stone-800">{h}:00</div>
                      <div className="flex-1 border-b border-stone-100 dark:border-stone-800 flex relative">
                          {[Room.ROOM_1, Room.ROOM_2, Room.ROOM_3].map(r => (
                              <div key={r} className="w-1/3 h-full border-r border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-crosshair" onClick={() => handleSlotClick(h, r)}></div>
                          ))}
                      </div>
                  </div>
              ))}
              {/* CURRENT TIME LINE */}
              <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: `${((new Date().getHours() - START_HOUR) * 100) + ((new Date().getMinutes()/60)*100)}px` }}>
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                  <div className="h-px bg-red-500 w-full"></div>
              </div>

              {appointments.map(appt => (
                  <div 
                    key={appt.id}
                    onContextMenu={(e) => handleContextMenu(e, appt.id)} // Right Click Trigger
                    className={`absolute mx-1 rounded-lg border p-2 flex flex-col justify-between cursor-pointer hover:shadow-md hover:z-30 transition-all bg-white dark:bg-stone-800 border-l-4 border-l-primary-500`}
                    style={{ 
                        top: `${((appt.start.getHours() - START_HOUR) * 100) + ((appt.start.getMinutes()/60) * 100)}px`, 
                        height: `${(appt.durationMinutes / 60) * 100 - 4}px`, 
                        left: appt.room === Room.ROOM_1 ? '0%' : appt.room === Room.ROOM_2 ? '33.33%' : '66.66%', 
                        width: 'calc(33.33% - 8px)' 
                    }}
                  >
                      <div className="flex justify-between items-start">
                          <span className="font-bold text-xs truncate dark:text-stone-200">{appt.patientName}</span>
                          <div className={`w-2 h-2 rounded-full ${appt.status === 'Confirmed' ? 'bg-emerald-500' : 'bg-stone-300'}`}></div>
                      </div>
                      <div className="text-[10px] opacity-80 dark:text-stone-400">{appt.type}</div>
                  </div>
              ))}
          </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agendar" footer={<Button onClick={handleSave}>Salvar</Button>}>
          <div className="space-y-4">
              <Input type="time" label="Início" value={formTime} onChange={(e:any) => setFormTime(e.target.value)} />
              <Select label="Sala" value={formRoom} onChange={(e:any) => setFormRoom(e.target.value)} options={Object.values(Room).map(r => ({value: r, label: r}))} />
          </div>
      </Modal>
    </div>
  );
};

export default Schedule;