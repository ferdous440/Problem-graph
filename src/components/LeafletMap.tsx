import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ProblemReport } from '../types';

interface LeafletMapProps {
  mode?: 'explorer' | 'picker' | 'route' | 'detail';
  problems?: ProblemReport[];
  selectedProblem?: ProblemReport | null;
  onSelectProblem?: (problem: ProblemReport) => void;
  // Picker mode props
  initialCoords?: { lat: number; lng: number };
  onLocationPicked?: (coords: { lat: number; lng: number }) => void;
  // Route mode props
  routePolyline?: Array<{ lat: number; lng: number }>;
  originCoords?: { lat: number; lng: number };
  destCoords?: { lat: number; lng: number };
  originName?: string;
  destName?: string;
  corridorBufferMeters?: number;
  height?: string;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  mode = 'explorer',
  problems = [],
  selectedProblem,
  onSelectProblem,
  initialCoords = { lat: 23.8103, lng: 90.4125 }, // Dhaka center
  onLocationPicked,
  routePolyline = [],
  originCoords,
  destCoords,
  originName = 'যাত্রা শুরু',
  destName = 'গন্তব্য',
  corridorBufferMeters = 800,
  height = '500px',
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialCoords.lat, initialCoords.lng],
        zoom: mode === 'picker' ? 14 : 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      // Picker mode click listener
      if (mode === 'picker') {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          updatePickerMarker(lat, lng);
          if (onLocationPicked) {
            onLocationPicked({ lat, lng });
          }
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mode]);

  // Handle Location Picker marker
  const updatePickerMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const pinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="background-color: #0284c7; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      pickerMarkerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(mapInstanceRef.current);
      pickerMarkerRef.current.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng();
        if (onLocationPicked) {
          onLocationPicked({ lat: newPos.lat, lng: newPos.lng });
        }
      });
    }
  };

  useEffect(() => {
    if (mode === 'picker' && initialCoords && mapInstanceRef.current) {
      updatePickerMarker(initialCoords.lat, initialCoords.lng);
      mapInstanceRef.current.setView([initialCoords.lat, initialCoords.lng], 14);
    }
  }, [initialCoords?.lat, initialCoords?.lng, mode]);

  // Color helper by category / severity
  const getMarkerColor = (category: string, severity: string) => {
    if (severity === 'critical') return '#dc2626'; // bright red
    switch (category) {
      case 'যানজট': return '#ef4444';
      case 'রাস্তার ক্ষতি': return '#ea580c';
      case 'জলাবদ্ধতা': return '#0284c7';
      case 'বর্জ্য ব্যবস্থাপনা': return '#65a30d';
      case 'ড্রেনেজ সমস্যা': return '#6366f1';
      case 'বিদ্যুৎ সমস্যা': return '#d97706';
      case 'পানি সমস্যা': return '#0891b2';
      case 'গ্যাস সমস্যা': return '#9333ea';
      case 'নির্মাণকাজ': return '#b45309';
      case 'নিরাপত্তা সংক্রান্ত সমস্যা': return '#db2777';
      default: return '#2563eb';
    }
  };

  // Render problem markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    if (mode === 'picker') return;

    markersLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    problems.forEach(problem => {
      if (!problem.latitude || !problem.longitude) return;

      const color = getMarkerColor(problem.category, problem.severity);
      const isCritical = problem.severity === 'critical';
      const isSelected = selectedProblem?.id === problem.id;

      const markerHtml = `
        <div class="relative group cursor-pointer ${isCritical ? 'pulse-critical' : ''}">
          <div style="background-color: ${color}; width: ${isSelected ? '36px' : '28px'}; height: ${isSelected ? '36px' : '28px'}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
            <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-problem-pin',
        html: markerHtml,
        iconSize: isSelected ? [36, 36] : [28, 28],
        iconAnchor: isSelected ? [18, 36] : [14, 28]
      });

      const marker = L.marker([problem.latitude, problem.longitude], { icon });

      // Popup content
      const popupHtml = `
        <div style="width: 240px; font-family: 'Hind Siliguri', sans-serif;">
          ${problem.images && problem.images[0] ? `<img src="${problem.images[0]}" alt="${problem.title}" style="width: 100%; height: 110px; object-fit: cover; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem;" />` : ''}
          <div style="padding: 10px 12px;">
            <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 4px;">
              <span style="background-color: ${color}20; color: ${color}; font-weight: 600; font-size: 11px; padding: 2px 6px; border-radius: 4px;">
                ${problem.category}
              </span>
              <span style="font-size: 11px; color: #64748b;">
                ${problem.tracking_code}
              </span>
            </div>
            <h4 style="margin: 0 0 6px 0; font-weight: 600; font-size: 13px; line-height: 1.3; color: #0f172a;">
              ${problem.title}
            </h4>
            <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
              📍 ${problem.area}, ${problem.district}
              ${problem.distanceFromRouteMeters !== undefined ? `<br/><span style="color: #2563eb; font-weight: 600;">রুট থেকে ${problem.distanceFromRouteMeters} মি. দূরে</span>` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 6px; font-size: 11px;">
              <span style="color: #64748b;">👍 ${problem.upvotes_count || 0} সমর্থন</span>
              <button id="view-prob-btn-${problem.id}" style="background-color: #0f172a; color: white; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500;">
                বিস্তারিত দেখুন
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-prob-btn-${problem.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectProblem) onSelectProblem(problem);
          };
        }
      });

      marker.on('click', () => {
        if (onSelectProblem) onSelectProblem(problem);
      });

      marker.addTo(markersLayerRef.current!);
      bounds.extend([problem.latitude, problem.longitude]);
    });

    if (problems.length > 0 && mode === 'explorer' && !selectedProblem) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [problems, selectedProblem, mode]);

  // Center selected problem
  useEffect(() => {
    if (selectedProblem && mapInstanceRef.current && selectedProblem.latitude && selectedProblem.longitude) {
      mapInstanceRef.current.setView([selectedProblem.latitude, selectedProblem.longitude], 15, {
        animate: true
      });
    }
  }, [selectedProblem]);

  // Route Polyline and Corridor visualization
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;
    if (mode !== 'route') return;

    routeLayerRef.current.clearLayers();

    if (routePolyline && routePolyline.length > 0) {
      const latLngs: [number, number][] = routePolyline.map(p => [p.lat, p.lng]);

      // Route polyline with navy/teal styling
      const routeLine = L.polyline(latLngs, {
        color: '#0284c7',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      });
      routeLine.addTo(routeLayerRef.current);

      // Corridor buffer line (semi-transparent corridor outline)
      const bufferLine = L.polyline(latLngs, {
        color: '#38bdf8',
        weight: Math.max(16, corridorBufferMeters / 25),
        opacity: 0.25,
        lineCap: 'round',
        lineJoin: 'round'
      });
      bufferLine.addTo(routeLayerRef.current);

      // Origin Marker
      if (originCoords) {
        const startIcon = L.divIcon({
          className: 'start-pin',
          html: `
            <div style="background-color: #10b981; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 14px;">
              A
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([originCoords.lat, originCoords.lng], { icon: startIcon })
          .bindPopup(`<b>যাত্রা শুরু:</b> ${originName}`)
          .addTo(routeLayerRef.current);
      }

      // Destination Marker
      if (destCoords) {
        const endIcon = L.divIcon({
          className: 'end-pin',
          html: `
            <div style="background-color: #ef4444; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 14px;">
              B
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([destCoords.lat, destCoords.lng], { icon: endIcon })
          .bindPopup(`<b>গন্তব্য:</b> ${destName}`)
          .addTo(routeLayerRef.current);
      }

      mapInstanceRef.current.fitBounds(routeLine.getBounds(), { padding: [60, 60] });
    }
  }, [routePolyline, originCoords, destCoords, corridorBufferMeters, mode]);

  // Geolocation trigger function for picker mode
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('আপনার ব্রাউজারে লোকেশন সার্ভিস সমর্থিত নয়।');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([coords.lat, coords.lng], 16);
          updatePickerMarker(coords.lat, coords.lng);
        }
        if (onLocationPicked) {
          onLocationPicked(coords);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('বর্তমান অবস্থান পেতে ব্যর্থ হয়েছে। অনুগ্রহ করে ম্যাপে ক্লিক করে অবস্থান নির্বাচন করুন।');
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${className}`}>
      <div ref={mapContainerRef} style={{ width: '100%', height }} />

      {/* Geolocation Button in Picker Mode */}
      {mode === 'picker' && (
        <button
          type="button"
          onClick={handleCurrentLocation}
          className="absolute top-4 right-4 z-[1000] bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5 transition-all"
        >
          <span>🎯</span> বর্তমান জিপিএস অবস্থান নিন
        </button>
      )}

      {/* Mode hint badge */}
      {mode === 'picker' && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow">
          ম্যাপের যেকোনো স্থানে ক্লিক করে বা মার্কার টেনে অবস্থান সেট করুন
        </div>
      )}
    </div>
  );
};
