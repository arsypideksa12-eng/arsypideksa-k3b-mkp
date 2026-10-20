export type VesselType = 'RORO' | 'Cargo' | 'Tongkang' | 'FastBoat' | 'Pelni';
export type VesselStatus = 'Ready' | 'Docking' | 'Sailing' | 'Maintenance';

export interface Vessel {
  id: string;
  name: string;
  code: string;
  type: VesselType;
  cargoCapacityTons: number;
  passengerCapacity: number;
  vehicleCapacity: number;
  buildYear: number;
  status: VesselStatus;
  captainName: string;
  currentLocation?: string;
  createdAt: string;
  updatedAt: string;
}

export type RouteStatus = 'Active' | 'Inactive' | 'WeatherAlert';

export interface Route {
  id: string;
  originPort: string;
  destinationPort: string;
  distanceNm: number;
  estimatedHours: number;
  cargoRatePerTon: number;
  passengerRateEconomy: number;
  passengerRateBusiness: number;
  passengerRateVip: number;
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
}

export type CargoType =
  | 'Container'
  | 'GeneralCargo'
  | 'Vehicle'
  | 'Sembako'
  | 'HeavyEquipment'
  | 'HazardousDG';

export type PaymentStatus = 'Paid' | 'Unpaid' | 'COD';

export type ShippingStatus =
  | 'Booked'
  | 'Loading'
  | 'InTransit'
  | 'Arrived'
  | 'Completed'
  | 'Cancelled';

export interface CargoManifest {
  id: string;
  trackingNumber: string;
  vesselId: string;
  vesselName: string;
  routeId: string;
  routeDescription: string;
  shipperName: string;
  shipperPhone: string;
  consigneeName: string;
  consigneePhone: string;
  cargoType: CargoType;
  itemDescription: string;
  weightKg: number;
  volumeM3: number;
  containerOrPlateNumber?: string;
  totalCost: number;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  departureDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PassengerType = 'Adult' | 'Child' | 'Infant';
export type Gender = 'L' | 'P';
export type SeatClass = 'Economy' | 'Business' | 'VIP';
export type BoardingStatus = 'Booked' | 'CheckedIn' | 'Boarded' | 'Completed' | 'Cancelled';

export interface PassengerTicket {
  id: string;
  ticketNumber: string;
  passengerName: string;
  idCardNumber: string;
  passengerType: PassengerType;
  gender: Gender;
  phone: string;
  vesselId: string;
  vesselName: string;
  routeId: string;
  routeDescription: string;
  seatOrDeckClass: SeatClass;
  seatNumber: string;
  departureDate: string;
  departureTime?: string;
  fare: number;
  paymentStatus: 'Paid' | 'Unpaid';
  boardingStatus: BoardingStatus;
  createdAt: string;
  updatedAt: string;
}

export type ScheduleStatus =
  | 'Scheduled'
  | 'Boarding'
  | 'Departed'
  | 'Delayed'
  | 'Arrived'
  | 'Cancelled';

export interface Schedule {
  id: string;
  scheduleCode: string;
  vesselId: string;
  vesselName: string;
  routeId: string;
  routeDescription: string;
  etd: string; // Estimated Time of Departure (YYYY-MM-DD HH:mm)
  eta: string; // Estimated Time of Arrival (YYYY-MM-DD HH:mm)
  status: ScheduleStatus;
  dockNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super_admin' | 'cargo_officer' | 'ticket_agent';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isFirebaseAuthenticated?: boolean;
}

export interface DbConnectionConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseConnected?: boolean;
  neonConnectionString?: string;
  neonConnected?: boolean;
  lastSyncTime?: string;
}
