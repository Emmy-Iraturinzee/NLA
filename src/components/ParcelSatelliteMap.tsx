import React, { useState } from 'react';
import { Layers, Minus, Plus, Crosshair, Check } from 'lucide-react';

interface ParcelSatelliteMapProps {
  upi: string;
  village: string;
}

type MapLayerMode = 'satellite' | 'cadastral' | 'zoning';

interface SubPlot {
  id: string;
  label: string;
  subNumber: string;
  area: string;
  owner: string;
  points: string;
  cx: number;
  cy: number;
}

const SUB_PLOTS: SubPlot[] = [
  {
    id: 'p1',
    label: '1/03/08/03/13485',
    subNumber: '(1)',
    area: '312 sqm',
    owner: 'Niyonzima Patrick',
    points: '263,76 344,50 361,105 276,125',
    cx: 311,
    cy: 89,
  },
  {
    id: 'p2',
    label: '2/03/08/03/13485',
    subNumber: '(2)',
    area: '328 sqm',
    owner: 'Mpunga James',
    points: '344,50 412,28 430,86 361,105',
    cx: 387,
    cy: 67,
  },
  {
    id: 'p3',
    label: '3/03/08/03/13485',
    subNumber: '(3)',
    area: '340 sqm',
    owner: 'Nyirahabimana D.',
    points: '276,125 361,105 374,143 340,156 289,167',
    cx: 328,
    cy: 139,
  },
  {
    id: 'p4',
    label: '4/03/08/03/13485',
    subNumber: '(4)',
    area: '356 sqm',
    owner: 'Habimana Eric',
    points: '361,105 430,86 449,134 401,150 374,143',
    cx: 403,
    cy: 124,
  },
  {
    id: 'p5',
    label: '5/03/08/03/13485',
    subNumber: '(5)',
    area: '348 sqm',
    owner: 'Uwamahoro Grace',
    points: '340,156 374,143 401,150 411,185 361,201 345,180',
    cx: 372,
    cy: 173,
  },
  {
    id: 'p6',
    label: '6/03/08/03/13485',
    subNumber: '(6)',
    area: '364 sqm',
    owner: 'Hakizimana Eric',
    points: '401,150 449,134 470,170 448,197 411,185',
    cx: 436,
    cy: 167,
  },
  {
    id: 'p7',
    label: '7/03/08/03/13485',
    subNumber: '(7)',
    area: '298 sqm',
    owner: 'Uwimana Solange',
    points: '289,167 340,156 345,180 361,201 334,225 304,234',
    cx: 329,
    cy: 194,
  },
  {
    id: 'p8',
    label: '8/03/08/03/13485',
    subNumber: '(8)',
    area: '330 sqm',
    owner: 'Bizimana Celestin',
    points: '304,234 334,225 361,201 384,242 315,263',
    cx: 340,
    cy: 233,
  },
  {
    id: 'p9',
    label: '9/03/08/03/13485',
    subNumber: '(9)',
    area: '375 sqm',
    owner: 'Murekatete Aline',
    points: '361,201 411,185 448,197 424,228 384,242',
    cx: 406,
    cy: 211,
  },
];

export const ParcelSatelliteMap: React.FC<ParcelSatelliteMapProps> = ({ upi, village }) => {
  const [layerMode, setLayerMode] = useState<MapLayerMode>('satellite');
  const [layersOpen, setLayersOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedPlot, setSelectedPlot] = useState<SubPlot | null>(null);

  return (
    <div className="relative w-full h-[360px] rounded-lg overflow-hidden border border-slate-200 bg-slate-900 select-none">
      {/* Zoomable Uploaded Aerial Map Image */}
      <div
        className="w-full h-full transition-transform duration-300 ease-out origin-center relative"
        style={{ transform: `scale(${zoom})` }}
      >
        <img
          src="/assets/aistudio/MapPlaceholder_1e5dad71.png"
          alt={`Parcel location aerial view for ${upi} in ${village}`}
          className={`w-full h-full object-cover transition-all duration-300 ${
            layerMode === 'cadastral'
              ? 'grayscale contrast-125 brightness-105 opacity-75'
              : layerMode === 'zoning'
              ? 'saturate-150 hue-rotate-15 contrast-105'
              : ''
          }`}
          draggable={false}
        />

        {/* Subtle Cadastral Grid Overlay when Cadastral Vector layer is active */}
        {layerMode === 'cadastral' && (
          <svg
            viewBox="0 0 720 360"
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
          >
            <g stroke="#0284C7" strokeOpacity="0.28" strokeWidth="0.8" strokeDasharray="4 4">
              {Array.from({ length: 12 }, (_, i) => (
                <line key={`v-${i}`} x1={i * 60} y1={0} x2={i * 60} y2={360} />
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <line key={`h-${i}`} x1={0} y1={i * 60} x2={720} y2={i * 60} />
              ))}
            </g>
          </svg>
        )}

        {/* Transparent Interactive Subdivision Hotspots aligned to MapPlaceholder */}
        <svg
          viewBox="0 0 720 360"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {SUB_PLOTS.map((plot) => {
            const isSelected = selectedPlot?.id === plot.id;
            return (
              <polygon
                key={plot.id}
                points={plot.points}
                onClick={() => setSelectedPlot(isSelected ? null : plot)}
                fill={isSelected ? 'rgba(56, 189, 248, 0.28)' : 'transparent'}
                stroke={isSelected ? '#FFFFFF' : 'transparent'}
                strokeWidth={isSelected ? 1.8 : 0}
                className="cursor-pointer hover:fill-sky-300/15 transition-colors"
              />
            );
          })}
        </svg>
      </div>

      {/* Top-Left Layers Control */}
      <div className="absolute top-3 left-3 z-10">
        <button
          type="button"
          onClick={() => setLayersOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#0F172A] text-xs font-semibold shadow-md border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-slate-600" />
          Layers
        </button>

        {layersOpen && (
          <div className="mt-1.5 w-44 rounded-lg bg-white shadow-lg border border-slate-200 p-1.5 text-xs">
            {(
              [
                { id: 'satellite', label: 'Satellite Imagery' },
                { id: 'cadastral', label: 'Cadastral Vector' },
                { id: 'zoning', label: 'Land Use Zoning' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setLayerMode(opt.id);
                  setLayersOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition cursor-pointer ${
                  layerMode === opt.id
                    ? 'bg-[#EFF8FD] text-[#0284C7] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{opt.label}</span>
                {layerMode === opt.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Top-Right Active Parcel Badge */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#0298D8]" />
        <span className="font-mono-code font-semibold text-slate-900">{upi}</span>
        <span className="text-slate-400">·</span>
        <span>{village}</span>
      </div>

      {/* Bottom-Right Zoom Controls */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1 bg-white rounded-lg border border-slate-200 shadow-md p-1">
        <button
          type="button"
          title="Zoom in"
          onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.15).toFixed(2)))}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Reset view"
          onClick={() => {
            setZoom(1);
            setSelectedPlot(null);
          }}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Zoom out"
          onClick={() => setZoom((z) => Math.max(0.85, +(z - 0.15).toFixed(2)))}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Selected Subdivision Tooltip */}
      {selectedPlot && (
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-sky-200 rounded-lg px-3 py-2 shadow-lg text-xs max-w-[240px]">
          <div className="flex items-center justify-between gap-3 mb-0.5">
            <span className="font-mono-code font-semibold text-[#0284C7]">
              {selectedPlot.label} {selectedPlot.subNumber}
            </span>
            <button
              type="button"
              onClick={() => setSelectedPlot(null)}
              className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="text-slate-600">
            Holder: <span className="font-medium text-slate-900">{selectedPlot.owner}</span>
          </div>
          <div className="text-slate-500">Area: {selectedPlot.area}</div>
        </div>
      )}
    </div>
  );
};
