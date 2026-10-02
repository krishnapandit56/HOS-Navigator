import React from 'react';
import { MapPin, Navigation, Clock, Fuel, Coffee, Moon, Warehouse, Flag } from 'lucide-react';

export default function StopsTimeline({ stops }) {
  if (!stops || stops.length === 0) return null;

  const getStopBadge = (type) => {
    switch (type) {
      case 'current':
        return {
          icon: <MapPin className="w-3.5 h-3.5 text-blue-400" />,
          label: 'Trip Origin',
          badgeClass: 'bg-blue-950 text-blue-300 border-blue-800'
        };
      case 'pickup':
        return {
          icon: <Warehouse className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Pickup Stop (1hr Load)',
          badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800'
        };
      case 'dropoff':
        return {
          icon: <Flag className="w-3.5 h-3.5 text-purple-400" />,
          label: 'Dropoff Destination (1hr Unload)',
          badgeClass: 'bg-purple-950 text-purple-300 border-purple-800'
        };
      case 'fuel':
        return {
          icon: <Fuel className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Fuel Stop (<= 1,000 mi)',
          badgeClass: 'bg-amber-950 text-amber-300 border-amber-800'
        };
      case 'rest_30min':
        return {
          icon: <Coffee className="w-3.5 h-3.5 text-teal-400" />,
          label: '30m Mandatory Break',
          badgeClass: 'bg-teal-950 text-teal-300 border-teal-800'
        };
      case 'night_rest':
        return {
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
          label: '10h Sleeper Berth Reset',
          badgeClass: 'bg-indigo-950 text-indigo-300 border-indigo-800'
        };
      default:
        return {
          icon: <Navigation className="w-3.5 h-3.5 text-slate-600" />,
          label: 'Waypoint',
          badgeClass: 'bg-white text-slate-700 border-slate-300'
        };
    }
  };

  return (
    <div className="bg-slate-50/80 border border-slate-300 rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-300">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-slate-900 tracking-wide">
            Detailed Route Schedule & HOS Itinerary
          </h2>
        </div>
        <span className="text-xs text-slate-600 font-mono">
          {stops.length} Total Waypoints
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/90 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-300">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Stop / Activity</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Arrival Time</th>
              <th className="py-2.5 px-3">Departure Time</th>
              <th className="py-2.5 px-3">Duration</th>
              <th className="py-2.5 px-3">Trip Mileage</th>
              <th className="py-2.5 px-3">HOS Regulation Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {stops.map((stop, idx) => {
              const badge = getStopBadge(stop.type);
              return (
                <tr
                  key={stop.id || idx}
                  className="hover:bg-slate-100/40 transition"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-600">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-semibold ${badge.badgeClass}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {stop.location_name}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {stop.arrival_time || '—'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {stop.departure_time || '—'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-sky-400">
                    {stop.duration_hours} hr
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                    Mile {stop.miles_from_start}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                    {stop.notes}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
