import { Package, AlertTriangle, MapPin, TrendingUp, Settings, Play, Search, ChevronDown, ArrowUpDown, ChevronRight, ChevronLeft, X, Plus, Sparkles, Check, CircleDot, Trash2, Shield, Lightbulb, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { PageFooter } from './PageFooter';
import { toast } from 'sonner';
import { useProgressiveList } from '../hooks/useProgressiveList';
import { TableSkeleton } from './ui/table-skeleton';

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
        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-secondary-foreground font-medium hover:bg-muted transition-colors"
      >
        <span className={selectedOption ? 'text-secondary-foreground' : 'text-text-subtle'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className={`text-text-subtle transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-[240px] overflow-y-auto min-w-[160px]">
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

export function CollectiveRisk() {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const [isEditingResidual, setIsEditingResidual] = useState(false);
  const [tempResidualValue, setTempResidualValue] = useState('');
  const [riskStatuses, setRiskStatuses] = useState<{ [key: string]: string }>({
    'CR-001': 'Escalating',
    'CR-002': 'Escalating',
    'CR-003': 'Monitored',
    'CR-004': 'Monitored',
  });
  const [drawerStatusOpen, setDrawerStatusOpen] = useState(false);
  const drawerStatusRef = useRef<HTMLDivElement>(null);
  const itemsPerPageDropdownRef = useRef<HTMLDivElement>(null);
  const [residualRankings, setResidualRankings] = useState<{ [key: string]: string }>({
    'CR-001': '15',
    'CR-002': '20',
    'CR-003': '12',
    'CR-004': '10',
    'CR-005': '20',
    'CR-006': '15',
    'CR-007': '12',
    'CR-008': '20',
    'CR-009': '12',
    'CR-010': '8',
    'CR-011': '10',
    'CR-012': '15',
    'CR-013': '9',
    'CR-014': '10',
  });
  const [notes, setNotes] = useState<{ [key: string]: Array<{ author: string; initials: string; time: string; text: string }> }>({
    'CR-001': [
      {
        author: 'Ahmed Mohamed',
        initials: 'AM',
        time: '2 days ago',
        text: 'Coordination meeting scheduled with regional teams to assess mitigation strategies. Priority focus on resource allocation.'
      }
    ]
  });

  // Mitigation measures state
  const [mitigationTab, setMitigationTab] = useState<'ai' | 'active'>('active');
  const [isAddingMitigation, setIsAddingMitigation] = useState(false);
  const [newMitigationText, setNewMitigationText] = useState('');
  const [newMitigationOwner, setNewMitigationOwner] = useState('');
  const [dismissedAiSuggestions, setDismissedAiSuggestions] = useState<{ [key: string]: string[] }>({});
  const [userMitigations, setUserMitigations] = useState<{ [key: string]: Array<{ id: string; text: string; owner: string; status: 'planned' | 'in-progress' | 'completed'; source: 'user' | 'ai' }> }>({
    'CR-001': [
      { id: 'um-1', text: 'Pre-position emergency supplies in Gedo and Bakool regions', owner: 'Logistics Team', status: 'in-progress', source: 'ai' },
      { id: 'um-2', text: 'Establish multi-agency coordination for displacement response', owner: 'Humanitarian Affairs', status: 'planned', source: 'user' }
    ],
    'CR-002': [
      { id: 'um-3', text: 'Strengthen security coordination with ATMIS and SNA', owner: 'Security & Risk Management', status: 'in-progress', source: 'user' },
      { id: 'um-4', text: 'Develop contingency plans for security vacuum scenarios', owner: 'Emergency Preparedness', status: 'planned', source: 'user' }
    ],
    'CR-003': [
      { id: 'um-5', text: 'Strengthen inter-agency coordination mechanisms', owner: 'Programme Coordination', status: 'in-progress', source: 'user' },
      { id: 'um-6', text: 'Implement integrated monitoring and reporting systems', owner: 'M&E Team', status: 'planned', source: 'user' }
    ],
    'CR-004': [
      { id: 'um-7', text: 'Engage with authorities to streamline customs procedures', owner: 'Logistics & Advocacy', status: 'in-progress', source: 'user' },
      { id: 'um-8', text: 'Establish contingency stock in-country to buffer delays', owner: 'Supply Chain', status: 'completed', source: 'user' }
    ]
  });

  const aiSuggestedMitigations: { [key: string]: Array<{ id: string; text: string; rationale: string }> } = {
    'CR-001': [
      { id: 'ai-1', text: 'Establish multi-agency early warning coordination for displacement triggers across Gedo and Bakool', rationale: 'Based on 42 contributing risk signals showing cascading displacement patterns' },
      { id: 'ai-2', text: 'Deploy mobile health units to anticipate healthcare gaps in projected displacement corridors', rationale: 'Healthcare system collapse (RSK-003) is a key amplifier of displacement severity' },
      { id: 'ai-3', text: 'Negotiate humanitarian access corridors with local authorities in border conflict zones', rationale: 'Armed conflict (RSK-002) is restricting aid delivery and accelerating displacement' },
    ],
    'CR-002': [
      { id: 'ai-4', text: 'Implement community-based water resource sharing agreements in contested areas', rationale: 'Water competition (RSK-005) is the primary driver of intercommunal tension' },
      { id: 'ai-5', text: 'Establish climate-security monitoring posts linking weather data with security incident tracking', rationale: 'Pattern analysis shows 72% correlation between drought severity and militia activity' },
    ],
    'CR-003': [
      { id: 'ai-6', text: 'Diversify fuel procurement through regional supplier agreements to reduce price volatility exposure', rationale: 'Single-source dependency amplifies global price shock impacts on operations' },
      { id: 'ai-7', text: 'Pilot alternative energy solutions for critical logistics hubs', rationale: 'Reducing fuel dependency in key nodes can buffer against supply disruptions' },
    ],
    'CR-004': [
      { id: 'ai-8', text: 'Propose streamlined documentation framework through joint government-humanitarian working group', rationale: 'Regulatory complexity is the primary bottleneck for cargo processing timelines' },
    ],
  };

  // Close drawer status dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerStatusRef.current && !drawerStatusRef.current.contains(event.target as Node)) {
        setDrawerStatusOpen(false);
      }
    }
    if (drawerStatusOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [drawerStatusOpen]);

  // Close itemsPerPage dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (itemsPerPageDropdownRef.current && !itemsPerPageDropdownRef.current.contains(event.target as Node)) {
        setShowItemsPerPageDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset editing state when risk selection changes
  useEffect(() => {
    setIsEditingResidual(false);
    setTempResidualValue('');
  }, [selectedRisk]);

  const collectiveRisks = [
    {
      id: 'CR-001',
      title: 'Multi-Dimensional IDP Displacement Crisis',
      contributingCount: 4,
      category: 'Humanitarian',
      causes: 'Drought-induced livelihood collapse, Al-Shabaab territorial control, interclan violence',
      inherentLikelihood: 5,
      inherentImpact: 5,
      mitigationStatus: 'Available',
      mitigationMeasures: 'Pre-positioned emergency supplies, multi-agency coordination for displacement response, protection screening at IDP sites',
      regions: ['Gedo', 'Bay', 'Lower Shabelle'],
      riskLevel: 'CRITICAL',
      status: 'Escalating',
      lastSync: '15M AGO',
      summary: 'Cascading displacement crisis driven by drought-induced livelihood collapse, Al-Shabaab territorial control, and interclan violence. Over 2.6 million people displaced with inadequate shelter, WASH, and protection services in overcrowded IDP settlements. Displacement patterns creating secondary protection risks including GBV, family separation, and forced recruitment.',
      topContributingRisks: [
        { id: 'RSK-EXT-007', title: 'Drought and Pastoral Livelihood Collapse', severity: 'CRITICAL' },
        { id: 'RSK-EXT-002', title: 'Checkpoint Taxation by Armed Groups', severity: 'HIGH' },
        { id: 'RSK-EXT-003', title: 'Cholera/AWD Outbreak Escalation', severity: 'HIGH' },
        { id: 'RSK-INT-008', title: 'Gender-Based Violence in Programming', severity: 'HIGH' }
      ]
    },
    {
      id: 'CR-002',
      title: 'ATMIS Drawdown Security Vacuum',
      contributingCount: 5,
      category: 'Security',
      causes: 'ATMIS drawdown, Al-Shabaab expansion, Somali National Army capacity gaps',
      inherentLikelihood: 5,
      inherentImpact: 4,
      mitigationStatus: 'Available',
      mitigationMeasures: 'Strengthen security coordination with ATMIS and SNA, develop contingency plans for security vacuum scenarios, enhanced convoy protocols',
      regions: ['Lower Shabelle', 'Middle Shabelle', 'Bay'],
      riskLevel: 'CRITICAL',
      status: 'Escalating',
      lastSync: '2H AGO',
      summary: 'African Union Transition Mission drawdown creating security vacuum enabling Al-Shabaab territorial expansion. Reduced humanitarian access corridors, increased checkpoint taxation, and heightened attack risks on UN facilities and convoys. Somali National Army capacity gaps undermining stabilization efforts in newly recovered areas.',
      topContributingRisks: [
        { id: 'RSK-EXT-008', title: 'AMISOM/ATMIS Drawdown Impact', severity: 'CRITICAL' },
        { id: 'RSK-EXT-001', title: 'IED/VBIED Attacks on UN Facilities', severity: 'HIGH' },
        { id: 'RSK-EXT-006', title: 'Kidnapping of International Staff', severity: 'HIGH' },
        { id: 'RSK-EXT-009', title: 'Forced Recruitment of Youth', severity: 'MEDIUM' },
        { id: 'RSK-INT-004', title: 'Staff Duty of Care Gaps', severity: 'MEDIUM' }
      ]
    },
    {
      id: 'CR-003',
      title: 'Multi-Agency Coordination Breakdown',
      contributingCount: 3,
      category: 'Operational',
      causes: 'Fragmented coordination mechanisms, competing mandates, donor earmarking',
      inherentLikelihood: 4,
      inherentImpact: 3,
      mitigationStatus: 'Available',
      mitigationMeasures: 'Strengthen inter-agency coordination mechanisms, implement integrated monitoring systems, joint planning frameworks',
      regions: ['Nationwide'],
      riskLevel: 'HIGH',
      status: 'Monitored',
      lastSync: '4H AGO',
      summary: 'Fragmented coordination mechanisms across UN agencies, INGOs, and local partners leading to duplicated efforts, coverage gaps, and inefficient resource allocation. Competing mandates, parallel reporting structures, and inadequate information sharing undermining integrated programming. Donor earmarking and short funding cycles exacerbating coordination challenges.',
      topContributingRisks: [
        { id: 'RSK-INT-002', title: 'Programme Delivery Delays', severity: 'HIGH' },
        { id: 'RSK-INT-005', title: 'Partner NGO Capacity Constraints', severity: 'MEDIUM' },
        { id: 'RSK-INT-003', title: 'Donor Reporting Non-Compliance', severity: 'MEDIUM' }
      ]
    },
    {
      id: 'CR-004',
      title: 'Federal-State Political Deadlock',
      contributingCount: 4,
      category: 'Political',
      causes: 'Power-sharing disputes, revenue sharing disagreements, electoral tensions',
      inherentLikelihood: 4,
      inherentImpact: 3,
      mitigationStatus: 'Not Available',
      mitigationMeasures: 'Engage with authorities to streamline customs procedures, establish contingency stock in-country',
      regions: ['Jubaland', 'Puntland', 'Galmudug'],
      riskLevel: 'HIGH',
      status: 'Monitored',
      lastSync: '6H AGO',
      summary: 'Power-sharing disputes between Federal Government of Somalia and Federal Member States disrupting humanitarian operations. Access negotiations stalled due to competing political claims over territory and resources. Revenue sharing disagreements and electoral tensions creating operational impediments including movement restrictions, program suspensions, and asset seizures.',
      topContributingRisks: [
        { id: 'RSK-EXT-005', title: 'Federal-State Political Tensions', severity: 'HIGH' },
        { id: 'RSK-EXT-010', title: 'Inter-Clan Conflict Escalation', severity: 'HIGH' },
        { id: 'RSK-INT-001', title: 'Al-Shabaab Infiltration of Programs', severity: 'MEDIUM' },
        { id: 'RSK-INT-007', title: 'Procurement Bottlenecks', severity: 'MEDIUM' }
      ]
    },
    {
      id: 'CR-005',
      title: 'Climate-Induced Food Insecurity Cascade',
      contributingCount: 6,
      category: 'Humanitarian',
      causes: 'Consecutive failed rainy seasons, livestock deaths, crop failure',
      inherentLikelihood: 5,
      inherentImpact: 4,
      mitigationStatus: 'Available',
      mitigationMeasures: 'Emergency food distribution, livestock support programs, cash transfers for vulnerable households',
      regions: ['Bay', 'Bakool', 'Gedo', 'Middle Shabelle'],
      riskLevel: 'CRITICAL',
      status: 'Escalating',
      lastSync: '1H AGO',
      summary: 'Consecutive failed rainy seasons creating acute food insecurity for 6.7 million people. Livestock deaths, crop failure, and degraded rangeland reducing pastoral and agropastoral livelihoods. Rising malnutrition rates, market price spikes, and depleted household coping mechanisms driving distress migration and negative coping strategies.',
      topContributingRisks: [
        { id: 'RSK-EXT-007', title: 'Drought and Pastoral Livelihood Collapse', severity: 'CRITICAL' },
        { id: 'RSK-EXT-011', title: 'Livestock Disease Outbreak', severity: 'HIGH' },
        { id: 'RSK-EXT-012', title: 'Market Price Inflation', severity: 'HIGH' },
        { id: 'RSK-INT-009', title: 'Food Distribution Targeting Errors', severity: 'MEDIUM' }
      ]
    },
    {
      id: 'CR-006',
      title: 'Healthcare System Near-Collapse',
      contributingCount: 5,
      category: 'Humanitarian',
      causes: 'Chronic underfunding, brain drain, insecurity-related facility closures',
      inherentLikelihood: 4,
      inherentImpact: 4,
      mitigationStatus: 'Available',
      mitigationMeasures: 'Mobile health unit deployment, medical supply pre-positioning, health worker safety protocols',
      regions: ['Lower Shabelle', 'Middle Juba', 'Hirshabelle'],
      riskLevel: 'HIGH',
      status: 'Escalating',
      lastSync: '3H AGO',
      summary: 'Chronic underfunding, brain drain of medical professionals, and insecurity-related facility closures undermining healthcare access. Disease outbreaks including cholera, measles, and malaria straining limited capacity. Maternal and child mortality rates rising amid gaps in emergency obstetric care and routine immunization coverage.',
      topContributingRisks: [
        { id: 'RSK-EXT-003', title: 'Cholera/AWD Outbreak Escalation', severity: 'HIGH' },
        { id: 'RSK-EXT-013', title: 'Medical Supply Shortages', severity: 'HIGH' },
        { id: 'RSK-INT-010', title: 'Health Worker Safety Concerns', severity: 'HIGH' },
        { id: 'RSK-INT-011', title: 'Cold Chain Equipment Failure', severity: 'MEDIUM' }
      ]
    },
    {
      id: 'CR-007',
      title: 'Donor Funding Volatility Crisis',
      contributingCount: 3,
      category: 'Operational',
      causes: 'Unpredictable funding cycles, earmarking restrictions, shifting donor priorities',
      inherentLikelihood: 4,
      inherentImpact: 3,
      mitigationStatus: 'Available',
      mitigationMeasures: 'Diversified donor portfolio, multi-year funding advocacy, improved reporting compliance',
      regions: ['Nationwide'],
      riskLevel: 'HIGH',
      status: 'Monitored',
      lastSync: '8H AGO',
      summary: 'Unpredictable funding cycles, earmarking restrictions, and shifting donor priorities creating program continuity risks. Humanitarian Response Plan only 48% funded creating hard choices between life-saving interventions. Short-term grants preventing strategic programming and partner capacity building.',
      topContributingRisks: [
        { id: 'RSK-INT-003', title: 'Donor Reporting Non-Compliance', severity: 'MEDIUM' },
        { id: 'RSK-INT-012', title: 'Budget Pipeline Gaps', severity: 'HIGH' },
        { id: 'RSK-INT-013', title: 'Grant Management Capacity Limits', severity: 'MEDIUM' }
      ]
    },
    {
      id: 'CR-008',
      title: 'Humanitarian Access Denial Pattern',
      contributingCount: 7,
      category: 'Security',
      causes: 'Systematic access restrictions, bureaucratic impediments, movement restrictions',
      inherentLikelihood: 5,
      inherentImpact: 4,
      mitigationStatus: 'Available',
      mitigationMeasures: 'Access negotiation frameworks, remote programming protocols, third-party monitoring arrangements',
      regions: ['Lower Shabelle', 'Middle Shabelle', 'Bay', 'Gedo'],
      riskLevel: 'CRITICAL',
      status: 'Escalating',
      lastSync: '45M AGO',
      summary: 'Systematic access restrictions by multiple actors limiting aid delivery to 3.2 million people in hard-to-reach areas. Bureaucratic impediments, movement restrictions, and denial of humanitarian principles creating protection concerns. Remote programming arrangements increasing fiduciary and quality assurance risks.',
      topContributingRisks: [
        { id: 'RSK-EXT-002', title: 'Checkpoint Taxation by Armed Groups', severity: 'HIGH' },
        { id: 'RSK-EXT-014', title: 'Road Closures Due to Insecurity', severity: 'HIGH' },
        { id: 'RSK-EXT-015', title: 'Visa and Work Permit Delays', severity: 'MEDIUM' },
        { id: 'RSK-INT-014', title: 'Remote Management Oversight Gaps', severity: 'HIGH' }
      ]
    },
    {
      id: 'CR-009',
      title: 'WASH Infrastructure Degradation',
      contributingCount: 4,
      category: 'Infrastructure',
      causes: 'Aging water systems, drought-induced water scarcity, inadequate maintenance',
      inherentLikelihood: 4,
      inherentImpact: 3,
      mitigationStatus: 'Available',
      mitigationMeasures: 'Water system rehabilitation, community WASH committees, hygiene promotion campaigns',
      regions: ['IDP Settlements', 'Bay', 'Lower Shabelle'],
      riskLevel: 'HIGH',
      status: 'Monitored',
      lastSync: '5H AGO',
      summary: 'Aging water systems, inadequate sanitation facilities, and drought-induced water scarcity affecting 4.5 million people. Open defecation practices and contaminated water sources driving disease transmission. Limited operation and maintenance capacity leading to rapid deterioration of infrastructure investments.',
      topContributingRisks: [
        { id: 'RSK-EXT-016', title: 'Water Source Depletion', severity: 'HIGH' },
        { id: 'RSK-EXT-017', title: 'Borehole Pump Failures', severity: 'MEDIUM' },
        { id: 'RSK-INT-015', title: 'Latrine Construction Quality Issues', severity: 'MEDIUM' },
        { id: 'RSK-INT-016', title: 'Community WASH Committee Gaps', severity: 'MEDIUM' }
      ]
    },
    {
      id: 'CR-010',
      title: 'Education System Fragmentation',
      contributingCount: 3,
      category: 'Humanitarian',
      causes: 'Conflict, displacement, poverty, damaged school infrastructure',
      inherentLikelihood: 3,
      inherentImpact: 3,
      mitigationStatus: 'Not Available',
      mitigationMeasures: 'Alternative education programs, teacher training initiatives, temporary learning spaces',
      regions: ['Nationwide'],
      riskLevel: 'MEDIUM',
      status: 'Stable',
      lastSync: '12H AGO',
      summary: 'Over 3 million children out of school due to conflict, displacement, and poverty. Disparate curriculum standards, lack of qualified teachers, and damaged school infrastructure limiting learning outcomes. Gender disparities and child protection concerns including attacks on schools and student recruitment by armed groups.',
      topContributingRisks: [
        { id: 'RSK-EXT-018', title: 'School Infrastructure Damage', severity: 'MEDIUM' },
        { id: 'RSK-EXT-019', title: 'Teacher Salary Payment Delays', severity: 'MEDIUM' },
        { id: 'RSK-INT-017', title: 'Education Material Procurement Delays', severity: 'LOW' }
      ]
    },
    {
      id: 'CR-011',
      title: 'Protection Mainstreaming Failure',
      contributingCount: 4,
      category: 'Humanitarian',
      causes: 'Inadequate protection analysis, limited capacity for monitoring',
      inherentLikelihood: 3,
      inherentImpact: 4,
      mitigationStatus: 'Available',
      mitigationMeasures: 'Protection mainstreaming training, GBV risk assessments, accountability mechanisms strengthening',
      regions: ['Nationwide'],
      riskLevel: 'MEDIUM',
      status: 'Monitored',
      lastSync: '7H AGO',
      summary: 'Inadequate protection analysis and risk mitigation across humanitarian programming creating unintended harm. GBV risks in distribution sites, child protection concerns in IDP settlements, and housing-land-property disputes undermining safe and dignified assistance. Limited capacity for protection monitoring and accountability to affected populations.',
      topContributingRisks: [
        { id: 'RSK-INT-008', title: 'Gender-Based Violence in Programming', severity: 'HIGH' },
        { id: 'RSK-INT-018', title: 'Child Protection Risks in Camps', severity: 'MEDIUM' },
        { id: 'RSK-INT-019', title: 'HLP Dispute Escalation', severity: 'MEDIUM' },
        { id: 'RSK-INT-020', title: 'AAP Mechanism Weakness', severity: 'LOW' }
      ]
    },
    {
      id: 'CR-012',
      title: 'Supply Chain Breakdown Risk',
      contributingCount: 5,
      category: 'Operational',
      causes: 'Port congestion, customs delays, fuel price volatility',
      inherentLikelihood: 4,
      inherentImpact: 4,
      mitigationStatus: 'Available',
      mitigationMeasures: 'Diversified supply routes, strategic stock pre-positioning, customs liaison officers',
      regions: ['Port of Mogadishu', 'Berbera', 'Kismayo'],
      riskLevel: 'HIGH',
      status: 'Monitored',
      lastSync: '4H AGO',
      summary: 'Port congestion, customs delays, and insecure supply routes creating critical pipeline bottlenecks. Fuel price volatility, vehicle fleet maintenance challenges, and limited warehousing capacity affecting last-mile delivery. Dependency on single supply corridors creating vulnerability to disruption.',
      topContributingRisks: [
        { id: 'RSK-INT-007', title: 'Procurement Bottlenecks', severity: 'MEDIUM' },
        { id: 'RSK-EXT-020', title: 'Port Congestion and Delays', severity: 'HIGH' },
        { id: 'RSK-INT-021', title: 'Vehicle Fleet Maintenance Gaps', severity: 'MEDIUM' },
        { id: 'RSK-EXT-021', title: 'Fuel Price Volatility', severity: 'HIGH' }
      ]
    },
    {
      id: 'CR-013',
      title: 'Locust Resurgence Threat',
      contributingCount: 2,
      category: 'Environmental',
      causes: 'Favorable breeding conditions, limited surveillance capacity',
      inherentLikelihood: 3,
      inherentImpact: 3,
      mitigationStatus: 'Not Available',
      mitigationMeasures: 'Surveillance and early warning systems, aerial spraying capacity, community awareness campaigns',
      regions: ['Gedo', 'Bakool', 'Galgaduud'],
      riskLevel: 'MEDIUM',
      status: 'Stable',
      lastSync: '18H AGO',
      summary: 'Favorable breeding conditions and limited surveillance capacity creating risk of desert locust resurgence. Previous swarms devastated 170,000 hectares of cropland and pasture. Cross-border coordination challenges and aerial spraying logistical constraints limiting preparedness and rapid response capability.',
      topContributingRisks: [
        { id: 'RSK-EXT-022', title: 'Desert Locust Breeding Detection', severity: 'MEDIUM' },
        { id: 'RSK-INT-022', title: 'Pesticide Stockpile Shortages', severity: 'MEDIUM' }
      ]
    },
    {
      id: 'CR-014',
      title: 'Urban Vulnerability Escalation',
      contributingCount: 4,
      category: 'Humanitarian',
      causes: 'Rapid urbanization, informal settlement expansion, youth unemployment',
      inherentLikelihood: 3,
      inherentImpact: 4,
      mitigationStatus: 'Available',
      mitigationMeasures: 'Urban livelihood programs, eviction protection advocacy, basic service expansion to informal settlements',
      regions: ['Mogadishu', 'Kismayo', 'Baidoa'],
      riskLevel: 'MEDIUM',
      status: 'Monitored',
      lastSync: '9H AGO',
      summary: 'Rapid urbanization and informal settlement expansion creating concentrated vulnerability in major cities. Limited urban planning, inadequate basic services, and youth unemployment driving social tensions. IDP integration challenges, forced evictions, and limited livelihood opportunities perpetuating urban poverty cycles.',
      topContributingRisks: [
        { id: 'RSK-EXT-023', title: 'Forced Eviction Risk', severity: 'HIGH' },
        { id: 'RSK-EXT-024', title: 'Urban Youth Unemployment', severity: 'MEDIUM' },
        { id: 'RSK-INT-023', title: 'Informal Settlement Fire Hazards', severity: 'MEDIUM' },
        { id: 'RSK-INT-024', title: 'Urban Service Delivery Gaps', severity: 'MEDIUM' }
      ]
    }
  ];

  const filteredRisks = collectiveRisks.filter((risk) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      risk.id.toLowerCase().includes(query) ||
      risk.title.toLowerCase().includes(query) ||
      risk.causes.toLowerCase().includes(query) ||
      risk.summary.toLowerCase().includes(query) ||
      risk.category.toLowerCase().includes(query) ||
      risk.riskLevel.toLowerCase().includes(query) ||
      risk.status.toLowerCase().includes(query) ||
      risk.regions.some((region) => region.toLowerCase().includes(query)) ||
      risk.contributingCount.toString().includes(query) ||
      (residualRankings[risk.id] || '').toLowerCase().includes(query);

    const matchesRegion =
      regionFilter === 'all' ||
      risk.regions.some((region) => region.toLowerCase().includes(regionFilter.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' ||
      risk.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'all' ||
      risk.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRegion && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRisks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRisks = filteredRisks.slice(startIndex, endIndex);
  const { visibleItems: visiblePaginatedRisks, isProgressivelyLoading } = useProgressiveList(paginatedRisks, {
    minLoadingMs: 200,
    transitionKey: `${currentPage}-${itemsPerPage}`,
  });
  const showingStart = filteredRisks.length > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(endIndex, filteredRisks.length);

  // Generate smart page numbers for pagination - Max 3 pages at a time
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 3) {
      // Show all pages if 3 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show max 3 consecutive pages with ellipsis
      const groupStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
      const groupEnd = Math.min(groupStart + 2, totalPages);
      
      if (groupStart > 1) {
        pages.push('...');
      }
      
      for (let i = groupStart; i <= groupEnd; i++) {
        pages.push(i);
      }
      
      if (groupEnd < totalPages) {
        pages.push('...');
      }
    }
    
    return pages;
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
        return 'bg-muted-foreground text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Escalating':
        return { dot: 'bg-destructive', text: 'text-destructive-text' };
      case 'Monitored':
        return { dot: 'bg-chart-2', text: 'text-muted-foreground' };
      case 'Stable':
        return { dot: 'bg-text-subtle', text: 'text-muted-foreground' };
      default:
        return { dot: 'bg-text-subtle', text: 'text-muted-foreground' };
    }
  };

  const getRiskLevelTextColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-destructive-text';
      case 'HIGH':
        return 'text-warning-strong';
      case 'MEDIUM':
        return 'text-warning';
      case 'LOW':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRiskScoreColor = (score: number | string) => {
    const numScore = typeof score === 'string' ? parseInt(score) : score;
    if (isNaN(numScore)) return { bg: 'bg-secondary', text: 'text-text-subtle' };
    
    if (numScore >= 20) {
      return { bg: 'bg-destructive-subtle', text: 'text-destructive-text' }; // Light red background, red text
    } else if (numScore >= 16) {
      return { bg: 'bg-destructive-subtle', text: 'text-destructive-text' }; // Light red background, red text
    } else if (numScore >= 8) {
      return { bg: 'bg-warning-subtle', text: 'text-warning-strong' }; // Light orange background, orange text
    } else if (numScore >= 1) {
      return { bg: 'bg-warning-subtle', text: 'text-warning' }; // Light yellow background, amber text
    }
    return { bg: 'bg-secondary', text: 'text-text-subtle' };
  };

  const selectedRiskData = collectiveRisks.find(r => r.id === selectedRisk);

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="bg-background px-4 sm:px-8 py-6 pt-6">
          <h2 className="text-page-title mb-1">Collective Risks</h2>
          <p className="text-sm sm:text-sm text-muted-foreground">AI-powered pattern analysis across all humanitarian risks in Somalia</p>
        </div>

        {/* Stats Cards */}
        <div className="px-4 sm:px-8 pt-[8px] pb-[24px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Patterns */}
            <div className="bg-card border border-border rounded-2xl px-6 py-5 relative">
              {/* Pill Badge - Top Right */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-success-subtle text-success rounded-full text-xs font-bold">
                  <TrendingUp size={12} strokeWidth={2.5} />
                  +3 New
                </span>
              </div>
              
              <div className="mb-3">
                <div className="w-8 h-8 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <Package size={18} className="text-chart-3" strokeWidth={1.5} />
                </div>
              </div>
              <p className="table-header-label mb-2">
                Total Patterns
              </p>
              <p className="text-kpi">18</p>
            </div>

            {/* Critical Threats */}
            <div className="bg-card border border-border rounded-2xl px-6 py-5 relative">
              <div className="mb-3">
                <div className="w-8 h-8 bg-destructive-subtle rounded-lg flex items-center justify-center">
                  <AlertTriangle size={18} className="text-destructive" strokeWidth={1.5} />
                </div>
              </div>
              <p className="table-header-label mb-2">
                Critical Threats
              </p>
              <p className="text-kpi">05</p>
            </div>

            {/* Affected Regions */}
            <div className="bg-card border border-border rounded-2xl px-6 py-5 relative">
              <div className="mb-3">
                <div className="w-8 h-8 bg-primary-subtle rounded-lg flex items-center justify-center">
                  <MapPin size={18} className="text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <p className="table-header-label mb-2">Affected Locations</p>
              <p className="text-kpi">12</p>
            </div>

            {/* Top Category */}
            <div className="bg-card border border-border rounded-2xl px-6 py-5 relative">
              <div className="mb-3">
                <div className="w-8 h-8 bg-success-subtle rounded-lg flex items-center justify-center">
                  <TrendingUp size={18} className="text-success" strokeWidth={1.5} />
                </div>
              </div>
              <p className="table-header-label mb-2">
                Top Category
              </p>
              <p className="text-kpi">Security</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-4 sm:px-8 pt-[0px] pb-[24px]">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                type="text"
                placeholder="Search collective risks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <CustomDropdown
              value={regionFilter}
              onChange={setRegionFilter}
              options={[
                { value: 'all', label: 'All Regions' },
                { value: 'banadir', label: 'Banadir' },
                { value: 'gedo', label: 'Gedo' },
                { value: 'bakool', label: 'Bakool' },
                { value: 'hirshabelle', label: 'Hirshabelle' }
              ]}
              placeholder="All Regions"
            />

            <CustomDropdown
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'all', label: 'Category' },
                { value: 'humanitarian', label: 'Humanitarian' },
                { value: 'nexus', label: 'Nexus' },
                { value: 'economic', label: 'Economic' },
                { value: 'infrastructure', label: 'Infrastructure' }
              ]}
              placeholder="Category"
            />

            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'Status' },
                { value: 'escalating', label: 'Escalating' },
                { value: 'monitored', label: 'Monitored' },
                { value: 'stable', label: 'Stable' }
              ]}
              placeholder="Status"
            />

            
          </div>
        </div>

        {/* Table - Desktop View */}
        <div className="hidden lg:block px-4 sm:px-8 pb-8">
          <div className="bg-card rounded-2xl overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 table-header-label w-[35%]">Risk description</th>
                  <th className="text-right px-6 py-3 table-header-label w-[15%]">Inherent risk</th>
                  <th className="text-left px-6 py-3 table-header-label w-[15%]">Mitigation</th>
                  <th className="text-right px-6 py-3 table-header-label w-[15%]">Residual risk</th>
                  <th className="w-[20%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isProgressivelyLoading ? (
                  <TableSkeleton rows={itemsPerPage} columns={5} />
                ) : (
                  visiblePaginatedRisks.map((risk) => (
                  <tr 
                    key={risk.id} 
                    className="table-row-narrative cursor-pointer"
                    onClick={() => setSelectedRisk(risk.id)}
                  >
                    {/* Risk Description */}
                    <td className="px-6 py-3.5">
                      
                      <p className="table-value-text line-clamp-2" title={risk.causes}>
                        {risk.causes}
                      </p>
                      <p className="table-metadata-text mt-1">
                        {risk.contributingCount} contributing risks
                      </p>
                    </td>

                    {/* Inherent Risk Ranking */}
                    <td className="px-6 py-3.5 text-right">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full table-status-text tabular-nums ${getRiskScoreColor(risk.inherentLikelihood * risk.inherentImpact).bg} ${getRiskScoreColor(risk.inherentLikelihood * risk.inherentImpact).text}`}>
                        {risk.inherentLikelihood * risk.inherentImpact}
                      </span>
                    </td>

                    {/* Mitigation */}
                    <td className="px-6 py-3.5">
                      <span className={`table-status-text ${risk.mitigationStatus === 'Available' ? 'text-success-text' : 'text-text-subtle'}`}>
                        {risk.mitigationStatus}
                      </span>
                    </td>

                    {/* Residual Risk Ranking */}
                    <td className="px-6 py-3.5 text-right">
                      {residualRankings[risk.id] && residualRankings[risk.id] !== '—' ? (
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full table-status-text tabular-nums ${getRiskScoreColor(residualRankings[risk.id]).bg} ${getRiskScoreColor(residualRankings[risk.id]).text}`}>
                          {residualRankings[risk.id]}
                        </span>
                      ) : (
                        <span className="table-metadata-text">—</span>
                      )}
                    </td>

                    {/* Arrow */}
                    <td className="px-6 py-3.5 text-right">
                      <ChevronRight size={18} className="text-text-subtle inline-block" />
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>

            {/* Pagination */}
            <div className="px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: Items per page */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm text-muted-foreground">Show</span>
              <div className="relative" ref={itemsPerPageDropdownRef}>
                <button
                  onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
                  className="px-3 py-1.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-w-[70px] justify-between"
                >
                  {itemsPerPage}
                  <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showItemsPerPageDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showItemsPerPageDropdown && (
                  <div className="absolute bottom-full left-0 mb-1 w-full bg-card border border-border rounded-lg shadow-lg z-10">
                    {[5, 10, 25, 50, 100].map((count) => (
                      <button
                        key={count}
                        onClick={() => {
                          setItemsPerPage(count);
                          setCurrentPage(1);
                          setShowItemsPerPageDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          itemsPerPage === count ? 'bg-secondary font-medium' : ''
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground leading-none">per page</span>
            </div>

            {/* Right: Page navigation */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-sm text-muted-foreground text-center sm:text-left">
                {isProgressivelyLoading ? 'Loading...' : `${showingStart}-${showingEnd} of ${filteredRisks.length}`}
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'text-border-muted cursor-not-allowed'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-1.5 sm:px-2 text-sm sm:text-sm text-text-subtle">
                      ...
                    </span>
                  ) : (
                    <button 
                      key={page}
                      onClick={() => setCurrentPage(typeof page === 'number' ? page : currentPage)}
                      className={`min-w-[30px] h-[30px] sm:min-w-[32px] sm:h-[32px] px-2 rounded-lg text-sm sm:text-sm font-medium transition-colors ${
                        page === currentPage 
                          ? 'bg-primary text-white' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'text-border-muted cursor-not-allowed'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Card View - Mobile */}
        <div className="lg:hidden px-4 sm:px-8 pb-8 space-y-3">
          {isProgressivelyLoading ? (
            <TableSkeleton variant="grid" rows={itemsPerPage} columns={4} />
          ) : (
            visiblePaginatedRisks.map((risk) => {
            const statusColor = getStatusColor(risk.status);
            return (
              <div
                key={risk.id}
                onClick={() => setSelectedRisk(risk.id)}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer"
              >
                {/* Risk Level and Status */}
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getRiskLevelTextColor(risk.riskLevel)}`}>
                    {risk.riskLevel}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${statusColor.dot}`}></div>
                    <span className="text-xs text-muted-foreground font-medium">{risk.status}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-foreground mb-2 leading-tight">
                  {risk.title}
                </h3>

                {/* Contributing Risks Count */}
                <p className="text-xs text-primary font-medium mb-3">
                  {risk.contributingCount} contributing risks
                </p>

                {/* Meta Information */}
                <div className="space-y-2">
                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-subtle font-medium w-24">Category</span>
                    <span className="text-sm text-muted-foreground font-medium">{risk.category}</span>
                  </div>

                  {/* Causes */}
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-text-subtle font-medium w-24 pt-0.5">Causes</span>
                    <span className="text-xs text-muted-foreground leading-relaxed flex-1">{risk.causes}</span>
                  </div>

                  {/* Inherent Risk */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-subtle font-medium w-24">Inherent Risk</span>
                    <span className="text-sm text-foreground font-semibold">
                      {risk.inherentLikelihood * risk.inherentImpact}
                    </span>
                  </div>

                  {/* Mitigation */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-subtle font-medium w-24">Mitigation</span>
                    <span className={`text-sm font-medium ${risk.mitigationStatus === 'Available' ? 'text-success' : 'text-text-subtle'}`}>
                      {risk.mitigationStatus}
                    </span>
                  </div>

                  {/* Residual Risk */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-subtle font-medium w-24">Residual Risk</span>
                    <span className="text-sm text-foreground font-semibold">
                      {residualRankings[risk.id] || '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
            })
          )}

          {/* Pagination - Mobile */}
          {totalPages > 1 && (
          <div className="mt-3 bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-1.5 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'text-border-muted cursor-not-allowed'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1.5">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-mobile-${index}`} className="px-1.5 text-sm text-text-subtle">
                    ...
                  </span>
                ) : (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(typeof page === 'number' ? page : currentPage)}
                    className={`min-w-[30px] h-[30px] px-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              </div>
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-1.5 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'text-border-muted cursor-not-allowed'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <p className="text-xs text-text-subtle text-center">
              Showing {showingStart}-{showingEnd} of {filteredRisks.length} collective risks
            </p>
          </div>
          )}
        </div>

        {/* Side Drawer */}
        {selectedRiskData && (() => {
          const currentStatus = riskStatuses[selectedRiskData.id] || selectedRiskData.status;
          const statusColors = getStatusColor(currentStatus);
          const statusOptions = [
            { value: 'Escalating', dot: 'bg-destructive', label: 'Escalating' },
            { value: 'Monitored', dot: 'bg-chart-2', label: 'Monitored' },
            { value: 'Stable', dot: 'bg-text-subtle', label: 'Stable' },
          ];

          return (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-300"
              onClick={() => { setSelectedRisk(null); setDrawerStatusOpen(false); setIsEditingResidual(false); setTempResidualValue(''); }}
            />
            
            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] border-l border-border bg-card shadow-2xl z-[9999] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4">
              <div className="flex items-start justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Risk Details
                </h2>
                <button 
                  onClick={() => { setSelectedRisk(null); setDrawerStatusOpen(false); setIsEditingResidual(false); setTempResidualValue(''); }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Title */}
              

              {/* Risk Category */}
              

              {/* Description */}
              <div>
                <h3 className="table-header-label mb-3">
                  Description
                </h3>
                <p className="text-sm text-secondary-foreground leading-relaxed">
                  {selectedRiskData.summary}
                </p>
              </div>

              {/* Causes/Effects */}
              <div>
                <h3 className="table-header-label mb-3">
                  Causes/Effects
                </h3>
                <p className="text-sm text-secondary-foreground leading-relaxed">
                  {selectedRiskData.causes}
                </p>
              </div>

              {/* Inherent Risk Ranking */}
              <div>
                <h3 className="table-header-label mb-3">
                  Inherent Risk Ranking
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-base">
                    {selectedRiskData.inherentLikelihood} × {selectedRiskData.inherentImpact} =
                  </span>
                  <span className={`font-semibold ${getRiskScoreColor(selectedRiskData.inherentLikelihood * selectedRiskData.inherentImpact).text} text-base`}>
                    {selectedRiskData.inherentLikelihood * selectedRiskData.inherentImpact}
                  </span>
                </div>
                <p className="text-sm text-text-subtle mt-2">Likelihood × Impact = Total</p>
              </div>

              {/* Controls/Mitigation Measures */}
              

              {/* Residual Risk Ranking */}
              <div>
                <h3 className="table-header-label mb-3">
                  Residual Risk Ranking
                </h3>
                {!isEditingResidual ? (
                  <div className="flex items-center justify-between px-5 py-4 rounded-xl border border-border bg-muted">
                    <div>
                      <span className="font-bold text-foreground text-xl">
                        {residualRankings[selectedRiskData.id] || '0'}
                      </span>
                      <p className="text-sm text-text-subtle mt-1">Updated after applying mitigation measures</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsEditingResidual(true);
                        setTempResidualValue(residualRankings[selectedRiskData.id] || '0');
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
                            [selectedRiskData.id]: tempResidualValue
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

              {/* Mitigation Measures */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="table-header-label">MITIGATION MEASURES</h3>
                  <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
                    <button
                      onClick={() => setMitigationTab('active')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${mitigationTab === 'active' ? 'bg-card text-foreground' : 'text-text-subtle hover:text-muted-foreground'}`}
                    >
                      Active ({userMitigations[selectedRiskData.id]?.length || 0})
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
                    {(userMitigations[selectedRiskData.id] || []).length === 0 && !isAddingMitigation && (
                      <div className="py-6 text-center">
                        <Shield size={24} className="text-border-muted mx-auto mb-2" />
                        <p className="text-sm text-text-subtle">No additional measures yet</p>
                        <p className="text-xs text-border-muted mt-1">Add your own or adopt AI suggestions</p>
                      </div>
                    )}

                    {userMitigations[selectedRiskData.id]?.map((mitigation) => {
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
                                  [selectedRiskData.id]: userMitigations[selectedRiskData.id]?.map(m =>
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
                                  [selectedRiskData.id]: userMitigations[selectedRiskData.id]?.filter(m => m.id !== mitigation.id) || []
                                });
                                toast.success('Mitigation removed');
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
                              const existing = userMitigations[selectedRiskData.id] || [];
                              setUserMitigations({
                                ...userMitigations,
                                [selectedRiskData.id]: [
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
                              toast.success('Mitigation added');
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
                  const dismissed = dismissedAiSuggestions[selectedRiskData.id] || [];
                  const adopted = (userMitigations[selectedRiskData.id] || []).filter(m => m.source === 'ai').map(m => m.text);
                  const available = (aiSuggestedMitigations[selectedRiskData.id] || []).filter(
                    s => !dismissed.includes(s.id) && !adopted.includes(s.text)
                  );

                  return (
                    <div className="space-y-2">
                      {available.length === 0 && (
                        <div className="py-6 text-center">
                          <CheckCircle2 size={24} className="text-border-muted mx-auto mb-2" />
                          <p className="text-sm text-text-subtle">No suggestions available</p>
                          <p className="text-xs text-border-muted mt-1">Check back as risk patterns evolve</p>
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
                                    const existing = userMitigations[selectedRiskData.id] || [];
                                    setUserMitigations({
                                      ...userMitigations,
                                      [selectedRiskData.id]: [
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
                                      [selectedRiskData.id]: [...dismissed, suggestion.id]
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
                                      [selectedRiskData.id]: [...dismissed, suggestion.id]
                                    });
                                    toast.success('Suggestion dismissed');
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

              {/* Contributing Risks */}
              <div>
                <h3 className="table-header-label mb-3">Contributing Risks</h3>
                <div className="divide-y divide-border">
                  {selectedRiskData.topContributingRisks.map((risk) => (
                    <button 
                      key={risk.id}
                      onClick={() => {
                        console.log('Clicked risk:', risk.id);
                      }}
                      className="w-full py-3 text-left hover:bg-muted -mx-4 px-4 transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs text-text-subtle font-medium mb-1">{risk.id}</p>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{risk.title}</p>
                        </div>
                        
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="table-header-label mb-3">
                  Notes
                </h3>
                <div className="space-y-3">
                  {notes[selectedRiskData.id]?.map((note, idx) => (
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
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                          AM
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-foreground">Ahmed Mohamed</p>
                          <p className="text-xs text-text-subtle">Just now</p>
                        </div>
                      </div>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="w-full h-20 px-3 py-2 bg-card border border-border rounded-lg text-sm text-secondary-foreground placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                        placeholder="Add your note..."
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2 mt-3">
                        <button
                          onClick={() => { setIsAddingNote(false); setNewNote(''); }}
                          className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={!newNote.trim()}
                          onClick={() => {
                            const existing = notes[selectedRiskData.id] || [];
                            setNotes({
                              ...notes,
                              [selectedRiskData.id]: [
                                ...existing,
                                {
                                  author: 'Ahmed Mohamed',
                                  initials: 'AM',
                                  time: 'Just now',
                                  text: newNote.trim()
                                }
                              ]
                            });
                            setIsAddingNote(false);
                            setNewNote('');
                            toast.success('Note added');
                          }}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg font-semibold text-xs hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  )}

                  {!isAddingNote && (
                    <button
                      onClick={() => setIsAddingNote(true)}
                      className="w-full p-2.5 border border-dashed border-border-muted rounded-xl text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary-subtle transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} />
                      Add Note
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          </>
          );
        })()}
        <div className="px-4 sm:px-8">
          <PageFooter />
        </div>
        </div>
      </div>
    </div>
  );
}
