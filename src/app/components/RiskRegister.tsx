import { Search, Plus, MapPin, Edit2, Trash2, ChevronLeft, ChevronRight, X, ChevronDown, Upload, MoreVertical, Eye, FileText, CheckCircle2, Sparkles, Shield, Lightbulb, Check, Circle, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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

// Upload modal step type
type UploadStep = 'upload' | 'processing' | 'complete';

// Processing stage labels
const processingStages = [
  'Reading document contents...',
  'Identifying risk entries...',
  'Extracting risk details & categories...',
  'Assessing likelihood and impact levels...',
  'Generating risk register entries...',
];

export function RiskRegister() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [riskToDelete, setRiskToDelete] = useState<string | null>(null);
  const [editingRisk, setEditingRisk] = useState<string | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const itemsPerPageDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
  
  // Drawer states
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [mitigationTab, setMitigationTab] = useState<'ai' | 'active'>('active');
  const [isAddingMitigation, setIsAddingMitigation] = useState(false);
  const [newMitigationText, setNewMitigationText] = useState('');
  const [newMitigationOwner, setNewMitigationOwner] = useState('');
  const [drawerStatusOpen, setDrawerStatusOpen] = useState(false);
  const drawerStatusRef = useRef<HTMLDivElement>(null);
  const [riskStatuses, setRiskStatuses] = useState<{ [key: string]: string }>({});
  const [residualRankings, setResidualRankings] = useState<{ [key: string]: string }>({
    'RSK-INT-001': '12',
    'RSK-INT-002': '15',
    'RSK-INT-003': '10',
    'RSK-INT-004': '12',
    'RSK-INT-005': '8',
    'RSK-INT-006': '10',
    'RSK-INT-007': '8',
    'RSK-INT-008': '10',
    'RSK-INT-009': '9',
    'RSK-INT-010': '8',
  });
  const [isEditingResidual, setIsEditingResidual] = useState(false);
  const [tempResidualValue, setTempResidualValue] = useState('');
  
  // Notes data (per risk)
  const [notes, setNotes] = useState<{ [key: string]: Array<{ author: string; initials: string; time: string; text: string }> }>({});
  
  // Mitigations data (per risk)
  const [userMitigations, setUserMitigations] = useState<{ [key: string]: Array<{ id: string; text: string; owner: string; status: 'planned' | 'in-progress' | 'completed'; source: 'user' | 'ai' }> }>({});
  const [dismissedAiSuggestions, setDismissedAiSuggestions] = useState<{ [key: string]: string[] }>({});

  // Upload modal states
  const [uploadStep, setUploadStep] = useState<UploadStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [extractedCount, setExtractedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for edit modal
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    region: 'Banadir',
    district: '',
    category: 'Security',
    likelihood: '3',
    impact: '3',
    owner: '',
    mitigationActions: '',
    status: 'Closed'
  });

  const risks = [
    {
      id: 'RSK-INT-001',
      title: 'Al-Shabaab Infiltration of Programs',
      description: 'Risk of AS members posing as beneficiaries or local staff to access resources and intelligence on UN operations',
      category: 'Security',
      location: 'Lower Shabelle',
      district: 'Afgooye',
      causeEffects: 'Weak vetting procedures, limited community verification mechanisms. Effects include compromised program integrity, security threats to staff.',
      riskLevel: 'CRITICAL',
      status: 'Active',
      likelihood: '4',
      impact: '5',
      inherentRisk: 20,
      mitigationStatus: 'Available',
      owner: 'Security & Risk Management',
      mitigationActions: 'Enhanced vetting procedures, biometric registration, and community verification mechanisms'
    },
    {
      id: 'RSK-INT-002',
      title: 'Programme Delivery Delays',
      description: 'Systematic delays in implementing health, nutrition, and WASH activities due to access constraints and bureaucratic bottlenecks',
      category: 'Operational',
      location: 'Bay',
      district: 'Baidoa',
      causeEffects: 'Access constraints, bureaucratic approval delays, coordination gaps. Effects include unmet humanitarian needs, donor dissatisfaction.',
      riskLevel: 'HIGH',
      status: 'Escalating',
      likelihood: '5',
      impact: '4',
      inherentRisk: 20,
      mitigationStatus: 'Available',
      owner: 'Programme Management',
      mitigationActions: 'Fast-track approval processes, pre-position supplies, strengthen coordination with local authorities'
    },
    {
      id: 'RSK-INT-003',
      title: 'Donor Reporting Non-Compliance',
      description: 'Risk of failing to meet donor reporting requirements due to limited M&E capacity and data collection challenges in hard-to-reach areas',
      category: 'Compliance',
      location: 'Nationwide',
      district: 'All Districts',
      causeEffects: 'Limited M&E capacity, data collection challenges, access restrictions. Effects include funding cuts, reputational damage.',
      riskLevel: 'HIGH',
      status: 'Active',
      likelihood: '3',
      impact: '5',
      inherentRisk: 15,
      mitigationStatus: 'Available',
      owner: 'Programme Quality & Compliance',
      mitigationActions: 'Strengthen M&E systems, invest in remote monitoring tools, dedicated donor liaison officers'
    },
    {
      id: 'RSK-INT-004',
      title: 'Staff Duty of Care Gaps',
      description: 'Insufficient medical evacuation capacity, mental health support, and R&R provisions for staff in high-stress environments',
      category: 'Human Resources',
      location: 'Nationwide',
      district: 'All Districts',
      causeEffects: 'Limited MEDEVAC capacity, inadequate mental health resources, high-stress operating environment. Effects include staff burnout, turnover.',
      riskLevel: 'HIGH',
      status: 'Active',
      likelihood: '4',
      impact: '4',
      inherentRisk: 16,
      mitigationStatus: 'Available',
      owner: 'HR & Staff Welfare',
      mitigationActions: 'Expand MEDEVAC contracts, mobile counseling services, enhanced R&R policies'
    },
    {
      id: 'RSK-INT-005',
      title: 'Partner NGO Capacity Constraints',
      description: 'Implementing partners lack technical capacity, financial management systems, and field presence to deliver quality programming',
      category: 'Partnership',
      location: 'Jubaland',
      district: 'Kismayo',
      causeEffects: 'Weak technical capacity, limited financial systems, inadequate field presence. Effects include poor program quality, implementation delays.',
      riskLevel: 'MEDIUM',
      status: 'Active',
      likelihood: '4',
      impact: '3',
      inherentRisk: 12,
      mitigationStatus: 'Available',
      owner: 'Partnership & Programme Support',
      mitigationActions: 'Partner capacity assessments, technical assistance, financial spot checks, joint monitoring'
    },
    {
      id: 'RSK-INT-006',
      title: 'Fraud and Diversion of Assistance',
      description: 'Risk of aid diversion through fraudulent beneficiary lists, ghost workers, and collusion between staff and suppliers',
      category: 'Compliance',
      location: 'Nationwide',
      district: 'All Districts',
      causeEffects: 'Weak controls, collusion between staff and suppliers, limited oversight in remote areas. Effects include resource loss, reputational damage.',
      riskLevel: 'HIGH',
      status: 'Active',
      likelihood: '4',
      impact: '4',
      inherentRisk: 16,
      mitigationStatus: 'Available',
      owner: 'Internal Oversight & Audit',
      mitigationActions: 'Biometric registration, third-party monitoring, hotlines, surprise audits'
    },
    {
      id: 'RSK-INT-007',
      title: 'Procurement Bottlenecks',
      description: 'Lengthy procurement processes delaying critical supplies including emergency shelter, health commodities, and fuel',
      category: 'Operational',
      location: 'Banadir',
      district: 'Mogadishu',
      causeEffects: 'Complex approval processes, limited supplier base, customs delays. Effects include program delays, increased costs.',
      riskLevel: 'MEDIUM',
      status: 'Stable',
      likelihood: '4',
      impact: '3',
      inherentRisk: 12,
      mitigationStatus: 'Available',
      owner: 'Procurement & Supply Chain',
      mitigationActions: 'Fast-track emergency procedures, long-term agreements with suppliers, local procurement'
    },
    {
      id: 'RSK-INT-008',
      title: 'Gender-Based Violence in Programming',
      description: 'Risk of GBV incidents linked to aid distribution including sexual exploitation, harassment at distribution points, and domestic violence',
      category: 'Protection',
      location: 'Nationwide',
      district: 'All Districts',
      causeEffects: 'Unsafe distribution sites, power imbalances, lack of female staff. Effects include harm to beneficiaries, program disruption.',
      riskLevel: 'CRITICAL',
      status: 'Active',
      likelihood: '3',
      impact: '5',
      inherentRisk: 15,
      mitigationStatus: 'Available',
      owner: 'Protection Cluster',
      mitigationActions: 'Safe distribution spaces, female staff presence, GBV referral pathways, community awareness'
    },
    {
      id: 'RSK-INT-009',
      title: 'Cash-Based Assistance Diversion',
      description: 'Mobile money agents charging excessive fees, forced sharing of PIN codes, and interception of cash transfers by gatekeepers',
      category: 'Operational',
      location: 'Bay',
      district: 'Baidoa',
      causeEffects: 'Weak agent oversight, gatekeeper influence, limited alternative payment methods. Effects include reduced beneficiary value, loss of trust.',
      riskLevel: 'HIGH',
      status: 'Active',
      likelihood: '3',
      impact: '4',
      inherentRisk: 12,
      mitigationStatus: 'Available',
      owner: 'Cash Working Group',
      mitigationActions: 'Retailer agreements, post-distribution monitoring, alternative payment mechanisms'
    },
    {
      id: 'RSK-INT-010',
      title: 'Telecommunications Failure',
      description: 'Unreliable internet and mobile networks disrupting communications, data transmission, and coordination during emergencies',
      category: 'Technology',
      location: 'Lower Juba',
      district: 'Afmadow',
      causeEffects: 'Unstable network infrastructure, limited backup systems, remote locations. Effects include coordination gaps, delayed response.',
      riskLevel: 'MEDIUM',
      status: 'Active',
      likelihood: '4',
      impact: '3',
      inherentRisk: 12,
      mitigationStatus: 'Available',
      owner: 'ICT & Emergency Telecoms',
      mitigationActions: 'Satellite communication backup, offline data systems, radio networks'
    }
  ];

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
        return { dot: 'bg-destructive', text: 'text-destructive-text' };
      case 'Active':
        return { dot: 'bg-warning-strong', text: 'text-muted-foreground' };
      case 'Stable':
        return { dot: 'bg-text-subtle', text: 'text-muted-foreground' };
      case 'Closed':
        return { dot: 'bg-success', text: 'text-success' };
      default:
        return { dot: 'bg-text-subtle', text: 'text-muted-foreground' };
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

  const handleEdit = (risk: any) => {
    setEditingRisk(risk.id);
    setFormData({
      title: risk.title,
      description: risk.description,
      region: risk.location,
      district: risk.district,
      category: risk.category,
      likelihood: risk.likelihood,
      impact: risk.impact,
      owner: risk.owner,
      mitigationActions: risk.mitigationActions,
      status: risk.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (riskId: string) => {
    setRiskToDelete(riskId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    const targetRisk = riskToDelete;
    toast.promise(
      Promise.resolve().then(() => {
        console.log('Deleting risk:', targetRisk);
        setIsDeleteModalOpen(false);
        setRiskToDelete(null);
      }),
      {
        loading: 'Deleting risk...',
        success: 'Risk deleted successfully.',
        error: 'We could not delete this risk. Please try again.',
      }
    );
  };

  const handleModalClose = () => {
    // Show success toast if we just completed an import
    if (uploadStep === 'complete' && extractedCount > 0) {
      toast.success(`Successfully imported ${extractedCount} risks to register`);
    }
    setIsModalOpen(false);
    setEditingRisk(null);
    setUploadStep('upload');
    setUploadedFile(null);
    setProcessingStage(0);
    setExtractedCount(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText size={20} className="text-destructive-text" />;
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return <FileText size={20} className="text-success" />;
    if (ext === 'docx' || ext === 'doc') return <FileText size={20} className="text-primary" />;
    return <FileText size={20} className="text-muted-foreground" />;
  };

  const handleFileSelect = (file: File) => {
    const sizeStr = formatFileSize(file.size);
    setUploadedFile({ name: file.name, size: sizeStr, type: file.type });
  };

  const handleExtractRisks = () => {
    if (!uploadedFile) return;
    
    setUploadStep('processing');
    
    // Simulate processing stages
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setProcessingStage(stage);
      if (stage >= processingStages.length) {
        clearInterval(interval);
        setTimeout(() => {
          setExtractedCount(7);
          setUploadStep('complete');
        }, 500);
      }
    }, 800);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Close action menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
    }
    if (openActionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionMenu]);

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

  // Filter risks
  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.mitigationStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.inherentRisk.toString().includes(searchQuery.toLowerCase()) ||
                         (residualRankings[risk.id] || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === 'all' || risk.location === locationFilter;
    const matchesCategory = categoryFilter === 'all' || risk.category === categoryFilter;
    const matchesRiskLevel = riskLevelFilter === 'all' || risk.riskLevel === riskLevelFilter;
    
    return matchesSearch && matchesLocation && matchesCategory && matchesRiskLevel;
  });

  const totalPages = Math.ceil(filteredRisks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRisks = filteredRisks.slice(startIndex, startIndex + itemsPerPage);
  const { visibleItems: visiblePaginatedRisks, isProgressivelyLoading } = useProgressiveList(paginatedRisks, {
    minLoadingMs: 200,
    transitionKey: `${currentPage}-${itemsPerPage}`,
  });
  const showingStart = filteredRisks.length > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(startIndex + itemsPerPage, filteredRisks.length);

  // Generate smart page numbers for pagination - Max 3 pages at a time
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
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
    'RSK-INT-004': [
      { id: 'ai-9', text: 'Negotiate standing medical evacuation agreements with private air ambulance services', rationale: 'Pre-arranged medevac capacity ensures rapid response during medical emergencies' },
      { id: 'ai-10', text: 'Deploy embedded psychosocial support counselors with confidential tele-therapy options', rationale: 'On-site and remote mental health services reduce stigma and increase access to care' },
    ],
    'RSK-INT-005': [
      { id: 'ai-11', text: 'Establish dedicated partner capacity-building unit with mentorship and technical support', rationale: 'Systematic capacity development improves partner performance over time' },
      { id: 'ai-12', text: 'Implement tiered partnership model matching partner capacity to programme complexity', rationale: 'Risk-based partnership approach ensures appropriate oversight and support levels' },
    ],
    'RSK-INT-006': [
      { id: 'ai-5', text: 'Deploy blockchain-based supply chain tracking for high-value commodities', rationale: 'Immutable transaction records create audit trails difficult to manipulate' },
      { id: 'ai-6', text: 'Establish anonymous fraud reporting channels with whistleblower protection', rationale: 'Staff and community members can report concerns without fear of retaliation' },
    ],
    'RSK-INT-007': [
      { id: 'ai-13', text: 'Establish long-term agreements with pre-qualified suppliers for common commodities', rationale: 'Framework agreements reduce procurement time for recurring needs' },
      { id: 'ai-14', text: 'Create emergency procurement authority delegation to field offices under defined thresholds', rationale: 'Decentralized procurement authority speeds up response for urgent needs' },
    ],
    'RSK-INT-008': [
      { id: 'ai-15', text: 'Deploy women-only distribution teams at registration and collection points', rationale: 'Gender-segregated service delivery reduces harassment and exploitation risks' },
      { id: 'ai-16', text: 'Establish community-based GBV reporting mechanisms with survivor-centered referral pathways', rationale: 'Accessible reporting and support systems enable timely intervention' },
    ],
    'RSK-INT-009': [
      { id: 'ai-17', text: 'Negotiate fixed service charge agreements with mobile money providers capping transaction fees', rationale: 'Regulated fees protect beneficiaries from exploitation by service providers' },
      { id: 'ai-18', text: 'Implement biometric authentication for cash withdrawal eliminating PIN code vulnerabilities', rationale: 'Biometric verification prevents forced sharing and unauthorized access' },
    ],
    'RSK-INT-010': [
      { id: 'ai-19', text: 'Deploy satellite communication terminals at all field locations as backup connectivity', rationale: 'Redundant communication channels ensure continuity during network outages' },
      { id: 'ai-20', text: 'Establish offline-capable crisis management protocols with scheduled radio check-ins', rationale: 'Offline procedures maintain coordination capacity during telecommunications failures' },
    ],
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="bg-background border-b border-sidebar-border px-4 sm:px-8 pt-6 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Internal Risks</h2>
              <p className="text-sm sm:text-sm text-muted-foreground">Operational risk register for Somalia humanitarian operations</p>
            </div>
            <div className="flex items-center gap-3">
              
              <button 
                onClick={() => { setEditingRisk(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
              >
                <Upload size={16} />
                Upload risk register
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-8 pt-[8px] pb-[24px]">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                type="text"
                placeholder="Search internal risks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Location Filter */}
            <div className="w-full lg:w-[200px]">
              <CustomDropdown
                value={locationFilter}
                onChange={setLocationFilter}
                options={[
                  { value: 'all', label: 'All Locations' },
                  { value: 'Banadir', label: 'Banadir' },
                  { value: 'Lower Shabelle', label: 'Lower Shabelle' },
                  { value: 'Bay', label: 'Bay' },
                  { value: 'Jubaland', label: 'Jubaland' },
                  { value: 'Lower Juba', label: 'Lower Juba' },
                  { value: 'Nationwide', label: 'Nationwide' }
                ]}
                placeholder="All Locations"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-[200px]">
              <CustomDropdown
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'Security', label: 'Security' },
                  { value: 'Operational', label: 'Operational' },
                  { value: 'Compliance', label: 'Compliance' },
                  { value: 'Human Resources', label: 'Human Resources' },
                  { value: 'Partnership', label: 'Partnership' },
                  { value: 'Protection', label: 'Protection' },
                  { value: 'Technology', label: 'Technology' }
                ]}
                placeholder="All Categories"
              />
            </div>

            {/* Risk Level Filter */}
            <div className="w-full lg:w-[160px]">
              <CustomDropdown
                value={riskLevelFilter}
                onChange={setRiskLevelFilter}
                options={[
                  { value: 'all', label: 'All Levels' },
                  { value: 'CRITICAL', label: 'Critical' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'LOW', label: 'Low' }
                ]}
                placeholder="All Levels"
              />
            </div>
          </div>
        </div>

        {/* Table - Desktop View */}
        <div className="hidden lg:block px-4 sm:px-8 pb-8">
          <div className="bg-card rounded-2xl overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Description</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Category</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inherent Risk</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mitigation</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Residual Risk</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Owner</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isProgressivelyLoading ? (
                  <TableSkeleton rows={itemsPerPage} columns={7} />
                ) : (
                  visiblePaginatedRisks.map((risk) => (
                  <tr 
                    key={risk.id} 
                    className="hover:bg-sidebar transition-colors cursor-pointer"
                    onClick={() => setSelectedRisk(risk)}
                  >
                    {/* Risk Description */}
                    <td className="px-6 py-5">
                      <p className="text-sm text-foreground line-clamp-2">
                        {risk.description}
                      </p>
                    </td>

                    {/* Risk Category */}
                    <td className="px-6 py-5">
                      <span className="text-sm text-foreground">{risk.category}</span>
                    </td>

                    {/* Inherent Risk Ranking */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-sm font-semibold ${getRiskScoreColor(risk.inherentRisk).bg} ${getRiskScoreColor(risk.inherentRisk).text}`}>
                        {risk.inherentRisk}
                      </span>
                    </td>

                    {/* Mitigation */}
                    <td className="px-6 py-5">
                      <span className={`text-sm font-medium ${risk.mitigationStatus === 'Available' ? 'text-success' : 'text-text-subtle'}`}>
                        {risk.mitigationStatus}
                      </span>
                    </td>

                    {/* Residual Risk Ranking */}
                    <td className="px-6 py-5">
                      {residualRankings[risk.id] && residualRankings[risk.id] !== '—' ? (
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-sm font-semibold ${getRiskScoreColor(residualRankings[risk.id]).bg} ${getRiskScoreColor(residualRankings[risk.id]).text}`}>
                          {residualRankings[risk.id]}
                        </span>
                      ) : (
                        <span className="text-sm text-text-subtle">—</span>
                      )}
                    </td>

                    {/* Risk Owner */}
                    <td className="px-6 py-5">
                      <span className="text-sm text-foreground">{risk.owner}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenu(openActionMenu === risk.id ? null : risk.id);
                        }}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} className="text-muted-foreground" />
                      </button>

                      {/* Action Menu Dropdown */}
                      {openActionMenu === risk.id && (
                        <div ref={actionMenuRef} className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-50 min-w-[160px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRisk(risk);
                              setOpenActionMenu(null);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-secondary-foreground hover:bg-muted transition-colors first:rounded-t-xl flex items-center gap-2"
                          >
                            <Eye size={14} />
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(risk);
                              setOpenActionMenu(null);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-secondary-foreground hover:bg-muted transition-colors flex items-center gap-2"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(risk.id);
                              setOpenActionMenu(null);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-destructive-text hover:bg-destructive-subtle transition-colors last:rounded-b-xl flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
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
                        currentPage === page
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
            <TableSkeleton variant="grid" rows={itemsPerPage} columns={5} />
          ) : (
            visiblePaginatedRisks.map((risk) => (
            <div
              key={risk.id}
              onClick={() => setSelectedRisk(risk)}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer"
            >
              {/* Risk ID and Level */}
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{risk.id}</p>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getRiskLevelColor(risk.riskLevel)}`}>
                  {risk.riskLevel}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-medium text-foreground mb-3 leading-tight">
                {risk.title}
              </h3>

              {/* Meta Information */}
              <div className="space-y-2">
                {/* Category */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-subtle font-medium w-28">Category</span>
                  <span className="text-sm text-muted-foreground font-medium">{risk.category}</span>
                </div>

                {/* Inherent Risk */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-subtle font-medium w-28">Inherent Risk</span>
                  <span className="text-sm text-foreground font-medium">{risk.inherentRisk}</span>
                </div>

                {/* Mitigation */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-subtle font-medium w-28">Mitigation</span>
                  <span className={`text-sm font-medium ${risk.mitigationStatus === 'Available' ? 'text-success' : 'text-text-subtle'}`}>
                    {risk.mitigationStatus}
                  </span>
                </div>

                {/* Residual Risk */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-subtle font-medium w-28">Residual Risk</span>
                  <span className="text-sm text-foreground font-medium">{residualRankings[risk.id] || '—'}</span>
                </div>

                {/* Owner */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-subtle font-medium w-28">Owner</span>
                  <span className="text-sm text-muted-foreground">{risk.owner}</span>
                </div>
              </div>
            </div>
            ))
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
              Showing {showingStart}-{showingEnd} of {filteredRisks.length} risks
            </p>
          </div>
          )}
        </div>
        </div>
      </div>

      {/* Side Drawer - Risk Details */}
      {selectedRisk && (
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
              <h2 className="text-base font-semibold text-foreground">
                Risk Details
              </h2>
              <button 
                onClick={() => { setSelectedRisk(null); setDrawerStatusOpen(false); setIsEditingResidual(false); setTempResidualValue(''); }}
                className="p-2 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Description</h3>
              <p className="text-sm text-secondary-foreground leading-relaxed">
                {selectedRisk.description}
              </p>
            </div>

            {/* Risk Cause/Effects */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Risk Cause/Effects</h3>
              <p className="text-sm text-secondary-foreground leading-relaxed">
                {selectedRisk.causeEffects}
              </p>
            </div>

            {/* Inherent Risk Ranking */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Inherent Risk Ranking</h3>
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

            {/* Controls/Mitigation Measures - Baseline */}
            

            {/* Residual Risk Ranking */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Residual Risk Ranking</h3>
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
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Risk Owner</h3>
              <p className="text-sm font-medium text-secondary-foreground">
                {selectedRisk.owner}
              </p>
            </div>
            

            {/* Mitigation Measures */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">MITIGATION MEASURES</h3>
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
                    {/* AI header banner */}
                    

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
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Notes</h3>
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
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400]">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Risk</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this risk? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-destructive text-white rounded-xl text-sm font-semibold hover:bg-destructive-text transition-colors"
              >
                Delete Risk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Risk Modal (Upload or Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1400] p-4">
          <div className="bg-card rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {uploadStep === 'upload' ? 'Import Risks from Document' : uploadStep === 'processing' ? 'Processing Document' : 'Import Complete'}
              </h3>
              <button onClick={handleModalClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Upload Step */}
              {uploadStep === 'upload' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-6">Upload a risk register and our AI will automatically extract and structure risk entries for your register.</p>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                      isDragging ? 'border-primary bg-primary-subtle' : 'border-border-muted bg-muted'
                    }`}
                  >
                    <Upload size={48} className="text-border-muted mx-auto mb-4" />
                    <p className="text-base font-semibold text-foreground mb-2">
                      Drop your file here, or <button onClick={() => fileInputRef.current?.click()} className="text-primary hover:underline">browse</button>
                    </p>
                    <p className="text-sm text-text-subtle">
                      Supports PDF, Word, Excel files up to 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Show selected file if uploaded */}
                  {uploadedFile && (
                    <div className="mt-4 flex items-center gap-4 p-4 bg-muted rounded-xl border border-border">
                      {getFileIcon(uploadedFile.name)}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{uploadedFile.name}</p>
                        <p className="text-xs text-text-subtle">{uploadedFile.size}</p>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="p-2 hover:bg-card rounded-lg transition-colors"
                      >
                        <X size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                  )}

                  {/* Extract Risks Button */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <button
                      onClick={handleExtractRisks}
                      disabled={!uploadedFile}
                      className={`w-full px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        uploadedFile
                          ? 'bg-primary text-white hover:bg-primary-hover'
                          : 'bg-muted text-text-subtle cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles size={16} />
                        Extract Risks
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Processing Step */}
              {uploadStep === 'processing' && uploadedFile && (
                <div>
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-xl mb-6">
                    {getFileIcon(uploadedFile.name)}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{uploadedFile.name}</p>
                      <p className="text-xs text-text-subtle">{uploadedFile.size}</p>
                    </div>
                    <div className="animate-spin">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {processingStages.map((stage, index) => (
                      <div key={index} className={`flex items-center gap-3 ${index <= processingStage ? 'opacity-100' : 'opacity-30'}`}>
                        {index < processingStage ? (
                          <CheckCircle2 size={20} className="text-success shrink-0" />
                        ) : index === processingStage ? (
                          <div className="w-5 h-5 shrink-0">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-border-muted rounded-full shrink-0" />
                        )}
                        <span className="text-sm text-secondary-foreground">{stage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete Step */}
              {uploadStep === 'complete' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-success-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-success" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">Import Successful!</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Extracted {extractedCount} risks from the document. Review and edit entries below.
                  </p>
                  <button
                    onClick={handleModalClose}
                    className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
                  >
                    View Risks
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
