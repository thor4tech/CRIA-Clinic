import React, { useRef, useState, useEffect } from 'react';
import { 
    PenTool, Eraser, MousePointer2, Save, Upload, User, ArrowLeft, 
    Maximize2, Minimize2, Undo, Redo, Layers, Eye, EyeOff, 
    ZoomIn, ZoomOut, AlertTriangle, FileText, ChevronDown, Camera, Type
} from 'lucide-react';
import { Button, EmptyState, Select } from './Shared';
import { Patient, ConsumptionItem } from '../types';

type Tool = 'pointer' | 'toxin' | 'filler' | 'threads' | 'eraser' | 'text';

interface Point {
    id: string;
    x: number;
    y: number;
    type: Tool;
    product: string;
    quantity: number;
    text?: string;
}

interface Product {
    id: string;
    name: string;
    type: Tool;
    unitPrice: number;
    color: string;
    step: number;
}

const PRODUCTS: Product[] = [
    { id: 'botox', name: 'Botox (Allergan)', type: 'toxin', unitPrice: 20, color: '#ef4444', step: 2 },
    { id: 'dysport', name: 'Dysport (Galderma)', type: 'toxin', unitPrice: 15, color: '#f97316', step: 3 },
    { id: 'restylane', name: 'Restylane (Lyft)', type: 'filler', unitPrice: 900, color: '#3b82f6', step: 0.1 },
    { id: 'juvederm', name: 'Juvederm (Voluma)', type: 'filler', unitPrice: 950, color: '#8b5cf6', step: 0.1 },
    { id: 'pdothread', name: 'Fios PDO (Liso)', type: 'threads', unitPrice: 150, color: '#10b981', step: 1 },
];

const REAL_PATIENT_IMAGE = "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop";

interface FaceMapProps {
    patientId: string | null;
    patients: Patient[];
    onBack: () => void;
    onSaveSession: (items: ConsumptionItem[]) => void;
}

const FaceMap: React.FC<FaceMapProps> = ({ patientId, patients, onBack, onSaveSession }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [activeProduct, setActiveProduct] = useState<Product>(PRODUCTS[0]);
  const [activeTool, setActiveTool] = useState<Tool>('toxin');
  const [points, setPoints] = useState<Point[]>([]);
  const [history, setHistory] = useState<Point[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'map' | 'comparison'>('map');
  const [showAnatomy, setShowAnatomy] = useState(false);
  const [showSafetyZones, setShowSafetyZones] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const selectedPatient = patients.find(p => p.id === patientId);

  useEffect(() => {
    if (canvasRef.current) drawCanvas();
  }, [points, zoom, showAnatomy, showSafetyZones, activeProduct]);

  const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (showAnatomy) {
          ctx.fillStyle = "rgba(255, 100, 100, 0.1)";
          ctx.fillRect(100, 150, 400, 500); 
      }

      if (showSafetyZones) {
          ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
          ctx.beginPath();
          ctx.arc(300, 400, 40, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = "orange";
          ctx.lineWidth = 2;
          ctx.stroke();
      }

      points.forEach(p => {
          if (p.type === 'text' && p.text) {
              ctx.font = `bold ${14/zoom}px Inter`;
              ctx.fillStyle = "black";
              ctx.fillText(p.text, p.x, p.y);
              return;
          }

          const product = PRODUCTS.find(prod => prod.id === p.product);
          const color = product ? product.color : '#000';
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6 / zoom, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1.5 / zoom;
          ctx.stroke();
          
          if (zoom > 1.2) {
              ctx.font = `bold ${10/zoom}px Inter`;
              ctx.fillStyle = "white";
              ctx.shadowColor="black";
              ctx.shadowBlur=2;
              ctx.fillText(p.type === 'toxin' ? `${p.quantity}u` : `${p.quantity}ml`, p.x + (8/zoom), p.y);
              ctx.shadowBlur=0;
          }
      });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'pointer') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (activeTool === 'eraser') {
        const newPoints = points.filter(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) > 15);
        updateHistory(newPoints);
        return;
    }

    if (activeTool === 'text') {
        const text = prompt("Digite a anotação:");
        if (text) {
            const newPoint: Point = { id: Math.random().toString(), x, y, type: 'text', product: '', quantity: 0, text };
            updateHistory([...points, newPoint]);
        }
        return;
    }

    const newPoint: Point = {
        id: Math.random().toString(36), x, y, type: activeTool, product: activeProduct.id, quantity: activeProduct.step
    };
    updateHistory([...points, newPoint]);
  };

  const handleWheel = (e: React.WheelEvent) => {
      if (viewMode !== 'map') return;
      if (e.deltaY < 0) setZoom(z => Math.min(z + 0.1, 3));
      else setZoom(z => Math.max(z - 0.1, 0.5));
  };

  const updateHistory = (newPoints: Point[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newPoints);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setPoints(newPoints);
  };

  const handleUndo = () => {
      if (historyIndex > 0) {
          setHistoryIndex(historyIndex - 1);
          setPoints(history[historyIndex - 1]);
      } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setPoints([]);
      }
  };

  const ToolBtn = ({ id, icon: Icon, label, active }: any) => (
      <button 
        onClick={() => { setActiveTool(id); if(id === 'toxin') setActiveProduct(PRODUCTS[0]); if(id==='filler') setActiveProduct(PRODUCTS[2]); }}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16 h-16 mb-2 ${active ? 'bg-stone-800 text-white shadow-lg scale-105' : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'}`}
      >
          <Icon size={20} className="mb-1"/>
          <span className="text-[9px] font-bold uppercase">{label}</span>
      </button>
  );

  if (!selectedPatient) return <EmptyState title="Erro" description="Paciente não encontrado" icon={AlertTriangle} />;

  return (
    <div className={`flex flex-col h-full space-y-4 ${isFullScreen ? 'fixed inset-0 z-50 bg-stone-50 p-6' : ''}`}>
        <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-3 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800">
            <div className="flex items-center space-x-4">
                {!isFullScreen && <button onClick={onBack} className="p-2 hover:bg-stone-100 rounded-full"><ArrowLeft size={20}/></button>}
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-stone-200 overflow-hidden"><img src={selectedPatient.avatarUrl} alt="Patient" /></div>
                    <div>
                        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">{selectedPatient.name}</h2>
                        <span className="text-xs text-stone-500">Histórico: Hoje</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="primary" onClick={() => onSaveSession([])} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200">
                    <Save size={16} className="mr-2" /> Salvar Sessão
                </Button>
            </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden relative">
            <div className="absolute left-4 top-4 bottom-4 w-20 flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white pointer-events-auto">
                    <ToolBtn id="pointer" icon={MousePointer2} label="Mover" active={activeTool === 'pointer'} />
                    <ToolBtn id="text" icon={Type} label="Texto" active={activeTool === 'text'} />
                    <div className="h-px bg-stone-200 w-full my-2"></div>
                    <ToolBtn id="toxin" icon={PenTool} label="Toxina" active={activeTool === 'toxin'} />
                    <ToolBtn id="filler" icon={PenTool} label="Preench." active={activeTool === 'filler'} />
                    <ToolBtn id="eraser" icon={Eraser} label="Apagar" active={activeTool === 'eraser'} />
                    <div className="mt-2 flex flex-col gap-2">
                        <button onClick={handleUndo} className="p-2 text-stone-400 hover:text-stone-800 rounded-lg"><Undo size={18}/></button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-stone-100/50 dark:bg-stone-900/50 rounded-2xl flex items-center justify-center relative overflow-hidden border border-stone-200 shadow-inner select-none" onWheel={handleWheel}>
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                     <div className="bg-white/90 backdrop-blur p-2 rounded-xl shadow-sm border border-stone-100 flex flex-col gap-2">
                        <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-2 hover:bg-stone-100 rounded-lg"><ZoomIn size={18}/></button>
                        <span className="text-[10px] text-center font-mono text-stone-400">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 hover:bg-stone-100 rounded-lg"><ZoomOut size={18}/></button>
                     </div>
                </div>

                <div className="relative shadow-2xl rounded-lg overflow-hidden bg-white transition-transform duration-200 ease-out" style={{ width: '600px', height: '800px', transform: `scale(${zoom})` }}>
                    <img src={REAL_PATIENT_IMAGE} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                    <canvas ref={canvasRef} width={600} height={800} className={`absolute inset-0 z-10 cursor-${activeTool === 'pointer' ? 'move' : 'crosshair'}`} onMouseDown={handleCanvasClick} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default FaceMap;