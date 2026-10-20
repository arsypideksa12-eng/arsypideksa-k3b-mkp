import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { VesselsManager } from './components/master/VesselsManager';
import { RoutesManager } from './components/master/RoutesManager';
import { CargoManager } from './components/transactions/CargoManager';
import { PassengerManager } from './components/transactions/PassengerManager';
import { ScheduleManager } from './components/transactions/ScheduleManager';
import { ReportsManager } from './components/reports/ReportsManager';
import { DatabaseManager } from './components/database/DatabaseManager';
import { LoginModal } from './components/auth/LoginModal';
import { CargoWaybillModal } from './components/print/CargoWaybillModal';
import { BoardingPassModal } from './components/print/BoardingPassModal';
import {
  Vessel,
  Route,
  CargoManifest,
  PassengerTicket,
  Schedule
} from './types';
import { dbService } from './services/dbService';
import { testConnection } from './firebase';
import {
  INITIAL_VESSELS,
  INITIAL_ROUTES,
  INITIAL_CARGO_MANIFESTS,
  INITIAL_PASSENGER_TICKETS,
  INITIAL_SCHEDULES
} from './data/initialData';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Print Modals
  const [cargoForPrint, setCargoForPrint] = useState<CargoManifest | null>(null);
  const [ticketForPrint, setTicketForPrint] = useState<PassengerTicket | null>(null);

  // Real-time Database State
  const [vessels, setVessels] = useState<Vessel[]>(INITIAL_VESSELS);
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [cargoManifests, setCargoManifests] = useState<CargoManifest[]>(INITIAL_CARGO_MANIFESTS);
  const [passengerTickets, setPassengerTickets] = useState<PassengerTicket[]>(INITIAL_PASSENGER_TICKETS);
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);
  const [isDbConnected, setIsDbConnected] = useState(true);

  useEffect(() => {
    // 1. Test connection to Firestore
    testConnection().then((connected) => {
      setIsDbConnected(connected);
    });

    // 2. Initialize and seed if needed
    dbService.initData();

    // 3. Setup real-time snapshot listeners
    const unsubVessels = dbService.subscribeVessels((data) => setVessels(data));
    const unsubRoutes = dbService.subscribeRoutes((data) => setRoutes(data));
    const unsubCargo = dbService.subscribeCargo((data) => setCargoManifests(data));
    const unsubPassengers = dbService.subscribePassengers((data) => setPassengerTickets(data));
    const unsubSchedules = dbService.subscribeSchedules((data) => setSchedules(data));

    return () => {
      unsubVessels();
      unsubRoutes();
      unsubCargo();
      unsubPassengers();
      unsubSchedules();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenDbModal={() => setActiveTab('database')}
        isDbConnected={isDbConnected}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          cargoCount={cargoManifests.length}
          passengerCount={passengerTickets.length}
          vesselCount={vessels.length}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              vessels={vessels}
              routes={routes}
              cargoManifests={cargoManifests}
              passengerTickets={passengerTickets}
              schedules={schedules}
              setActiveTab={setActiveTab}
              onOpenCargoPrint={(c) => setCargoForPrint(c)}
              onOpenTicketPrint={(t) => setTicketForPrint(t)}
            />
          )}

          {activeTab === 'vessels' && <VesselsManager vessels={vessels} />}

          {activeTab === 'routes' && <RoutesManager routes={routes} />}

          {activeTab === 'cargo' && (
            <CargoManager
              cargoManifests={cargoManifests}
              vessels={vessels}
              routes={routes}
              onOpenPrint={(c) => setCargoForPrint(c)}
            />
          )}

          {activeTab === 'passengers' && (
            <PassengerManager
              passengerTickets={passengerTickets}
              vessels={vessels}
              routes={routes}
              onOpenPrint={(t) => setTicketForPrint(t)}
            />
          )}

          {activeTab === 'schedules' && (
            <ScheduleManager
              schedules={schedules}
              vessels={vessels}
              routes={routes}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsManager
              vessels={vessels}
              routes={routes}
              cargoManifests={cargoManifests}
              passengerTickets={passengerTickets}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseManager
              vessels={vessels}
              routes={routes}
              cargoManifests={cargoManifests}
              passengerTickets={passengerTickets}
              isFirestoreOnline={isDbConnected}
            />
          )}
        </main>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Printable Bill of Lading Modal */}
      {cargoForPrint && (
        <CargoWaybillModal
          cargo={cargoForPrint}
          onClose={() => setCargoForPrint(null)}
        />
      )}

      {/* Printable Boarding Pass Modal */}
      {ticketForPrint && (
        <BoardingPassModal
          ticket={ticketForPrint}
          onClose={() => setTicketForPrint(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
