import React from 'react';
import { Route, Clock, Calendar, ShieldCheck, AlertTriangle, Fuel, Coffee, Bed, ArrowUpRight } from 'lucide-react';

export default function TripSummary({ summary, inputs }) {
  if (!summary) return null;

  const {
    total_miles,
    leg1_miles,
    leg2_miles,
    total_driving_hours,
    total_on_duty_hours,
    total_rest_hours,
    total_trip_days,
    cycle_used_at_start,
    cycle_used_at_end,
    cycle_remaining,
    hos_compliant,
    fuel_stops_count,
    rest_stops_count,
  } = summary;

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4">
      {/* Top Banner / Compliance Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            FMCSA Trip Summary & HOS Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calculated under 49 CFR Part 395 (Property-carrying 70hr / 8-day rules).
          </p>
        </div>

        <div>
          {hos_compliant ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% FMCSA Compliant</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-950/80 border border-rose-500/50 rounded-lg text-rose-300 text-xs font-bold shadow-sm">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>70-Hour Cycle Warning</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Mileage */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Route className="w-3.5 h-3.5 text-sky-400" />
            <span>Total Miles</span>
          </div>
          <div className="text-xl font-black font-mono text-white">
            {total_miles}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Leg 1: {leg1_miles}m | Leg 2: {leg2_miles}m
          </div>
        </div>

        {/* Total Driving Hours */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Drive Time</span>
          </div>
          <div className="text-xl font-black font-mono text-sky-300">
            {total_driving_hours} hrs
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Max 11.0 hrs/day
          </div>
        </div>

        {/* Total On-Duty Time */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>On-Duty Time</span>
          </div>
          <div className="text-xl font-black font-mono text-amber-300">
            {total_on_duty_hours} hrs
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Includes Pick/Drop/Fuel
          </div>
        </div>

        {/* Mandatory Rest & Breaks */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Bed className="w-3.5 h-3.5 text-indigo-400" />
            <span>Rest & Sleep</span>
          </div>
          <div className="text-xl font-black font-mono text-indigo-300">
            {total_rest_hours} hrs
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            10h resets & 30m breaks
          </div>
        </div>

        {/* Trip Duration / Daily Sheets */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daily Sheets</span>
          </div>
          <div className="text-xl font-black font-mono text-emerald-300">
            {total_trip_days} {total_trip_days === 1 ? 'Sheet' : 'Sheets'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            24-hour log partitions
          </div>
        </div>

        {/* 70-Hr Cycle Remaining */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Cycle Clock</span>
          </div>
          <div className="text-xl font-black font-mono text-teal-300">
            {cycle_remaining} hrs
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Remaining of 70 hrs
          </div>
        </div>
      </div>

      {/* Assumptions Breakdown Footer */}
      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">Assumptions Applied:</span>
          <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
            Property-carrying
          </span>
          <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
            70hrs / 8days
          </span>
          <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
            Fuel every &le; 1,000 mi ({fuel_stops_count} stops)
          </span>
          <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
            1 hr Pickup & Dropoff
          </span>
        </div>

        <div className="text-[11px] text-sky-400 font-mono">
          Cycle Clock: {cycle_used_at_start}h &rarr; {cycle_used_at_end}h / 70h
        </div>
      </div>
    </div>
  );
}
