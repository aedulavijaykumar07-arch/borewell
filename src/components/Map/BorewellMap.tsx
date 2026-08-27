import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Compass,
  Eye,
  EyeOff,
  Navigation,
  Info,
  Maximize2
} from 'lucide-react';
import { BorewellRecord, RegulatoryZone } from '../../types/index.js';

interface BorewellMapProps {
  selectedCoords: { lat: number; lng: number };
  onSelectCoords: (lat: number, lng: number, locationName?: string) => void;
  borewells: (BorewellRecord & { distance_m?: number })[];
  regulatoryZones: RegulatoryZone[];
  radiusM?: number;
  highlightedBorewellId?: string;
}

export const BorewellMap: React.FC<BorewellMapProps> = ({
  selectedCoords,
  onSelectCoords,
  borewells,
  regulatoryZones,
  radiusM = 5000,
  highlightedBorewellId
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const borewellsLayerRef = useRef<L.LayerGroup | null>(null);
  const regulatoryLayerRef = useRef<L.LayerGroup | null>(null);

  const [showBorewells, setShowBorewells] = useState(true);
  const [showRegulatory, setShowRegulatory] = useState(true);
  const [showSatellite, setShowSatellite] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [selectedCoords.lat, selectedCoords.lng],
      zoom: 12,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap dark / standard tile layers
    const osmLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
        maxZoom: 19
      }
    );

    osmLayer.addTo(map);

    borewellsLayerRef.current = L.layerGroup().addTo(map);
    regulatoryLayerRef.current = L.layerGroup().addTo(map);

    // Map click handler to pick location
    map.on('click', (e: L.LeafletMouseEvent) => {
      onSelectCoords(
        parseFloat(e.latlng.lat.toFixed(5)),
        parseFloat(e.latlng.lng.toFixed(5)),
        `Target Site (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`
      );
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center & selected marker when coords change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing user marker & circle
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }

    // Custom Gold Target Pin Icon
    const targetIcon = L.divIcon({
      className: 'custom-target-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-9 h-9 rounded-full bg-[#D4AF37]/30 border-2 border-[#D4AF37] animate-ping absolute"></div>
          <div class="w-8 h-8 rounded-full bg-[#080808] text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center shadow-2xl text-xs font-bold z-10 font-cinzel">
            📍
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    userMarkerRef.current = L.marker([selectedCoords.lat, selectedCoords.lng], {
      icon: targetIcon,
      zIndexOffset: 1000
    }).addTo(map);

    userMarkerRef.current.bindPopup(`
      <div class="text-xs p-1">
        <strong class="text-[#D4AF37] font-semibold block mb-1 font-cinzel tracking-wider uppercase">PROPOSED BOREWELL SITE</strong>
        <p class="text-[#F5F2ED]/80">Lat: ${selectedCoords.lat.toFixed(4)}, Lng: ${selectedCoords.lng.toFixed(4)}</p>
        <span class="text-emerald-400 mt-1 block text-[10px] uppercase font-bold tracking-wider">Ready for 9-Pillar Decision Analysis</span>
      </div>
    `);

    // Radius Circle
    radiusCircleRef.current = L.circle([selectedCoords.lat, selectedCoords.lng], {
      radius: radiusM,
      color: '#D4AF37',
      fillColor: '#D4AF37',
      fillOpacity: 0.07,
      weight: 1.5,
      dashArray: '4, 6'
    }).addTo(map);

    map.panTo([selectedCoords.lat, selectedCoords.lng], { animate: true });
  }, [selectedCoords, radiusM]);

  // Render Borewells layer
  useEffect(() => {
    if (!borewellsLayerRef.current) return;
    borewellsLayerRef.current.clearLayers();

    if (!showBorewells) return;

    borewells.forEach((bw) => {
      let color = '#10b981'; // emerald for safe
      if (bw.groundwater_category === 'OVER_EXPLOITED') color = '#dc2626'; // crimson
      else if (bw.groundwater_category === 'CRITICAL') color = '#ea580c'; // amber orange
      else if (bw.groundwater_category === 'SEMI_CRITICAL') color = '#eab308'; // yellow

      const isHighlighted = highlightedBorewellId === bw.id;

      const markerIcon = L.divIcon({
        className: 'custom-bw-marker',
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-6 h-6 rounded-full border-2 border-[#080808] shadow-lg flex items-center justify-center text-[10px] font-bold text-white transition-transform ${
              isHighlighted ? 'scale-150 ring-4 ring-[#D4AF37]' : 'hover:scale-125'
            }" style="background-color: ${color}">
              ${Math.round(bw.yield_lpm)}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([bw.latitude, bw.longitude], { icon: markerIcon });
      marker.bindPopup(`
        <div class="text-xs p-1 text-[#F5F2ED]">
          <div class="font-bold text-[#F5F2ED] text-sm mb-1">${bw.location_name}</div>
          <div class="text-[11px] text-[#F5F2ED]/50 mb-2 font-mono">Ref: ${bw.external_id}</div>
          <div class="grid grid-cols-2 gap-1.5 bg-[#141414] p-2 rounded-lg border border-[#F5F2ED]/10 mb-2">
            <div><span class="text-[#F5F2ED]/50 text-[10px] uppercase">Depth:</span> <strong class="text-[#F5F2ED] block">${bw.depth_m} m</strong></div>
            <div><span class="text-[#F5F2ED]/50 text-[10px] uppercase">Yield:</span> <strong class="text-[#D4AF37] block">${bw.yield_lpm} LPM</strong></div>
            <div><span class="text-[#F5F2ED]/50 text-[10px] uppercase">Water Table:</span> <strong class="text-[#F5F2ED] block">${bw.static_water_level_m} m</strong></div>
            <div><span class="text-[#F5F2ED]/50 text-[10px] uppercase">Drilled:</span> <strong class="text-[#F5F2ED] block">${bw.drilling_year}</strong></div>
          </div>
          <div class="text-[10px] text-[#F5F2ED]/60">
            <span class="text-[#D4AF37] font-medium uppercase">Strata:</span> ${bw.soil_type} / ${bw.rock_formation}
          </div>
        </div>
      `);

      borewellsLayerRef.current?.addLayer(marker);
    });
  }, [borewells, showBorewells, highlightedBorewellId]);

  // Render Regulatory Zones layer
  useEffect(() => {
    if (!regulatoryLayerRef.current) return;
    regulatoryLayerRef.current.clearLayers();

    if (!showRegulatory) return;

    regulatoryZones.forEach((zone) => {
      const radius = zone.radius_m || 3000;
      const isStrict = zone.restriction_level === 'STRICT';
      const color = isStrict ? '#dc2626' : '#d97706';

      const circle = L.circle([zone.latitude, zone.longitude], {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: isStrict ? '2, 4' : '5, 5'
      });

      circle.bindPopup(`
        <div class="text-xs p-1 text-[#F5F2ED]">
          <div class="font-bold text-rose-400 text-sm mb-1">⚠️ ${zone.name}</div>
          <p class="text-[#F5F2ED]/80 mb-2 text-[11px]">${zone.legal_reference}</p>
          <span class="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            isStrict ? 'bg-rose-950/60 text-rose-300 border border-rose-800' : 'bg-amber-950/60 text-amber-300 border border-amber-800'
          }">
            Restriction: ${zone.restriction_level}
          </span>
        </div>
      `);

      regulatoryLayerRef.current?.addLayer(circle);
    });
  }, [regulatoryZones, showRegulatory]);

  // Handle GPS location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onSelectCoords(
          parseFloat(pos.coords.latitude.toFixed(5)),
          parseFloat(pos.coords.longitude.toFixed(5)),
          'My Device GPS Location'
        );
      },
      (err) => {
        setIsLocating(false);
        // Fallback to Hyderabad city center
        onSelectCoords(17.385, 78.4867, 'Hyderabad Central (GPS fallback)');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-[#F5F2ED]/10 shadow-2xl bg-[#080808] flex flex-col">
      {/* Top Map Floating Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Toggles */}
        <div className="bg-[#080808]/90 backdrop-blur-md p-1.5 rounded-full border border-[#F5F2ED]/15 shadow-xl pointer-events-auto flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setShowBorewells(!showBorewells)}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1.5 transition text-xs cursor-pointer ${
              showBorewells
                ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40'
                : 'text-[#F5F2ED]/60 hover:text-[#F5F2ED]'
            }`}
          >
            {showBorewells ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Borewells ({borewells.length})</span>
          </button>

          <button
            onClick={() => setShowRegulatory(!showRegulatory)}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1.5 transition text-xs cursor-pointer ${
              showRegulatory
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                : 'text-[#F5F2ED]/60 hover:text-[#F5F2ED]'
            }`}
          >
            {showRegulatory ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Regulatory Zones</span>
          </button>
        </div>

        {/* GPS and View Controls */}
        <div className="bg-[#080808]/90 backdrop-blur-md p-1.5 rounded-full border border-[#F5F2ED]/15 shadow-xl pointer-events-auto flex items-center gap-1">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="px-3 py-1 bg-[#141414] hover:bg-[#1f1f1f] text-[#F5F2ED] rounded-full text-xs font-medium flex items-center gap-1.5 border border-[#F5F2ED]/10 hover:border-[#D4AF37]/40 transition cursor-pointer"
            title="Use current GPS position"
          >
            <Navigation className={`w-3.5 h-3.5 text-[#D4AF37] ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'GPS Pin'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-10" />

      {/* Bottom Map Legend Bar */}
      <div className="bg-[#080808]/95 border-t border-[#F5F2ED]/10 px-4 py-2.5 text-xs text-[#F5F2ED]/60 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-[#F5F2ED]/80 flex items-center gap-1.5 font-cinzel text-[11px] uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-[#D4AF37]" /> Yield (LPM):
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span> Safe / High (&gt;50)
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block shadow-sm"></span> Semi-Critical (30-50)
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm"></span> Over-Exploited (&lt;25)
            </span>
          </div>
        </div>
        <div className="text-[11px] text-[#F5F2ED]/50 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#D4AF37]" /> Click map point to reposition borehole assessment coordinates
        </div>
      </div>
    </div>
  );
};
