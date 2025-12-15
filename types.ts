export enum AppointmentStatus {
  SCHEDULED = 'Agendado',
  CONFIRMED = 'Confirmado',
  CHECKED_IN = 'Em Sala',
  COMPLETED = 'Concluído',
  CANCELED = 'Cancelado',
  NO_SHOW = 'Não Compareceu'
}

export enum TreatmentType {
  BOTOX = 'Toxina Botulínica',
  FILLER = 'Preenchimento',
  THREADS = 'Fios de Sustentação',
  LASER = 'Laser CO2',
  BIOSTIMULATOR = 'Bioestimulador',
  EVALUATION = 'Consulta Avaliação'
}

export enum Room {
  ROOM_1 = 'Sala 1 (Injetáveis)',
  ROOM_2 = 'Sala 2 (Laser/Corporal)',
  ROOM_3 = 'Sala 3 (Avaliação)'
}

export interface ConsumptionItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
  gender?: 'F' | 'M' | 'Other';
  address?: Address;
  avatarUrl: string;
  notes?: string;
  tags?: string[];
  anamnesisStatus?: 'Valid' | 'Expired' | 'Pending';
  
  // Computed fields
  totalSpent?: number;
  visitCount?: number;
  lastVisit?: string;
  status: 'Active' | 'Inactive' | 'Blocked';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  start: Date; // Object, not string, for easier manipulation
  durationMinutes: number;
  type: TreatmentType;
  status: AppointmentStatus;
  room: Room;
  price: number;
  notes?: string;
  // Linked Data
  consumption?: ConsumptionItem[]; // Items generated from FaceMap
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  patientId: string;
  patientName: string;
  service: string;
  amount: number;
  type: 'Income' | 'Expense'; // New field for cash flow
  status: 'Paid' | 'Pending';
  method: 'Credit Card' | 'Pix' | 'Cash' | 'Split';
  clinicShare: number;
  doctorShare: number;
}

export interface KPI {
  revenue: number;
  ticket: number;
  occupancy: number;
  noShowRate: number;
}

export enum KanbanStage {
  NEW = 'Novo Lead',
  SCHEDULED = 'Agendou Avaliação',
  BUDGET = 'Orçamento Enviado',
  CLOSED = 'Fechou (Venda)',
  LOST = 'Perdido',
  RETURN = 'Retorno Pendente'
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: 'Instagram' | 'Google' | 'Indicação';
  stage: KanbanStage;
  value: number; // Potential value
  daysInStage: number;
  lastContact: string;
  returnDate?: string; // For automated retention
  tags?: ('Hot' | 'Warm' | 'Cold')[];
  notes?: string;
}

// --- INTEGRATIONS & CONNECTIONS ---

export enum IntegrationStatus {
  CONNECTED = 'Conectado',
  DISCONNECTED = 'Desconectado',
  ERROR = 'Erro',
  EXPIRED = 'Expirado'
}

export enum IntegrationProvider {
  META = 'Meta (Facebook/Instagram)',
  WHATSAPP = 'WhatsApp Business API',
  GOOGLE = 'Google',
  PAYMENT = 'Gateway de Pagamento',
  NFE = 'Emissor Fiscal'
}

export interface Integration {
  id: string;
  name: string;
  provider: IntegrationProvider;
  icon: string; // icon name
  status: IntegrationStatus;
  accountName?: string;
  lastSync?: string;
  description: string;
  features: string[];
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  event: string;
  status: 'Success' | 'Error';
  timestamp: string;
}

// --- REFERRAL SYSTEM ---

export enum ReferralStatus {
  INVITED = 'Convidada',        // Link accessed/Lead created
  VALIDATING = 'Em Validação',  // Paid implementation, waiting 30 days
  VALID = 'Válida',             // 30 days active -> Reward released
  CANCELED = 'Cancelada',       // Churn before 30 days
  FRAUD = 'Fraude'              // Duplicate data
}

export enum ReferralTier {
  BRONZE = 'Bronze',      // 1 Referral
  SILVER = 'Prata',       // 3 Referrals
  GOLD = 'Ouro',          // 5 Referrals
  DIAMOND = 'Diamante'    // 10+ Referrals
}

export interface Referral {
  id: string;
  referredClinicName: string;
  contactName: string;
  dateInvited: string;
  dateActivated?: string; // When they paid implementation
  status: ReferralStatus;
  rewardAmount: number; // Potential or realized reward
  rewardReleased: boolean;
}