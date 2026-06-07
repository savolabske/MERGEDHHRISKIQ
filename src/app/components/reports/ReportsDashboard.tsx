import { useState, useEffect, useRef } from 'react';
import { PageScrollShell } from '../PageScrollShell';
import { TrendingUp, TrendingDown, Shield, AlertTriangle, DollarSign, Cloud, MapPin, Sparkles, Activity, BarChart3, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Area, AreaChart } from 'recharts';

// Custom Risk Map Component with dynamic leaflet import
function RiskMap({ riskLocations, getSeverityColor, getSeverityRadius }: {
  riskLocations: Array<{ name: string; lat: number; lng: number; risks: number; severity: string; category: string }>;
  getSeverityColor: (severity: string) => string;
  getSeverityRadius: (risks: number) => number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Create map centered on Somalia
      const map = L.map(mapRef.current).setView([2.5, 45.5], 6);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Add circles for each risk location
      riskLocations.forEach(location => {
        const circle = L.circle([location.lat, location.lng], {
          color: getSeverityColor(location.severity),
          fillColor: getSeverityColor(location.severity),
          fillOpacity: 0.3,
          radius: getSeverityRadius(location.risks),
          weight: 2
        }).addTo(map);

        circle.bindPopup(`
          <div style="padding: 8px;">
            <p style="font-weight: bold; font-size: 13px; color: #1e293b; margin: 0 0 4px 0;">${location.name}</p>
            <p style="font-size: 11px; color: #64748b; margin: 0;">${location.risks} active risks</p>
            <p style="font-size: 11px; color: #64748b; margin: 0;">Category: ${location.category}</p>
          </div>
        `);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [riskLocations, getSeverityColor, getSeverityRadius]);

  return <div ref={mapRef} className="h-[400px] rounded-xl overflow-hidden border border-border" />;
}

interface RiskItem {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Security' | 'Climate' | 'Aid Diversion' | 'Programmatic';
  description: string;
  location: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  incidents?: string[];
  recommendations?: string[];
}

export function ReportsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);

  const handleRiskClick = (risk: RiskItem) => {
    setSelectedRisk(risk);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedRisk(null), 300);
  };

  // Risk data
  const securityRisks: RiskItem[] = [
    {
      id: 'sec-1',
      title: 'Remote field sites face escalating militia threats — 3 missions canceled in past 14 days',
      severity: 'Critical',
      category: 'Security',
      description: 'Elevated threat levels at remote operational sites due to increased militia activity and inadequate security infrastructure.',
      location: 'Bay, Bakool, and Lower Shabelle regions',
      trend: 'up',
      lastUpdated: 'March 4, 2026',
      incidents: [
        'Feb 28: Attempted unauthorized access at Baidoa compound',
        'Feb 15: Intelligence report on militia movement near field sites',
        'Feb 8: Security escort delayed causing mission cancellation'
      ],
      recommendations: [
        'Mandatory armed escort for all remote site visits',
        'Enhanced perimeter security at vulnerable compounds',
        'Daily security briefings for field teams',
        'Review and update evacuation protocols'
      ]
    },
    {
      id: 'sec-2',
      title: 'Bay Region access severely restricted — armed checkpoints block humanitarian convoys',
      severity: 'Critical',
      category: 'Security',
      description: 'Humanitarian access severely restricted due to armed group checkpoints and deteriorating security conditions along main supply routes.',
      location: 'Bay Region (Baidoa corridor)',
      trend: 'up',
      lastUpdated: 'March 5, 2026',
      incidents: [
        'March 3: Three unauthorized checkpoints established on Mogadishu-Baidoa road',
        'Feb 22: Humanitarian convoy delayed 6 hours at militia checkpoint',
        'Feb 18: Two UN vehicles turned back from Bay Region entry points',
        'Feb 10: Road mine discovery forced route diversion (4-hour delay)'
      ],
      recommendations: [
        'Negotiate humanitarian corridor access with local authorities',
        'Establish alternative supply routes via air transport',
        'Daily route monitoring and threat assessment',
        'Coordinate movements with AMISOM forces'
      ]
    },
    {
      id: 'sec-3',
      title: 'IED threats surge in Afgooye corridor — 4 incidents detected in last 3 weeks',
      severity: 'High',
      category: 'Security',
      description: 'Security incidents in peri-urban Mogadishu areas showing upward trend, particularly IED threats and opportunistic crime targeting aid operations.',
      location: 'Afgooye corridor, Daynile, and Hodan districts',
      trend: 'up',
      lastUpdated: 'March 4, 2026',
      incidents: [
        'Feb 26: IED discovered near Afgooye checkpoint (safely detonated)',
        'Feb 19: Vehicle hijacking attempt targeting INGO convoy',
        'Feb 12: Armed robbery at IDP camp distribution point',
        'Feb 5: Mortar attack near Mogadishu airport (no casualties)'
      ],
      recommendations: [
        'Enhanced convoy security protocols',
        'Restrict movement during high-risk hours (after 18:00)',
        'Community liaison to improve local intelligence',
        'GPS tracking mandatory for all vehicles in these zones'
      ]
    }
  ];

  const climateRisks: RiskItem[] = [
    {
      id: 'clim-1',
      title: 'Flash floods displace 15,000 in Baidoa — three health facilities now underwater',
      severity: 'Critical',
      category: 'Climate',
      description: 'Unseasonable heavy rainfall causing extensive flooding in Bay Region, displacing populations and disrupting humanitarian operations.',
      location: 'Bay Region (Baidoa and surrounding areas)',
      trend: 'up',
      lastUpdated: 'March 5, 2026',
      incidents: [
        'March 4: 15,000 people displaced by flash floods in Baidoa district',
        'March 1: Three health facilities inundated and non-operational',
        'Feb 25: Main water treatment plant compromised by flooding',
        'Feb 22: Supply routes cut off isolating 8 villages'
      ],
      recommendations: [
        'Emergency flood response activation',
        'Prepositioning of emergency shelter materials',
        'Water purification and cholera prevention programs',
        'Helicopter access for isolated communities'
      ]
    },
    {
      id: 'clim-2',
      title: 'Bakool drought worsens — 40% livestock mortality and crop failures reported',
      severity: 'High',
      category: 'Climate',
      description: 'Prolonged drought conditions in Bakool Region leading to crop failure, livestock deaths, and population displacement.',
      location: 'Bakool Region (Hudur, Wajid, and Elberde districts)',
      trend: 'up',
      lastUpdated: 'March 3, 2026',
      incidents: [
        'Feb 28: Livestock mortality rate reaches 40% in pastoral areas',
        'Feb 20: Water scarcity forcing population migration to urban centers',
        'Feb 15: Crop failure confirmed across 70% of agricultural zones',
        'Feb 8: Acute malnutrition rates exceed emergency thresholds'
      ],
      recommendations: [
        'Scale up emergency water trucking operations',
        'Cash transfers for affected pastoral communities',
        'Veterinary interventions to protect remaining livestock',
        'Malnutrition screening and treatment programs'
      ]
    },
    {
      id: 'clim-3',
      title: 'IDP camp flooding damages 120 shelters — waterborne disease risk rising',
      severity: 'Medium',
      category: 'Climate',
      description: 'Urban flash flooding in Mogadishu IDP settlements creating health risks and damaging temporary shelter infrastructure.',
      location: 'Mogadishu IDP camps (Daynile and Kahda districts)',
      trend: 'stable',
      lastUpdated: 'March 2, 2026',
      incidents: [
        'Feb 27: 2,400 families affected by flash floods in Daynile IDP camps',
        'Feb 24: Contaminated water sources increasing diarrhea cases',
        'Feb 18: 120 temporary shelters damaged or destroyed',
        'Feb 10: Drainage systems overwhelmed in Kahda district'
      ],
      recommendations: [
        'Emergency shelter repairs and reinforcement',
        'Drainage improvement in vulnerable IDP settlements',
        'WASH interventions to prevent waterborne disease',
        'Relocation planning for high-risk camp locations'
      ]
    }
  ];

  const aidDiversionRisks: RiskItem[] = [
    {
      id: 'aid-1',
      title: 'Checkpoint taxation escalates — armed groups extracting 15-20% of shipment values',
      severity: 'Critical',
      category: 'Aid Diversion',
      description: 'Systematic aid diversion at militia checkpoints along major supply routes, with armed groups demanding payments and confiscating portions of humanitarian cargo.',
      location: 'Afgooye corridor, Bay Region entry points',
      trend: 'up',
      lastUpdated: 'March 5, 2026',
      incidents: [
        'March 2: Food convoy forced to surrender 18% of cargo at unauthorized checkpoint',
        'Feb 26: Medical supplies diverted, estimated value $42,000',
        'Feb 19: Cash payment of $8,500 demanded for convoy passage',
        'Feb 12: NFI shipment delayed 48 hours pending taxation negotiations'
      ],
      recommendations: [
        'Negotiate humanitarian corridor agreements with armed group leadership',
        'Enhanced monitoring of supply chain through GPS and photo verification',
        'Coalition advocacy with regional authorities',
        'Consider alternative routing and transport modalities'
      ]
    },
    {
      id: 'aid-2',
      title: 'Partner diversion suspected — warehouse inventory discrepancies found in 3 locations',
      severity: 'High',
      category: 'Aid Diversion',
      description: 'Internal control weaknesses and suspected diversion by implementing partners in food distribution programs.',
      location: 'Mogadishu, Baidoa, Kismayo warehouses',
      trend: 'stable',
      lastUpdated: 'March 3, 2026',
      incidents: [
        'Feb 28: Inventory audit reveals 1,240 missing food rations in Baidoa warehouse',
        'Feb 21: Unaccounted distribution records for 780 beneficiaries in Mogadishu',
        'Feb 14: Warehouse access logs show unauthorized entry during non-operational hours',
        'Feb 7: Partner staff unable to explain discrepancies during spot check'
      ],
      recommendations: [
        'Immediate suspension of partner pending investigation',
        'Enhanced due diligence for all implementing partners',
        'Strengthen beneficiary verification mechanisms',
        'Third-party monitoring and unannounced warehouse inspections'
      ]
    },
    {
      id: 'aid-3',
      title: 'Beneficiary list manipulation detected — 340 ghost registrations in IDP camp distribution',
      severity: 'High',
      category: 'Aid Diversion',
      description: 'Fraudulent beneficiary registration and list manipulation by camp gatekeepers enabling diversion of assistance.',
      location: 'Daynile and Kahda IDP settlements',
      trend: 'stable',
      lastUpdated: 'March 1, 2026',
      incidents: [
        'Feb 25: Biometric verification reveals 340 duplicate/non-existent registrations',
        'Feb 18: Community complaints about aid not reaching registered families',
        'Feb 11: Camp elder found maintaining parallel beneficiary list',
        'Feb 5: Distribution monitoring identifies systematic exclusion patterns'
      ],
      recommendations: [
        'Mandatory biometric registration for all beneficiaries',
        'Community-based targeting with accountability committees',
        'Regular post-distribution monitoring with household visits',
        'Protection response for vulnerable groups facing access barriers'
      ]
    }
  ];

  const programmaticRisks: RiskItem[] = [
    {
      id: 'prog-1',
      title: 'Cash program suspension risk — mobile money providers threaten service withdrawal',
      severity: 'Critical',
      category: 'Programmatic',
      description: 'Key mobile money service providers citing compliance concerns and threatening to suspend humanitarian cash transfer operations.',
      location: 'Nationwide cash transfer programs',
      trend: 'up',
      lastUpdated: 'March 4, 2026',
      incidents: [
        'March 1: Hormuud Money warns of potential suspension pending regulatory clarity',
        'Feb 24: Premier Bank raises AML compliance concerns over cash disbursements',
        'Feb 17: Government introduces new remittance oversight requirements',
        'Feb 10: Service disruptions affect 4,200 scheduled cash transfers'
      ],
      recommendations: [
        'High-level engagement with Central Bank and service providers',
        'Diversify payment mechanisms and vendor partnerships',
        'Accelerate compliance documentation and KYC procedures',
        'Contingency planning for alternative cash delivery modalities'
      ]
    },
    {
      id: 'prog-2',
      title: 'Partner capacity constraints — 3 key partners unable to meet delivery targets',
      severity: 'High',
      category: 'Programmatic',
      description: 'Implementing partners facing severe capacity and resource limitations affecting program delivery timelines and quality.',
      location: 'Bay, Gedo, and Hiraan regions',
      trend: 'up',
      lastUpdated: 'March 3, 2026',
      incidents: [
        'Feb 27: Health partner achieves only 52% of monthly service delivery targets',
        'Feb 20: WASH partner reports staff attrition (7 of 15 field team members departed)',
        'Feb 13: Nutrition partner delays program launch by 6 weeks citing logistics issues',
        'Feb 6: Protection partner unable to access 40% of targeted communities'
      ],
      recommendations: [
        'Technical capacity building and embedded technical advisors',
        'Resource sharing agreements with better-resourced partners',
        'Budget revisions to allow for operational support costs',
        'Consider direct implementation for critical activities'
      ]
    },
    {
      id: 'prog-3',
      title: 'Monitoring access gaps — 65% of sites inaccessible for third-party verification',
      severity: 'High',
      category: 'Programmatic',
      description: 'Security and access constraints preventing adequate program monitoring and accountability, with increasing reliance on unverified partner reporting.',
      location: 'AS-controlled and contested areas',
      trend: 'stable',
      lastUpdated: 'March 2, 2026',
      incidents: [
        'Feb 25: Third-party monitors denied access to 23 program sites in Lower Shabelle',
        'Feb 18: Remote monitoring via phone reveals significant implementation delays',
        'Feb 11: Photo verification shows incomplete infrastructure rehabilitation',
        'Feb 4: Beneficiary feedback mechanisms non-functional in 18 locations'
      ],
      recommendations: [
        'Enhanced remote monitoring technologies (satellite imagery, mobile data)',
        'Community-based monitors and accountability mechanisms',
        'Negotiate access through local leaders and humanitarian coordinators',
        'Risk-based monitoring approach focusing on high-value activities'
      ]
    }
  ];

  // Data for severity pie chart
  const severityData = [
    { name: 'Critical', value: 4, color: 'var(--destructive-text)' },
    { name: 'High', value: 7, color: 'var(--warning)' },
    { name: 'Medium', value: 5, color: 'var(--primary)' },
    { name: 'Low', value: 2, color: 'var(--success)' }
  ];

  // Data for aid diversion trend
  const aidDiversionData = [
    { month: 'Oct', incidents: 8, value: 145 },
    { month: 'Nov', incidents: 12, value: 230 },
    { month: 'Dec', incidents: 6, value: 98 },
    { month: 'Jan', incidents: 9, value: 167 },
    { month: 'Feb', incidents: 14, value: 289 },
    { month: 'Mar', incidents: 11, value: 201 }
  ];

  // Data for security incidents
  const securityIncidentsData = [
    { type: 'IED/VBIED', count: 23 },
    { type: 'Checkpoint Taxation', count: 47 },
    { type: 'Kidnapping', count: 6 },
    { type: 'Armed Robbery', count: 15 },
    { type: 'AS Infiltration', count: 12 }
  ];

  // Data for climate risks trend
  const climateRisksData = [
    { month: 'Oct', drought: 18, flooding: 3, cholera: 5 },
    { month: 'Nov', drought: 22, flooding: 2, cholera: 8 },
    { month: 'Dec', drought: 25, flooding: 1, cholera: 12 },
    { month: 'Jan', drought: 28, flooding: 2, cholera: 15 },
    { month: 'Feb', drought: 31, flooding: 4, cholera: 18 },
    { month: 'Mar', drought: 29, flooding: 9, cholera: 14 }
  ];

  // Somalia locations with risk data
  const riskLocations = [
    { name: 'Mogadishu', lat: 2.0469, lng: 45.3182, risks: 8, severity: 'high', category: 'Security' },
    { name: 'Baidoa', lat: 3.1136, lng: 43.6498, risks: 6, severity: 'high', category: 'Health' },
    { name: 'Afgooye', lat: 2.1383, lng: 45.1217, risks: 4, severity: 'critical', category: 'Security' },
    { name: 'Jowhar', lat: 2.7697, lng: 45.5031, risks: 5, severity: 'high', category: 'Security' },
    { name: 'Kismayo', lat: -0.3582, lng: 42.5454, risks: 4, severity: 'medium', category: 'Political' },
    { name: 'Beledweyne', lat: 4.7351, lng: 45.2039, risks: 3, severity: 'high', category: 'Environmental' },
    { name: 'Luuq', lat: 3.7952, lng: 42.5439, risks: 2, severity: 'critical', category: 'Environmental' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--destructive-text)';
      case 'high': return 'var(--warning-strong)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--success)';
    }
  };

  const getSeverityRadius = (risks: number) => {
    return risks * 15000; // Scale radius based on number of risks
  };

  return (
    <>
    <PageScrollShell innerClassName="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Risk Intelligence Reports</h2>
              <p className="text-sm sm:text-sm text-muted-foreground">Comprehensive analysis of operational risk landscape</p>
            </div>
            
            {/* Time Range Toggle */}
            <div className="flex items-center bg-card border border-border rounded-xl p-1">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  timeRange === '7d'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  timeRange === '30d'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  timeRange === '90d'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                90 Days
              </button>
            </div>
          </div>
          
          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Critical Risks */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-destructive-subtle flex items-center justify-center">
                    <AlertTriangle size={24} className="text-destructive-text" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Critical Risks</p>
                    <p className="text-3xl font-bold text-foreground leading-none mt-1">4</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp size={14} className="text-destructive-text" />
                <span className="font-semibold text-destructive-text">+33%</span>
                <span className="text-text-subtle">vs last period</span>
              </div>
              
            </div>

            {/* Mitigation Rate */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center">
                    <Shield size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Mitigation Rate</p>
                    <p className="text-3xl font-bold text-foreground leading-none mt-1">68%</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp size={14} className="text-success" />
                <span className="font-semibold text-success">+12%</span>
                <span className="text-text-subtle">vs last period</span>
              </div>
              
            </div>

            {/* Overall Exposure */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-warning-subtle flex items-center justify-center">
                    <Activity size={24} className="text-warning-strong" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Overall Exposure</p>
                    <p className="text-3xl font-bold text-foreground leading-none mt-1">High</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingDown size={14} className="text-success" />
                <span className="font-semibold text-success">-8%</span>
                <span className="text-text-subtle">risk score reduction</span>
              </div>
              
            </div>

            {/* Active Monitoring */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-success-subtle flex items-center justify-center">
                    <BarChart3 size={24} className="text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Active Monitoring</p>
                    <p className="text-3xl font-bold text-foreground leading-none mt-1">20</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="font-semibold text-foreground">Real-time</span>
                <span className="text-text-subtle">tracking enabled</span>
              </div>
              
            </div>
          </div>

          {/* AI Summary Card */}
          <div className="bg-gradient-to-br from-primary to-primary rounded-2xl border border-primary p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-card/10 backdrop-blur flex items-center justify-center shrink-0">
                <Sparkles size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold mb-3">AI Risk Intelligence Summary</h3>
                <p className="text-sm leading-relaxed text-white/90 mb-4">
                  Security landscape in Somalia shows heightened volatility with 4 critical-level risks identified in the past 30 days. Al-Shabaab infiltration attempts increased 33% following AMISOM drawdown in Lower Shabelle, while drought conditions in Gedo region reached crisis levels affecting 180,000 pastoralists. Checkpoint taxation incidents surged along Jowhar-Mogadishu corridor, with armed groups extorting an estimated USD 289K from humanitarian convoys. Mitigation effectiveness improved 12% due to enhanced vetting procedures and pre-positioning strategies, though cholera outbreak response in Baidoa IDP settlements requires urgent scaling.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-warning"></div>
                    <span>Key trend: Security deterioration in AS-controlled areas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>Positive: Improved partner vetting systems</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map and Severity Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
            {/* Geographic Risk Distribution - Map */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-5 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-primary" />
                  <div>
                    <h3 className="text-base font-bold text-foreground">Geographic Risk Distribution</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Risk hotspots across Somalia operational zones</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <RiskMap 
                  riskLocations={riskLocations} 
                  getSeverityColor={getSeverityColor} 
                  getSeverityRadius={getSeverityRadius} 
                />
              </div>
            </div>

            {/* Severity Card */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-5 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-primary" />
                  <div>
                    <h3 className="text-base font-bold text-foreground">Severity</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Risk breakdown by status</p>
                  </div>
                </div>
              </div>
              <div className="p-6">

              {/* Donut Chart */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative" style={{ width: '160px', height: '160px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        fill="var(--chart-3)"
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-foreground">18</div>
                    <div className="text-xs text-muted-foreground">total</div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-destructive"></div>
                    <span className="text-base text-muted-foreground">Critical</span>
                  </div>
                  <span className="text-2xl font-bold text-destructive-text">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-warning-strong"></div>
                    <span className="text-base text-muted-foreground">High</span>
                  </div>
                  <span className="text-2xl font-bold text-warning-strong">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-primary"></div>
                    <span className="text-base text-muted-foreground">Medium</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-success"></div>
                    <span className="text-base text-muted-foreground">Low</span>
                  </div>
                  <span className="text-2xl font-bold text-success">2</span>
                </div>
              </div>

              {/* Separator */}
              

              {/* Category Bars */}
              
              </div>
            </div>
          </div>

          {/* Aid Diversion Section */}
          

          {/* Security & Climate Cards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Incidents Card */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="text-lg">🛡️</div>
                  <h3 className="text-base font-bold text-foreground">Security Incidents</h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-warning-strong">6 active</span>
                  <TrendingUp size={16} className="text-warning-strong" />
                </div>
              </div>

              {/* Simple trend line */}
              <div className="h-[80px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Oct', value: 18 },
                    { month: 'Nov', value: 22 },
                    { month: 'Dec', value: 19 },
                    { month: 'Jan', value: 24 },
                    { month: 'Feb', value: 28 },
                    { month: 'Mar', value: 31 }
                  ]}>
                    <defs>
                      <linearGradient id="colorSecurityIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--warning-strong)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--warning-strong)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--warning-strong)" 
                      strokeWidth={2}
                      fill="url(#colorSecurityIncidents)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Incident list */}
              <div className="space-y-2 pt-4 border-t border-sidebar-border">
                {securityRisks.map((risk) => (
                  <button 
                    key={risk.id}
                    onClick={() => handleRiskClick(risk)}
                    className="w-full flex items-start gap-3 px-3 py-3 hover:bg-destructive-subtle rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      risk.severity === 'Critical' ? 'bg-destructive' : 'bg-warning-strong'
                    }`}></div>
                    <span className="text-sm text-foreground leading-relaxed">{risk.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Climate Risks Card */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="text-lg">🌧️</div>
                  <h3 className="text-base font-bold text-foreground">Climate Risks</h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-success">4 active</span>
                  <TrendingUp size={16} className="text-success" />
                </div>
              </div>

              {/* Simple trend line */}
              <div className="h-[80px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Oct', value: 12 },
                    { month: 'Nov', value: 15 },
                    { month: 'Dec', value: 18 },
                    { month: 'Jan', value: 22 },
                    { month: 'Feb', value: 26 },
                    { month: 'Mar', value: 29 }
                  ]}>
                    <defs>
                      <linearGradient id="colorClimateRisks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--success)" 
                      strokeWidth={2}
                      fill="url(#colorClimateRisks)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Risk list */}
              <div className="space-y-2 pt-4 border-t border-sidebar-border">
                {climateRisks.map((risk) => (
                  <button 
                    key={risk.id}
                    onClick={() => handleRiskClick(risk)}
                    className="w-full flex items-start gap-3 px-3 py-3 hover:bg-success-subtle rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      risk.severity === 'Critical' ? 'bg-destructive' : 
                      risk.severity === 'High' ? 'bg-warning-strong' : 'bg-primary'
                    }`}></div>
                    <span className="text-sm text-foreground leading-relaxed">{risk.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aid Diversion Card */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="text-lg">💰</div>
                  <h3 className="text-base font-bold text-foreground">Aid Diversion</h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-destructive-text">3 active</span>
                  <TrendingUp size={16} className="text-destructive-text" />
                </div>
              </div>

              {/* Simple trend line */}
              <div className="h-[80px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Oct', value: 8 },
                    { month: 'Nov', value: 12 },
                    { month: 'Dec', value: 6 },
                    { month: 'Jan', value: 9 },
                    { month: 'Feb', value: 14 },
                    { month: 'Mar', value: 11 }
                  ]}>
                    <defs>
                      <linearGradient id="colorAidDiversion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--destructive-text)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--destructive-text)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--destructive-text)" 
                      strokeWidth={2}
                      fill="url(#colorAidDiversion)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Risk list */}
              <div className="space-y-2 pt-4 border-t border-sidebar-border">
                {aidDiversionRisks.map((risk) => (
                  <button 
                    key={risk.id}
                    onClick={() => handleRiskClick(risk)}
                    className="w-full flex items-start gap-3 px-3 py-3 hover:bg-destructive-subtle rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      risk.severity === 'Critical' ? 'bg-destructive' : 'bg-warning-strong'
                    }`}></div>
                    <span className="text-sm text-foreground leading-relaxed">{risk.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Programmatic Risks Card */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="text-lg">📋</div>
                  <h3 className="text-base font-bold text-foreground">Programmatic Risks</h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-chart-3">3 active</span>
                  <TrendingUp size={16} className="text-chart-3" />
                </div>
              </div>

              {/* Simple trend line */}
              <div className="h-[80px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Oct', value: 14 },
                    { month: 'Nov', value: 11 },
                    { month: 'Dec', value: 16 },
                    { month: 'Jan', value: 19 },
                    { month: 'Feb', value: 22 },
                    { month: 'Mar', value: 25 }
                  ]}>
                    <defs>
                      <linearGradient id="colorProgrammatic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--chart-3)" 
                      strokeWidth={2}
                      fill="url(#colorProgrammatic)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Risk list */}
              <div className="space-y-2 pt-4 border-t border-sidebar-border">
                {programmaticRisks.map((risk) => (
                  <button 
                    key={risk.id}
                    onClick={() => handleRiskClick(risk)}
                    className="w-full flex items-start gap-3 px-3 py-3 hover:bg-chart-3/10 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      risk.severity === 'Critical' ? 'bg-destructive' : 'bg-chart-3'
                    }`}></div>
                    <span className="text-sm text-foreground leading-relaxed">{risk.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
    </PageScrollShell>

      {/* Side Drawer */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-300"
            onClick={closeDrawer}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-card z-[9999] shadow-xl transform transition-transform duration-300 ease-out overflow-y-auto">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-foreground">Risk Details</h3>
              <button 
                onClick={closeDrawer}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Drawer Content */}
            {selectedRisk && (
              <div className="px-6 py-6 space-y-6">
                {/* Title & Severity */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="text-xl font-bold text-foreground">{selectedRisk.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                      selectedRisk.severity === 'Critical' ? 'bg-destructive text-white' :
                      selectedRisk.severity === 'High' ? 'bg-warning-strong text-white' :
                      selectedRisk.severity === 'Medium' ? 'bg-primary text-white' :
                      'bg-success text-white'
                    }`}>
                      {selectedRisk.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedRisk.category === 'Security' ? '🛡️' : '🌧️'}</span>
                    <span>{selectedRisk.category}</span>
                    <span>•</span>
                    <span>Updated {selectedRisk.lastUpdated}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-background rounded-xl p-4 border border-border">
                  <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Overview</h5>
                  <p className="text-sm text-foreground leading-relaxed">{selectedRisk.description}</p>
                </div>

                {/* Location */}
                <div>
                  <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Location</h5>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <MapPin size={16} className="text-muted-foreground" />
                    <span>{selectedRisk.location}</span>
                  </div>
                </div>

                {/* Trend */}
                <div>
                  <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Trend</h5>
                  <div className="flex items-center gap-2">
                    {selectedRisk.trend === 'up' && (
                      <>
                        <TrendingUp size={16} className="text-destructive-text" />
                        <span className="text-sm text-destructive-text font-semibold">Escalating</span>
                      </>
                    )}
                    {selectedRisk.trend === 'down' && (
                      <>
                        <TrendingDown size={16} className="text-success" />
                        <span className="text-sm text-success font-semibold">Improving</span>
                      </>
                    )}
                    {selectedRisk.trend === 'stable' && (
                      <>
                        <Activity size={16} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-semibold">Stable</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Recent Incidents */}
                {selectedRisk.incidents && selectedRisk.incidents.length > 0 && (
                  <div>
                    <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Recent Incidents</h5>
                    <div className="space-y-2">
                      {selectedRisk.incidents.map((incident, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0"></div>
                          <p className="text-sm text-foreground leading-relaxed">{incident}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedRisk.recommendations && selectedRisk.recommendations.length > 0 && (
                  <div>
                    <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">Recommended Actions</h5>
                    <div className="space-y-2">
                      {selectedRisk.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex gap-3 bg-background rounded-lg p-3 border border-border">
                          <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-border space-y-2">
                  <button className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold text-sm transition-colors">
                    Generate Full Report
                  </button>
                  <button className="w-full bg-card hover:bg-secondary text-foreground py-3 rounded-lg font-semibold text-sm border border-border transition-colors">
                    Export to PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
