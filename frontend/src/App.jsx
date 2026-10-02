import React, { useState, useEffect } from 'react';
import { Truck, Navigation, FileText, Calendar, CheckCircle2, AlertCircle, Sparkles, Layers, ShieldCheck, MapPin } from 'lucide-react';
import TripForm from './components/TripForm';
import TripSummary from './components/TripSummary';
import RouteMap from './components/RouteMap';
import ELDLogSheet from './components/ELDLogSheet';
import StopsTimeline from './components/StopsTimeline';

export default function App() {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [presets, setPresets] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'logs', 'map', 'schedule'

  const API_BASE = import.meta.env.VITE_API_URL || '';

  // Fetch presets on load & initialize with a default trip
  useEffect(() => {
    fetchPresets();
    // Default initial trip calculation
    handlePlanTrip({
      current_location: 'Chicago, IL',
      pickup_location: 'St. Louis, MO',
      dropoff_location: 'Dallas, TX',
      current_cycle_used: 14.5,
      carrier_name: 'Apex Freight Logistics Inc.',
      main_office_address: '100 Logistics Blvd, Dallas, TX 75201',
      home_terminal_address: '450 Transport Way, Chicago, IL 60601',
      truck_number: 'TRK-8821',
      trailer_number: 'TLR-9042',
      manifest_number: 'BOL-78912',
      shipper_commodity: 'Commercial Electronics / General Freight',
      start_date: new Date().toISOString().split('T')[0],
      start_hour: 6.0,
    });
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/trips/presets/`);
      if (res.ok) {
        const data = await res.json();
        setPresets(data);
      }
    } catch (err) {
      console.warn('Failed to fetch presets:', err);
    }
  };

  const handlePlanTrip = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/trips/plan/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setTripData(data);
    } catch (err) {
      console.error('Error planning trip:', err);
      setError(err.message || 'An unexpected error occurred while calculating the route and ELD logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  TruckRoute <span className="text-sky-400">ELD</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-300 rounded border border-sky-500/30">
                  FMCSA §395.8
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Route Optimizer & Automated FMCSA Driver's Daily Log Generator
              </p>
            </div>
          </div>

          {/* Top Status Badges */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-300 text-xs text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Property-carrying (70hr/8day)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-300 text-xs text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Free Map & Routing</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm shadow-lg no-print">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <strong className="font-semibold block mb-0.5">Route Planning Failed</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Input Form */}
        <section className="no-print">
          <TripForm
            onSubmit={handlePlanTrip}
            loading={loading}
            presets={presets}
            onSelectPreset={handlePlanTrip}
          />
        </section>

        {/* Trip Results */}
        {tripData && (
          <>
            {/* Summary KPI Cards */}
            <section>
              <TripSummary summary={tripData.summary} inputs={tripData.inputs} />
            </section>

            {/* View Filter Tabs (no-print) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 no-print">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'all'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>All Views</span>
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'logs'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>ELD Daily Logs ({tripData.daily_logs.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'map'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  <span>Route Map</span>
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'schedule'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Itinerary Schedule</span>
                </button>
              </div>

              <div className="text-xs text-slate-600">
                Generated <strong className="text-sky-400">{tripData.daily_logs.length}</strong> official 24-hr log sheets
              </div>
            </div>

            {/* View Sections */}
            {(activeTab === 'all' || activeTab === 'logs') && (
              <section id="eld-logs-section">
                <ELDLogSheet
                  dailyLogs={tripData.daily_logs}
                  tripInputs={tripData.inputs}
                  summary={tripData.summary}
                />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'map') && (
              <section id="route-map-section" className="no-print">
                <RouteMap route={tripData.route} summary={tripData.summary} />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'schedule') && (
              <section id="schedule-section" className="no-print">
                <StopsTimeline stops={tripData.route?.stops} />
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-400" />
            <span>TruckRoute ELD — Full-Stack Django & React HOS Route Planner</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>FMCSA 49 CFR Part 395</span>
            <span>&bull;</span>
            <span>70hr/8day Rules</span>
            <span>&bull;</span>
            <span>Fuel Every &le; 1,000 Miles</span>
            <span>&bull;</span>
            <span>1hr Pick/Drop</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
