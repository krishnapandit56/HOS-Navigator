import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Fuel, Coffee, Moon, Flag, Warehouse, Layers } from 'lucide-react';

// 100% Free tile providers with ZERO API keys and NO watermarks
const TILE_PROVIDERS = {
  esri: {
    name: 'Esri World Street (Highways)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; National Geographic, DeLorme, NAVTEQ',
    subdomains: ['server', 'services'],
    maxZoom: 19,
  },
  osm_hot: {
    name: 'OpenStreetMap Humanitarian',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
  },
  osm_fr: {
    name: 'OpenStreetMap Standard (Mirror)',
    url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
  },
  esri_topo: {
    name: 'Esri Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    subdomains: ['server', 'services'],
    maxZoom: 19,
  }
};

export default function RouteMap({ route, summary }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersGroupRef = useRef(null);
  const [selectedMapStyle, setSelectedMapStyle] = useState('esri');

  // Change tile provider dynamically if style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const provider = TILE_PROVIDERS[selectedMapStyle] || TILE_PROVIDERS.esri;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: provider.subdomains,
      maxZoom: provider.maxZoom,
    }).addTo(mapInstanceRef.current);
    
    // Ensure tile layer sits at the bottom
    tileLayerRef.current.bringToBack();
  }, [selectedMapStyle]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([39.8283, -98.5795], 4);

      const defaultProvider = TILE_PROVIDERS.esri;
      tileLayerRef.current = L.tileLayer(defaultProvider.url, {
        attribution: defaultProvider.attribution,
        subdomains: defaultProvider.subdomains,
        maxZoom: defaultProvider.maxZoom,
      }).addTo(map);

      layersGroupRef.current = L.featureGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;
    layerGroup.clearLayers();

    if (!route || !route.stops || route.stops.length === 0) return;

    // 1. Draw Route Polyline
    if (route.coordinates && route.coordinates.length > 0) {
      const polyline = L.polyline(route.coordinates, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
      });
      polyline.addTo(layerGroup);
    }

    // Helper to generate custom HTML marker icons
    const createCustomIcon = (type, number) => {
      let bgColor = 'bg-sky-600';
      let iconSymbol = '📍';
      let badgeLabel = '';

      if (type === 'current') {
        bgColor = 'bg-blue-600';
        iconSymbol = '🚚';
        badgeLabel = 'Start';
      } else if (type === 'pickup') {
        bgColor = 'bg-emerald-600';
        iconSymbol = '📦';
        badgeLabel = 'Pickup';
      } else if (type === 'dropoff') {
        bgColor = 'bg-purple-600';
        iconSymbol = '🏁';
        badgeLabel = 'Dropoff';
      } else if (type === 'fuel') {
        bgColor = 'bg-amber-500';
        iconSymbol = '⛽';
        badgeLabel = 'Fuel';
      } else if (type === 'rest_30min') {
        bgColor = 'bg-teal-600';
        iconSymbol = '☕';
        badgeLabel = '30m Break';
      } else if (type === 'night_rest') {
        bgColor = 'bg-indigo-700';
        iconSymbol = '🛌';
        badgeLabel = '10h Rest';
      }

      const html = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
          <div class="w-8 h-8 rounded-full ${bgColor} border-2 border-white shadow-lg flex items-center justify-center text-sm transform transition duration-200 group-hover:scale-125">
            <span>${iconSymbol}</span>
          </div>
          <span class="absolute -bottom-5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-slate-900/90 whitespace-nowrap shadow border border-slate-700">
            ${badgeLabel}
          </span>
        </div>
      `;

      return L.divIcon({
        className: 'custom-leaflet-marker',
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    // 2. Add Stop Markers
    route.stops.forEach((stop, index) => {
      if (stop.lat && stop.lon) {
        const marker = L.marker([stop.lat, stop.lon], {
          icon: createCustomIcon(stop.type, index + 1),
        });

        // Popup content with styled HTML
        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 220px; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
              <strong style="color: #0f172a; font-size: 13px;">${stop.title}</strong>
              <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                Mile ${stop.miles_from_start}
              </span>
            </div>
            <div style="font-size: 12px; color: #334155; margin-bottom: 4px;">
              📍 <strong>Location:</strong> ${stop.location_name}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
              🕒 <strong>Arrival:</strong> ${stop.arrival_time || 'Start'}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
              ⏱️ <strong>Duration:</strong> ${stop.duration_hours} hr (${stop.duration_hours * 60} mins)
            </div>
            <div style="font-size: 11px; color: #0284c7; background: #f8fafc; padding: 4px 6px; border-radius: 4px; margin-top: 6px; border-left: 3px solid #0284c7;">
              ℹ️ ${stop.notes || ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(layerGroup);
      }
    });

    // 3. Fit bounds smoothly
    try {
      const bounds = layerGroup.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    } catch (e) {
      console.warn('Error fitting map bounds:', e);
    }

    // Force map size refresh
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [route]);

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">
            Interactive Route & Mandated Stops Map
          </h2>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Origin
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Pickup (1hr)
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Dropoff (1hr)
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Fuel (&le; 1,000 mi)
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> 30m Break
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> 10h Rest Reset
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-slate-600 shadow-inner z-0">
        <div
          ref={mapContainerRef}
          className="w-full h-[420px] bg-slate-900"
          style={{ zIndex: 1 }}
        />
        
        {/* Style Switcher & Badge */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          <div className="bg-slate-900/90 backdrop-blur px-2.5 py-1.5 rounded-md border border-slate-700 text-xs text-slate-200 shadow flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={selectedMapStyle}
              onChange={(e) => setSelectedMapStyle(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="esri" className="bg-slate-900 text-white">Esri World Street (Highways)</option>
              <option value="osm_hot" className="bg-slate-900 text-white">OSM Humanitarian</option>
              <option value="osm_fr" className="bg-slate-900 text-white">OSM Standard Mirror</option>
              <option value="esri_topo" className="bg-slate-900 text-white">Esri Topographic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stop Cards Horizontal Scroll / Quick Overview */}
      {route?.stops && route.stops.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Trip Stops & Waypoints ({route.stops.length} Total):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {route.stops.map((stop, i) => (
              <div
                key={stop.id || i}
                className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5 hover:border-sky-500/50 transition text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white truncate max-w-[140px]">
                    {stop.title}
                  </span>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800">
                    Mile {stop.miles_from_start}
                  </span>
                </div>
                <div className="text-slate-400 truncate mb-1" title={stop.location_name}>
                  📍 {stop.location_name}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-1 mt-1">
                  <span>⏱️ {stop.duration_hours} hr</span>
                  <span className="text-sky-300">{stop.arrival_time?.split(',')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
