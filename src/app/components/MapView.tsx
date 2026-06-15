import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, PanelRightClose, MessageSquare, Send, Sparkles, AlertTriangle, Utensils, Tent, ShieldAlert, ChevronRight, ChevronUp, ChevronDown, Users, X, Zap, TrendingDown, Package, Route, Crosshair, Calendar, Filter as FilterIcon, History, Clock } from 'lucide-react';
import { cn } from './ui/utils';
import { hasMapboxAccessToken, mapboxgl } from '../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// ── Types ──
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  displayedText?: string;
  isTyping?: boolean;
}

interface ActiveFilter {
  id: string;
  label: string;
  icon: 'location' | 'camp' | 'calendar' | 'people' | 'route' | 'food' | 'danger' | 'trend' | 'package';
}

interface SuggestedAction {
  label: string;
  icon: React.ReactNode;
}

interface ConversationStep {
  userMessage: string;
  assistantResponse: string;
  filters: ActiveFilter[];
  suggestedActions: SuggestedAction[];
  legendTitle: string;
  legendItems: { color: string; label: string; type?: 'circle' | 'square' | 'line' | 'hatch' }[];
  // Data panel items
  panelTitle?: string;
  panelItems?: PanelItem[];
}

interface PanelItem {
  name: string;
  subtitle: string;
  value: string;
  valueLabel?: string;
  dotColor: string;
  coordinates: [number, number];
  highlighted?: boolean;
}

interface ConversationFlow {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  steps: ConversationStep[];
}

interface HistoryItem {
  id: string;
  flowId: string;
  flowLabel: string;
  timestamp: number;
  queries: string[];
  stepReached: number;
}

// ── GeoJSON Data ──

const SOMALIA_DISTRICTS_GEO: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'Baidoa', severity: 'severe', affected: 245000, ipcPhase: 4, region: 'Bay', trend: 'worsening', projected2026: 310000 }, geometry: { type: 'Polygon', coordinates: [[[43.25, 2.25], [43.55, 2.15], [43.85, 2.20], [44.05, 2.40], [44.00, 2.65], [43.90, 2.85], [43.60, 2.95], [43.30, 2.85], [43.15, 2.60], [43.20, 2.40], [43.25, 2.25]]] } },
    { type: 'Feature', properties: { name: 'Mogadishu', severity: 'severe', affected: 312000, ipcPhase: 4, region: 'Banadir', trend: 'worsening', projected2026: 385000 }, geometry: { type: 'Polygon', coordinates: [[[44.92, 1.98], [45.08, 1.95], [45.22, 2.00], [45.28, 2.10], [45.25, 2.22], [45.12, 2.28], [44.98, 2.25], [44.88, 2.15], [44.88, 2.05], [44.92, 1.98]]] } },
    { type: 'Feature', properties: { name: 'Beledweyne', severity: 'severe', affected: 178000, ipcPhase: 4, region: 'Hiraan', trend: 'worsening', projected2026: 234000 }, geometry: { type: 'Polygon', coordinates: [[[44.80, 4.35], [45.10, 4.30], [45.40, 4.40], [45.55, 4.60], [45.50, 4.85], [45.35, 5.05], [45.05, 5.10], [44.80, 5.00], [44.65, 4.78], [44.70, 4.55], [44.80, 4.35]]] } },
    { type: 'Feature', properties: { name: 'Dolow', severity: 'severe', affected: 156000, ipcPhase: 4, region: 'Gedo', trend: 'stable', projected2026: 168000 }, geometry: { type: 'Polygon', coordinates: [[[41.70, 3.85], [42.00, 3.80], [42.30, 3.90], [42.45, 4.10], [42.40, 4.35], [42.20, 4.50], [41.90, 4.48], [41.68, 4.30], [41.60, 4.08], [41.70, 3.85]]] } },
    { type: 'Feature', properties: { name: 'Jowhar', severity: 'severe', affected: 145000, ipcPhase: 4, region: 'Middle Shabelle', trend: 'worsening', projected2026: 198000 }, geometry: { type: 'Polygon', coordinates: [[[45.00, 2.50], [45.25, 2.42], [45.50, 2.48], [45.65, 2.65], [45.62, 2.88], [45.50, 3.05], [45.25, 3.12], [45.02, 3.02], [44.88, 2.82], [44.92, 2.62], [45.00, 2.50]]] } },
    { type: 'Feature', properties: { name: 'Marka', severity: 'moderate', affected: 98000, ipcPhase: 3, region: 'Lower Shabelle', trend: 'stable', projected2026: 112000 }, geometry: { type: 'Polygon', coordinates: [[[44.10, 1.52], [44.35, 1.45], [44.58, 1.52], [44.70, 1.68], [44.68, 1.88], [44.55, 2.02], [44.32, 2.08], [44.10, 1.98], [44.00, 1.78], [44.05, 1.62], [44.10, 1.52]]] } },
    { type: 'Feature', properties: { name: 'Kismayo', severity: 'moderate', affected: 89000, ipcPhase: 3, region: 'Lower Juba', trend: 'improving', projected2026: 78000 }, geometry: { type: 'Polygon', coordinates: [[[41.95, -0.15], [42.18, -0.20], [42.40, -0.12], [42.52, 0.05], [42.48, 0.25], [42.32, 0.38], [42.10, 0.35], [41.92, 0.22], [41.85, 0.02], [41.90, -0.10], [41.95, -0.15]]] } },
    { type: 'Feature', properties: { name: 'Galkayo', severity: 'moderate', affected: 67000, ipcPhase: 3, region: 'Mudug', trend: 'stable', projected2026: 72000 }, geometry: { type: 'Polygon', coordinates: [[[47.05, 6.45], [47.32, 6.38], [47.60, 6.45], [47.78, 6.62], [47.75, 6.88], [47.62, 7.05], [47.35, 7.12], [47.10, 7.02], [46.95, 6.82], [46.98, 6.60], [47.05, 6.45]]] } },
  ]
};

interface CampData {
  name: string;
  population: number;
  lat: number;
  lng: number;
  distanceKm: number;
  services: string[];
  established: string; // date string
  isNew: boolean; // within last 6 months
}

const refugeeCamps: CampData[] = [
  { name: 'Mogadishu IDP Settlement Zone 1', population: 42000, lat: 2.08, lng: 45.28, distanceKm: 8, services: ['Health', 'WASH', 'Food'], established: '2023-03-15', isNew: false },
  { name: 'Kaxda Camp', population: 28500, lat: 2.12, lng: 45.22, distanceKm: 14, services: ['Health', 'Education'], established: '2024-01-20', isNew: false },
  { name: 'Dayniile IDP Camp', population: 35200, lat: 2.09, lng: 45.18, distanceKm: 18, services: ['Food', 'Shelter', 'WASH'], established: '2025-09-10', isNew: true },
  { name: 'Garasbaley Settlement', population: 19800, lat: 2.15, lng: 45.38, distanceKm: 12, services: ['Health', 'Food'], established: '2025-11-05', isNew: true },
  { name: 'Afgooye Corridor Camp A', population: 51000, lat: 2.14, lng: 45.02, distanceKm: 32, services: ['Food', 'WASH', 'Protection'], established: '2022-06-12', isNew: false },
  { name: 'Afgooye Corridor Camp B', population: 38700, lat: 2.10, lng: 44.95, distanceKm: 38, services: ['Shelter', 'Health'], established: '2025-10-22', isNew: true },
  { name: 'Ceelasha Biyaha Camp', population: 22400, lat: 2.06, lng: 45.08, distanceKm: 25, services: ['Education', 'Food'], established: '2025-12-01', isNew: true },
  { name: 'Balcad Settlement', population: 15600, lat: 2.35, lng: 45.40, distanceKm: 42, services: ['Health', 'WASH'], established: '2024-07-18', isNew: false },
  { name: 'Jowhar Refugee Camp', population: 18200, lat: 2.78, lng: 45.50, distanceKm: 85, services: ['Food', 'Shelter'], established: '2023-11-30', isNew: false },
  { name: 'Baidoa IDP Complex', population: 62000, lat: 2.43, lng: 43.65, distanceKm: 245, services: ['Health', 'Food', 'WASH', 'Education'], established: '2021-05-14', isNew: false },
];

// Aid diversion data
interface DiversionZone {
  name: string;
  region: string;
  cases: number;
  severity: 'critical' | 'high' | 'moderate';
  coordinates: [number, number];
  aidTypes: string[];
  controlledBy: string;
}

const diversionZones: DiversionZone[] = [
  { name: 'Jowhar', region: 'Middle Shabelle', cases: 47, severity: 'critical', coordinates: [45.28, 2.78], aidTypes: ['Food', 'Medical Supplies'], controlledBy: 'Armed group checkpoints' },
  { name: 'Marka', region: 'Lower Shabelle', cases: 38, severity: 'critical', coordinates: [44.38, 1.78], aidTypes: ['Food', 'WASH Supplies'], controlledBy: 'Militia-controlled corridor' },
  { name: 'Baidoa', region: 'Bay', cases: 31, severity: 'high', coordinates: [43.65, 2.55], aidTypes: ['Food', 'Cash Transfers'], controlledBy: 'Contested territory' },
  { name: 'Beledweyne', region: 'Hiraan', cases: 24, severity: 'high', coordinates: [45.15, 4.70], aidTypes: ['Medical Supplies', 'Shelter'], controlledBy: 'Flood-zone militias' },
  { name: 'Kismayo', region: 'Lower Juba', cases: 19, severity: 'moderate', coordinates: [42.20, 0.10], aidTypes: ['Food', 'Fuel'], controlledBy: 'Border armed groups' },
  { name: 'Mogadishu', region: 'Banadir', cases: 15, severity: 'moderate', coordinates: [45.05, 2.12], aidTypes: ['Cash Transfers'], controlledBy: 'Urban crime networks' },
];

const DIVERSION_GEO: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'Jowhar', cases: 47, severity: 'critical' }, geometry: { type: 'Polygon', coordinates: [[[45.00, 2.50], [45.25, 2.42], [45.50, 2.48], [45.65, 2.65], [45.62, 2.88], [45.50, 3.05], [45.25, 3.12], [45.02, 3.02], [44.88, 2.82], [44.92, 2.62], [45.00, 2.50]]] } },
    { type: 'Feature', properties: { name: 'Marka', cases: 38, severity: 'critical' }, geometry: { type: 'Polygon', coordinates: [[[44.10, 1.52], [44.35, 1.45], [44.58, 1.52], [44.70, 1.68], [44.68, 1.88], [44.55, 2.02], [44.32, 2.08], [44.10, 1.98], [44.00, 1.78], [44.05, 1.62], [44.10, 1.52]]] } },
    { type: 'Feature', properties: { name: 'Baidoa', cases: 31, severity: 'high' }, geometry: { type: 'Polygon', coordinates: [[[43.25, 2.25], [43.55, 2.15], [43.85, 2.20], [44.05, 2.40], [44.00, 2.65], [43.90, 2.85], [43.60, 2.95], [43.30, 2.85], [43.15, 2.60], [43.20, 2.40], [43.25, 2.25]]] } },
    { type: 'Feature', properties: { name: 'Beledweyne', cases: 24, severity: 'high' }, geometry: { type: 'Polygon', coordinates: [[[44.80, 4.35], [45.10, 4.30], [45.40, 4.40], [45.55, 4.60], [45.50, 4.85], [45.35, 5.05], [45.05, 5.10], [44.80, 5.00], [44.65, 4.78], [44.70, 4.55], [44.80, 4.35]]] } },
    { type: 'Feature', properties: { name: 'Kismayo', cases: 19, severity: 'moderate' }, geometry: { type: 'Polygon', coordinates: [[[41.95, -0.15], [42.18, -0.20], [42.40, -0.12], [42.52, 0.05], [42.48, 0.25], [42.32, 0.38], [42.10, 0.35], [41.92, 0.22], [41.85, 0.02], [41.90, -0.10], [41.95, -0.15]]] } },
    { type: 'Feature', properties: { name: 'Mogadishu', cases: 15, severity: 'moderate' }, geometry: { type: 'Polygon', coordinates: [[[44.92, 1.98], [45.08, 1.95], [45.22, 2.00], [45.28, 2.10], [45.25, 2.22], [45.12, 2.28], [44.98, 2.25], [44.88, 2.15], [44.88, 2.05], [44.92, 1.98]]] } },
  ]
};

// Supply routes
const SUPPLY_ROUTES_GEO: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'Mogadishu–Baidoa Highway', risk: 'high', attacks: 12 }, geometry: { type: 'LineString', coordinates: [[45.05, 2.12], [44.80, 2.25], [44.50, 2.35], [44.20, 2.42], [43.65, 2.55]] } },
    { type: 'Feature', properties: { name: 'Mogadishu–Jowhar Road', risk: 'critical', attacks: 23 }, geometry: { type: 'LineString', coordinates: [[45.05, 2.12], [45.15, 2.35], [45.22, 2.55], [45.28, 2.78]] } },
    { type: 'Feature', properties: { name: 'Mogadishu–Marka Road', risk: 'critical', attacks: 18 }, geometry: { type: 'LineString', coordinates: [[45.05, 2.12], [44.85, 2.00], [44.60, 1.88], [44.38, 1.78]] } },
    { type: 'Feature', properties: { name: 'Beledweyne–Mogadishu Route', risk: 'high', attacks: 9 }, geometry: { type: 'LineString', coordinates: [[45.15, 4.70], [45.18, 4.20], [45.15, 3.60], [45.10, 3.00], [45.05, 2.12]] } },
    { type: 'Feature', properties: { name: 'Kismayo–Mogadishu Coast Road', risk: 'moderate', attacks: 5 }, geometry: { type: 'LineString', coordinates: [[42.20, 0.10], [43.00, 0.80], [43.80, 1.30], [44.38, 1.78], [45.05, 2.12]] } },
  ]
};

// Checkpoint data
interface Checkpoint {
  name: string;
  lat: number;
  lng: number;
  controlledBy: string;
  type: 'armed_group' | 'government' | 'contested';
  tolls: boolean;
}

const checkpoints: Checkpoint[] = [
  { name: 'Afgoye Junction', lat: 2.13, lng: 44.98, controlledBy: 'Al-Shabaab affiliated', type: 'armed_group', tolls: true },
  { name: 'Elasha Biyaha Gate', lat: 2.05, lng: 45.05, controlledBy: 'Clan militia', type: 'armed_group', tolls: true },
  { name: 'KM-50 Checkpoint', lat: 2.35, lng: 44.75, controlledBy: 'Armed group', type: 'armed_group', tolls: true },
  { name: 'Jowhar North Gate', lat: 2.82, lng: 45.30, controlledBy: 'Contested', type: 'contested', tolls: false },
  { name: 'Marka Port Access', lat: 1.72, lng: 44.40, controlledBy: 'Armed group', type: 'armed_group', tolls: true },
  { name: 'Baidoa West Entry', lat: 2.55, lng: 43.50, controlledBy: 'Govt/AMISOM', type: 'government', tolls: false },
  { name: 'Beledweyne Bridge', lat: 4.72, lng: 45.18, controlledBy: 'Contested', type: 'contested', tolls: false },
];

// Food stock depot data
interface FoodDepot {
  name: string;
  lat: number;
  lng: number;
  stockMT: number;
  capacity: number;
  status: 'adequate' | 'low' | 'critical';
}

const foodDepots: FoodDepot[] = [
  { name: 'Mogadishu Central Warehouse', lat: 2.05, lng: 45.32, stockMT: 4200, capacity: 8000, status: 'adequate' },
  { name: 'Baidoa Forward Base', lat: 2.48, lng: 43.60, stockMT: 800, capacity: 3000, status: 'critical' },
  { name: 'Beledweyne Depot', lat: 4.65, lng: 45.12, stockMT: 450, capacity: 2000, status: 'critical' },
  { name: 'Dolow Border Store', lat: 4.10, lng: 42.02, stockMT: 1200, capacity: 2500, status: 'low' },
  { name: 'Garowe Hub', lat: 8.40, lng: 48.50, stockMT: 2800, capacity: 4000, status: 'adequate' },
  { name: 'Kismayo Port Warehouse', lat: 0.08, lng: 42.25, stockMT: 1600, capacity: 3500, status: 'low' },
];

// UNICEF Projects data
interface UNICEFProject {
  name: string;
  location: string;
  lat: number;
  lng: number;
  sector: 'Health' | 'Education' | 'WASH' | 'Nutrition' | 'Protection' | 'Multi-Sector';
  beneficiaries: number;
  status: 'active' | 'completed' | 'planned';
  budget: number; // in USD
  startDate: string;
}

const unicefProjects: UNICEFProject[] = [
  { name: 'Integrated Health & Nutrition Program', location: 'Baidoa', lat: 2.48, lng: 43.65, sector: 'Health', beneficiaries: 125000, status: 'active', budget: 3200000, startDate: '2024-06' },
  { name: 'Emergency WASH Services', location: 'Mogadishu', lat: 2.05, lng: 45.32, sector: 'WASH', beneficiaries: 85000, status: 'active', budget: 1800000, startDate: '2025-01' },
  { name: 'School Feeding & Education', location: 'Hargeisa', lat: 9.56, lng: 44.08, sector: 'Education', beneficiaries: 42000, status: 'active', budget: 950000, startDate: '2024-09' },
  { name: 'Child Protection Services', location: 'Kismayo', lat: 0.08, lng: 42.25, sector: 'Protection', beneficiaries: 18500, status: 'active', budget: 620000, startDate: '2025-02' },
  { name: 'Nutrition Stabilization Centers', location: 'Beledweyne', lat: 4.70, lng: 45.15, sector: 'Nutrition', beneficiaries: 32000, status: 'active', budget: 1100000, startDate: '2024-11' },
  { name: 'Multi-Sector IDP Response', location: 'Garowe', lat: 8.40, lng: 48.48, sector: 'Multi-Sector', beneficiaries: 67000, status: 'active', budget: 2400000, startDate: '2024-08' },
  { name: 'Community WASH Infrastructure', location: 'Galkayo', lat: 6.77, lng: 47.43, sector: 'WASH', beneficiaries: 54000, status: 'active', budget: 1450000, startDate: '2025-01' },
  { name: 'Mobile Health & Vaccination', location: 'Dolow', lat: 4.10, lng: 42.05, sector: 'Health', beneficiaries: 28000, status: 'active', budget: 780000, startDate: '2024-10' },
  { name: 'Education in Emergencies', location: 'Jowhar', lat: 2.78, lng: 45.30, sector: 'Education', beneficiaries: 21000, status: 'active', budget: 640000, startDate: '2025-03' },
  { name: 'Integrated Nutrition Program', location: 'Marka', lat: 1.72, lng: 44.38, sector: 'Nutrition', beneficiaries: 19500, status: 'active', budget: 560000, startDate: '2024-12' },
];

// ── Helper: Create radius circle ──
function createCircle(center: [number, number], radiusKm: number, points = 64): GeoJSON.Feature {
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)]);
  }
  coords.push(coords[0]);
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } };
}

// ── Markdown-lite renderer ──
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-3">
          <table className="w-full text-[13px] leading-[18px] border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {tableHeaders.map((h, i) => (
                  <th key={i} className="text-left px-3 py-2 text-[12px] leading-4 font-semibold text-[#64748B]">{h.trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri} className="border-b border-[#F3F4F6] transition-colors hover:bg-[#F8FAFC]">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-[#4B5563]">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    inTable = false;
    tableRows = [];
    tableHeaders = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').filter(c => c.trim() !== '');
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
        if (lines[i + 1]?.match(/^\|[\s\-|]+\|$/)) i++;
        continue;
      }
      if (line.match(/^\|[\s\-|]+\|$/)) continue;
      tableRows.push(cells);
      continue;
    }
    if (inTable) flushTable();

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-[0.9375rem] font-bold text-[#1f2937] mt-4 mb-2">{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-[0.8125rem] font-semibold text-[#2463EB] mt-3 mb-1.5">{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('- ')) {
      const content = line.replace('- ', '');
      elements.push(
        <div key={i} className="flex gap-2 ml-2 mb-1">
          <span className="text-[#9CA3AF] mt-1.5 flex-shrink-0">•</span>
          <span className="text-[0.8125rem] text-[#4B5563] leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
        </div>
      );
    } else if (line.match(/^\d+\. /)) {
      const num = line.match(/^(\d+)\. /)?.[1];
      const content = line.replace(/^\d+\. /, '');
      elements.push(
        <div key={i} className="flex gap-2 ml-2 mb-1">
          <span className="text-[0.75rem] font-semibold text-[#6B7280] mt-0.5 flex-shrink-0 w-4">{num}.</span>
          <span className="text-[0.8125rem] text-[#4B5563] leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
        </div>
      );
    } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      elements.push(<p key={i} className="text-[0.75rem] text-[#9CA3AF] italic mt-3 mb-1">{line.replace(/^\*|\*$/g, '')}</p>);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    } else {
      elements.push(<p key={i} className="text-[0.8125rem] text-[#4B5563] leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />);
    }
  }
  if (inTable) flushTable();
  return elements;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#1f2937]">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// ── Time ago formatter ──
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// ── Filter icon helper ──
const FILTER_ICONS: Record<ActiveFilter['icon'], string> = {
  location: '📍',
  camp: '🏕',
  calendar: '📅',
  people: '👥',
  route: '🛣',
  food: '🍚',
  danger: '⚠️',
  trend: '📈',
  package: '📦',
};

// ══════════════════════════════════════════════════════════════
// ── CONVERSATION FLOWS DEFINITION ──
// ══════════════════════════════════════════════════════════════

const CONVERSATION_FLOWS: ConversationFlow[] = [
  // ── FLOW 1: IDP Camps ──
  {
    id: 'refugees',
    label: 'Show IDP Camps near Mogadishu',
    icon: <Tent size={16} />,
    color: '#2463EB',
    bgColor: '#E6F7FF',
    steps: [
      {
        userMessage: 'Show IDP Camps near Mogadishu',
        assistantResponse: `## Refugee & IDP Camps Near Mogadishu

Refugee and IDP sites near Mogadishu are concentrated in **Dayniile, Kahda,** and **Wadajir** districts.

There are approximately **237,600 displaced persons** across **7 active camps** within a 50km radius of Mogadishu city center.

### Key Concentrations
- **Afgooye Corridor** — Largest displacement hub with 89,700 people across 2 camps
- **Dayniile District** — 35,200 IDPs in rapidly growing settlement
- **Mogadishu IDP Zone 1** — 42,000 people, closest to city center (8km)

### Service Coverage
- Health facilities: 5 of 7 camps
- WASH access: Only 45% of camp populations
- Education: Available in 2 camps only

*Data source: UNHCR/IOM DTM — Last updated: February 2026*`,
        filters: [
          { id: 'loc', label: 'Mogadishu', icon: 'location' },
          { id: 'type', label: 'Refugee / IDP Camps', icon: 'camp' },
        ],
        suggestedActions: [
          { label: 'Only show camps from last 6 months', icon: <Calendar size={14} /> },
          { label: 'Show new arrivals data', icon: <Users size={14} /> },
          { label: 'Overlay with flooding points', icon: <AlertTriangle size={14} /> },
        ],
        legendTitle: 'Refugee / IDP Camps',
        legendItems: [
          { color: '#38BDF8', label: 'Mogadishu (Origin)', type: 'circle' },
          { color: 'rgba(56,189,248,0.15)', label: '50km Radius', type: 'circle' },
          { color: '#38BDF8', label: 'Camp (in radius)', type: 'circle' },
          { color: '#64748B', label: 'Camp (outside radius)', type: 'circle' },
        ],
        panelTitle: 'CAMPS & SETTLEMENTS',
        panelItems: refugeeCamps.filter(c => c.distanceKm <= 50).map(c => ({
          name: c.name,
          subtitle: `${c.distanceKm}km · ${c.services.join(', ')}`,
          value: `${(c.population / 1000).toFixed(1)}K`,
          dotColor: '#2463EB',
          coordinates: [c.lng, c.lat] as [number, number],
        })),
      },
      {
        userMessage: 'Only show camps established in the last 6 months',
        assistantResponse: `## Filtered: New Camps (Last 6 Months)

**4 camps** were established in the last 6 months within the Mogadishu area, primarily in **Kahda** and **Dayniile** districts.

### New Camps

| Camp | Population | Established | Distance |
|------|-----------|-------------|----------|
| Afgooye Corridor Camp B | 38,700 | Oct 2025 | 38km |
| Dayniile IDP Camp | 35,200 | Sep 2025 | 18km |
| Ceelasha Biyaha Camp | 22,400 | Dec 2025 | 25km |
| Garasbaley Settlement | 19,800 | Nov 2025 | 12km |

### Key Findings
- **116,100 people** displaced in new settlements over 6 months
- Most displacement driven by **conflict-related events** in Lower Shabelle
- Garasbaley Settlement growing at **fastest rate** — 3,200 new arrivals in January alone
- Only 1 of 4 new camps has adequate WASH infrastructure

*Data source: UNHCR/IOM DTM — Last updated: February 2026*`,
        filters: [
          { id: 'loc', label: 'Mogadishu', icon: 'location' },
          { id: 'type', label: 'Camps', icon: 'camp' },
          { id: 'date', label: 'Last 6 months', icon: 'calendar' },
        ],
        suggestedActions: [
          { label: 'Which have more than 5,000 people?', icon: <Users size={14} /> },
          { label: 'Show service gaps in these camps', icon: <Package size={14} /> },
        ],
        legendTitle: 'New Camps (Last 6 Months)',
        legendItems: [
          { color: '#38BDF8', label: 'Mogadishu (Origin)', type: 'circle' },
          { color: '#38BDF8', label: 'New Camp (in radius)', type: 'circle' },
          { color: '#64748B', label: 'Older camps (hidden)', type: 'circle' },
        ],
        panelTitle: 'NEW CAMPS (< 6 MONTHS)',
        panelItems: refugeeCamps.filter(c => c.isNew && c.distanceKm <= 50).map(c => ({
          name: c.name,
          subtitle: `Est. ${c.established} · ${c.distanceKm}km`,
          value: `${(c.population / 1000).toFixed(1)}K`,
          dotColor: '#38BDF8',
          coordinates: [c.lng, c.lat] as [number, number],
          highlighted: true,
        })),
      },
      {
        userMessage: 'Which of these have more than 5,000 people?',
        assistantResponse: `## Filtered: Large New Camps (>5,000 population)

All **4 new camps** exceed the 5,000 population threshold. The largest is **Afgooye Corridor Camp B** with 38,700 residents.

### Population Breakdown

- **Afgooye Corridor Camp B** — 38,700 people (largest new camp)
- **Dayniile IDP Camp** — 35,200 people (fastest growing)
- **Ceelasha Biyaha Camp** — 22,400 people
- **Garasbaley Settlement** — 19,800 people

### Critical Observations
- All 4 camps have populations **well above 5,000** — indicating mass displacement events
- Combined population: **116,100 people** in settlements less than 6 months old
- **Dayniile** is projected to reach 45,000 by mid-2026 at current growth rate
- Urgent need for **scaled-up food distribution** and **health clinic construction**

### Recommended Actions
1. Deploy mobile health teams to Afgooye Corridor Camp B immediately
2. Establish permanent WASH facilities at Garasbaley
3. Coordinate with WFP for emergency food pipeline to all 4 sites

*Data source: UNHCR/IOM DTM — Last updated: February 2026*`,
        filters: [
          { id: 'loc', label: 'Mogadishu', icon: 'location' },
          { id: 'type', label: 'Camps', icon: 'camp' },
          { id: 'date', label: 'Last 6 months', icon: 'calendar' },
          { id: 'pop', label: '> 5,000 people', icon: 'people' },
        ],
        suggestedActions: [
          { label: 'Show drought-affected districts in Puntland', icon: <Zap size={14} /> },
        ],
        legendTitle: 'Large New Camps (>5K)',
        legendItems: [
          { color: '#38BDF8', label: 'Mogadishu (Origin)', type: 'circle' },
          { color: '#38BDF8', label: 'Large new camp', type: 'circle' },
        ],
        panelTitle: 'LARGE NEW CAMPS (>5K)',
        panelItems: refugeeCamps
          .filter(c => c.isNew && c.distanceKm <= 50 && c.population > 5000)
          .sort((a, b) => b.population - a.population)
          .map(c => ({
            name: c.name,
            subtitle: `Est. ${c.established}`,
            value: `${(c.population / 1000).toFixed(1)}K`,
            valueLabel: 'people',
            dotColor: '#38BDF8',
            coordinates: [c.lng, c.lat] as [number, number],
            highlighted: true,
          })),
      },
    ],
  },
  // ── FLOW 2: Aid Diversion ──
  {
    id: 'diversion',
    label: 'Which areas have most aid diversion cases?',
    icon: <ShieldAlert size={16} />,
    color: '#EA580C',
    bgColor: '#FFF7ED',
    steps: [
      {
        userMessage: 'Which areas have most aid diversion cases?',
        assistantResponse: `## Aid Diversion Hotspots — Somalia

Analysis of reported aid diversion incidents over the past 12 months identifies **6 districts** with significant diversion activity, totaling **174 documented cases**.

### Critical Diversion Zones

- **Jowhar (Middle Shabelle)** — 47 cases. Armed group checkpoints diverting food and medical supplies on the Mogadishu–Jowhar road.
- **Marka (Lower Shabelle)** — 38 cases. Militia-controlled corridor systematically taxing WASH and food convoys.

### High Diversion Zones

- **Baidoa (Bay)** — 31 cases. Contested territory with food and cash transfer diversion.
- **Beledweyne (Hiraan)** — 24 cases. Flood-zone militias diverting medical supplies and shelter materials.

### Moderate Diversion Zones

- **Kismayo (Lower Juba)** — 19 cases. Border armed groups intercepting food and fuel shipments.
- **Mogadishu (Banadir)** — 15 cases. Urban crime networks targeting cash transfers.

### Impact
- An estimated **$12.3M** in humanitarian aid diverted in the last 12 months
- **65%** of diversion involves food supplies
- **23%** involves medical equipment and pharmaceuticals

*Data source: OCHA Access Monitoring & UNDSS — Last updated: February 2026*`,
        filters: [
          { id: 'type', label: 'Aid Diversion', icon: 'danger' },
          { id: 'time', label: 'Last 12 months', icon: 'calendar' },
        ],
        suggestedActions: [
          { label: 'Show the supply routes affected', icon: <Route size={14} /> },
          { label: 'What types of aid are most diverted?', icon: <Package size={14} /> },
          { label: 'Which organizations are impacted?', icon: <Users size={14} /> },
        ],
        legendTitle: 'Aid Diversion Hotspots',
        legendItems: [
          { color: '#EF4444', label: 'Critical (30+ cases)', type: 'square' },
          { color: '#F97316', label: 'High (20-29 cases)', type: 'square' },
          { color: '#FBBF24', label: 'Moderate (<20 cases)', type: 'square' },
        ],
        panelTitle: 'DIVERSION HOTSPOTS',
        panelItems: diversionZones.map(z => ({
          name: z.name,
          subtitle: `${z.region} · ${z.aidTypes.join(', ')}`,
          value: `${z.cases}`,
          valueLabel: 'cases',
          dotColor: z.severity === 'critical' ? '#EF4444' : z.severity === 'high' ? '#F97316' : '#FBBF24',
          coordinates: z.coordinates,
        })),
      },
      {
        userMessage: 'Show the supply routes affected',
        assistantResponse: `## Affected Supply Routes

**5 major supply corridors** are currently compromised by aid diversion activity. The most dangerous is the **Mogadishu–Jowhar Road** with 23 convoy attacks in the past year.

### Critical Routes

🔴 **Mogadishu–Jowhar Road** — 23 attacks. Primary Al-Shabaab operational corridor. Armed checkpoints at KM-20 and KM-35.

🔴 **Mogadishu–Marka Road** — 18 attacks. Militia checkpoints every 15km. Convoy escorts required but frequently ambushed.

### High-Risk Routes

🟠 **Mogadishu–Baidoa Highway** — 12 attacks. Longest route (250km) with multiple contested zones. IED threats increasing.

🟠 **Beledweyne–Mogadishu Route** — 9 attacks. Flash flooding compounds security risks on this corridor.

### Moderate Risk

🟡 **Kismayo–Mogadishu Coast Road** — 5 attacks. Relatively safer but emerging threats from border incursions.

### Recommendations
1. Increase convoy frequency on Mogadishu–Baidoa route (economy of force)
2. Explore air delivery alternatives for Jowhar-bound aid
3. Negotiate humanitarian corridor agreements for Marka route

*Data source: UNDSS Convoy Tracking — Last updated: February 2026*`,
        filters: [
          { id: 'type', label: 'Aid Diversion', icon: 'danger' },
          { id: 'time', label: 'Last 12 months', icon: 'calendar' },
          { id: 'routes', label: 'Supply Routes', icon: 'route' },
        ],
        suggestedActions: [
          { label: 'Which checkpoints are armed group controlled?', icon: <Crosshair size={14} /> },
          { label: 'Show alternative delivery options', icon: <Package size={14} /> },
        ],
        legendTitle: 'Supply Routes at Risk',
        legendItems: [
          { color: '#EF4444', label: 'Critical risk route', type: 'line' },
          { color: '#F97316', label: 'High risk route', type: 'line' },
          { color: '#FBBF24', label: 'Moderate risk route', type: 'line' },
          { color: '#EF4444', label: 'Diversion hotspot', type: 'square' },
        ],
        panelTitle: 'SUPPLY ROUTES',
        panelItems: [
          { name: 'Mogadishu–Jowhar Road', subtitle: 'Critical · Al-Shabaab corridor', value: '23', valueLabel: 'attacks', dotColor: '#EF4444', coordinates: [45.15, 2.45] },
          { name: 'Mogadishu–Marka Road', subtitle: 'Critical · Militia checkpoints', value: '18', valueLabel: 'attacks', dotColor: '#EF4444', coordinates: [44.70, 1.95] },
          { name: 'Mogadishu–Baidoa Highway', subtitle: 'High risk · IED threats', value: '12', valueLabel: 'attacks', dotColor: '#F97316', coordinates: [44.30, 2.35] },
          { name: 'Beledweyne–Mogadishu Route', subtitle: 'High risk · Flooding + security', value: '9', valueLabel: 'attacks', dotColor: '#F97316', coordinates: [45.10, 3.40] },
          { name: 'Kismayo–Mogadishu Coast Rd', subtitle: 'Moderate · Emerging threats', value: '5', valueLabel: 'attacks', dotColor: '#FBBF24', coordinates: [43.60, 1.10] },
        ],
      },
      {
        userMessage: 'Which checkpoints are controlled by armed groups?',
        assistantResponse: `## Armed Group Checkpoints

**5 of 7 major checkpoints** along these supply routes are controlled by armed groups or contested between factions.

### Armed Group Controlled

🔴 **Afgoye Junction** — Al-Shabaab affiliated. Systematic "taxation" of all humanitarian convoys. Estimated $50-200 per truck.

🔴 **Elasha Biyaha Gate** — Clan militia. Demands cargo inspection and takes percentage of food supplies.

🔴 **KM-50 Checkpoint** — Armed group. Strategic chokepoint on Baidoa highway. Multiple aid worker detentions reported.

🔴 **Marka Port Access** — Armed group. Controls sole access to port facilities. All WASH materials subject to confiscation.

### Contested

🟠 **Jowhar North Gate** — Alternates between government and armed group control. Unpredictable access.

🟠 **Beledweyne Bridge** — Key river crossing. Control shifts frequently during flood season.

### Government Controlled (Safe)

🟢 **Baidoa West Entry** — Govt/AMISOM controlled. Reliable access point but limited hours (6AM-4PM).

### Impact Assessment
- Armed checkpoints add **$2.1M annually** in illegal tolls to humanitarian operations
- Average delay at armed checkpoints: **4.5 hours per convoy**
- 3 incidents of aid worker detention in last 90 days

*Data source: UNDSS/OCHA — Last updated: February 2026*`,
        filters: [
          { id: 'type', label: 'Aid Diversion', icon: 'danger' },
          { id: 'time', label: 'Last 12 months', icon: 'calendar' },
          { id: 'routes', label: 'Supply Routes', icon: 'route' },
          { id: 'checkpoints', label: 'Checkpoints', icon: 'location' },
        ],
        suggestedActions: [
          { label: 'Show IDP Camps near Mogadishu', icon: <Tent size={14} /> },
        ],
        legendTitle: 'Checkpoints & Routes',
        legendItems: [
          { color: '#EF4444', label: 'Armed group checkpoint', type: 'circle' },
          { color: '#F97316', label: 'Contested checkpoint', type: 'circle' },
          { color: '#4ADE80', label: 'Government controlled', type: 'circle' },
          { color: '#EF4444', label: 'Critical route', type: 'line' },
          { color: '#F97316', label: 'High risk route', type: 'line' },
        ],
        panelTitle: 'CHECKPOINTS',
        panelItems: checkpoints.map(cp => ({
          name: cp.name,
          subtitle: `${cp.controlledBy}${cp.tolls ? ' · Illegal tolls' : ''}`,
          value: cp.type === 'armed_group' ? '⛔' : cp.type === 'contested' ? '⚠️' : '✅',
          dotColor: cp.type === 'armed_group' ? '#EF4444' : cp.type === 'contested' ? '#F97316' : '#4ADE80',
          coordinates: [cp.lng, cp.lat] as [number, number],
        })),
      },
    ],
  },
  // ── FLOW 3: Drought Impact ──
  {
    id: 'hunger2026',
    label: 'Which areas will be most impacted by drought?',
    icon: <Utensils size={16} />,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    steps: [
      {
        userMessage: 'Which areas will be most impacted by drought?',
        assistantResponse: `## Projected Food Insecurity — 2026

Based on IPC projections, **an estimated 4.6 million people** across Somalia will face crisis-level food insecurity or worse by mid-2026 — a **7% increase** from current levels.

### IPC Phase 4 (Emergency) — Projected Districts

- **Mogadishu (Banadir)** — 385,000 people (up from 312,000)
- **Baidoa (Bay)** — 310,000 people (up from 245,000)
- **Beledweyne (Hiraan)** — 234,000 people (up from 178,000)
- **Jowhar (Middle Shabelle)** — 198,000 people (up from 145,000)
- **Dolow (Gedo)** — 168,000 people (up from 156,000)

### IPC Phase 3 (Crisis) — Projected Districts

- **Marka (Lower Shabelle)** — 112,000 people
- **Kismayo (Lower Juba)** — 78,000 people (improving)
- **Galkayo (Mudug)** — 72,000 people

### Key Drivers
1. La Niña conditions expected to cause **below-average Gu rains** (April–June)
2. Conflict intensification in Bay and Hiraan regions
3. Rising food prices — cereal costs up 34% year-over-year

*Data source: FSNAU/FEWS NET Projections — February 2026*`,
        filters: [
          { id: 'type', label: 'Hunger Projection', icon: 'food' },
          { id: 'year', label: '2026', icon: 'calendar' },
        ],
        suggestedActions: [
          { label: 'Which districts are deteriorating fastest?', icon: <TrendingDown size={14} /> },
          { label: 'Compare with 2025 baseline', icon: <FilterIcon size={14} /> },
          { label: 'Show pre-positioned food stocks', icon: <Package size={14} /> },
        ],
        legendTitle: 'Hunger Projection 2026',
        legendItems: [
          { color: '#EF4444', label: 'IPC Phase 4 — Emergency', type: 'square' },
          { color: '#F97316', label: 'IPC Phase 3 — Crisis', type: 'square' },
          { color: '#FACC15', label: 'IPC Phase 2 — Stressed', type: 'square' },
        ],
        panelTitle: 'PROJECTED DISTRICTS (2026)',
        panelItems: [
          { name: 'Mogadishu', subtitle: 'Banadir · IPC Phase 4', value: '385K', dotColor: '#EF4444', coordinates: [45.05, 2.12] },
          { name: 'Baidoa', subtitle: 'Bay · IPC Phase 4', value: '310K', dotColor: '#EF4444', coordinates: [43.65, 2.55] },
          { name: 'Beledweyne', subtitle: 'Hiraan · IPC Phase 4', value: '234K', dotColor: '#EF4444', coordinates: [45.15, 4.70] },
          { name: 'Jowhar', subtitle: 'M. Shabelle · IPC Phase 4', value: '198K', dotColor: '#EF4444', coordinates: [45.28, 2.78] },
          { name: 'Dolow', subtitle: 'Gedo · IPC Phase 4', value: '168K', dotColor: '#EF4444', coordinates: [42.05, 4.15] },
          { name: 'Marka', subtitle: 'L. Shabelle · IPC Phase 3', value: '112K', dotColor: '#F97316', coordinates: [44.38, 1.78] },
          { name: 'Kismayo', subtitle: 'L. Juba · IPC Phase 3', value: '78K', dotColor: '#F97316', coordinates: [42.20, 0.10] },
          { name: 'Galkayo', subtitle: 'Mudug · IPC Phase 3', value: '72K', dotColor: '#F97316', coordinates: [47.40, 6.75] },
        ],
      },
      {
        userMessage: 'Which districts are deteriorating fastest?',
        assistantResponse: `## Fastest Deteriorating Districts

Analysis of year-over-year IPC trends reveals **4 districts** with rapidly worsening food security conditions.

### Rapidly Worsening

🔴 **Beledweyne (Hiraan)** — **+31.5%** increase projected. Population affected rising from 178K to 234K. Driven by recurring floods destroying farmland and conflict-related displacement.

🔴 **Jowhar (Middle Shabelle)** — **+36.6%** increase projected. Fastest deterioration rate. Agricultural production collapsed due to Al-Shabaab imposed restrictions on farming.

🔴 **Baidoa (Bay)** — **+26.5%** increase projected. Territory disputes preventing farmers from accessing fields. Livestock mortality rising.

🔴 **Mogadishu (Banadir)** — **+23.4%** increase projected. Urban displacement influx overwhelming existing food distribution capacity.

### Stable Districts

🟡 **Dolow** — +7.7% (moderate increase, aid pipeline maintained)
🟡 **Marka** — +14.3% (stable with existing interventions)
🟡 **Galkayo** — +7.5% (pastoral economy recovering)

### Improving

🟢 **Kismayo** — **-12.4%** decrease projected. Port operations resuming, agricultural production recovering in Lower Juba.

*Data source: FSNAU Trend Analysis — February 2026*`,
        filters: [
          { id: 'type', label: 'Hunger Projection', icon: 'food' },
          { id: 'year', label: '2026', icon: 'calendar' },
          { id: 'trend', label: 'Deteriorating', icon: 'trend' },
        ],
        suggestedActions: [
          { label: 'Where should we pre-position food stocks?', icon: <Package size={14} /> },
          { label: 'Show aid delivery routes to worst areas', icon: <Route size={14} /> },
        ],
        legendTitle: 'Deterioration Trend',
        legendItems: [
          { color: '#EF4444', label: 'Rapidly worsening (>20%)', type: 'square' },
          { color: '#FBBF24', label: 'Stable / slight increase', type: 'square' },
          { color: '#4ADE80', label: 'Improving', type: 'square' },
        ],
        panelTitle: 'DETERIORATION RANKING',
        panelItems: [
          { name: 'Jowhar', subtitle: 'M. Shabelle · +36.6%', value: '198K', dotColor: '#EF4444', coordinates: [45.28, 2.78], highlighted: true },
          { name: 'Beledweyne', subtitle: 'Hiraan · +31.5%', value: '234K', dotColor: '#EF4444', coordinates: [45.15, 4.70], highlighted: true },
          { name: 'Baidoa', subtitle: 'Bay · +26.5%', value: '310K', dotColor: '#EF4444', coordinates: [43.65, 2.55], highlighted: true },
          { name: 'Mogadishu', subtitle: 'Banadir · +23.4%', value: '385K', dotColor: '#EF4444', coordinates: [45.05, 2.12], highlighted: true },
          { name: 'Marka', subtitle: 'L. Shabelle · +14.3%', value: '112K', dotColor: '#FBBF24', coordinates: [44.38, 1.78] },
          { name: 'Dolow', subtitle: 'Gedo · +7.7%', value: '168K', dotColor: '#FBBF24', coordinates: [42.05, 4.15] },
          { name: 'Galkayo', subtitle: 'Mudug · +7.5%', value: '72K', dotColor: '#FBBF24', coordinates: [47.40, 6.75] },
          { name: 'Kismayo', subtitle: 'L. Juba · -12.4%', value: '78K', dotColor: '#4ADE80', coordinates: [42.20, 0.10] },
        ],
      },
      {
        userMessage: 'Where should we pre-position food stocks?',
        assistantResponse: `## Recommended Pre-Positioning Locations

Based on projected deterioration and current supply chain analysis, **6 depot locations** have been identified for food stock pre-positioning ahead of the 2026 Gu season.

### Critical Priority (Stock Immediately)

🔴 **Baidoa Forward Base** — Current stock: 800 MT / 3,000 MT capacity. Only **27% filled**. Covers Bay, Bakool regions. Need immediate 2,200 MT resupply.

🔴 **Beledweyne Depot** — Current stock: 450 MT / 2,000 MT capacity. Only **23% filled**. Serves Hiraan region. Air delivery may be required due to route insecurity.

### High Priority

🟠 **Dolow Border Store** — Current stock: 1,200 MT / 2,500 MT capacity. **48% filled**. Strategic for Gedo region and cross-border operations.

🟠 **Kismayo Port Warehouse** — Current stock: 1,600 MT / 3,500 MT capacity. **46% filled**. Port access enables maritime resupply.

### Adequate

🟢 **Mogadishu Central Warehouse** — 4,200 MT / 8,000 MT. **53% filled**. Main distribution hub, well-supplied.

🟢 **Garowe Hub** — 2,800 MT / 4,000 MT. **70% filled**. Puntland coverage adequate.

### Total Gap Analysis
- Current national stock: **11,050 MT**
- Required by April 2026: **23,000 MT**
- **Deficit: 11,950 MT** ($18.2M estimated cost)

*Data source: WFP Logistics Cluster — February 2026*`,
        filters: [
          { id: 'type', label: 'Hunger Projection', icon: 'food' },
          { id: 'year', label: '2026', icon: 'calendar' },
          { id: 'trend', label: 'Deteriorating', icon: 'trend' },
          { id: 'stocks', label: 'Food Stocks', icon: 'package' },
        ],
        suggestedActions: [
          { label: 'Show IDP Camps near Mogadishu', icon: <Tent size={14} /> },
        ],
        legendTitle: 'Pre-Positioning Status',
        legendItems: [
          { color: '#EF4444', label: 'Critical (<30% filled)', type: 'square' },
          { color: '#F97316', label: 'Low (30-50% filled)', type: 'square' },
          { color: '#4ADE80', label: 'Adequate (>50% filled)', type: 'square' },
          { color: '#EF4444', label: 'Worsening district', type: 'hatch' },
        ],
        panelTitle: 'FOOD DEPOTS',
        panelItems: foodDepots.map(d => ({
          name: d.name,
          subtitle: `${d.stockMT.toLocaleString()} / ${d.capacity.toLocaleString()} MT`,
          value: `${Math.round((d.stockMT / d.capacity) * 100)}%`,
          valueLabel: 'filled',
          dotColor: d.status === 'critical' ? '#EF4444' : d.status === 'low' ? '#F97316' : '#4ADE80',
          coordinates: [d.lng, d.lat] as [number, number],
          highlighted: d.status === 'critical',
        })),
      },
    ],
  },
  // ── FLOW 4: UNICEF Projects ──
  {
    id: 'unicef',
    label: 'Show me UNICEF projects in Somalia',
    icon: <Users size={16} />,
    color: '#0891B2',
    bgColor: '#ECFEFF',
    steps: [
      {
        userMessage: 'Show me UNICEF projects in Somalia',
        assistantResponse: `## UNICEF Programs in Somalia — 2024-2026

UNICEF currently operates **10 active programs** across Somalia, reaching an estimated **492,000 beneficiaries** with a combined budget of **$13.5 million**.

### Programs by Sector

**Health & Nutrition** — 4 projects, 204,500 beneficiaries
- Integrated Health & Nutrition Program (Baidoa) — 125,000 people
- Nutrition Stabilization Centers (Beledweyne) — 32,000 people
- Mobile Health & Vaccination (Dolow) — 28,000 people
- Integrated Nutrition Program (Marka) — 19,500 people

**WASH (Water, Sanitation & Hygiene)** — 2 projects, 139,000 beneficiaries
- Emergency WASH Services (Mogadishu) — 85,000 people
- Community WASH Infrastructure (Galkayo) — 54,000 people

**Education** — 2 projects, 63,000 beneficiaries
- School Feeding & Education (Hargeisa) — 42,000 children
- Education in Emergencies (Jowhar) — 21,000 children

**Child Protection** — 1 project, 18,500 beneficiaries
- Child Protection Services (Kismayo)

**Multi-Sector Response** — 1 project, 67,000 beneficiaries
- Multi-Sector IDP Response (Garowe)

### Geographic Coverage
Programs are distributed across **10 districts** in South-Central, Puntland, and Somaliland regions.

*Data source: UNICEF Somalia Country Office — February 2026*`,
        filters: [
          { id: 'org', label: 'UNICEF', icon: 'people' },
          { id: 'status', label: 'Active Projects', icon: 'calendar' },
        ],
        suggestedActions: [
          { label: 'Show only health & nutrition projects', icon: <AlertTriangle size={14} /> },
          { label: 'Filter by beneficiary count', icon: <Users size={14} /> },
          { label: 'Show project budgets', icon: <Package size={14} /> },
        ],
        legendTitle: 'UNICEF Projects',
        legendItems: [
          { color: '#0891B2', label: 'Health & Nutrition', type: 'circle' },
          { color: '#06B6D4', label: 'WASH', type: 'circle' },
          { color: '#22D3EE', label: 'Education', type: 'circle' },
          { color: '#67E8F9', label: 'Protection', type: 'circle' },
          { color: '#A5F3FC', label: 'Multi-Sector', type: 'circle' },
        ],
        panelTitle: 'UNICEF PROGRAMS',
        panelItems: unicefProjects.map(p => ({
          name: p.name,
          subtitle: `${p.location} · ${p.sector}`,
          value: `${(p.beneficiaries / 1000).toFixed(0)}K`,
          valueLabel: 'people',
          dotColor: p.sector === 'Health' || p.sector === 'Nutrition' ? '#0891B2' : 
                    p.sector === 'WASH' ? '#06B6D4' : 
                    p.sector === 'Education' ? '#22D3EE' : 
                    p.sector === 'Protection' ? '#67E8F9' : '#A5F3FC',
          coordinates: [p.lng, p.lat] as [number, number],
        })),
      },
      {
        userMessage: 'Show only health & nutrition projects',
        assistantResponse: `## UNICEF Health & Nutrition Programs

Filtering to show **4 health and nutrition programs** serving **204,500 beneficiaries** across South-Central Somalia.

### Active Programs

| Project | Location | Beneficiaries | Budget |
|---------|----------|---------------|--------|
| Integrated Health & Nutrition | Baidoa | 125,000 | $3.2M |
| Nutrition Stabilization Centers | Beledweyne | 32,000 | $1.1M |
| Mobile Health & Vaccination | Dolow | 28,000 | $780K |
| Integrated Nutrition Program | Marka | 19,500 | $560K |

### Key Activities
- Treatment of acute malnutrition (SAM & MAM)
- Routine immunization campaigns
- Maternal & child health services
- Community nutrition education
- Mobile health teams in hard-to-reach areas

### Impact Highlights
- **87% coverage** of target vaccination rates in program areas
- **12,400 children** treated for severe acute malnutrition in 2025
- **340 community health workers** trained and deployed

*Data source: UNICEF Somalia Health & Nutrition Cluster — February 2026*`,
        filters: [
          { id: 'org', label: 'UNICEF', icon: 'people' },
          { id: 'sector', label: 'Health & Nutrition', icon: 'food' },
        ],
        suggestedActions: [
          { label: 'Compare with WFP food distribution', icon: <Utensils size={14} /> },
          { label: 'Show malnutrition hotspots', icon: <AlertTriangle size={14} /> },
        ],
        legendTitle: 'Health & Nutrition Projects',
        legendItems: [
          { color: '#0891B2', label: 'Health', type: 'circle' },
          { color: '#06B6D4', label: 'Nutrition', type: 'circle' },
        ],
        panelTitle: 'HEALTH & NUTRITION',
        panelItems: unicefProjects
          .filter(p => p.sector === 'Health' || p.sector === 'Nutrition')
          .map(p => ({
            name: p.name,
            subtitle: `${p.location} · ${p.sector}`,
            value: `${(p.beneficiaries / 1000).toFixed(0)}K`,
            valueLabel: 'people',
            dotColor: p.sector === 'Health' ? '#0891B2' : '#06B6D4',
            coordinates: [p.lng, p.lat] as [number, number],
            highlighted: true,
          })),
      },
    ],
  },
];

const LG_BREAKPOINT = 1024;

// ══════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ──
// ══════════════════════════════════════════════════════════════

export function MapView() {
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [mapQuery, setMapQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [queryHistory, setQueryHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const pinnedPopupRef = useRef<mapboxgl.Popup | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const activeFlow = activeFlowId ? CONVERSATION_FLOWS.find(f => f.id === activeFlowId) : null;
  const currentStep = activeFlow ? activeFlow.steps[currentStepIndex] : null;

  useEffect(() => {
    const syncViewport = () => setIsMobileViewport(window.innerWidth < LG_BREAKPOINT);
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  useEffect(() => {
    if (!isMobileViewport) {
      setIsMobilePanelOpen(false);
    }
  }, [isMobileViewport]);

  const openMobilePanel = useCallback(() => setIsMobilePanelOpen(true), []);
  const closeMobilePanel = useCallback(() => setIsMobilePanelOpen(false), []);

  const scrollChatToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior });
      return;
    }
    chatEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  // Initialize map
  useEffect(() => {
    const container = mapRef.current;
    const observeTarget = mapContainerRef.current;
    if (!hasMapboxAccessToken() || !container || !observeTarget || mapInstanceRef.current) {
      return;
    }

    let cancelled = false;
    let observer: ResizeObserver | null = null;
    let map: mapboxgl.Map | null = null;

    const initMap = () => {
      if (cancelled || !container || mapInstanceRef.current) {
        return;
      }

      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) {
        requestAnimationFrame(initMap);
        return;
      }

      map = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: [46.0, 5.0],
        zoom: 5.2,
        attributionControl: false,
        pitch: 0,
      });
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
      map.addControl(new mapboxgl.ScaleControl({ maxWidth: 150 }), 'bottom-left');
      map.on('load', () => {
        map?.resize();
        // Hatching pattern
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d')!;
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(16, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-4, 4); ctx.lineTo(4, -4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(12, 20); ctx.lineTo(20, 12); ctx.stroke();
        map?.addImage('hatching-pattern', { width: 16, height: 16, data: ctx.getImageData(0, 0, 16, 16).data } as any);
      });
      // Click on empty map area dismisses pinned popup
      map.on('click', () => {
        if (pinnedPopupRef.current) {
          pinnedPopupRef.current.remove();
          pinnedPopupRef.current = null;
        }
      });
      mapInstanceRef.current = map;

      observer = new ResizeObserver(() => {
        map?.resize();
      });
      observer.observe(observeTarget);
    };

    requestAnimationFrame(initMap);

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) {
      return;
    }

    mapInstanceRef.current.resize();
    const resizeTimer = window.setTimeout(() => {
      mapInstanceRef.current?.resize();
    }, 320);

    return () => window.clearTimeout(resizeTimer);
  }, [isPanelMinimized, isMobilePanelOpen, isMobileViewport]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    scrollChatToBottom('smooth');
  }, [chatMessages, scrollChatToBottom]);

  // Resume at most recent message when reopening the mobile sheet or desktop panel
  useEffect(() => {
    if (isMobileViewport && !isMobilePanelOpen) return;
    if (!isMobileViewport && isPanelMinimized) return;
    const timer = window.setTimeout(() => scrollChatToBottom('auto'), isMobileViewport ? 320 : 0);
    return () => window.clearTimeout(timer);
  }, [isMobilePanelOpen, isPanelMinimized, isMobileViewport, scrollChatToBottom]);

  // Clean up
  const clearMapLayers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
    if (pinnedPopupRef.current) { pinnedPopupRef.current.remove(); pinnedPopupRef.current = null; }
    const layers = [
      'hunger-fill', 'hunger-outline', 'hunger-highlight',
      'radius-circle', 'radius-circle-outline',
      'diversion-fill', 'diversion-outline',
      'routes-line', 'routes-glow',
      'trend-fill', 'trend-outline',
      'trend-worsening-fill', 'trend-worsening-outline',
    ];
    layers.forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
    const sources = ['hunger-districts', 'radius-circle', 'diversion-zones', 'supply-routes', 'trend-districts'];
    sources.forEach(id => { if (map.getSource(id)) map.removeSource(id); });
    if (animationFrameRef.current) { cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = null; }
    // Remove event listeners by removing and readding nothing - mapbox handles this
  }, []);

  // ── Map Renderers ──

  const renderRefugeeCamps = useCallback((stepIdx: number) => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;
    clearMapLayers();

    const mogadishuCenter: [number, number] = [45.3182, 2.0469];
    const circleGeo = createCircle(mogadishuCenter, 50);

    map.addSource('radius-circle', { type: 'geojson', data: circleGeo as any });
    map.addLayer({ id: 'radius-circle', type: 'fill', source: 'radius-circle', paint: { 'fill-color': '#38BDF8', 'fill-opacity': 0.08 } });
    map.addLayer({ id: 'radius-circle-outline', type: 'line', source: 'radius-circle', paint: { 'line-color': '#38BDF8', 'line-width': 2, 'line-dasharray': [3, 2], 'line-opacity': 0.6 } });

    // Mogadishu pulsing dot
    const mogEl = document.createElement('div');
    mogEl.innerHTML = `<div style="position:relative;width:28px;height:28px;"><div style="position:absolute;inset:0;background:#38BDF8;border-radius:50%;animation:pulse-ring 2s infinite;"></div><div style="position:absolute;inset:5px;background:#38BDF8;border-radius:50%;border:2px solid #0F172A;box-shadow:0 0 12px rgba(56,189,248,0.6);"></div></div>`;
    markersRef.current.push(new mapboxgl.Marker({ element: mogEl }).setLngLat(mogadishuCenter).addTo(map));

    // Filter camps based on step
    let visibleCamps = refugeeCamps.filter(c => c.distanceKm <= 50);
    if (stepIdx >= 1) visibleCamps = visibleCamps.filter(c => c.isNew);
    if (stepIdx >= 2) visibleCamps = visibleCamps.filter(c => c.population > 5000);

    visibleCamps.forEach(camp => {
      const el = document.createElement('div');
      el.style.cursor = 'pointer';
      // Scale marker size by population for step 2
      const size = stepIdx >= 2 ? Math.max(24, Math.min(44, camp.population / 1500)) : 28;
      el.innerHTML = `<div style="filter:drop-shadow(0 0 6px rgba(56,189,248,0.5));"><svg width="${size}" height="${size * 1.28}" viewBox="0 0 28 36" fill="none"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#38BDF8"/><circle cx="14" cy="14" r="6" fill="#0F172A"/></svg></div>`;

      // Hover tooltip (lightweight)
      const hoverPopup = new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'gis-tooltip' }).setHTML(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:8px 12px;background:#0F172A;border-radius:8px;">
          <div style="font-weight:700;font-size:12px;color:#F1F5F9;">${camp.name}</div>
          <div style="font-size:11px;color:#94A3B8;">${camp.distanceKm}km · ${camp.population.toLocaleString()} people</div>
        </div>
      `);
      let isPinned = false;
      el.addEventListener('mouseenter', () => { if (!isPinned) hoverPopup.setLngLat([camp.lng, camp.lat]).addTo(map); });
      el.addEventListener('mouseleave', () => { if (!isPinned) hoverPopup.remove(); });

      // Click: show rich persistent card
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        hoverPopup.remove();
        isPinned = true;
        // Remove any existing pinned popup
        if (pinnedPopupRef.current) pinnedPopupRef.current.remove();

        const servicesBadges = camp.services.map(s => `<span style="font-size:10px;background:#1E3A5F;color:#38BDF8;padding:2px 8px;border-radius:4px;white-space:nowrap;">${s}</span>`).join('');
        const pinnedPopup = new mapboxgl.Popup({ offset: 30, closeButton: false, className: 'gis-tooltip pinned-card', maxWidth: '300px' })
          .setLngLat([camp.lng, camp.lat])
          .setHTML(`
            <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:0;background:#0F172A;border-radius:10px;min-width:260px;border:1px solid #1E293B;">
              <div style="padding:14px 16px 10px;border-bottom:1px solid #1E293B;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                  <div style="flex:1;min-width:0;">
                    <div style="font-weight:700;font-size:14px;color:#F1F5F9;margin-bottom:4px;line-height:1.3;">${camp.name}</div>
                    <div style="font-size:11px;color:#64748B;">${camp.distanceKm}km from Mogadishu${camp.isNew ? ' · <span style="color:#38BDF8;font-weight:600;">NEW</span>' : ''}</div>
                  </div>
                  <button onclick="this.closest('.mapboxgl-popup').remove()" style="width:22px;height:22px;border-radius:6px;border:none;background:#1E293B;color:#94A3B8;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;flex-shrink:0;margin-left:8px;">✕</button>
                </div>
              </div>
              <div style="padding:12px 16px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                  <div style="width:32px;height:32px;border-radius:8px;background:#1E3A5F;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:16px;">👥</span>
                  </div>
                  <div>
                    <div style="font-size:18px;font-weight:800;color:#F1F5F9;line-height:1;">${camp.population.toLocaleString()}</div>
                    <div style="font-size:10px;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;">Residents</div>
                  </div>
                </div>
                ${camp.isNew ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;"><span style="font-size:11px;color:#94A3B8;">📅 Established:</span><span style="font-size:11px;color:#E2E8F0;font-weight:600;">${camp.established}</span></div>` : ''}
                <div style="margin-bottom:6px;"><span style="font-size:10px;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;">Services Available</span></div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;">${servicesBadges}</div>
              </div>
            </div>
          `)
          .addTo(map);

        pinnedPopup.on('close', () => { isPinned = false; });
        pinnedPopupRef.current = pinnedPopup;
        setSelectedItem(camp.name);
        map.flyTo({ center: [camp.lng, camp.lat], zoom: Math.max(map.getZoom(), 10), duration: 600 });
      });

      markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([camp.lng, camp.lat]).addTo(map));
    });

    // Dimmed markers for filtered-out camps in step 1+
    if (stepIdx >= 1) {
      refugeeCamps.filter(c => c.distanceKm <= 50 && !visibleCamps.includes(c)).forEach(camp => {
        const el = document.createElement('div');
        el.innerHTML = `<div style="opacity:0.15;"><svg width="18" height="23" viewBox="0 0 28 36" fill="none"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#64748B"/><circle cx="14" cy="14" r="6" fill="#1E293B"/></svg></div>`;
        markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([camp.lng, camp.lat]).addTo(map));
      });
    }

    map.flyTo({ center: [45.2, 2.1], zoom: stepIdx >= 2 ? 9.5 : 8.5, duration: 1200 });
  }, [clearMapLayers]);

  const renderDiversionMap = useCallback((stepIdx: number) => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;
    clearMapLayers();

    // Diversion zone polygons
    map.addSource('diversion-zones', { type: 'geojson', data: DIVERSION_GEO });
    map.addLayer({
      id: 'diversion-fill', type: 'fill', source: 'diversion-zones',
      paint: {
        'fill-color': ['match', ['get', 'severity'], 'critical', 'rgba(239,68,68,0.5)', 'high', 'rgba(249,115,22,0.4)', 'rgba(251,191,36,0.3)'],
        'fill-opacity': stepIdx >= 1 ? 0.4 : 0.7,
      }
    });
    map.addLayer({
      id: 'diversion-outline', type: 'line', source: 'diversion-zones',
      paint: {
        'line-color': ['match', ['get', 'severity'], 'critical', '#FCA5A5', 'high', '#FDBA74', '#FDE68A'],
        'line-width': 1.5,
      }
    });

    // Tooltip
    const tooltip = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, className: 'gis-tooltip', offset: 10 });
    popupRef.current = tooltip;
    map.on('mousemove', 'diversion-fill', (e) => {
      if (!e.features?.length) return;
      map.getCanvas().style.cursor = 'pointer';
      const p = e.features[0].properties!;
      tooltip.setLngLat(e.lngLat).setHTML(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:10px 14px;background:#0F172A;border-radius:8px;">
          <div style="font-weight:700;font-size:13px;color:#F1F5F9;margin-bottom:4px;">${p.name}</div>
          <div style="font-size:12px;font-weight:600;color:#FCA5A5;">${p.cases} diversion cases</div>
        </div>
      `).addTo(map);
    });
    map.on('mouseleave', 'diversion-fill', () => { map.getCanvas().style.cursor = ''; tooltip.remove(); });

    // Step 1+: Add supply routes
    if (stepIdx >= 1) {
      map.addSource('supply-routes', { type: 'geojson', data: SUPPLY_ROUTES_GEO });
      map.addLayer({
        id: 'routes-glow', type: 'line', source: 'supply-routes',
        paint: {
          'line-color': ['match', ['get', 'risk'], 'critical', '#EF4444', 'high', '#F97316', '#FBBF24'],
          'line-width': 6, 'line-opacity': 0.3, 'line-blur': 3,
        }
      });
      map.addLayer({
        id: 'routes-line', type: 'line', source: 'supply-routes',
        paint: {
          'line-color': ['match', ['get', 'risk'], 'critical', '#EF4444', 'high', '#F97316', '#FBBF24'],
          'line-width': 2.5, 'line-dasharray': [4, 2],
        }
      });
    }

    // Step 2: Add checkpoint markers
    if (stepIdx >= 2) {
      checkpoints.forEach(cp => {
        const el = document.createElement('div');
        el.style.cursor = 'pointer';
        const color = cp.type === 'armed_group' ? '#EF4444' : cp.type === 'contested' ? '#F97316' : '#4ADE80';
        const icon = cp.type === 'armed_group' ? '���' : cp.type === 'contested' ? '⚠️' : '✅';
        const statusLabel = cp.type === 'armed_group' ? 'ARMED GROUP' : cp.type === 'contested' ? 'CONTESTED' : 'GOVERNMENT';
        const statusColor = cp.type === 'armed_group' ? '#FCA5A5' : cp.type === 'contested' ? '#FDBA74' : '#86EFAC';
        el.innerHTML = `
          <div style="position:relative;width:32px;height:32px;">
            ${cp.type === 'armed_group' ? '<div style="position:absolute;inset:0;background:' + color + ';border-radius:50%;animation:pulse-ring 3s infinite;opacity:0.4;"></div>' : ''}
            <div style="position:absolute;inset:2px;background:#0F172A;border:2px solid ${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">${icon}</div>
          </div>
        `;

        // Hover tooltip
        const hoverPopup = new mapboxgl.Popup({ offset: 20, closeButton: false, className: 'gis-tooltip' }).setHTML(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:8px 12px;background:#0F172A;border-radius:8px;">
            <div style="font-weight:700;font-size:12px;color:#F1F5F9;">${cp.name}</div>
            <div style="font-size:11px;color:#94A3B8;">${cp.controlledBy}</div>
          </div>
        `);
        let isPinned = false;
        el.addEventListener('mouseenter', () => { if (!isPinned) hoverPopup.setLngLat([cp.lng, cp.lat]).addTo(map); });
        el.addEventListener('mouseleave', () => { if (!isPinned) hoverPopup.remove(); });

        // Click: rich persistent card
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          hoverPopup.remove();
          isPinned = true;
          if (pinnedPopupRef.current) pinnedPopupRef.current.remove();

          const pinnedPopup = new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'gis-tooltip pinned-card', maxWidth: '300px' })
            .setLngLat([cp.lng, cp.lat])
            .setHTML(`
              <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:0;background:#0F172A;border-radius:10px;min-width:250px;border:1px solid #1E293B;">
                <div style="padding:14px 16px 10px;border-bottom:1px solid #1E293B;">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="flex:1;min-width:0;">
                      <div style="font-weight:700;font-size:14px;color:#F1F5F9;margin-bottom:4px;">${cp.name}</div>
                      <div style="display:inline-block;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${statusColor};background:${color}20;padding:2px 8px;border-radius:4px;">${statusLabel}</div>
                    </div>
                    <button onclick="this.closest('.mapboxgl-popup').remove()" style="width:22px;height:22px;border-radius:6px;border:none;background:#1E293B;color:#94A3B8;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;flex-shrink:0;margin-left:8px;">✕</button>
                  </div>
                </div>
                <div style="padding:12px 16px;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                    <div style="width:32px;height:32px;border-radius:8px;background:${color}20;display:flex;align-items:center;justify-content:center;">
                      <span style="font-size:16px;">${icon}</span>
                    </div>
                    <div>
                      <div style="font-size:12px;font-weight:600;color:#E2E8F0;line-height:1.3;">${cp.controlledBy}</div>
                    </div>
                  </div>
                  ${cp.tolls ? `
                  <div style="background:#1E293B;border-radius:6px;padding:8px 10px;display:flex;align-items:center;gap:8px;">
                    <span style="font-size:14px;">💰</span>
                    <div>
                      <div style="font-size:11px;font-weight:600;color:#FCA5A5;">Illegal Tolls Active</div>
                      <div style="font-size:10px;color:#64748B;">$50–200 per humanitarian truck</div>
                    </div>
                  </div>
                  ` : `
                  <div style="background:#1E293B;border-radius:6px;padding:8px 10px;display:flex;align-items:center;gap:8px;">
                    <span style="font-size:14px;">🛡️</span>
                    <div>
                      <div style="font-size:11px;font-weight:600;color:#86EFAC;">No Tolls Reported</div>
                      <div style="font-size:10px;color:#64748B;">Standard security protocols apply</div>
                    </div>
                  </div>
                  `}
                </div>
              </div>
            `)
            .addTo(map);

          pinnedPopup.on('close', () => { isPinned = false; });
          pinnedPopupRef.current = pinnedPopup;
          setSelectedItem(cp.name);
          map.flyTo({ center: [cp.lng, cp.lat], zoom: Math.max(map.getZoom(), 8), duration: 600 });
        });

        markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([cp.lng, cp.lat]).addTo(map));
      });
    }

    map.flyTo({ center: [44.5, 2.8], zoom: stepIdx >= 2 ? 6.5 : 5.8, duration: 1200 });
  }, [clearMapLayers]);

  const renderHungerProjection = useCallback((stepIdx: number) => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;
    clearMapLayers();

    if (stepIdx <= 1) {
      // Base hunger map with trend coloring for step 1
      const geoData: GeoJSON.FeatureCollection = stepIdx === 0 ? SOMALIA_DISTRICTS_GEO : {
        ...SOMALIA_DISTRICTS_GEO,
        features: SOMALIA_DISTRICTS_GEO.features.map(f => ({
          ...f,
          properties: { ...f.properties }
        }))
      };

      map.addSource('hunger-districts', { type: 'geojson', data: geoData });

      if (stepIdx === 0) {
        map.addLayer({
          id: 'hunger-fill', type: 'fill', source: 'hunger-districts',
          paint: {
            'fill-color': ['match', ['get', 'severity'], 'severe', '#EF4444', 'moderate', '#F97316', 'stressed', '#FACC15', '#6B7280'],
            'fill-opacity': 0.7,
          }
        });
      } else {
        // Step 1: Color by trend
        map.addLayer({
          id: 'hunger-fill', type: 'fill', source: 'hunger-districts',
          paint: {
            'fill-color': ['match', ['get', 'trend'], 'worsening', '#EF4444', 'stable', '#FBBF24', 'improving', '#4ADE80', '#6B7280'],
            'fill-opacity': 0.7,
          }
        });
      }

      map.addLayer({
        id: 'hunger-outline', type: 'line', source: 'hunger-districts',
        paint: { 'line-color': '#CBD5E1', 'line-width': 1.5 }
      });

      // Highlight layer
      map.addLayer({
        id: 'hunger-highlight', type: 'line', source: 'hunger-districts',
        paint: { 'line-color': '#38BDF8', 'line-width': 3, 'line-opacity': 0 }
      });

      // Tooltip
      const tooltip = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, className: 'gis-tooltip', offset: 10 });
      popupRef.current = tooltip;
      map.on('mousemove', 'hunger-fill', (e) => {
        if (!e.features?.length) return;
        map.getCanvas().style.cursor = 'pointer';
        const p = e.features[0].properties!;
        const trendIcon = p.trend === 'worsening' ? '📈' : p.trend === 'improving' ? '📉' : '➡️';
        tooltip.setLngLat(e.lngLat).setHTML(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:10px 14px;background:#0F172A;border-radius:8px;">
            <div style="font-weight:700;font-size:13px;color:#F1F5F9;margin-bottom:4px;">${p.name}</div>
            <div style="font-size:11px;color:#94A3B8;margin-bottom:6px;">IPC Phase ${p.ipcPhase} · ${p.region}</div>
            <div style="font-size:12px;font-weight:600;color:#E2E8F0;">2026 Projection: ${Number(p.projected2026).toLocaleString()}</div>
            <div style="font-size:11px;color:#94A3B8;margin-top:4px;">${trendIcon} Trend: ${p.trend}</div>
          </div>
        `).addTo(map);
      });
      map.on('mouseleave', 'hunger-fill', () => { map.getCanvas().style.cursor = ''; tooltip.remove(); });

      map.on('click', 'hunger-fill', (e) => {
        if (!e.features?.length) return;
        const name = e.features[0].properties!.name;
        setSelectedItem(name);
        map.setPaintProperty('hunger-highlight', 'line-opacity', ['case', ['==', ['get', 'name'], name], 1, 0]);
      });
    }

    // Step 2: Hunger districts + food depot markers
    if (stepIdx === 2) {
      // Show worsening districts as background
      const worseningGeo: GeoJSON.FeatureCollection = {
        ...SOMALIA_DISTRICTS_GEO,
        features: SOMALIA_DISTRICTS_GEO.features.filter(f => f.properties?.trend === 'worsening')
      };
      map.addSource('hunger-districts', { type: 'geojson', data: worseningGeo });
      map.addLayer({
        id: 'hunger-fill', type: 'fill', source: 'hunger-districts',
        paint: { 'fill-color': 'rgba(239,68,68,0.25)', 'fill-opacity': 1 }
      });
      map.addLayer({
        id: 'hunger-outline', type: 'line', source: 'hunger-districts',
        paint: { 'line-color': '#FCA5A5', 'line-width': 1, 'line-dasharray': [3, 2] }
      });

      // Food depot markers
      foodDepots.forEach(depot => {
        const el = document.createElement('div');
        el.style.cursor = 'pointer';
        const color = depot.status === 'critical' ? '#EF4444' : depot.status === 'low' ? '#F97316' : '#4ADE80';
        const statusLabel = depot.status.toUpperCase();
        const pct = Math.round((depot.stockMT / depot.capacity) * 100);
        const deficit = depot.capacity - depot.stockMT;
        el.innerHTML = `
          <div style="position:relative;width:40px;height:40px;">
            ${depot.status === 'critical' ? '<div style="position:absolute;inset:0;background:' + color + ';border-radius:50%;animation:pulse-ring 2.5s infinite;opacity:0.3;"></div>' : ''}
            <div style="position:absolute;inset:2px;background:#0F172A;border:2.5px solid ${color};border-radius:50%;display:flex;align-items:center;justify-content:center;">
              <span style="font-size:11px;font-weight:700;color:${color};">${pct}%</span>
            </div>
          </div>
        `;

        // Hover tooltip
        const hoverPopup = new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'gis-tooltip' }).setHTML(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:8px 12px;background:#0F172A;border-radius:8px;">
            <div style="font-weight:700;font-size:12px;color:#F1F5F9;">${depot.name}</div>
            <div style="font-size:11px;color:#94A3B8;">${pct}% filled · ${depot.stockMT.toLocaleString()} MT</div>
          </div>
        `);
        let isPinned = false;
        el.addEventListener('mouseenter', () => { if (!isPinned) hoverPopup.setLngLat([depot.lng, depot.lat]).addTo(map); });
        el.addEventListener('mouseleave', () => { if (!isPinned) hoverPopup.remove(); });

        // Click: rich persistent card
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          hoverPopup.remove();
          isPinned = true;
          if (pinnedPopupRef.current) pinnedPopupRef.current.remove();

          const pinnedPopup = new mapboxgl.Popup({ offset: 30, closeButton: false, className: 'gis-tooltip pinned-card', maxWidth: '300px' })
            .setLngLat([depot.lng, depot.lat])
            .setHTML(`
              <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:0;background:#0F172A;border-radius:10px;min-width:260px;border:1px solid #1E293B;">
                <div style="padding:14px 16px 10px;border-bottom:1px solid #1E293B;">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="flex:1;min-width:0;">
                      <div style="font-weight:700;font-size:14px;color:#F1F5F9;margin-bottom:4px;line-height:1.3;">${depot.name}</div>
                      <div style="display:inline-block;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${color};background:${color}20;padding:2px 8px;border-radius:4px;">${statusLabel}</div>
                    </div>
                    <button onclick="this.closest('.mapboxgl-popup').remove()" style="width:22px;height:22px;border-radius:6px;border:none;background:#1E293B;color:#94A3B8;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;flex-shrink:0;margin-left:8px;">✕</button>
                  </div>
                </div>
                <div style="padding:12px 16px;">
                  <div style="display:flex;gap:12px;margin-bottom:12px;">
                    <div style="flex:1;background:#1E293B;border-radius:8px;padding:8px 10px;text-align:center;">
                      <div style="font-size:16px;font-weight:800;color:#F1F5F9;">${depot.stockMT.toLocaleString()}</div>
                      <div style="font-size:9px;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;">Current MT</div>
                    </div>
                    <div style="flex:1;background:#1E293B;border-radius:8px;padding:8px 10px;text-align:center;">
                      <div style="font-size:16px;font-weight:800;color:#F1F5F9;">${depot.capacity.toLocaleString()}</div>
                      <div style="font-size:9px;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;">Capacity MT</div>
                    </div>
                  </div>
                  <div style="margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:10px;color:#64748B;">Fill Level</span>
                    <span style="font-size:11px;font-weight:700;color:${color};">${pct}%</span>
                  </div>
                  <div style="background:#1E293B;border-radius:4px;height:8px;overflow:hidden;margin-bottom:10px;">
                    <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;transition:width 0.5s ease;"></div>
                  </div>
                  <div style="background:${color}15;border:1px solid ${color}30;border-radius:6px;padding:8px 10px;">
                    <div style="font-size:10px;color:#94A3B8;margin-bottom:2px;">Resupply Needed</div>
                    <div style="font-size:13px;font-weight:700;color:${color};">${deficit.toLocaleString()} MT</div>
                  </div>
                </div>
              </div>
            `)
            .addTo(map);

          pinnedPopup.on('close', () => { isPinned = false; });
          pinnedPopupRef.current = pinnedPopup;
          setSelectedItem(depot.name);
          map.flyTo({ center: [depot.lng, depot.lat], zoom: Math.max(map.getZoom(), 7), duration: 600 });
        });

        markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([depot.lng, depot.lat]).addTo(map));
      });
    }

    map.flyTo({ center: stepIdx === 2 ? [44.5, 3.5] : [45.0, 4.0], zoom: stepIdx === 2 ? 5.0 : 5.5, duration: 1200 });
  }, [clearMapLayers]);

  const renderUNICEFProjects = useCallback((stepIdx: number) => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;
    clearMapLayers();

    // Filter projects based on step
    let visibleProjects = unicefProjects;
    if (stepIdx >= 1) {
      visibleProjects = visibleProjects.filter(p => p.sector === 'Health' || p.sector === 'Nutrition');
    }

    // Add markers for each project
    visibleProjects.forEach(project => {
      const el = document.createElement('div');
      el.style.cursor = 'pointer';
      
      // Color based on sector
      const sectorColor = project.sector === 'Health' || project.sector === 'Nutrition' ? '#0891B2' : 
                          project.sector === 'WASH' ? '#06B6D4' : 
                          project.sector === 'Education' ? '#22D3EE' : 
                          project.sector === 'Protection' ? '#67E8F9' : '#A5F3FC';
      
      // Larger markers for larger beneficiary counts
      const size = Math.max(24, Math.min(40, project.beneficiaries / 3500));
      
      el.innerHTML = `<div style="filter:drop-shadow(0 0 6px ${sectorColor}80);"><svg width="${size}" height="${size * 1.28}" viewBox="0 0 28 36" fill="none"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${sectorColor}"/><circle cx="14" cy="14" r="6" fill="#0F172A"/></svg></div>`;

      // Hover tooltip
      const hoverPopup = new mapboxgl.Popup({ offset: 25, closeButton: false, className: 'gis-tooltip' }).setHTML(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:8px 12px;background:#0F172A;border-radius:8px;">
          <div style="font-weight:700;font-size:12px;color:#F1F5F9;">${project.name}</div>
          <div style="font-size:11px;color:#94A3B8;">${project.location} · ${project.beneficiaries.toLocaleString()} people</div>
        </div>
      `);
      let isPinned = false;
      el.addEventListener('mouseenter', () => { if (!isPinned) hoverPopup.setLngLat([project.lng, project.lat]).addTo(map); });
      el.addEventListener('mouseleave', () => { if (!isPinned) hoverPopup.remove(); });

      // Click: show detailed card
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        hoverPopup.remove();
        isPinned = true;
        if (pinnedPopupRef.current) pinnedPopupRef.current.remove();

        const budgetFormatted = project.budget >= 1000000 ? `$${(project.budget / 1000000).toFixed(1)}M` : `$${(project.budget / 1000).toFixed(0)}K`;
        const pinnedPopup = new mapboxgl.Popup({ offset: 30, closeButton: false, className: 'gis-tooltip pinned-card', maxWidth: '300px' })
          .setLngLat([project.lng, project.lat])
          .setHTML(`
            <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:0;background:#0F172A;border-radius:10px;min-width:260px;border:1px solid #1E293B;">
              <div style="padding:14px 16px 10px;border-bottom:1px solid #1E293B;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                  <div style="flex:1;min-width:0;">
                    <div style="font-weight:700;font-size:14px;color:#F1F5F9;margin-bottom:4px;line-height:1.3;">${project.name}</div>
                    <div style="font-size:11px;color:#64748B;">${project.location} · ${project.sector}</div>
                  </div>
                  <button onclick="this.closest('.mapboxgl-popup').remove()" style="width:22px;height:22px;border-radius:6px;border:none;background:#1E293B;color:#94A3B8;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;flex-shrink:0;margin-left:8px;">✕</button>
                </div>
              </div>
              <div style="padding:12px 16px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                  <span style="font-size:11px;color:#94A3B8;">Beneficiaries</span>
                  <span style="font-size:12px;font-weight:600;color:#38BDF8;">${project.beneficiaries.toLocaleString()}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                  <span style="font-size:11px;color:#94A3B8;">Budget</span>
                  <span style="font-size:12px;font-weight:600;color:#4ADE80;">${budgetFormatted}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="font-size:11px;color:#94A3B8;">Status</span>
                  <span style="font-size:11px;background:#1E3A5F;color:#38BDF8;padding:2px 8px;border-radius:4px;text-transform:capitalize;">${project.status}</span>
                </div>
              </div>
            </div>
          `);
        pinnedPopupRef.current = pinnedPopup;
        pinnedPopup.addTo(map);
      });

      markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([project.lng, project.lat]).addTo(map));
    });

    // Fly to Somalia overview
    map.flyTo({ center: [45.5, 5.5], zoom: 5.5, duration: 1200 });
  }, [clearMapLayers]);

  // ── Render map for current flow/step ──
  const renderMapForStep = useCallback((flowId: string, stepIdx: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const waitForStyle = () => {
      if (map.isStyleLoaded()) {
        if (flowId === 'refugees') renderRefugeeCamps(stepIdx);
        else if (flowId === 'diversion') renderDiversionMap(stepIdx);
        else if (flowId === 'hunger2026') renderHungerProjection(stepIdx);
        else if (flowId === 'unicef') renderUNICEFProjects(stepIdx);
      } else {
        setTimeout(waitForStyle, 100);
      }
    };
    waitForStyle();
  }, [renderRefugeeCamps, renderDiversionMap, renderHungerProjection, renderUNICEFProjects]);

  // ── Start a new conversation flow ──
  const startFlow = useCallback((flowId: string) => {
    const flow = CONVERSATION_FLOWS.find(f => f.id === flowId);
    if (!flow) return;

    setActiveFlowId(flowId);
    setCurrentStepIndex(0);
    setSelectedItem(null);
    setIsTransitioning(true);

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    const step = flow.steps[0];
    setActiveFilters(step.filters);

    const userMsg: ChatMessage = { role: 'user', content: step.userMessage };
    const assistantMsg: ChatMessage = { role: 'assistant', content: step.assistantResponse, displayedText: '', isTyping: true };
    setChatMessages([userMsg, assistantMsg]);

    // Typing animation
    const fullText = step.assistantResponse;
    let charIndex = 0;
    typingIntervalRef.current = window.setInterval(() => {
      charIndex = Math.min(charIndex + 4, fullText.length);
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], displayedText: fullText.slice(0, charIndex), isTyping: charIndex < fullText.length };
        return updated;
      });
      if (charIndex >= fullText.length) {
        clearInterval(typingIntervalRef.current!);
        setIsTransitioning(false);
      }
    }, 10);

    renderMapForStep(flowId, 0);
    setIsMobilePanelOpen(true);
  }, [renderMapForStep]);

  // ── Advance to next step in flow ──
  const advanceStep = useCallback((suggestedActionIndex: number) => {
    if (!activeFlow || isTransitioning) return;

    const nextStepIdx = currentStepIndex + 1;
    if (nextStepIdx >= activeFlow.steps.length) {
      // This suggested action might start a different flow
      const action = currentStep?.suggestedActions[suggestedActionIndex];
      if (action) {
        const q = action.label.toLowerCase();
        const matchedFlow = CONVERSATION_FLOWS.find(f => {
          const fl = f.label.toLowerCase();
          return q.includes('refugee') || q.includes('camp') ? f.id === 'refugees' :
                 q.includes('diversion') || q.includes('aid') ? f.id === 'diversion' :
                 q.includes('hunger') || q.includes('food') || q.includes('drought') ? f.id === 'hunger2026' :
                 false;
        });
        if (matchedFlow && matchedFlow.id !== activeFlowId) {
          startFlow(matchedFlow.id);
        }
      }
      return;
    }

    setCurrentStepIndex(nextStepIdx);
    setSelectedItem(null);
    setIsTransitioning(true);

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    const step = activeFlow.steps[nextStepIdx];
    setActiveFilters(step.filters);

    const userMsg: ChatMessage = { role: 'user', content: step.userMessage };
    const assistantMsg: ChatMessage = { role: 'assistant', content: step.assistantResponse, displayedText: '', isTyping: true };
    setChatMessages(prev => [...prev, userMsg, assistantMsg]);

    // Typing animation
    const fullText = step.assistantResponse;
    let charIndex = 0;
    typingIntervalRef.current = window.setInterval(() => {
      charIndex = Math.min(charIndex + 4, fullText.length);
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], displayedText: fullText.slice(0, charIndex), isTyping: charIndex < fullText.length };
        return updated;
      });
      if (charIndex >= fullText.length) {
        clearInterval(typingIntervalRef.current!);
        setIsTransitioning(false);
      }
    }, 10);

    renderMapForStep(activeFlow.id, nextStepIdx);
  }, [activeFlow, activeFlowId, currentStepIndex, currentStep, isTransitioning, renderMapForStep, startFlow]);

  // ── Remove a filter ──
  const removeFilter = useCallback((filterId: string) => {
    // This is a UX signal — in a real system it would re-render the map
    // For the demo, we remove the pill visually
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  // ── Custom query handler ──
  const handleCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapQuery.trim()) return;
    setIsMobilePanelOpen(true);
    const q = mapQuery.toLowerCase();
    if (q.includes('refugee') || q.includes('camp') || q.includes('idp') || q.includes('mogadishu')) {
      startFlow('refugees');
    } else if (q.includes('diversion') || q.includes('aid') || q.includes('stolen') || q.includes('diverted')) {
      startFlow('diversion');
    } else if (q.includes('unicef') || q.includes('project') || q.includes('program')) {
      startFlow('unicef');
    } else if (q.includes('hunger') || q.includes('food') || q.includes('famine') || q.includes('2026') || q.includes('hungry') || q.includes('drought')) {
      startFlow('hunger2026');
    } else {
      startFlow('hunger2026');
    }
    setMapQuery('');
  };

  // ── Save to History ──
  const saveToHistory = () => {
    if (!activeFlowId || chatMessages.length === 0) return;
    
    const flow = CONVERSATION_FLOWS.find(f => f.id === activeFlowId);
    if (!flow) return;
    
    const userQueries = chatMessages.filter(m => m.role === 'user').map(m => m.content);
    
    const historyItem: HistoryItem = {
      id: `history-${Date.now()}`,
      flowId: activeFlowId,
      flowLabel: flow.label,
      timestamp: Date.now(),
      queries: userQueries,
      stepReached: currentStepIndex
    };
    
    setQueryHistory(prev => [historyItem, ...prev].slice(0, 20)); // Keep last 20 items
  };

  // ── Reset ──
  const handleReset = () => {
    saveToHistory(); // Save current conversation before resetting
    setActiveFlowId(null);
    setCurrentStepIndex(0);
    setSelectedItem(null);
    setActiveFilters([]);
    setChatMessages([]);
    clearMapLayers();
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    mapInstanceRef.current?.flyTo({ center: [46.0, 5.0], zoom: 5.2, duration: 1200 });
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Check if last message is done typing
  const isLastMessageDone = chatMessages.length > 0 && !chatMessages[chatMessages.length - 1]?.isTyping;

  const promptPlaceholder = activeFlow
    ? 'Ask a follow-up question...'
    : 'Ask a question about Somalia...';

  const renderPromptInput = ({
    compact = false,
    showMinimize = false,
  }: {
    compact?: boolean;
    showMinimize?: boolean;
  } = {}) => (
    <form onSubmit={handleCustomQuery}>
      <div className={cn('flex items-center', showMinimize ? 'gap-2' : '')}>
        {showMinimize && (
          <button
            type="button"
            onClick={closeMobilePanel}
            aria-label="Minimize to map"
            title="Show map"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
          >
            <ChevronDown size={18} />
          </button>
        )}
        <div
          data-composite-field
          className={cn(
            'relative flex flex-1 items-center focus-within:ring-2 focus-within:ring-[#1D4ED8]/20',
            showMinimize && 'min-w-0',
          )}
        >
          <div className="absolute left-4 pointer-events-none">
            <Sparkles size={compact ? 14 : 16} className="text-[#9CA3AF]" />
          </div>
          <input
            type="text"
            value={mapQuery}
            onChange={(e) => setMapQuery(e.target.value)}
            onFocus={() => {
              if (isMobileViewport && !isMobilePanelOpen) {
                openMobilePanel();
              }
            }}
            placeholder={promptPlaceholder}
            className={cn(
              'focus-ring-container-control w-full rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] text-[0.8125rem] transition-all placeholder:text-[#9CA3AF] focus:border-[#1D4ED8]',
              compact ? 'pl-9 pr-11 py-2.5' : 'pl-10 pr-12 py-3',
            )}
          />
          <button
            type="submit"
            disabled={!mapQuery.trim()}
            className={cn(
              'absolute right-2 rounded-full flex items-center justify-center transition-all',
              compact ? 'w-7 h-7' : 'w-8 h-8',
              mapQuery.trim() ? 'bg-[#2463EB] text-white cursor-pointer' : 'text-[#D1D5DB] cursor-not-allowed',
            )}
          >
            <Send size={compact ? 12 : 14} />
          </button>
        </div>
      </div>
    </form>
  );

  const showDesktopPanel = !isMobileViewport && !isPanelMinimized;

  return (
    <div className="flex h-full min-h-0 relative overflow-hidden">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes filter-appear {
          from { opacity: 0; transform: translateY(-4px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes suggestion-appear {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .filter-pill { animation: filter-appear 0.3s ease-out forwards; }
        .suggestion-btn { animation: suggestion-appear 0.4s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
        .mapboxgl-popup.gis-tooltip .mapboxgl-popup-content {
          padding: 0; border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,0.5);
          border: 1px solid #1E293B; background: #0F172A;
        }
        .mapboxgl-popup.gis-tooltip .mapboxgl-popup-tip { border-top-color: #0F172A; }
        .mapboxgl-popup.pinned-card .mapboxgl-popup-content {
          padding: 0; border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.15);
          border: 1px solid #334155; background: #0F172A;
        }
        .mapboxgl-popup.pinned-card .mapboxgl-popup-tip { border-top-color: #0F172A; }
        .mapboxgl-ctrl-scale {
          background: rgba(15,23,42,0.7) !important; border-color: #475569 !important; color: #94A3B8 !important;
        }
        .mapboxgl-ctrl-group {
          background: #0F172A !important; border: 1px solid #1E293B !important; box-shadow: 0 2px 12px rgba(0,0,0,0.4) !important;
        }
        .mapboxgl-ctrl-group button { border-bottom-color: #1E293B !important; }
        .mapboxgl-ctrl-group button .mapboxgl-ctrl-icon { filter: invert(1) brightness(0.8); }
      `}</style>

      {/* ════ Map Container ════ */}
      <div
        ref={mapContainerRef}
        className={cn(
          'flex-1 relative min-w-0 h-full min-h-0 w-full',
          isMobileViewport && !isMobilePanelOpen && 'pb-[calc(5.5rem+env(safe-area-inset-bottom))]',
        )}
      >
        <div ref={mapRef} className="w-full h-full bg-[#0F172A]" />
        {!hasMapboxAccessToken() && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0F172A] z-20 px-6">
            <p className="text-[0.875rem] text-[#94A3B8] text-center max-w-[320px]">
              GIS map requires <code className="text-[#E2E8F0]">VITE_MAPBOX_ACCESS_TOKEN</code> in Netlify environment
              variables. Redeploy after adding it.
            </p>
          </div>
        )}

        {/* Active Filters Pill Row */}
        {activeFilters.length > 0 && (
          <div className="absolute top-4 left-4 right-4 lg:right-[440px] z-10 flex flex-wrap gap-2">
            {activeFilters.map((filter, idx) => (
              <div
                key={filter.id}
                className="filter-pill flex items-center gap-1.5 bg-[#0F172A]/90 backdrop-blur-sm border border-[#1E293B] rounded-full px-3 py-1.5 shadow-lg"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <span className="text-[0.75rem]">{FILTER_ICONS[filter.icon]}</span>
                <span className="text-[0.75rem] text-[#E2E8F0] font-medium">{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#334155] transition-colors"
                >
                  <X size={10} className="text-[#94A3B8]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Map Legend */}
        {currentStep && (
          <div className="absolute top-14 left-4 z-10 bg-[#0F172A]/90 backdrop-blur-sm rounded-xl border border-[#1E293B] shadow-lg p-4 min-w-[200px]" style={{ marginTop: activeFilters.length > 0 ? '8px' : '0' }}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[0.6875rem] font-semibold text-[#64748B]">{currentStep.legendTitle}</h4>
              <button onClick={handleReset} className="text-[#64748B] hover:text-[#CBD5E1] transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {currentStep.legendItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {item.type === 'circle' ? (
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color, border: item.color.includes('rgba') ? `1px dashed ${item.color}` : undefined }} />
                  ) : item.type === 'line' ? (
                    <div className="w-4 h-0.5 flex-shrink-0 rounded" style={{ background: item.color }} />
                  ) : item.type === 'hatch' ? (
                    <div className="w-4 h-3 rounded-sm flex-shrink-0 relative overflow-hidden" style={{ background: item.color }}>
                      <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)' }} />
                    </div>
                  ) : (
                    <div className="w-4 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  )}
                  <span className="text-[0.75rem] text-[#CBD5E1]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coordinates display */}
        <div className="absolute bottom-2 left-2 lg:left-[170px] z-10 text-[10px] text-[#94A3B8] bg-[#0F172A]/80 px-2.5 py-1 rounded border border-[#1E293B]">
          Somalia · EPSG:4326
        </div>
      </div>

      {/* ════ Intelligence Hub Panel ════ */}
      {(showDesktopPanel || isMobileViewport) && (
        <div
          className={cn(
            'bg-white flex flex-col overflow-hidden',
            isMobileViewport
              ? cn(
                  'fixed inset-x-0 bottom-0 z-[1220] flex h-[min(68dvh,560px)] max-h-[min(68dvh,560px)] flex-col rounded-t-2xl border-t border-[#E5E7EB] shadow-2xl transition-transform duration-300 ease-out',
                  isMobilePanelOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full',
                )
              : 'relative flex h-full w-[420px] shrink-0 flex-col border-l border-[#E5E7EB]',
          )}
        >
          {isMobileViewport && (
            <div className="sticky top-0 z-10 flex shrink-0 flex-col items-center border-b border-[#F3F4F6] bg-white px-4 pb-2 pt-2">
              <button
                type="button"
                onClick={closeMobilePanel}
                aria-label="Collapse assistant to map"
                className="flex flex-col items-center gap-1 py-0.5"
              >
                <span className="h-1 w-10 rounded-full bg-[#E5E7EB]" />
                <span className="text-[0.625rem] font-medium text-[#9CA3AF]">Show map</span>
              </button>
            </div>
          )}

          {!isMobileViewport && (
            <div className="absolute right-4 top-4 z-10">
              <button
                type="button"
                onClick={() => setIsPanelMinimized(true)}
                aria-label="Collapse assistant panel"
                title="Collapse panel"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
              >
                <PanelRightClose size={16} />
              </button>
            </div>
          )}

          {!activeFlow ? (
            /* ── Default State: Suggested Prompts ── */
            <div className={cn('flex flex-col', isMobileViewport ? 'min-h-0 flex-1' : 'h-full')}>
              <div className="shrink-0 px-8 pt-8 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:border-[#1D4ED8] hover:bg-[#F9FAFB] transition-all group"
                    title="View query history"
                  >
                    <History size={14} className="text-[#6B7280] group-hover:text-[#2463EB]" />
                    <span className="text-[0.75rem] text-[#6B7280] group-hover:text-[#2463EB] font-medium">History</span>
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1" />

              {/* Suggested Prompts — anchored above the input */}
              <div className="shrink-0 px-6 pb-4">
                <p className="text-[0.6875rem] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3 px-2">
                  SUGGESTED PROMPTS
                </p>
                <div className="space-y-2.5">
                  {CONVERSATION_FLOWS.map(flow => (
                    <button
                      key={flow.id}
                      onClick={() => startFlow(flow.id)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-[#E5E7EB] hover:border-[#1D4ED8] hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: flow.bgColor, color: flow.color }}>
                        {flow.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.8125rem] text-[#374151] leading-snug group-hover:text-[#2463EB] transition-colors">
                          {flow.label}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-[#D1D5DB] group-hover:text-[#1D4ED8] flex-shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="shrink-0 border-t border-[#F3F4F6] bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                {renderPromptInput({ compact: true, showMinimize: isMobileViewport })}
              </div>
            </div>
          ) : (
            /* ── Active Flow: Chat + Data Panel ── */
            <div className={cn('flex flex-col', isMobileViewport ? 'min-h-0 flex-1' : 'h-full')}>
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={handleReset} className="text-[#9CA3AF] hover:text-[#374151] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: activeFlow.bgColor, color: activeFlow.color }}>
                      {activeFlow.icon}
                    </div>
                    <span className="text-[0.75rem] font-semibold text-[#6B7280]">Analysis</span>
                  </div>
                  {/* Step indicator */}
                  <div className="ml-auto flex items-center gap-1">
                    {activeFlow.steps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx <= currentStepIndex ? 'bg-[#2463EB]' : 'bg-[#E5E7EB]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div ref={chatScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx}>
                    {msg.role === 'user' ? (
                      <div className="flex justify-end mb-3">
                        <div className="bg-[#2463EB] text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[90%]">
                          <p className="text-[0.8125rem] leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#F9FAFB] rounded-2xl rounded-tl-md p-4 border border-[#F3F4F6]">
                        <div className="prose-sm">
                          {renderMarkdown(msg.displayedText || msg.content)}
                          {msg.isTyping && (
                            <span className="inline-flex gap-1 ml-1 items-center">
                              <span className="w-1.5 h-1.5 bg-[#2463EB] rounded-full animate-pulse" />
                              <span className="w-1.5 h-1.5 bg-[#2463EB] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                              <span className="w-1.5 h-1.5 bg-[#2463EB] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Data Panel */}
                {isLastMessageDone && currentStep?.panelItems && currentStep.panelItems.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[0.6875rem] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">{currentStep.panelTitle}</p>
                    <div className="space-y-1.5">
                      {currentStep.panelItems.map(item => (
                        <button
                          key={item.name}
                          onClick={() => {
                            setSelectedItem(item.name);
                            mapInstanceRef.current?.flyTo({ center: item.coordinates, zoom: 9, duration: 800 });
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                            selectedItem === item.name
                              ? 'border-[#1D4ED8] bg-[#EFF6FF] shadow-sm'
                              : item.highlighted
                                ? 'border-[#E5E7EB] bg-[#FFFBEB] hover:border-[#1D4ED8]'
                                : 'border-[#F3F4F6] hover:border-[#E5E7EB] hover:bg-[#FAFAFA]'
                          }`}
                        >
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.dotColor }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.8125rem] font-medium text-[#1f2937] truncate">{item.name}</p>
                            <p className="text-[0.6875rem] text-[#9CA3AF] truncate">{item.subtitle}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[0.8125rem] font-semibold text-[#1f2937]">{item.value}</p>
                            {item.valueLabel && <p className="text-[0.6875rem] text-[#9CA3AF]">{item.valueLabel}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-Up Actions — always last */}
                {isLastMessageDone && currentStep?.suggestedActions && currentStep.suggestedActions.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <p className="text-[0.6875rem] font-semibold text-[#9CA3AF] uppercase tracking-wider">SUGGESTED NEXT</p>
                    {currentStep.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => advanceStep(idx)}
                        className="suggestion-btn w-full flex items-center gap-3 p-3 rounded-xl border border-[#E5E7EB] hover:border-[#1D4ED8] hover:bg-[#EFF6FF] hover:shadow-sm transition-all text-left group"
                        style={{ animationDelay: `${idx * 0.15}s`, opacity: 0 }}
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] group-hover:bg-[#DBEAFE] flex items-center justify-center flex-shrink-0 text-[#6B7280] group-hover:text-[#2463EB] transition-colors">
                          {action.icon}
                        </div>
                        <span className="text-[0.8125rem] text-[#374151] group-hover:text-[#2463EB] transition-colors flex-1">
                          {action.label}
                        </span>
                        <ChevronRight size={14} className="text-[#D1D5DB] group-hover:text-[#1D4ED8] flex-shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Bottom Input */}
              <div className="shrink-0 border-t border-[#F3F4F6] bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
                {renderPromptInput({ compact: true, showMinimize: true })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop: collapsed panel FAB */}
      {!isMobileViewport && isPanelMinimized && (
        <div className="absolute top-4 right-4 z-[1000]">
          <button
            onClick={() => setIsPanelMinimized(false)}
            className="w-12 h-12 bg-[#2463EB] rounded-lg shadow-lg flex items-center justify-center hover:bg-[#1D4ED8] transition-colors"
            title="Open Intelligence Hub"
          >
            <MessageSquare size={20} className="text-white" />
          </button>
        </div>
      )}

      {/* Mobile: persistent prompt dock — single entry point when sheet is collapsed */}
      {isMobileViewport && !isMobilePanelOpen && (
        <div className="fixed inset-x-0 bottom-0 z-[1215] border-t border-[#E5E7EB] bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_32px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={openMobilePanel}
            aria-label="Open analysis panel"
            className="mb-2 flex w-full items-center justify-center gap-1.5 text-[0.6875rem] font-medium text-[#9CA3AF]"
          >
            <ChevronUp size={14} />
            {activeFlow
              ? chatMessages.length > 0
                ? `View analysis · ${chatMessages.length} messages`
                : 'View analysis'
              : 'Suggested prompts'}
          </button>
          {renderPromptInput({ compact: true })}
        </div>
      )}

      {/* ════ History Drawer ════ */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex lg:justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsHistoryOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-full lg:w-[420px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <History size={18} className="text-[#2463EB]" />
                <h2 className="text-[1rem] font-bold text-[#1f2937]">Query History</h2>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
              >
                <X size={18} className="text-[#6B7280]" />
              </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {queryHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] flex items-center justify-center mb-4">
                    <Clock size={28} className="text-[#9CA3AF]" />
                  </div>
                  <p className="text-[0.9375rem] font-semibold text-[#1f2937] mb-2">No history yet</p>
                  <p className="text-[0.8125rem] text-[#6B7280] leading-relaxed">
                    Your map queries will appear here for quick access
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queryHistory.map((item) => {
                    const flow = CONVERSATION_FLOWS.find(f => f.id === item.flowId);
                    const timeAgo = formatTimeAgo(item.timestamp);
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          startFlow(item.flowId);
                          setIsHistoryOpen(false);
                        }}
                        className="w-full text-left p-4 rounded-xl border border-[#E5E7EB] hover:border-[#1D4ED8] hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          {flow && (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: flow.bgColor, color: flow.color }}>
                              {flow.icon}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.8125rem] font-medium text-[#1f2937] mb-1 group-hover:text-[#2463EB] transition-colors">
                              {item.flowLabel}
                            </p>
                            <p className="text-[0.6875rem] text-[#9CA3AF]">
                              <Clock size={11} className="inline mr-1" />
                              {timeAgo} · {item.stepReached + 1} step{item.stepReached > 0 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        {item.queries.length > 0 && (
                          <div className="ml-11 space-y-1">
                            {item.queries.slice(0, 2).map((query, idx) => (
                              <p key={idx} className="text-[0.75rem] text-[#6B7280] truncate">
                                "{query}"
                              </p>
                            ))}
                            {item.queries.length > 2 && (
                              <p className="text-[0.6875rem] text-[#9CA3AF] italic">
                                +{item.queries.length - 2} more
                              </p>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with Clear All */}
            {queryHistory.length > 0 && (
              <div className="px-6 py-4 border-t border-[#E5E7EB] flex-shrink-0">
                <button
                  onClick={() => {
                    if (confirm('Clear all query history?')) {
                      setQueryHistory([]);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-lg border border-[#E5E7EB] text-[0.8125rem] font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#DC2626] hover:text-[#DC2626] transition-all"
                >
                  Clear All History
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
