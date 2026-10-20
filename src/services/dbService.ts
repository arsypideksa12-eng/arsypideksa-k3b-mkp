import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Vessel,
  Route,
  CargoManifest,
  PassengerTicket,
  Schedule,
  DbConnectionConfig
} from '../types';
import {
  INITIAL_VESSELS,
  INITIAL_ROUTES,
  INITIAL_CARGO_MANIFESTS,
  INITIAL_PASSENGER_TICKETS,
  INITIAL_SCHEDULES
} from '../data/initialData';

// Storage key for offline caching and Supabase / Neon configs
const DB_CONFIG_KEY = 'ars_logistic_db_config';

export function getDbConfig(): DbConnectionConfig {
  try {
    const raw = localStorage.getItem(DB_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading db config', e);
  }
  return {
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseConnected: false,
    neonConnectionString: '',
    neonConnected: false,
    lastSyncTime: new Date().toISOString(),
  };
}

export function saveDbConfig(cfg: DbConnectionConfig): void {
  try {
    localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.warn('Failed saving db config', e);
  }
}

class DatabaseService {
  private isSeeded = false;

  // Initialize and seed if empty
  public async initData() {
    if (this.isSeeded) return;
    try {
      const snap = await getDocs(collection(db, 'vessels')).catch((err) => {
        handleFirestoreError(err, OperationType.GET, 'vessels');
        return null;
      });

      if (snap && snap.empty) {
        console.log('Firestore is empty. Seeding initial maritime data...');
        await this.seedInitialData();
      }
      this.isSeeded = true;
    } catch (e) {
      console.warn('Firestore initial check handled:', e);
    }
  }

  public async seedInitialData() {
    try {
      const batch = writeBatch(db);

      INITIAL_VESSELS.forEach((v) => {
        batch.set(doc(db, 'vessels', v.id), v);
      });
      INITIAL_ROUTES.forEach((r) => {
        batch.set(doc(db, 'routes', r.id), r);
      });
      INITIAL_CARGO_MANIFESTS.forEach((c) => {
        batch.set(doc(db, 'cargoManifests', c.id), c);
      });
      INITIAL_PASSENGER_TICKETS.forEach((p) => {
        batch.set(doc(db, 'passengerTickets', p.id), p);
      });
      INITIAL_SCHEDULES.forEach((s) => {
        batch.set(doc(db, 'schedules', s.id), s);
      });

      await batch.commit();
      console.log('Seeding initial maritime database completed successfully.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch_seed');
    }
  }

  // --- Real-time Listeners ---
  public subscribeVessels(callback: (vessels: Vessel[]) => void, onError?: (err: unknown) => void) {
    const coll = collection(db, 'vessels');
    return onSnapshot(
      coll,
      (snapshot) => {
        const list: Vessel[] = [];
        snapshot.forEach((d) => list.push(d.data() as Vessel));
        if (list.length === 0) {
          callback(INITIAL_VESSELS);
        } else {
          callback(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'vessels');
        if (onError) onError(error);
      }
    );
  }

  public subscribeRoutes(callback: (routes: Route[]) => void, onError?: (err: unknown) => void) {
    const coll = collection(db, 'routes');
    return onSnapshot(
      coll,
      (snapshot) => {
        const list: Route[] = [];
        snapshot.forEach((d) => list.push(d.data() as Route));
        if (list.length === 0) {
          callback(INITIAL_ROUTES);
        } else {
          callback(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'routes');
        if (onError) onError(error);
      }
    );
  }

  public subscribeCargo(callback: (cargo: CargoManifest[]) => void, onError?: (err: unknown) => void) {
    const coll = collection(db, 'cargoManifests');
    return onSnapshot(
      coll,
      (snapshot) => {
        const list: CargoManifest[] = [];
        snapshot.forEach((d) => list.push(d.data() as CargoManifest));
        if (list.length === 0) {
          callback(INITIAL_CARGO_MANIFESTS);
        } else {
          // Sort by creation or departure desc
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'cargoManifests');
        if (onError) onError(error);
      }
    );
  }

  public subscribePassengers(callback: (passengers: PassengerTicket[]) => void, onError?: (err: unknown) => void) {
    const coll = collection(db, 'passengerTickets');
    return onSnapshot(
      coll,
      (snapshot) => {
        const list: PassengerTicket[] = [];
        snapshot.forEach((d) => list.push(d.data() as PassengerTicket));
        if (list.length === 0) {
          callback(INITIAL_PASSENGER_TICKETS);
        } else {
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'passengerTickets');
        if (onError) onError(error);
      }
    );
  }

  public subscribeSchedules(callback: (schedules: Schedule[]) => void, onError?: (err: unknown) => void) {
    const coll = collection(db, 'schedules');
    return onSnapshot(
      coll,
      (snapshot) => {
        const list: Schedule[] = [];
        snapshot.forEach((d) => list.push(d.data() as Schedule));
        if (list.length === 0) {
          callback(INITIAL_SCHEDULES);
        } else {
          callback(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'schedules');
        if (onError) onError(error);
      }
    );
  }

  // --- CRUD: Vessel ---
  public async saveVessel(vessel: Vessel): Promise<void> {
    try {
      const now = new Date().toISOString();
      const payload: Vessel = {
        ...vessel,
        createdAt: vessel.createdAt || now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'vessels', vessel.id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `vessels/${vessel.id}`);
    }
  }

  public async deleteVessel(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'vessels', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `vessels/${id}`);
    }
  }

  // --- CRUD: Route ---
  public async saveRoute(route: Route): Promise<void> {
    try {
      const now = new Date().toISOString();
      const payload: Route = {
        ...route,
        createdAt: route.createdAt || now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'routes', route.id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `routes/${route.id}`);
    }
  }

  public async deleteRoute(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'routes', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `routes/${id}`);
    }
  }

  // --- CRUD: Cargo Manifest ---
  public async saveCargo(cargo: CargoManifest): Promise<void> {
    try {
      const now = new Date().toISOString();
      const payload: CargoManifest = {
        ...cargo,
        createdAt: cargo.createdAt || now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'cargoManifests', cargo.id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `cargoManifests/${cargo.id}`);
    }
  }

  public async deleteCargo(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'cargoManifests', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `cargoManifests/${id}`);
    }
  }

  // --- CRUD: Passenger Ticket ---
  public async savePassenger(ticket: PassengerTicket): Promise<void> {
    try {
      const now = new Date().toISOString();
      const payload: PassengerTicket = {
        ...ticket,
        createdAt: ticket.createdAt || now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'passengerTickets', ticket.id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `passengerTickets/${ticket.id}`);
    }
  }

  public async deletePassenger(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'passengerTickets', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `passengerTickets/${id}`);
    }
  }

  // --- CRUD: Schedule ---
  public async saveSchedule(schedule: Schedule): Promise<void> {
    try {
      const now = new Date().toISOString();
      const payload: Schedule = {
        ...schedule,
        createdAt: schedule.createdAt || now,
        updatedAt: now,
      };
      await setDoc(doc(db, 'schedules', schedule.id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `schedules/${schedule.id}`);
    }
  }

  public async deleteSchedule(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'schedules', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `schedules/${id}`);
    }
  }

  // Generate SQL DDL and Seed script for PostgreSQL / Supabase / Neon DB
  public generatePostgresSql(
    vessels: Vessel[],
    routes: Route[],
    cargos: CargoManifest[],
    passengers: PassengerTicket[]
  ): string {
    const lines: string[] = [
      '-- ====================================================================',
      '-- ARS LOGISTIC AND PASSENGER SERVICE DATABASE EXPORT (PostgreSQL / Supabase / Neon)',
      `-- Generated At: ${new Date().toISOString()}`,
      '-- ====================================================================',
      '',
      '-- 1. Create Tables',
      `CREATE TABLE IF NOT EXISTS vessels (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(30) NOT NULL,
  type VARCHAR(30) NOT NULL,
  cargo_capacity_tons NUMERIC NOT NULL,
  passenger_capacity INT NOT NULL,
  vehicle_capacity INT NOT NULL,
  build_year INT,
  status VARCHAR(30) NOT NULL,
  captain_name VARCHAR(100),
  current_location VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`,
      '',
      `CREATE TABLE IF NOT EXISTS routes (
  id VARCHAR(64) PRIMARY KEY,
  origin_port VARCHAR(100) NOT NULL,
  destination_port VARCHAR(100) NOT NULL,
  distance_nm NUMERIC NOT NULL,
  estimated_hours NUMERIC NOT NULL,
  cargo_rate_per_ton NUMERIC NOT NULL,
  passenger_rate_economy NUMERIC NOT NULL,
  passenger_rate_business NUMERIC NOT NULL,
  passenger_rate_vip NUMERIC NOT NULL,
  status VARCHAR(30) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`,
      '',
      `CREATE TABLE IF NOT EXISTS cargo_manifests (
  id VARCHAR(64) PRIMARY KEY,
  tracking_number VARCHAR(40) UNIQUE NOT NULL,
  vessel_id VARCHAR(64) REFERENCES vessels(id),
  vessel_name VARCHAR(100),
  route_id VARCHAR(64) REFERENCES routes(id),
  route_description VARCHAR(150),
  shipper_name VARCHAR(100) NOT NULL,
  shipper_phone VARCHAR(30),
  consignee_name VARCHAR(100) NOT NULL,
  consignee_phone VARCHAR(30),
  cargo_type VARCHAR(50) NOT NULL,
  item_description TEXT,
  weight_kg NUMERIC NOT NULL,
  volume_m3 NUMERIC,
  container_or_plate_number VARCHAR(50),
  total_cost NUMERIC NOT NULL,
  payment_status VARCHAR(20) NOT NULL,
  shipping_status VARCHAR(30) NOT NULL,
  departure_date VARCHAR(30),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`,
      '',
      `CREATE TABLE IF NOT EXISTS passenger_tickets (
  id VARCHAR(64) PRIMARY KEY,
  ticket_number VARCHAR(40) UNIQUE NOT NULL,
  passenger_name VARCHAR(100) NOT NULL,
  id_card_number VARCHAR(50) NOT NULL,
  passenger_type VARCHAR(20) NOT NULL,
  gender CHAR(1),
  phone VARCHAR(30),
  vessel_id VARCHAR(64) REFERENCES vessels(id),
  vessel_name VARCHAR(100),
  route_id VARCHAR(64) REFERENCES routes(id),
  route_description VARCHAR(150),
  seat_or_deck_class VARCHAR(30),
  seat_number VARCHAR(20),
  departure_date VARCHAR(30),
  departure_time VARCHAR(30),
  fare NUMERIC NOT NULL,
  payment_status VARCHAR(20) NOT NULL,
  boarding_status VARCHAR(30) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`,
      '',
      '-- 2. Insert Data Records',
    ];

    // Vessels
    vessels.forEach((v) => {
      lines.push(
        `INSERT INTO vessels (id, name, code, type, cargo_capacity_tons, passenger_capacity, vehicle_capacity, build_year, status, captain_name, current_location) ` +
        `VALUES ('${v.id}', '${v.name.replace(/'/g, "''")}', '${v.code}', '${v.type}', ${v.cargoCapacityTons}, ${v.passengerCapacity}, ${v.vehicleCapacity}, ${v.buildYear}, '${v.status}', '${(v.captainName || '').replace(/'/g, "''")}', '${(v.currentLocation || '').replace(/'/g, "''")}') ` +
        `ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW();`
      );
    });

    // Routes
    routes.forEach((r) => {
      lines.push(
        `INSERT INTO routes (id, origin_port, destination_port, distance_nm, estimated_hours, cargo_rate_per_ton, passenger_rate_economy, passenger_rate_business, passenger_rate_vip, status) ` +
        `VALUES ('${r.id}', '${r.originPort.replace(/'/g, "''")}', '${r.destinationPort.replace(/'/g, "''")}', ${r.distanceNm}, ${r.estimatedHours}, ${r.cargoRatePerTon}, ${r.passengerRateEconomy}, ${r.passengerRateBusiness}, ${r.passengerRateVip}, '${r.status}') ` +
        `ON CONFLICT (id) DO NOTHING;`
      );
    });

    // Cargo Manifests
    cargos.forEach((c) => {
      lines.push(
        `INSERT INTO cargo_manifests (id, tracking_number, vessel_id, vessel_name, route_id, route_description, shipper_name, shipper_phone, consignee_name, consignee_phone, cargo_type, item_description, weight_kg, volume_m3, container_or_plate_number, total_cost, payment_status, shipping_status, departure_date) ` +
        `VALUES ('${c.id}', '${c.trackingNumber}', '${c.vesselId}', '${c.vesselName.replace(/'/g, "''")}', '${c.routeId}', '${c.routeDescription.replace(/'/g, "''")}', '${c.shipperName.replace(/'/g, "''")}', '${c.shipperPhone}', '${c.consigneeName.replace(/'/g, "''")}', '${c.consigneePhone}', '${c.cargoType}', '${(c.itemDescription || '').replace(/'/g, "''")}', ${c.weightKg}, ${c.volumeM3}, '${c.containerOrPlateNumber || ''}', ${c.totalCost}, '${c.paymentStatus}', '${c.shippingStatus}', '${c.departureDate}') ` +
        `ON CONFLICT (id) DO NOTHING;`
      );
    });

    // Passenger Tickets
    passengers.forEach((p) => {
      lines.push(
        `INSERT INTO passenger_tickets (id, ticket_number, passenger_name, id_card_number, passenger_type, gender, phone, vessel_id, vessel_name, route_id, route_description, seat_or_deck_class, seat_number, departure_date, fare, payment_status, boarding_status) ` +
        `VALUES ('${p.id}', '${p.ticketNumber}', '${p.passengerName.replace(/'/g, "''")}', '${p.idCardNumber}', '${p.passengerType}', '${p.gender}', '${p.phone}', '${p.vesselId}', '${p.vesselName.replace(/'/g, "''")}', '${p.routeId}', '${p.routeDescription.replace(/'/g, "''")}', '${p.seatOrDeckClass}', '${p.seatNumber}', '${p.departureDate}', ${p.fare}, '${p.paymentStatus}', '${p.boardingStatus}') ` +
        `ON CONFLICT (id) DO NOTHING;`
      );
    });

    return lines.join('\n');
  }
}

export const dbService = new DatabaseService();
