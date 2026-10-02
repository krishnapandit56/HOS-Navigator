import React, { useState } from 'react';
import { Truck, MapPin, Clock, ArrowRight, Settings2, Sparkles, RefreshCw } from 'lucide-react';

export default function TripForm({ onSubmit, loading, presets, onSelectPreset }) {
  const [currentLocation, setCurrentLocation] = useState('Chicago, IL');
  const [pickupLocation, setPickupLocation] = useState('St. Louis, MO');
  const [dropoffLocation, setDropoffLocation] = useState('Dallas, TX');
  const [currentCycleUsed, setCurrentCycleUsed] = useState(14.5);

  // Advanced fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [carrierName, setCarrierName] = useState('Apex Freight Logistics Inc.');
  const [mainOfficeAddress, setMainOfficeAddress] = useState('100 Logistics Blvd, Dallas, TX 75201');
  const [homeTerminalAddress, setHomeTerminalAddress] = useState('450 Transport Way, Chicago, IL 60601');
  const [truckNumber, setTruckNumber] = useState('TRK-8821');
  const [trailerNumber, setTrailerNumber] = useState('TLR-9042');
  const [manifestNumber, setManifestNumber] = useState('BOL-78912');
  const [shipperCommodity, setShipperCommodity] = useState('Commercial Electronics / General Freight');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState(6.0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentLocation || !pickupLocation || !dropoffLocation) return;

    onSubmit({
      current_location: currentLocation,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      current_cycle_used: parseFloat(currentCycleUsed) || 0.0,
      carrier_name: carrierName,
      main_office_address: mainOfficeAddress,
      home_terminal_address: homeTerminalAddress,
      truck_number: truckNumber,
      trailer_number: trailerNumber,
      manifest_number: manifestNumber,
      shipper_commodity: shipperCommodity,
      start_date: startDate,
      start_hour: parseFloat(startHour) || 6.0,
    });
  };

  const handleApplyPreset = (preset) => {
    setCurrentLocation(preset.current_location);
    setPickupLocation(preset.pickup_location);
    setDropoffLocation(preset.dropoff_location);
    setCurrentCycleUsed(preset.current_cycle_used);
    if (onSelectPreset) {
      onSelectPreset(preset);
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-5">
      {/* Header & Quick Presets */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Trip Dispatch & HOS Parameters
            </h2>
          </div>
          <span className="text-xs text-sky-400/90 font-mono bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
            FMCSA 70hr/8day Rules
          </span>
        </div>

        {/* Quick Demo Presets */}
        {presets && presets.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Test Presets (1-Click Fill):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 text-xs bg-slate-900/90 hover:bg-sky-900/40 text-slate-300 hover:text-white rounded-md border border-slate-700 hover:border-sky-500/50 transition truncate max-w-full"
                  title={p.notes}
                >
                  {p.label.split(':')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Current Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Current Location (Origin)
            </label>
            <input
              type="text"
              required
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              placeholder="e.g. Chicago, IL"
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Pickup Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Pickup Location (1hr Load)
            </label>
            <input
              type="text"
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g. St. Louis, MO"
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Dropoff Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              Dropoff Location (1hr Unload)
            </label>
            <input
              type="text"
              required
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              placeholder="e.g. Dallas, TX"
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500 transition"
            />
          </div>
        </div>

        {/* Current Cycle Used (Hrs) */}
        <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Current Cycle Used (Hrs) - 70-Hr / 8-Day Limit
            </label>
            <span className="font-mono text-sm font-bold text-sky-400">
              {Number(currentCycleUsed).toFixed(1)} / 70.0 hrs
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="70"
              step="0.5"
              value={currentCycleUsed}
              onChange={(e) => setCurrentCycleUsed(e.target.value)}
              className="flex-1 accent-sky-500 cursor-pointer"
            />
            <input
              type="number"
              min="0"
              max="70"
              step="0.5"
              value={currentCycleUsed}
              onChange={(e) => setCurrentCycleUsed(e.target.value)}
              className="w-20 px-2 py-1 text-sm bg-slate-800 border border-slate-600 rounded text-center text-white focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Remaining Cycle Clock: <strong className="text-emerald-400">{(70.0 - currentCycleUsed).toFixed(1)} hrs</strong></span>
            <span>Fuel Stops: every &le; 1,000 miles</span>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Carrier & Log Customizations' : 'Customize Carrier, Truck, Start Time & BOL'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3.5 bg-slate-900/90 rounded-lg border border-slate-700/80 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Carrier Name</label>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Main Office Address</label>
                <input
                  type="text"
                  value={mainOfficeAddress}
                  onChange={(e) => setMainOfficeAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Home Terminal Address</label>
                <input
                  type="text"
                  value={homeTerminalAddress}
                  onChange={(e) => setHomeTerminalAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Truck / Trailer IDs</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={truckNumber}
                    onChange={(e) => setTruckNumber(e.target.value)}
                    placeholder="Truck #"
                    className="w-1/2 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white font-mono"
                  />
                  <input
                    type="text"
                    value={trailerNumber}
                    onChange={(e) => setTrailerNumber(e.target.value)}
                    placeholder="Trailer #"
                    className="w-1/2 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Manifest / Bill of Lading (BOL)</label>
                <input
                  type="text"
                  value={manifestNumber}
                  onChange={(e) => setManifestNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Departure Date & Hour</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-3/5 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs"
                  />
                  <input
                    type="number"
                    min="0"
                    max="23"
                    step="0.5"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="w-2/5 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-center font-mono"
                    title="Start hour (e.g. 6.0 for 06:00 AM)"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Calculating FMCSA Route & Drawing Daily Logs...</span>
            </>
          ) : (
            <>
              <Truck className="w-5 h-5" />
              <span>Calculate Compliant Route & Draw ELD Logs</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
