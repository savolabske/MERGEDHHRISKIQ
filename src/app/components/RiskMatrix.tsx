import { useState, useRef, useEffect } from 'react';
import { PageFooter } from './PageFooter';
import { ChevronDown, X, ChevronLeft, MapPin, Sparkles, Shield, Plus, Check, Lightbulb, CheckCircle2, Circle, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { DetailSectionTitle } from './ui/detail-labels';

interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  region: string;
  district: string;
  likelihood: number;
  impact: number;
  type: 'internal' | 'external';
  status: string;
  owner: string;
  mitigationActions: string;
  causeEffects: string;
  inherentRisk: number;
}

// Hover card component for risk dots
function RiskHoverCard({ risk, likelihoodLabel, impactLabel, getRiskLevel, getRiskLevelColor, getRiskDotColor }: {
  risk: Risk;
  likelihoodLabel: string;
  impactLabel: string;
  getRiskLevel: (l: number, i: number) => string;
  getRiskLevelColor: (level: string) => string;
  getRiskDotColor: (category: string) => string;
}) {
  const level = getRiskLevel(risk.likelihood, risk.impact);
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[100] pointer-events-none">
      {/* Arrow pointing up */}
      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-white mx-auto" style={{ filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.06))' }} />
      
      {/* Card */}
      <div className="bg-card rounded-xl border border-border p-4 min-w-[280px] max-w-[340px]" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
        {/* Header with category dot and title */}
        <div className="flex items-start gap-2 mb-2">
          <div className={`w-2.5 h-2.5 rounded-full ${getRiskDotColor(risk.category)} shrink-0 mt-1`} />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground leading-tight">{risk.title}</h4>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {risk.description}
        </p>
      </div>
    </div>
  );
}

// Risk dot with hover card
function RiskDot({ risk, likelihoodLabel, impactLabel, getRiskLevel, getRiskLevelColor, getRiskDotColor, onClick }: {
  risk: Risk;
  likelihoodLabel: string;
  impactLabel: string;
  getRiskLevel: (l: number, i: number) => string;
  getRiskLevelColor: (level: string) => string;
  getRiskDotColor: (category: string) => string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        onClick={onClick}
        className={`w-3 h-3 rounded-full ${getRiskDotColor(risk.category)} hover:scale-125 transition-transform cursor-pointer`}
      />
      {hovered && (
        <RiskHoverCard
          risk={risk}
          likelihoodLabel={likelihoodLabel}
          impactLabel={impactLabel}
          getRiskLevel={getRiskLevel}
          getRiskLevelColor={getRiskLevelColor}
          getRiskDotColor={getRiskDotColor}
        />
      )}
    </div>
  );
}

interface CustomDropdownProps {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

function CustomDropdown({ label, value, options, onChange, placeholder }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-secondary-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent flex items-center justify-between"
      >
        <span className={selectedOption ? 'text-secondary-foreground' : 'text-text-subtle'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-text-subtle transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-[240px] overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl ${
                option.value === value ? 'bg-primary-subtle text-primary font-semibold' : 'text-secondary-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function RiskMatrix({ compact = false }: { compact?: boolean }) {
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskType, setRiskType] = useState<'internal' | 'external'>('internal');
  const [selectedCell, setSelectedCell] = useState<{ likelihood: number; impact: number } | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  
  // Drawer states for notes and mitigations
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [mitigationTab, setMitigationTab] = useState<'ai' | 'active'>('active');
  const [isAddingMitigation, setIsAddingMitigation] = useState(false);
  const [newMitigationText, setNewMitigationText] = useState('');
  const [newMitigationOwner, setNewMitigationOwner] = useState('');
  const [residualRankings, setResidualRankings] = useState<{ [key: string]: string }>({
    'RSK-INT-001': '15',
    'RSK-INT-002': '12',
    'RSK-INT-003': '10',
    'RSK-EXT-001': '16',
    'RSK-EXT-002': '15',
    'RSK-EXT-003': '16',
    'RSK-INT-004': '12',
    'RSK-EXT-004': '16',
    'RSK-INT-005': '8',
    'RSK-EXT-005': '12',
    'RSK-INT-006': '12',
    'RSK-EXT-006': '12',
    'RSK-INT-007': '9',
    'RSK-EXT-007': '20',
    'RSK-INT-008': '12',
    'RSK-EXT-008': '16',
    'RSK-INT-009': '9',
    'RSK-EXT-009': '12',
    'RSK-INT-010': '8',
    'RSK-EXT-010': '12',
  });
  const [isEditingResidual, setIsEditingResidual] = useState(false);
  const [tempResidualValue, setTempResidualValue] = useState('');
  const [notes, setNotes] = useState<{ [key: string]: Array<{ author: string; initials: string; time: string; text: string }> }>({});
  const [userMitigations, setUserMitigations] = useState<{ [key: string]: Array<{ id: string; text: string; owner: string; status: 'planned' | 'in-progress' | 'completed'; source: 'user' | 'ai' }> }>({
    'RSK-INT-001': [
      { id: 'um-1', text: 'Enhanced vetting procedures with biometric registration', owner: 'Security & Risk Management', status: 'in-progress', source: 'user' },
      { id: 'um-2', text: 'Community verification mechanisms for all new hires', owner: 'HR Department', status: 'planned', source: 'user' }
    ],
    'RSK-INT-002': [
      { id: 'um-3', text: 'Fast-track approval processes for urgent operations', owner: 'Programme Management', status: 'in-progress', source: 'user' },
      { id: 'um-4', text: 'Pre-position emergency supplies in strategic locations', owner: 'Logistics Team', status: 'completed', source: 'user' }
    ],
    'RSK-INT-003': [
      { id: 'um-5', text: 'Strengthen M&E systems with digital data collection tools', owner: 'Programme Quality', status: 'in-progress', source: 'user' },
      { id: 'um-6', text: 'Deploy dedicated donor liaison officers', owner: 'Compliance Team', status: 'planned', source: 'user' }
    ],
    'RSK-EXT-001': [
      { id: 'um-7', text: 'Install additional blast barriers and hardening measures', owner: 'Security & Risk Management', status: 'in-progress', source: 'user' },
      { id: 'um-8', text: 'Implement vehicle search procedures at entry points', owner: 'Security Team', status: 'completed', source: 'user' }
    ],
    'RSK-EXT-002': [
      { id: 'um-9', text: 'Develop alternative supply routes to avoid checkpoints', owner: 'Logistics & Supply Chain', status: 'in-progress', source: 'user' },
      { id: 'um-10', text: 'Strengthen coordination with AMISOM/SNA escorts', owner: 'Security Coordination', status: 'planned', source: 'user' }
    ],
    'RSK-EXT-003': [
      { id: 'um-11', text: 'Deploy rapid response teams with ORS supplies', owner: 'Health & WASH Cluster', status: 'in-progress', source: 'user' },
      { id: 'um-12', text: 'Scale up hygiene promotion and water chlorination', owner: 'WASH Team', status: 'completed', source: 'user' }
    ],
    'RSK-INT-004': [
      { id: 'um-13', text: 'Expand MEDEVAC contracts for remote locations', owner: 'HR & Staff Welfare', status: 'in-progress', source: 'user' },
      { id: 'um-14', text: 'Provide mobile counseling and mental health support', owner: 'Staff Wellness', status: 'planned', source: 'user' }
    ],
    'RSK-EXT-004': [
      { id: 'um-15', text: 'Pre-position NFIs and WASH supplies before rainy season', owner: 'Emergency Preparedness', status: 'completed', source: 'user' },
      { id: 'um-16', text: 'Implement flood early warning systems in high-risk areas', owner: 'Emergency Response', status: 'in-progress', source: 'user' }
    ],
    'RSK-INT-005': [
      { id: 'um-17', text: 'Conduct partner capacity assessments quarterly', owner: 'Partnership Team', status: 'in-progress', source: 'user' },
      { id: 'um-18', text: 'Provide technical assistance and financial training', owner: 'Programme Support', status: 'planned', source: 'user' }
    ],
    'RSK-EXT-005': [
      { id: 'um-19', text: 'Maintain strict neutrality in all engagements', owner: 'Political Affairs', status: 'completed', source: 'user' },
      { id: 'um-20', text: 'Dual-track engagement with FGS and FMS authorities', owner: 'Coordination Team', status: 'in-progress', source: 'user' }
    ],
    'RSK-INT-006': [
      { id: 'um-21', text: 'Implement biometric beneficiary registration', owner: 'Programme Management', status: 'in-progress', source: 'user' },
      { id: 'um-22', text: 'Conduct random audits and financial spot checks', owner: 'Compliance Team', status: 'planned', source: 'user' }
    ]
  });
  const [dismissedAiSuggestions, setDismissedAiSuggestions] = useState<{ [key: string]: string[] }>({});

  // Sample risk data
  const risks: Risk[] = [
    {
      id: 'RSK-INT-001',
      title: 'Al-Shabaab Infiltration of Programs',
      description: 'Risk of AS members posing as beneficiaries or local staff to access resources and intelligence on UN operations',
      category: 'Security',
      region: 'Lower Shabelle',
      district: 'Afgooye',
      likelihood: 4,
      impact: 5,
      type: 'internal',
      status: 'Active',
      owner: 'Security & Risk Management',
      mitigationActions: 'Enhanced vetting procedures, biometric registration, and community verification mechanisms',
      causeEffects: 'Weak vetting procedures, limited community verification mechanisms. Effects include compromised program integrity, security threats to staff.',
      inherentRisk: 20
    },
    {
      id: 'RSK-INT-002',
      title: 'Programme Delivery Delays',
      description: 'Systematic delays in implementing health, nutrition, and WASH activities due to access constraints and bureaucratic bottlenecks',
      category: 'Operational',
      region: 'Bay',
      district: 'Baidoa',
      likelihood: 5,
      impact: 4,
      type: 'internal',
      status: 'Escalating',
      owner: 'Programme Management',
      mitigationActions: 'Fast-track approval processes, pre-position supplies, strengthen coordination with local authorities',
      causeEffects: 'Access constraints, bureaucratic approval delays, coordination gaps. Effects include unmet humanitarian needs, donor dissatisfaction.',
      inherentRisk: 20
    },
    {
      id: 'RSK-INT-003',
      title: 'Donor Reporting Non-Compliance',
      description: 'Risk of failing to meet donor reporting requirements due to limited M&E capacity and data collection challenges in hard-to-reach areas',
      category: 'Compliance',
      region: 'Nationwide',
      district: 'All Districts',
      likelihood: 3,
      impact: 5,
      type: 'internal',
      status: 'Active',
      owner: 'Programme Quality & Compliance',
      mitigationActions: 'Strengthen M&E systems, invest in remote monitoring tools, dedicated donor liaison officers',
      causeEffects: 'Limited M&E capacity, data collection challenges in hard-to-reach areas. Effects include donor sanctions, funding suspension, reputational damage.',
      inherentRisk: 15
    },
    {
      id: 'RSK-EXT-001',
      title: 'IED/VBIED Attacks on UN Facilities',
      description: 'Persistent threat of improvised explosive device and vehicle-borne attacks targeting UN compounds and staff accommodation',
      category: 'Security',
      region: 'Banadir',
      district: 'Mogadishu',
      likelihood: 4,
      impact: 5,
      type: 'external',
      status: 'Escalating',
      owner: 'Security & Risk Management',
      mitigationActions: 'Hardening of facilities, blast barriers, vehicle search procedures, standoff distances',
      causeEffects: 'Al-Shabaab targeting of high-profile UN facilities, weak perimeter security. Effects include mass casualties, operational shutdown, global attention.',
      inherentRisk: 20
    },
    {
      id: 'RSK-EXT-002',
      title: 'Checkpoint Taxation by Armed Groups',
      description: 'Unauthorized taxation and cargo diversion at checkpoints controlled by Al-Shabaab and other armed actors along supply routes',
      category: 'Security',
      region: 'Middle Shabelle',
      district: 'Jowhar',
      likelihood: 5,
      impact: 4,
      type: 'external',
      status: 'Active',
      owner: 'Logistics & Supply Chain',
      mitigationActions: 'Route diversification, community engagement, coordination with AMISOM/SNA',
      causeEffects: 'Al-Shabaab control of supply routes, limited government presence. Effects include aid diversion, programme funding gaps, beneficiary shortfalls.',
      inherentRisk: 20
    },
    {
      id: 'RSK-EXT-003',
      title: 'Cholera/AWD Outbreak Escalation',
      description: 'Acute watery diarrhea and cholera outbreaks in IDP settlements with inadequate WASH facilities and overcrowding',
      category: 'Health',
      region: 'Bay',
      district: 'Baidoa',
      likelihood: 5,
      impact: 4,
      type: 'external',
      status: 'Active',
      owner: 'Health & WASH Cluster',
      mitigationActions: 'Rapid response teams, oral rehydration points, hygiene promotion, water chlorination',
      causeEffects: 'Inadequate WASH infrastructure, IDP overcrowding, limited health services. Effects include high mortality, health system overwhelm, programme disruption.',
      inherentRisk: 20
    },
    {
      id: 'RSK-INT-004',
      title: 'Staff Duty of Care Gaps',
      description: 'Insufficient medical evacuation capacity, mental health support, and R&R provisions for staff in high-stress environments',
      category: 'Human Resources',
      region: 'Nationwide',
      district: 'All Districts',
      likelihood: 4,
      impact: 4,
      type: 'internal',
      status: 'Active',
      owner: 'HR & Staff Welfare',
      mitigationActions: 'Expand MEDEVAC contracts, mobile counseling services, enhanced R&R policies',
      causeEffects: 'High-stress operational environment, limited medical facilities, insufficient support systems. Effects include staff burnout, resignations, duty of care litigation.',
      inherentRisk: 16
    },
    {
      id: 'RSK-EXT-004',
      title: 'Gu/Deyr Seasonal Flooding',
      description: 'Riverine flooding during rainy seasons displacing populations, destroying infrastructure, and cutting off access to programme areas',
      category: 'Environmental',
      region: 'Hiraan',
      district: 'Beledweyne',
      likelihood: 5,
      impact: 4,
      type: 'external',
      status: 'Active',
      owner: 'Emergency Preparedness Team',
      mitigationActions: 'Pre-positioning of NFIs and WASH supplies, flood early warning systems, relocation plans',
      causeEffects: 'Riverine flooding patterns, climate variability, weak drainage systems. Effects include mass displacement, infrastructure damage, access disruption.',
      inherentRisk: 20
    },
    {
      id: 'RSK-INT-005',
      title: 'Partner NGO Capacity Constraints',
      description: 'Implementing partners lack technical capacity, financial management systems, and field presence to deliver quality programming',
      category: 'Partnership',
      region: 'Jubaland',
      district: 'Kismayo',
      likelihood: 4,
      impact: 3,
      type: 'internal',
      status: 'Active',
      owner: 'Partnership & Programme Support',
      mitigationActions: 'Partner capacity assessments, technical assistance, financial spot checks, joint monitoring',
      causeEffects: 'Limited local NGO capacity, weak financial systems, insufficient field presence. Effects include poor programme quality, financial mismanagement, donor concerns.',
      inherentRisk: 12
    },
    {
      id: 'RSK-EXT-005',
      title: 'Federal-State Political Tensions',
      description: 'Political disputes between FGS and Federal Member States creating operational impediments and restricted humanitarian access',
      category: 'Political',
      region: 'Jubaland',
      district: 'Multiple',
      likelihood: 4,
      impact: 4,
      type: 'external',
      status: 'Active',
      owner: 'Political Affairs & Coordination',
      mitigationActions: 'Maintain neutrality, dual-track engagement with FGS and FMS authorities',
      causeEffects: 'Federal-state power struggles, electoral tensions, resource disputes. Effects include access restrictions, programme delays, perception of bias.',
      inherentRisk: 16
    },
    {
      id: 'RSK-INT-006',
      title: 'Fraud and Diversion of Assistance',
      description: 'Risk of aid diversion through fraudulent beneficiary lists, ghost workers, and collusion between staff and suppliers',
      category: 'Compliance',
      region: 'Nationwide',
      district: 'All Districts',
      likelihood: 4,
      impact: 4,
      type: 'internal',
      status: 'Active',
      owner: 'Internal Oversight & Audit',
      mitigationActions: 'Biometric registration, third-party monitoring, hotlines, surprise audits',
      causeEffects: 'Weak internal controls, limited oversight capacity, collusion risks. Effects include aid diversion, donor investigations, reputational damage.',
      inherentRisk: 16
    },
    {
      id: 'RSK-EXT-006',
      title: 'Kidnapping of International Staff',
      description: 'High-value targets for kidnapping-for-ransom and hostage-taking by criminal networks and extremist groups',
      category: 'Security',
      region: 'Lower Juba',
      district: 'Kismayo',
      likelihood: 3,
      impact: 5,
      type: 'external',
      status: 'Active',
      owner: 'Security & Risk Management',
      mitigationActions: 'Strict movement protocols, security escorts, low-profile operations, tracking systems',
      causeEffects: 'High-value targets, criminal networks, extremist groups. Effects include staff trauma, operational shutdown, ransom payments, global media attention.',
      inherentRisk: 15
    },
    {
      id: 'RSK-INT-007',
      title: 'Procurement Bottlenecks',
      description: 'Lengthy procurement processes delaying critical supplies including emergency shelter, health commodities, and fuel',
      category: 'Operational',
      region: 'Banadir',
      district: 'Mogadishu',
      likelihood: 4,
      impact: 3,
      type: 'internal',
      status: 'Stable',
      owner: 'Procurement & Supply Chain',
      mitigationActions: 'Fast-track emergency procedures, long-term agreements with suppliers, local procurement',
      causeEffects: 'Complex approval processes, limited supplier base, compliance requirements. Effects include programme delays, stock-outs, missed delivery windows.',
      inherentRisk: 12
    },
    {
      id: 'RSK-EXT-007',
      title: 'Drought and Pastoral Livelihood Collapse',
      description: 'Consecutive failed rainy seasons causing livestock deaths, water scarcity, and displacement of pastoralist communities',
      category: 'Environmental',
      region: 'Gedo',
      district: 'Luuq',
      likelihood: 5,
      impact: 5,
      type: 'external',
      status: 'Escalating',
      owner: 'Food Security & Livelihoods',
      mitigationActions: 'Cash transfers, livestock destocking, water trucking, livelihood diversification',
      causeEffects: 'Climate change, consecutive failed rains, weak water infrastructure. Effects include famine conditions, mass displacement, livelihood collapse.',
      inherentRisk: 25
    },
    {
      id: 'RSK-INT-008',
      title: 'Gender-Based Violence in Programming',
      description: 'Risk of GBV incidents linked to aid distribution including sexual exploitation, harassment at distribution points, and domestic violence',
      category: 'Protection',
      region: 'Nationwide',
      district: 'All Districts',
      likelihood: 3,
      impact: 5,
      type: 'internal',
      status: 'Active',
      owner: 'Protection Cluster',
      mitigationActions: 'Safe distribution spaces, female staff presence, GBV referral pathways, community awareness',
      causeEffects: 'Power imbalances, inadequate safeguards, cultural norms. Effects include survivor trauma, programme suspension, legal liability, reputational damage.',
      inherentRisk: 15
    },
    {
      id: 'RSK-EXT-008',
      title: 'AMISOM/ATMIS Drawdown Impact',
      description: 'Security vacuum created by withdrawal of African Union forces enabling AS territorial expansion and restricting humanitarian access',
      category: 'Security',
      region: 'Lower Shabelle',
      district: 'Multiple',
      likelihood: 4,
      impact: 5,
      type: 'external',
      status: 'Escalating',
      owner: 'Security & Risk Management',
      mitigationActions: 'Contingency planning, programme suspension protocols, remote programming modalities',
      causeEffects: 'African Union troop withdrawal, weak SNA capacity, Al-Shabaab resurgence. Effects include access loss, programme suspension, staff relocations.',
      inherentRisk: 20
    },
    {
      id: 'RSK-INT-009',
      title: 'Cash-Based Assistance Diversion',
      description: 'Mobile money agents charging excessive fees, forced sharing of PIN codes, and interception of cash transfers by gatekeepers',
      category: 'Operational',
      region: 'Bay',
      district: 'Baidoa',
      likelihood: 3,
      impact: 4,
      type: 'internal',
      status: 'Active',
      owner: 'Cash Working Group',
      mitigationActions: 'Retailer agreements, post-distribution monitoring, alternative payment mechanisms',
      causeEffects: 'Limited agent oversight, power imbalances, gatekeeper dynamics. Effects include beneficiary harm, reduced transfer value, programme integrity concerns.',
      inherentRisk: 12
    },
    {
      id: 'RSK-EXT-009',
      title: 'Forced Recruitment of Youth',
      description: 'Al-Shabaab forced recruitment campaigns targeting vulnerable youth in IDP camps and underserved communities',
      category: 'Protection',
      region: 'Middle Shabelle',
      district: 'Jowhar',
      likelihood: 4,
      impact: 4,
      type: 'external',
      status: 'Active',
      owner: 'Protection & Child Protection',
      mitigationActions: 'Youth engagement programmes, education access, livelihood opportunities, community dialogues',
      causeEffects: 'Lack of opportunities, AS recruitment tactics, vulnerable populations. Effects include protection failures, community trauma, programme access restrictions.',
      inherentRisk: 16
    },
    {
      id: 'RSK-INT-010',
      title: 'Telecommunications Failure',
      description: 'Unreliable internet and mobile networks disrupting communications, data transmission, and coordination during emergencies',
      category: 'Technology',
      region: 'Lower Juba',
      district: 'Afmadow',
      likelihood: 4,
      impact: 3,
      type: 'internal',
      status: 'Active',
      owner: 'ICT & Emergency Telecoms',
      mitigationActions: 'Satellite communication backup, offline data systems, radio networks',
      causeEffects: 'Weak telecommunications infrastructure, power outages, limited coverage. Effects include coordination gaps, data loss, delayed emergency response.',
      inherentRisk: 12
    },
    {
      id: 'RSK-EXT-010',
      title: 'Inter-Clan Conflict Escalation',
      description: 'Resource competition and political disputes triggering violent clashes between clan militias disrupting humanitarian operations',
      category: 'Political',
      region: 'Galmudug',
      district: 'Dhusamareb',
      likelihood: 4,
      impact: 4,
      type: 'external',
      status: 'Active',
      owner: 'Political Affairs & Conflict Prevention',
      mitigationActions: 'Conflict-sensitive programming, community dialogue platforms, do-no-harm assessments',
      causeEffects: 'Resource competition, political disputes, clan dynamics. Effects include civilian casualties, access restrictions, programme suspension, perception of bias.',
      inherentRisk: 16
    }
  ];

  // AI suggested mitigations data
  const aiSuggestedMitigations: { [key: string]: Array<{ id: string; text: string; rationale: string }> } = {
    'RSK-INT-001': [
      { id: 'ai-1', text: 'Implement community-led beneficiary verification committees with rotating membership', rationale: 'Community involvement reduces infiltration risk through local knowledge and accountability' },
      { id: 'ai-2', text: 'Deploy biometric registration systems linked to national identity databases', rationale: 'Technical verification creates additional layers beyond document-based screening' },
    ],
    'RSK-INT-002': [
      { id: 'ai-7', text: 'Establish advance authorization protocols with gatekeepers for predictable access windows', rationale: 'Pre-negotiated access reduces ad-hoc delays and creates operational predictability' },
      { id: 'ai-8', text: 'Create buffer stock pre-positioning in accessible locations near restricted areas', rationale: 'Pre-positioned supplies enable rapid deployment when access windows open' },
    ],
    'RSK-INT-003': [
      { id: 'ai-3', text: 'Establish remote monitoring partnerships with local CSOs for real-time data collection', rationale: 'Local partners can access restricted areas while maintaining reporting standards' },
      { id: 'ai-4', text: 'Develop offline-first mobile data collection tools with automated donor report generation', rationale: 'Technology reduces manual reporting burden and improves data quality' },
    ],
    'RSK-EXT-001': [
      { id: 'ai-21', text: 'Deploy perimeter intrusion detection systems with integrated camera surveillance', rationale: 'Early detection of security breaches enables rapid response before attacks materialize' },
      { id: 'ai-22', text: 'Establish multi-layered vehicle search protocols with explosive detection equipment', rationale: 'Systematic vehicle screening reduces VBIED risks at facility entry points' },
    ],
    'RSK-EXT-002': [
      { id: 'ai-23', text: 'Negotiate humanitarian access agreements with local elders and armed group intermediaries', rationale: 'Community mediation reduces taxation incidents through relationship building' },
      { id: 'ai-24', text: 'Implement GPS tracking and real-time convoy monitoring with alert protocols', rationale: 'Visibility of convoy movements enables rapid intervention during checkpoint incidents' },
    ],
    'RSK-EXT-003': [
      { id: 'ai-25', text: 'Pre-position oral rehydration supplies and medical kits in high-risk IDP settlements', rationale: 'Immediate treatment capacity reduces AWD mortality during outbreak surges' },
      { id: 'ai-26', text: 'Deploy rapid cholera testing kits for early case detection and containment', rationale: 'Early detection enables targeted response before community transmission accelerates' },
    ],
  };

  // Filter risks based on selected filters
  const filteredRisks = risks.filter(risk => {
    const matchesRegion = regionFilter === 'all' || risk.region === regionFilter;
    const matchesCategory = categoryFilter === 'all' || risk.category === categoryFilter;
    const matchesType = risk.type === riskType;
    
    return matchesRegion && matchesCategory && matchesType;
  });

  // Get cell background color based on risk level
  const getCellColor = (likelihood: number, impact: number) => {
    const riskScore = likelihood * impact;
    
    // High Risk (red zone) - very light pink/rose
    if (riskScore >= 12) return 'bg-destructive-subtle'; // Very light red/pink
    
    // Medium Risk (yellow zone) - very light yellow
    if (riskScore >= 6) return 'bg-warning-subtle'; // Very light yellow
    
    // Low Risk (green zone) - very light mint/green
    return 'bg-success-subtle'; // Very light green/mint
  };

  // Get risk dot color based on category
  const getRiskDotColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Security': 'bg-destructive',
      'Operational': 'bg-chart-3',
      'Compliance': 'bg-info',
      'Health': 'bg-destructive',
      'Human Resources': 'bg-chart-3',
      'Environmental': 'bg-success',
      'Partnership': 'bg-warning',
      'Political': 'bg-warning-strong',
      'Protection': 'bg-chart-4',
      'Technology': 'bg-info'
    };
    return colors[category] || 'bg-muted-foreground';
  };

  // Group risks by cell position
  const getRisksInCell = (likelihood: number, impact: number) => {
    return filteredRisks.filter(risk => risk.likelihood === likelihood && risk.impact === impact);
  };

  // Get risk level label
  const getRiskLevel = (likelihood: number, impact: number) => {
    const riskScore = likelihood * impact;
    if (riskScore >= 20) return 'CRITICAL';
    if (riskScore >= 15) return 'HIGH';
    if (riskScore >= 10) return 'MEDIUM';
    if (riskScore >= 6) return 'LOW';
    return 'VERY LOW';
  };

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

  const getRiskScoreColor = (score: number | string) => {
    const numScore = typeof score === 'string' ? parseInt(score) : score;
    if (isNaN(numScore)) return { bg: 'bg-secondary', text: 'text-text-subtle' };
    
    if (numScore >= 20) {
      return { bg: 'bg-destructive-subtle', text: 'text-destructive-text' };
    } else if (numScore >= 16) {
      return { bg: 'bg-destructive-subtle', text: 'text-destructive-text' };
    } else if (numScore >= 8) {
      return { bg: 'bg-warning-subtle', text: 'text-warning-strong' };
    } else if (numScore >= 1) {
      return { bg: 'bg-warning-subtle', text: 'text-warning' };
    }
    return { bg: 'bg-secondary', text: 'text-text-subtle' };
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: { dot: string; bg?: string; text?: string } } = {
      'Escalating': { dot: 'bg-destructive', bg: 'bg-chart-4/10', text: 'text-destructive' },
      'Active': { dot: 'bg-warning-strong', bg: 'bg-warning-subtle', text: 'text-warning-text' },
      'Stable': { dot: 'bg-text-subtle', bg: 'bg-muted', text: 'text-secondary-foreground' },
      'Closed': { dot: 'bg-success', bg: 'bg-success-subtle', text: 'text-success-text' },
    };
    return statusColors[status] || { dot: 'bg-gray-400' };
  };

  const likelihoodLabels = ['Very Unlikely', 'Unlikely', 'Moderate', 'Likely', 'Very Likely'];
  const impactLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

  // Get risks in the selected cell
  const selectedCellRisks = selectedCell ? getRisksInCell(selectedCell.likelihood, selectedCell.impact) : [];

  return (
    <div className={`${compact ? 'w-full overflow-visible' : 'h-full flex flex-col bg-background overflow-hidden'}`}>
      {/* Scrollable Content */}
      <div className={compact ? '' : 'flex-1 overflow-y-auto'}>
        <div className={compact ? '' : 'max-w-[1400px] mx-auto'}>
        {/* Header */}
        {!compact && (
          <div className="bg-background px-4 sm:px-8 py-6 pt-6">
            <h2 className="text-page-title mb-1">Risk Matrix</h2>
            <p className="text-sm sm:text-sm text-muted-foreground">Interactive 5×5 matrix visualization of risk likelihood and impact</p>
          </div>
        )}

        {/* Filters and Toggle */}
        {!compact && (
          <div className="px-4 sm:px-8 pt-[8px] pb-[24px]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Region Filter */}
            <div className="w-full sm:w-[200px]">
              <CustomDropdown
                value={regionFilter}
                onChange={setRegionFilter}
                options={[
                  { value: 'all', label: 'All Regions' },
                  { value: 'Banadir', label: 'Banadir' },
                  { value: 'Lower Shabelle', label: 'Lower Shabelle' },
                  { value: 'Lower Juba', label: 'Lower Juba' },
                  { value: 'Nationwide', label: 'Nationwide' }
                ]}
                placeholder="All Regions"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-[200px]">
              <CustomDropdown
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'Security', label: 'Security' },
                  { value: 'Operational', label: 'Operational' },
                  { value: 'Compliance', label: 'Compliance' },
                  { value: 'Health', label: 'Health' },
                  { value: 'Human Resources', label: 'Human Resources' },
                  { value: 'Environmental', label: 'Environmental' },
                  { value: 'Partnership', label: 'Partnership' },
                  { value: 'Political', label: 'Political' },
                  { value: 'Protection', label: 'Protection' },
                  { value: 'Technology', label: 'Technology' }
                ]}
                placeholder="All Categories"
              />
            </div>

            <div className="flex-1"></div>

            {/* Internal/External Toggle */}
            <div className="flex items-center bg-card border border-border rounded-xl p-1 w-full sm:w-auto">
              <button
                onClick={() => setRiskType('internal')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-sm font-semibold transition-colors ${
                  riskType === 'internal'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Internal Risks
              </button>
              <button
                onClick={() => setRiskType('external')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-sm font-semibold transition-colors ${
                  riskType === 'external'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Collective Risks
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Risk Matrix */}
        <div className={compact ? 'p-3 sm:p-5' : 'px-4 sm:px-8 pb-8'}>
          <div className={`bg-card rounded-2xl border border-border ${compact ? 'p-3 sm:p-5 overflow-x-auto' : 'p-3 sm:p-8 overflow-x-auto'}`}>
            <div className={`flex ${compact ? 'gap-6' : 'gap-3 sm:gap-6'} ${compact ? '' : 'min-w-[600px] sm:min-w-0'}`}>
              {/* Y-axis Label - Vertical */}
              <div className="hidden sm:flex flex-col items-center justify-center">
                <div className="text-xs font-bold text-text-subtle uppercase tracking-wide" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  Likelihood
                </div>
              </div>

              {/* Y-axis Labels */}
              <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-2 sm:gap-3'}`}>
                {[...likelihoodLabels].reverse().map((label) => (
                  <div key={label} className={`text-xs sm:text-xs font-bold text-text-subtle uppercase tracking-wide text-right ${compact ? 'h-[70px]' : 'h-[56px] sm:h-[100px]'} flex items-center justify-end`}>
                    {label.includes(' ') ? (
                      <span className="text-right leading-tight">
                        {label.split(' ')[0]}<br />{label.split(' ')[1]}
                      </span>
                    ) : (
                      label
                    )}
                  </div>
                ))}
              </div>

              {/* Matrix Grid */}
              <div className="flex-1">
                <div className={`grid grid-cols-5 ${compact ? 'gap-3' : 'gap-2 sm:gap-3'}`}>
                  {/* Matrix Cells - 5x5 grid */}
                  {[5, 4, 3, 2, 1].map((likelihood) => (
                    impactLabels.map((impactLabel, impactIndex) => {
                      const impact = impactIndex + 1;
                      const cellRisks = getRisksInCell(likelihood, impact);
                      const hasRisks = cellRisks.length > 0;

                      return (
                        <button
                          key={`${likelihood}-${impact}`}
                          onClick={() => hasRisks && setSelectedCell({ likelihood, impact })}
                          className={`${compact ? 'h-[70px]' : 'h-[56px] sm:h-[100px]'} rounded-xl ${getCellColor(likelihood, impact)} border border-border p-1.5 sm:p-4 relative flex items-center justify-center ${hasRisks ? 'cursor-pointer hover:border-primary hover:border-2 transition-all' : 'cursor-default'}`}
                        >
                          {hasRisks && (
                            <div className="flex flex-wrap gap-1 items-center justify-center">
                              {cellRisks.slice(0, 5).map((risk) => (
                                <RiskDot
                                  key={risk.id}
                                  risk={risk}
                                  likelihoodLabel={likelihoodLabels[likelihood - 1]}
                                  impactLabel={impactLabel}
                                  getRiskLevel={getRiskLevel}
                                  getRiskLevelColor={getRiskLevelColor}
                                  getRiskDotColor={getRiskDotColor}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCell({ likelihood, impact });
                                    setSelectedRisk(risk);
                                  }}
                                />
                              ))}
                              {cellRisks.length > 5 && (
                                <span className="text-xs font-bold text-muted-foreground">
                                  +{cellRisks.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })
                  ))}
                </div>

                {/* X-axis Labels */}
                <div className={`grid grid-cols-5 ${compact ? 'gap-3 mt-6' : 'gap-2 sm:gap-3 mt-3 sm:mt-6'}`}>
                  {impactLabels.map((label) => (
                    <div key={label} className="text-xs sm:text-xs font-bold text-text-subtle uppercase tracking-wide text-center leading-tight">
                      {label.includes(' ') ? (
                        <>
                          {label.split(' ')[0]}
                          <br />
                          {label.split(' ')[1]}
                        </>
                      ) : (
                        label
                      )}
                    </div>
                  ))}
                </div>
                
                {/* X-axis Label - Centered */}
                <div className="text-center mt-4 sm:mt-6">
                  <div className="text-xs font-bold text-text-subtle uppercase tracking-wide">
                    Impact Level →
                  </div>
                </div>

                {/* Risk Legend - Centered */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-6 mt-4 sm:mt-6 mb-2 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-success-subtle"></div>
                    <span className="text-xs text-muted-foreground font-medium">Low Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-warning-subtle"></div>
                    <span className="text-xs text-muted-foreground font-medium">Medium Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-destructive-subtle"></div>
                    <span className="text-xs text-muted-foreground font-medium">High Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Drawer */}
        {selectedCell && selectedCellRisks.length > 0 && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-300"
              onClick={() => setSelectedCell(null)}
            />
            
            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] border-l border-border bg-card shadow-2xl z-[9999] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 bg-card border-b border-border px-6 py-6 flex items-start justify-between">
              <div className="flex-1">
                {!selectedRisk ? (
                  <>
                    <p className="text-xs text-text-subtle font-bold uppercase tracking-wide mb-1">
                      {likelihoodLabels[selectedCell.likelihood - 1]} x {impactLabels[selectedCell.impact - 1]}
                    </p>
                    <h2 className="text-xl font-semibold text-foreground leading-tight">
                      {selectedCellRisks.length} {selectedCellRisks.length === 1 ? 'Risk' : 'Risks'} in this Cell
                    </h2>
                  </>
                ) : (
                  <>
                    
                    <h2 className="text-xl font-semibold text-foreground leading-tight">
                      {selectedRisk.title}
                    </h2>
                  </>
                )}
              </div>
              <button 
                onClick={() => {
                  setSelectedRisk(null);
                  setSelectedCell(null);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Content - List of Risks or Risk Detail */}
            {!selectedRisk ? (
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                {selectedCellRisks.map((risk, index) => (
                  <button
                    key={risk.id}
                    onClick={() => setSelectedRisk(risk)}
                    className="w-full bg-card border border-border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all text-left"
                  >
                    {/* Risk Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        
                        <h3 className="text-base font-bold text-foreground leading-tight">
                          {risk.title}
                        </h3>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full ${getRiskDotColor(risk.category)} ml-3 mt-1`} />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {risk.description}
                    </p>

                    {/* Risk Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-text-subtle font-medium mb-1">Category</p>
                        <p className="text-xs font-semibold text-foreground">{risk.category}</p>
                      </div>
                    </div>

                    {/* Location & Status */}
                    

                    {/* Risk Level Badge */}
                    
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* Back Button */}
                <div className="px-6 py-4 border-b border-border">
                  <button
                    onClick={() => setSelectedRisk(null)}
                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Back to Cell Risks
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                  {/* Description */}
                  <div>
                    <DetailSectionTitle as="h3">Description</DetailSectionTitle>
                    <p className="text-sm text-secondary-foreground leading-relaxed">
                      {selectedRisk.description}
                    </p>
                  </div>

                  {/* Risk Cause/Effects */}
                  <div>
                    <DetailSectionTitle as="h3">Risk Cause/Effects</DetailSectionTitle>
                    <p className="text-sm text-secondary-foreground leading-relaxed">
                      {selectedRisk.causeEffects}
                    </p>
                  </div>

                  {/* Inherent Risk Ranking */}
                  <div>
                    <DetailSectionTitle as="h3">Inherent Risk Ranking</DetailSectionTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-base">
                        {selectedRisk.likelihood} × {selectedRisk.impact} =
                      </span>
                      <span className={`font-semibold ${getRiskScoreColor(selectedRisk.inherentRisk).text} text-base`}>
                        {selectedRisk.inherentRisk}
                      </span>
                    </div>
                    <p className="text-sm text-text-subtle mt-2">Likelihood × Impact = Total</p>
                  </div>

                  {/* Residual Risk Ranking */}
                  <div>
                    <DetailSectionTitle as="h3">Residual Risk Ranking</DetailSectionTitle>
                    {!isEditingResidual ? (
                      <div className="flex items-center justify-between px-5 py-4 rounded-xl border border-border bg-muted">
                        <div>
                          <span className="font-bold text-foreground text-xl">
                            {residualRankings[selectedRisk.id] || '0'}
                          </span>
                          <p className="text-sm text-text-subtle mt-1">Updated after applying mitigation measures</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsEditingResidual(true);
                            setTempResidualValue(residualRankings[selectedRisk.id] || '0');
                          }}
                          className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-semibold text-primary hover:bg-primary-subtle transition-colors"
                        >
                          Edit score
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="number"
                          value={tempResidualValue}
                          onChange={(e) => setTempResidualValue(e.target.value)}
                          placeholder="Enter ranking"
                          autoFocus
                          className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setResidualRankings({
                                ...residualRankings,
                                [selectedRisk.id]: tempResidualValue
                              });
                              setIsEditingResidual(false);
                              toast.success('Residual risk ranking updated');
                            }}
                            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingResidual(false);
                              setTempResidualValue('');
                            }}
                            className="flex-1 px-4 py-2.5 bg-card border border-border text-muted-foreground rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risk Owner */}
                  <div>
                    <DetailSectionTitle as="h3">Risk Owner</DetailSectionTitle>
                    <p className="text-sm font-medium text-secondary-foreground">
                      {selectedRisk.owner}
                    </p>
                  </div>

                  {/* Mitigation Measures */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <DetailSectionTitle as="h3" className="mb-0">
                        Mitigation measures
                      </DetailSectionTitle>
                      <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
                        <button
                          onClick={() => setMitigationTab('active')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${mitigationTab === 'active' ? 'bg-card text-foreground' : 'text-text-subtle hover:text-muted-foreground'}`}
                        >
                          Active ({userMitigations[selectedRisk.id]?.length || 0})
                        </button>
                        <button
                          onClick={() => setMitigationTab('ai')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${mitigationTab === 'ai' ? 'bg-card text-foreground' : 'text-text-subtle hover:text-muted-foreground'}`}
                        >
                          <Sparkles size={11} />
                          AI Suggested (5)
                        </button>
                      </div>
                    </div>

                    {/* Active Mitigations Tab */}
                    {mitigationTab === 'active' && (
                      <div className="space-y-2">
                        {(userMitigations[selectedRisk.id] || []).length === 0 && !isAddingMitigation && (
                          <div className="py-6 text-center">
                            <Shield size={24} className="text-border-muted mx-auto mb-2" />
                            <p className="text-sm text-text-subtle">No additional measures yet</p>
                            <p className="text-xs text-border-muted mt-1">Add your own or adopt AI suggestions</p>
                          </div>
                        )}

                        {userMitigations[selectedRisk.id]?.map((mitigation) => {
                          const statusConfig = {
                            'planned': { icon: Circle, color: 'text-text-subtle', bg: 'bg-secondary', label: 'Planned' },
                            'in-progress': { icon: Clock, color: 'text-primary', bg: 'bg-primary-subtle', label: 'In Progress' },
                            'completed': { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-subtle', label: 'Completed' },
                          };
                          const config = statusConfig[mitigation.status];
                          const StatusIcon = config.icon;
                          const nextStatus: Record<string, 'planned' | 'in-progress' | 'completed'> = {
                            'planned': 'in-progress',
                            'in-progress': 'completed',
                            'completed': 'planned',
                          };

                          return (
                            <div key={mitigation.id} className="p-3.5 border border-border rounded-xl bg-card group">
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => {
                                    setUserMitigations({
                                      ...userMitigations,
                                      [selectedRisk.id]: userMitigations[selectedRisk.id]?.map(m =>
                                        m.id === mitigation.id ? { ...m, status: nextStatus[m.status] } : m
                                      ) || []
                                    });
                                  }}
                                  className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${config.bg}`}
                                  title={`Click to change status (${config.label})`}
                                >
                                  <StatusIcon size={13} className={config.color} />
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm text-foreground leading-relaxed ${mitigation.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                                    {mitigation.text}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    {mitigation.source === 'ai' && (
                                      <span className="flex items-center gap-1 text-xs font-semibold text-chart-3 bg-chart-3/10 px-2 py-0.5 rounded-full">
                                        <Sparkles size={9} />
                                        AI
                                      </span>
                                    )}
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                      {config.label}
                                    </span>
                                    {mitigation.owner && (
                                      <span className="text-xs text-text-subtle">{mitigation.owner}</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setUserMitigations({
                                      ...userMitigations,
                                      [selectedRisk.id]: userMitigations[selectedRisk.id]?.filter(m => m.id !== mitigation.id) || []
                                    });
                                    toast.success('Mitigation action removed');
                                  }}
                                  className="shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive-subtle rounded-md transition-all"
                                  title="Remove mitigation"
                                >
                                  <Trash2 size={13} className="text-destructive-text" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {isAddingMitigation && (
                          <div className="p-3.5 border border-primary rounded-xl bg-primary-subtle">
                            <textarea
                              value={newMitigationText}
                              onChange={(e) => setNewMitigationText(e.target.value)}
                              className="w-full h-16 px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-secondary-foreground placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                              placeholder="Describe the mitigation measure..."
                              autoFocus
                            />
                            <input
                              type="text"
                              value={newMitigationOwner}
                              onChange={(e) => setNewMitigationOwner(e.target.value)}
                              className="w-full mt-2 px-3 py-2 bg-card border border-border rounded-lg text-sm text-secondary-foreground placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                              placeholder="Owner (e.g. Security Team)"
                            />
                            <div className="flex items-center justify-end gap-2 mt-3">
                              <button
                                onClick={() => { setIsAddingMitigation(false); setNewMitigationText(''); setNewMitigationOwner(''); }}
                                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                disabled={!newMitigationText.trim()}
                                onClick={() => {
                                  const existing = userMitigations[selectedRisk.id] || [];
                                  setUserMitigations({
                                    ...userMitigations,
                                    [selectedRisk.id]: [
                                      ...existing,
                                      {
                                        id: `um-${Date.now()}`,
                                        text: newMitigationText.trim(),
                                        owner: newMitigationOwner.trim() || 'Unassigned',
                                        status: 'planned',
                                        source: 'user'
                                      }
                                    ]
                                  });
                                  setIsAddingMitigation(false);
                                  setNewMitigationText('');
                                  setNewMitigationOwner('');
                                  toast.success('Mitigation action added successfully');
                                }}
                                className="px-3 py-1.5 bg-primary text-white rounded-lg font-semibold text-xs hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Add Measure
                              </button>
                            </div>
                          </div>
                        )}

                        {!isAddingMitigation && (
                          <button
                            onClick={() => setIsAddingMitigation(true)}
                            className="w-full p-2.5 border border-dashed border-border-muted rounded-xl text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary-subtle transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Plus size={14} />
                            Add Measure
                          </button>
                        )}
                      </div>
                    )}

                    {/* AI Suggestions Tab */}
                    {mitigationTab === 'ai' && (() => {
                      const dismissed = dismissedAiSuggestions[selectedRisk.id] || [];
                      const adopted = (userMitigations[selectedRisk.id] || []).filter(m => m.source === 'ai').map(m => m.text);
                      const available = (aiSuggestedMitigations[selectedRisk.id] || []).filter(
                        s => !dismissed.includes(s.id) && !adopted.includes(s.text)
                      );

                      return (
                        <div className="space-y-2">
                          {available.length === 0 && (
                            <div className="py-6 text-center">
                              <CheckCircle2 size={24} className="text-border-muted mx-auto mb-2" />
                              <p className="text-sm text-text-subtle">All suggestions reviewed</p>
                              <p className="text-xs text-border-muted mt-1">New suggestions will appear as risk signals evolve</p>
                            </div>
                          )}

                          {available.map((suggestion) => (
                            <div key={suggestion.id} className="p-3.5 border border-chart-3/20 rounded-xl bg-chart-3/10">
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-chart-3/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <Lightbulb size={13} className="text-chart-3" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground leading-relaxed">
                                    {suggestion.text}
                                  </p>
                                  
                                  <div className="flex items-center gap-2 mt-3">
                                    <button
                                      onClick={() => {
                                        const existing = userMitigations[selectedRisk.id] || [];
                                        setUserMitigations({
                                          ...userMitigations,
                                          [selectedRisk.id]: [
                                            ...existing,
                                            {
                                              id: `um-${Date.now()}`,
                                              text: suggestion.text,
                                              owner: 'Unassigned',
                                              status: 'planned',
                                              source: 'ai'
                                            }
                                          ]
                                        });
                                        setDismissedAiSuggestions({
                                          ...dismissedAiSuggestions,
                                          [selectedRisk.id]: [...dismissed, suggestion.id]
                                        });
                                        toast.success('AI suggestion adopted');
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition-colors"
                                    >
                                      <Check size={12} />
                                      Adopt
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDismissedAiSuggestions({
                                          ...dismissedAiSuggestions,
                                          [selectedRisk.id]: [...dismissed, suggestion.id]
                                        });
                                        toast.success('AI suggestion dismissed');
                                      }}
                                      className="px-3 py-1.5 text-xs font-medium text-text-subtle hover:text-muted-foreground transition-colors"
                                    >
                                      Dismiss
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Notes Section */}
                  <div>
                    <DetailSectionTitle as="h3">Notes</DetailSectionTitle>
                    <div className="space-y-3">
                      {notes[selectedRisk.id]?.map((note, idx) => (
                        <div key={idx} className="p-4 border border-warning-subtle rounded-xl bg-warning-subtle">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                              {note.initials}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-foreground">{note.author}</p>
                              <p className="text-xs text-text-subtle">{note.time}</p>
                            </div>
                          </div>
                          <p className="text-sm text-secondary-foreground leading-relaxed">
                            {note.text}
                          </p>
                        </div>
                      ))}

                      {isAddingNote && (
                        <div className="p-4 border border-border rounded-xl bg-muted">
                          <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="w-full h-20 px-4 py-3 bg-card border border-border rounded-xl text-sm text-secondary-foreground placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                            placeholder="Add a note..."
                          />
                          <div className="flex items-center justify-end mt-3">
                            <button
                              onClick={() => setIsAddingNote(false)}
                              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                setNotes({
                                  ...notes,
                                  [selectedRisk.id]: [
                                    ...(notes[selectedRisk.id] || []),
                                    {
                                      author: 'Current User',
                                      initials: 'CU',
                                      time: 'Just now',
                                      text: newNote
                                    }
                                  ]
                                });
                                setIsAddingNote(false);
                                setNewNote('');
                                toast.success('Note added successfully');
                              }}
                              className="px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors"
                            >
                              Add Note
                            </button>
                          </div>
                        </div>
                      )}

                      {!isAddingNote && (
                        <button
                          onClick={() => setIsAddingNote(true)}
                          className="w-full p-3 border-2 border-dashed border-border rounded-xl text-sm font-semibold text-muted-foreground hover:border-border-muted hover:bg-card transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus size={16} />
                          Add Note
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </>
        )}
        {!compact && (
          <div className="px-4 sm:px-8">
            <PageFooter />
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
