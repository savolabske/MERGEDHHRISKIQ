import { Compass, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BriefingContentProps {
  onFollowUp?: (suggestions: string[]) => void;
  mode?: 'briefing' | 'comparison';
}

interface Risk {
  id: string;
  title: string;
  category: string;
  likelihood: number;
  impact: number;
  riskLevel: string;
  status: string;
  description: string;
}

export function BriefingContent({ onFollowUp, mode = 'briefing' }: BriefingContentProps) {
  const [selectedCell, setSelectedCell] = useState<{ likelihood: number; impact: number } | null>(null);

  // Set suggestions when component mounts
  useEffect(() => {
    if (mode === 'briefing') {
      onFollowUp?.(['Compare with last month']);
    } else if (mode === 'comparison') {
      onFollowUp?.(['Map the increases geographically']);
    }
  }, [mode]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-destructive text-white';
      case 'HIGH':
        return 'bg-warning-strong text-white';
      case 'MEDIUM':
        return 'bg-warning text-white';
      case 'LOW':
        return 'bg-success text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Escalating':
        return 'text-warning';
      case 'Active':
        return 'text-chart-2';
      case 'Stable':
        return 'text-muted-foreground';
      default:
        return 'text-gray-700';
    }
  };

  // Complete risk data with full details
  const allRisks: Risk[] = [
    { 
      id: 'RSK-SEC-021', 
      title: 'Escalation of armed conflict in Lower Shabelle', 
      category: 'Security',
      likelihood: 5, 
      impact: 5, 
      riskLevel: 'CRITICAL',
      status: 'Escalating',
      description: 'Al-Shabaab operations intensifying in Lower Shabelle region. Complex attacks targeting government facilities and humanitarian convoys averaging 3-5 incidents per month. Movement restrictions severely impacting operational capacity.'
    },
    { 
      id: 'RSK-ENV-034', 
      title: 'Flooding in riverine districts (Shabelle basin)', 
      category: 'Environmental',
      likelihood: 5, 
      impact: 4, 
      riskLevel: 'HIGH',
      status: 'Active',
      description: 'Seasonal flooding along Shabelle River displacing 23,000 people. 14 villages underwater. Humanitarian access by boat only. Cholera outbreak risk elevated due to contaminated water sources.'
    },
    { 
      id: 'RSK-LOG-018', 
      title: 'Road access constraints - AS checkpoints', 
      category: 'Logistics',
      likelihood: 3, 
      impact: 4, 
      riskLevel: 'HIGH',
      status: 'Active',
      description: 'Al-Shabaab maintains improvised checkpoints on Mogadishu-Jowhar and Kismayo-Jilib supply routes. Taxation demands and cargo inspections causing 3-7 day delays. Armed escort requirements increasing operational costs by 35%.'
    },
    { 
      id: 'RSK-LOG-041', 
      title: 'Supply chain disruption - fuel price volatility', 
      category: 'Logistics',
      likelihood: 3, 
      impact: 4, 
      riskLevel: 'MEDIUM',
      status: 'Stable',
      description: 'Global oil price fluctuations impacting humanitarian logistics. Transportation costs up 28% since January. Budget pressures forcing route optimization and reduced field presence in outlying areas.'
    },
    { 
      id: 'RSK-ECO-009', 
      title: 'Funding shortfall risk - donor reduction signals', 
      category: 'Economic',
      likelihood: 3, 
      impact: 3, 
      riskLevel: 'MEDIUM',
      status: 'Active',
      description: 'Major donors signaling budget reductions for FY2026. ECHO: -25%, SIDA: grant non-renewal (€4.2M). Cumulative impact: 28% funding gap emerging for Q2-Q3 operations. Program prioritization required.'
    }
  ];

  // Get risks for a specific cell
  const getRisksInCell = (likelihood: number, impact: number) => {
    return allRisks.filter(risk => risk.likelihood === likelihood && risk.impact === impact);
  };

  // Get cell background color
  const getCellColor = (likelihood: number, impact: number) => {
    const riskScore = likelihood * impact;
    if (riskScore >= 15) return 'bg-destructive-subtle'; // High - light red
    if (riskScore >= 9) return 'bg-warning-subtle'; // Medium - light yellow
    return 'bg-success-subtle'; // Low - light green
  };

  const selectedRisks = selectedCell ? getRisksInCell(selectedCell.likelihood, selectedCell.impact) : [];

  return (
    <div className="space-y-6">
      {mode === 'briefing' && (
        <div className="bg-card border border-border rounded-2xl p-8">
          <h4 className="text-sm font-bold text-foreground mb-6">Risk Distribution Matrix</h4>
          
          <div className="flex gap-8">
            {/* Y-axis label */}
            <div className="flex flex-col justify-center">
              <div className="text-xs font-bold text-text-subtle uppercase tracking-wide -rotate-90 whitespace-nowrap">
                Likelihood
              </div>
            </div>

            {/* Matrix container */}
            <div className="flex-1">
              {/* Matrix grid */}
              <div className="relative" style={{ maxWidth: '600px' }}>
                {/* Grid cells - 5x5 */}
                <div className="grid grid-cols-5 grid-rows-5 gap-2">
                  {[...Array(25)].map((_, i) => {
                    const row = Math.floor(i / 5);
                    const col = i % 5;
                    const likelihoodLevel = 5 - row; // 5 at top, 1 at bottom (Y-axis)
                    const impactLevel = col + 1; // 1 at left, 5 at right (X-axis)
                    
                    const bgColor = getCellColor(likelihoodLevel, impactLevel);
                    const risksInCell = getRisksInCell(likelihoodLevel, impactLevel);
                    const hasRisks = risksInCell.length > 0;

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (hasRisks) {
                            setSelectedCell({ likelihood: likelihoodLevel, impact: impactLevel });
                          }
                        }}
                        className={`${bgColor} rounded-lg relative h-24 transition-all ${
                          hasRisks ? 'cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-2' : 'cursor-default'
                        }`}
                      >
                        {/* Risk dots */}
                        {risksInCell.map((risk, riskIdx) => (
                          <div
                            key={risk.id}
                            className="absolute w-4 h-4 rounded-full bg-foreground border-2 border-white shadow-sm"
                            style={{
                              top: '50%',
                              left: '50%',
                              transform: `translate(${riskIdx % 2 === 0 ? '-10px' : '6px'}, ${Math.floor(riskIdx / 2) * 12 - 6}px)`
                            }}
                            title={risk.title}
                          />
                        ))}
                        
                        {/* Risk count badge */}
                        {risksInCell.length > 0 && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-foreground text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {risksInCell.length}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Y-axis labels (Likelihood) */}
                <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-around text-xs text-muted-foreground font-semibold">
                  <span>5</span>
                  <span>4</span>
                  <span>3</span>
                  <span>2</span>
                  <span>1</span>
                </div>

                {/* X-axis labels (Impact) */}
                <div className="absolute -bottom-8 left-0 right-0 flex justify-around text-xs text-muted-foreground font-semibold">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>

              {/* X-axis label */}
              <div className="text-center mt-12">
                <div className="text-xs font-bold text-text-subtle uppercase tracking-wide">
                  Impact
                </div>
              </div>

              {/* Color Legend */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex items-center gap-6">
                  <span className="text-xs font-bold text-text-subtle uppercase tracking-wide">Risk Levels:</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-success-subtle border border-border-muted"></div>
                      <span className="text-xs text-muted-foreground font-medium">Low (1-8)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-warning-subtle border border-border-muted"></div>
                      <span className="text-xs text-muted-foreground font-medium">Medium (9-14)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-destructive-subtle border border-border-muted"></div>
                      <span className="text-xs text-muted-foreground font-medium">High (15-25)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Drawer */}
      {selectedCell && selectedRisks.length > 0 && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-300"
            onClick={() => setSelectedCell(null)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] border-l border-border bg-card overflow-auto shadow-2xl z-[9999]">
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-6 py-6 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Likelihood {selectedCell.likelihood} × Impact {selectedCell.impact}
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                {selectedRisks.length} {selectedRisks.length === 1 ? 'risk' : 'risks'} in this cell
              </p>
            </div>
            <button 
              onClick={() => setSelectedCell(null)}
              className="p-2 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {selectedRisks.map((risk) => (
              <div 
                key={risk.id}
                className="p-5 border border-border rounded-xl hover:border-border-muted transition-colors bg-card"
              >
                {/* Risk ID and Level */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-xs text-text-subtle font-bold uppercase tracking-wide">
                    {risk.id}
                  </span>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getRiskLevelColor(risk.riskLevel)}`}>
                    {risk.riskLevel}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-foreground mb-3 leading-snug">
                  {risk.title}
                </h3>

                {/* Category and Status */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-muted-foreground font-medium">
                    {risk.category}
                  </span>
                  <span className="text-border-muted">•</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(risk.status).replace('text-', 'bg-')}`}></div>
                    <span className="text-xs text-muted-foreground font-medium">{risk.status}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-secondary-foreground leading-relaxed">
                  {risk.description}
                </p>

                {/* Matrix Position */}
                <div className="mt-4 pt-4 border-t border-sidebar-border flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-text-subtle font-medium">Likelihood: </span>
                    <span className="text-foreground font-bold">{risk.likelihood}/5</span>
                  </div>
                  <span className="text-border-muted">•</span>
                  <div>
                    <span className="text-text-subtle font-medium">Impact: </span>
                    <span className="text-foreground font-bold">{risk.impact}/5</span>
                  </div>
                  <span className="text-border-muted">•</span>
                  <div>
                    <span className="text-text-subtle font-medium">Score: </span>
                    <span className="text-foreground font-bold">{risk.likelihood * risk.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
      )}
    </div>
  );
}