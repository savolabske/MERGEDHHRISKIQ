export type ReportTypeId = 'aid-flow' | 'migration-displacement' | 'somalia-joint-fund';

export interface AdminDocumentFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  uploadFileProgress?: number;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  processingProgress?: number;
  uploadedBy?: string;
}

export interface AdminDocumentGroup {
  id: string;
  title: string;
  description: string;
  webLinks?: string[];
  tags?: string[];
  userGroup: string;
  files: AdminDocumentFile[];
  uploadStatus: 'uploading' | 'uploaded' | 'failed';
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  uploadProgress: number;
  dateAdded: string;
  addedBy: string;
  lastModified: string;
  kind?: 'standard' | 'report_hub';
  reportTypeId?: ReportTypeId;
  availabilityTarget?: 'map' | 'reports';
  reportTypes?: string[];
  managedReportId?: string;
}

export const mockDocuments: AdminDocumentGroup[] = [
  {
    id: 'demo-upload-3-of-5',
    title: 'Humanitarian Access Incident Tracker Q1 2026',
    description:
      'Incident logging, checkpoints, movement restrictions, and supporting DTM and field annexes for Q1 humanitarian access.',
    tags: ['access', 'incidents', 'dtm'],
    userGroup: 'Program Staff',
    files: [
      {
        id: 'demo.1',
        name: 'Access_Incidents_Summary_Q1.pdf',
        size: '2.1 MB',
        uploadedAt: 'May 2, 2026',
        uploadedBy: 'Amina Hassan',
        uploadFileProgress: 100,
        processingStatus: 'pending',
        processingProgress: 0,
      },
      {
        id: 'demo.2',
        name: 'Checkpoint_Log.xlsx',
        size: '640 KB',
        uploadedAt: 'May 2, 2026',
        uploadedBy: 'Amina Hassan',
        uploadFileProgress: 100,
        processingStatus: 'pending',
        processingProgress: 0,
      },
      {
        id: 'demo.3',
        name: 'Movement_Restrictions_Annex.pdf',
        size: '1.4 MB',
        uploadedAt: 'May 2, 2026',
        uploadedBy: 'Amina Hassan',
        uploadFileProgress: 100,
        processingStatus: 'pending',
        processingProgress: 0,
      },
      {
        id: 'demo.4',
        name: 'DTM_Flow_Monitoring.csv',
        size: '320 KB',
        uploadedAt: 'May 2, 2026',
        uploadedBy: 'Amina Hassan',
        uploadFileProgress: 0,
        processingStatus: 'pending',
        processingProgress: 0,
      },
      {
        id: 'demo.5',
        name: 'Field_Photos_Archive.zip',
        size: '18.2 MB',
        uploadedAt: 'May 2, 2026',
        uploadedBy: 'Amina Hassan',
        uploadFileProgress: 0,
        processingStatus: 'pending',
        processingProgress: 0,
      },
    ],
    uploadStatus: 'uploading',
    processingStatus: 'pending',
    uploadProgress: 60,
    dateAdded: 'May 2, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'May 2, 2026',
    availabilityTarget: 'map',
  },
  {
    id: '1',
    title: 'OCHA Somalia Risk Assessment 2026',
    description: 'Comprehensive risk analysis covering security threats, access constraints, humanitarian needs, and operational challenges across Somalia including Al-Shabaab activities and IDP displacement patterns',
    tags: ['risk', 'ocha', 'somalia'],
    userGroup: 'All Staff',
    files: Array.from({ length: 30 }, (_, index) => {
      const fileNumber = String(index + 1).padStart(2, '0');
      const extension = index % 4 === 0 ? 'xlsx' : index % 5 === 0 ? 'docx' : 'pdf';
      const size = `${(0.8 + index * 0.3).toFixed(1)} MB`;
      const uploadedAt = `Feb ${String(index + 1).padStart(2, '0')}, 2026`;
      const roster = ['Brian Osei', 'Amina Hassan', 'Sarah Chen', 'Mohamed Ali', 'Kwame Ntumi'];
      const by = roster[index % roster.length];
      const sampleProgress = [29, 21, 44, 67, 38, 55, 71, 19, 82, 34];
      let processingStatus: DocumentFileProcessingStatus = 'completed';
      let processingProgress = 100;
      if (index === 2) {
        processingStatus = 'pending';
        processingProgress = 0;
      } else if (index === 4) {
        processingStatus = 'failed';
      } else if (index % 2 === 1) {
        processingStatus = 'processing';
        processingProgress = sampleProgress[index % sampleProgress.length];
      }
      return {
        id: `1.${index + 1}`,
        name: `Somalia_Economic_Outlook_2024_${fileNumber}.${extension}`,
        size,
        uploadedAt,
        uploadedBy: by,
        processingStatus,
        processingProgress,
      };
    }),
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 15, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'Mar 15, 2026',
    availabilityTarget: 'map',
  },
  {
    id: '2',
    title: 'Displacement, arrivals, and access evidence',
    description: 'DTM tracking, arrival and return figures, drought displacement briefs, and access incident logs used to build the migration report.',
    tags: ['access', 'incidents', 'dtm'],
    userGroup: 'Program Staff',
    files: [
      { id: '2.1', name: 'IOM DTM Emergency Trends Tracking, week of 1 Mar 2026', size: '1.8 MB', uploadedAt: 'Mar 03, 2026' },
      { id: '2.2', name: 'IOM DTM flow monitoring, Bay and Bakool', size: '640 KB', uploadedAt: 'Mar 02, 2026' },
      { id: '2.3', name: 'UNHCR population movement snapshot, 2023–2026', size: '2.4 MB', uploadedAt: 'Feb 26, 2026' },
      { id: '2.4', name: 'CCCM cluster, Bay IDP site master list', size: '1.1 MB', uploadedAt: 'Mar 04, 2026' },
      { id: '2.5', name: 'FSNAU drought-driven displacement brief, March 2026', size: '3.2 MB', uploadedAt: 'Mar 06, 2026' },
      { id: '2.6', name: 'UNICEF children on the move in Somalia', size: '890 KB', uploadedAt: 'Feb 18, 2026' },
      { id: '2.7', name: 'WFP food assistance gap analysis, Bay region', size: '1.6 MB', uploadedAt: 'Mar 08, 2026' },
      { id: '2.8', name: 'OCHA humanitarian access snapshot, South Central', size: '2.1 MB', uploadedAt: 'Mar 01, 2026' },
      { id: '2.9', name: 'NRC eviction and secondary displacement, Mogadishu', size: '1.4 MB', uploadedAt: 'Feb 12, 2026' },
      { id: '2.10', name: 'UNHCR PRMN cross-border movements, Kenya and Ethiopia', size: '980 KB', uploadedAt: 'Feb 20, 2026' },
      { id: '2.11', name: 'IOM ETT new arrivals, Baidoa weekly', size: '760 KB', uploadedAt: 'Mar 09, 2026' },
      { id: '2.12', name: 'Protection cluster risks in IDP sites, Q1 2026', size: '1.2 MB', uploadedAt: 'Feb 28, 2026' },
      { id: '2.13', name: 'REACH multi-sector needs assessment, Bay', size: '4.6 MB', uploadedAt: 'Jan 22, 2026' },
      { id: '2.14', name: 'OCHA access incident log, Q1 2026', size: '540 KB', uploadedAt: 'Mar 11, 2026' },
      { id: '2.15', name: 'DRC checkpoint restrictions, Lower Shabelle', size: '1.9 MB', uploadedAt: 'Feb 07, 2026' },
      { id: '2.16', name: 'FAO livestock loss and pastoral movement', size: '1.3 MB', uploadedAt: 'Jan 30, 2026' },
      { id: '2.17', name: 'WHO health facility access constraints', size: '720 KB', uploadedAt: 'Feb 14, 2026' },
      { id: '2.18', name: 'Shelter cluster NFI pipeline against new arrivals', size: '860 KB', uploadedAt: 'Mar 05, 2026' },
      { id: '2.19', name: 'UNDP durable solutions note, Bay region', size: '2.2 MB', uploadedAt: 'Jan 16, 2026' },
      { id: '2.20', name: 'Save the Children arrival screening, Baidoa', size: '1.5 MB', uploadedAt: 'Mar 07, 2026' },
      { id: '2.21', name: 'OCHA drought alert, Hirshabelle, March 2026', size: '640 KB', uploadedAt: 'Mar 10, 2026' },
      { id: '2.22', name: 'IOM DTM baseline assessment, round 3', size: '3.8 MB', uploadedAt: 'Dec 18, 2025' },
      { id: '2.23', name: 'UNFPA population estimates for IDP settlements', size: '1.1 MB', uploadedAt: 'Jan 09, 2026' },
      { id: '2.24', name: 'Logistics cluster convoy access report, February 2026', size: '2.0 MB', uploadedAt: 'Feb 24, 2026' },
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 12, 2026',
    addedBy: 'Mohamed Ali',
    lastModified: 'Mar 12, 2026',
  },
  {
    id: '3',
    title: 'Somalia Joint Fund portfolio and results',
    description: 'Donor pledges, thematic window allocations, UN entity delivery, and H1 2025 results for the Somalia Joint Fund.',
    tags: ['sjf', 'donors', 'results'],
    userGroup: 'All Staff',
    files: [
      { id: '3.1', name: 'Somalia Joint Fund annual report 2025', size: '4.8 MB', uploadedAt: 'Mar 10, 2026' },
      { id: '3.2', name: 'SJF donor contributions and pledges, H1 2025', size: '1.3 MB', uploadedAt: 'Jul 18, 2025' },
      { id: '3.3', name: 'Thematic window allocation: reconciliation, economic, social', size: '890 KB', uploadedAt: 'Aug 02, 2025' },
      { id: '3.4', name: 'UN entity delivery report, H1 2025', size: '2.6 MB', uploadedAt: 'Jul 30, 2025' },
      { id: '3.5', name: 'Programme results framework 2025', size: '740 KB', uploadedAt: 'Feb 12, 2026' },
      { id: '3.6', name: 'SJF risk and compliance review, Q4 2025', size: '1.7 MB', uploadedAt: 'Jan 21, 2026' },
      { id: '3.7', name: 'Multi-partner trust fund gateway extract', size: '2.2 MB', uploadedAt: 'Mar 04, 2026' },
      { id: '3.8', name: 'H1 2025 results narrative', size: '3.1 MB', uploadedAt: 'Aug 14, 2025' },
      { id: '3.9', name: 'IPC analysis, Bay and Bakool food security window', size: '2.7 MB', uploadedAt: 'Mar 06, 2026' },
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 10, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Mar 10, 2026',
    availabilityTarget: 'map',
  },
  {
    id: '4',
    title: 'OCHA Cluster Coordination Meeting Notes',
    description: 'Inter-cluster coordination meeting documentation covering protection, WASH, food security, and health sector updates with action items and resource allocation decisions',
    tags: ['meetingnotes', 'coordination', 'clusters'],
    userGroup: 'Program Staff',
    files: [
      {
        id: '4.1',
        name: 'Cluster_Meeting_Minutes_Mar2026.pdf',
        size: '892 KB',
        uploadedAt: 'Mar 8, 2026',
        uploadedBy: 'James Wilson',
      },
      {
        id: '4.2',
        name: 'Action_Items_Tracker.xlsx',
        size: '456 KB',
        uploadedAt: 'Mar 8, 2026',
        uploadedBy: 'James Wilson',
      },
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 8, 2026',
    addedBy: 'James Wilson',
    lastModified: 'Mar 8, 2026',
  },
  {
    id: '5',
    title: 'Aid Flow Intelligence',
    description: 'Central knowledge source for Aid Flow Intelligence — donor contributions, sector allocation, and spending delivery across regions.',
    tags: ['aid-flow', 'donors', 'finance'],
    userGroup: 'Security Team',
    kind: 'report_hub',
    reportTypeId: 'aid-flow',
    files: [
      { id: '5.1', name: 'OCHA FTS donor contributions, Somalia 2023–2026', size: '2.8 MB', uploadedAt: 'Mar 05, 2026' },
      { id: '5.2', name: 'HRP 2026 sector allocation workbook', size: '1.9 MB', uploadedAt: 'Mar 04, 2026' },
      { id: '5.3', name: 'ECHO funding decision, Horn of Africa 2026', size: '1.4 MB', uploadedAt: 'Feb 19, 2026' },
      { id: '5.4', name: 'USAID BHA Somalia obligation report', size: '860 KB', uploadedAt: 'Feb 11, 2026' },
      { id: '5.5', name: 'FCDO Somalia humanitarian spend, FY 2025–26', size: '2.1 MB', uploadedAt: 'Jan 28, 2026' },
      { id: '5.6', name: 'UN pooled funds disbursement ledger, Q1 2026', size: '1.2 MB', uploadedAt: 'Mar 09, 2026' },
      { id: '5.7', name: 'OCHA HRP funding status, March 2026', size: '3.4 MB', uploadedAt: 'Mar 12, 2026' },
      { id: '5.8', name: 'Cluster expenditure against targets', size: '740 KB', uploadedAt: 'Feb 27, 2026' },
      { id: '5.9', name: 'Regional delivery, Bay, Bakool, and Banadir', size: '1.5 MB', uploadedAt: 'Mar 01, 2026' },
      { id: '5.10', name: 'CERF rapid response allocation, drought 2026', size: '980 KB', uploadedAt: 'Feb 06, 2026' },
      { id: '5.11', name: 'World Bank Somalia economic update 2025', size: '4.2 MB', uploadedAt: 'Nov 14, 2025' },
      { id: '5.12', name: 'Somalia Humanitarian Fund advisory board note', size: '620 KB', uploadedAt: 'Mar 08, 2026' },
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 5, 2026',
    addedBy: 'David Kumar',
    lastModified: 'Mar 5, 2026',
    availabilityTarget: 'reports',
    reportTypes: ['Aid Flow Intelligence'],
  },
  {
    id: '6',
    title: 'Drought Impact Assessment Gedo & Hiiraan',
    description: 'Multi-sector drought impact assessment covering agricultural losses, livestock mortality, water scarcity, and displacement projections with emergency response recommendations',
    tags: ['drought', 'gedo', 'hiiraan'],
    userGroup: 'All Staff',
    files: [
      {
        id: '6.1',
        name: 'Drought_Assessment_Gedo_Hiiraan.pdf',
        size: '3.8 MB',
        uploadedAt: 'Mar 3, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Mar 3, 2026',
    addedBy: 'Michael Brown',
    lastModified: 'Mar 3, 2026'
  },
  {
    id: '7',
    title: 'Protection Monitoring Report Lower Shabelle',
    description: 'Human rights violations, gender-based violence incidents, child protection concerns, and forced eviction documentation with protection response recommendations',
    tags: ['protection', 'gbv', 'lowershabelle'],
    userGroup: 'Program Staff',
    files: [
      {
        id: '7.1',
        name: 'Protection_Monitoring_Lower_Shabelle.pdf',
        size: '2.9 MB',
        uploadedAt: 'Feb 28, 2026'
      },
      {
        id: '7.2',
        name: 'GBV_Incident_Data.xlsx',
        size: '1.2 MB',
        uploadedAt: 'Feb 28, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 28, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Feb 28, 2026'
  },
  {
    id: '8',
    title: 'OCHA Humanitarian Needs Overview 2026',
    description: 'Comprehensive overview of humanitarian needs across Somalia including population in need figures, severity analysis, and intersectoral response priorities',
    tags: ['hno', 'humanitarian', 'ocha'],
    userGroup: 'All Staff',
    files: [
      {
        id: '8.1',
        name: 'HNO_Somalia_2026.pdf',
        size: '5.2 MB',
        uploadedAt: 'Feb 25, 2026'
      },
      {
        id: '8.2',
        name: 'Population_Figures_Analysis.xlsx',
        size: '978 KB',
        uploadedAt: 'Feb 25, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 25, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'Feb 25, 2026'
  },
  {
    id: '9',
    title: 'Cholera Outbreak Response Plan Banadir',
    description: 'Emergency disease outbreak response protocol including treatment center locations, WASH interventions, vaccination campaigns, and coordination mechanisms',
    tags: ['health', 'cholera', 'banadir'],
    userGroup: 'Program Staff',
    files: [
      {
        id: '9.1',
        name: 'Cholera_Response_Plan_Banadir.pdf',
        size: '2.1 MB',
        uploadedAt: 'Feb 23, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'pending',
    uploadProgress: 100,
    dateAdded: 'Feb 23, 2026',
    addedBy: 'Emily Rodriguez',
    lastModified: 'Feb 23, 2026'
  },
  {
    id: '10',
    title: 'IDP Camp Coordination Afgooye Corridor',
    description: 'Camp management coordination documentation covering site planning, service delivery, protection concerns, and interagency coordination for IDP settlements along Afgooye corridor',
    userGroup: 'Program Staff',
    files: [
      {
        id: '10.1',
        name: 'IDP_Camp_Coordination_Report.pdf',
        size: '3.4 MB',
        uploadedAt: 'Feb 20, 2026'
      },
      {
        id: '10.2',
        name: 'Camp_Service_Mapping.xlsx',
        size: '1.5 MB',
        uploadedAt: 'Feb 20, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 20, 2026',
    addedBy: 'David Kumar',
    lastModified: 'Feb 20, 2026'
  },
  {
    id: '11',
    title: 'Supply Chain Logistics Risk Analysis',
    description: 'Port access analysis, road insecurity mapping, checkpoint negotiations, and alternative logistics routes for humanitarian supply chain operations in Somalia',
    userGroup: 'Logistics Team',
    files: [
      {
        id: '11.1',
        name: 'Supply_Chain_Risk_Analysis.pdf',
        size: '2.8 MB',
        uploadedAt: 'Feb 18, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 18, 2026',
    addedBy: 'Michael Brown',
    lastModified: 'Feb 18, 2026'
  },
  {
    id: '12',
    title: 'Education in Emergency Assessment Galkayo',
    description: 'School infrastructure damage, teacher availability, learning materials needs, and education access barriers for conflict-affected children in Galkayo',
    userGroup: 'Program Staff',
    files: [
      {
        id: '12.1',
        name: 'Education_Assessment_Galkayo.pdf',
        size: '1.9 MB',
        uploadedAt: 'Feb 15, 2026'
      },
      {
        id: '12.2',
        name: 'School_Infrastructure_Data.xlsx',
        size: '687 KB',
        uploadedAt: 'Feb 15, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'failed',
    uploadProgress: 100,
    dateAdded: 'Feb 15, 2026',
    addedBy: 'James Wilson',
    lastModified: 'Feb 15, 2026'
  },
  {
    id: '13',
    title: 'OCHA Humanitarian Bulletin March 2026',
    description: 'Monthly humanitarian bulletin covering situation overview, key developments, funding status, and humanitarian access challenges across Somalia',
    userGroup: 'All Staff',
    files: [
      {
        id: '13.1',
        name: 'OCHA_Bulletin_March_2026.pdf',
        size: '2.3 MB',
        uploadedAt: 'Feb 12, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 12, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Feb 12, 2026'
  },
  {
    id: '14',
    title: 'WASH Sector Coordination Documents',
    description: 'Water, sanitation, and hygiene sector coordination documents including strategic response plan, 4W mapping, and gap analysis for drought-affected regions',
    userGroup: 'WASH Team',
    files: [
      {
        id: '14.1',
        name: 'WASH_Strategy_2026.pdf',
        size: '2.6 MB',
        uploadedAt: 'Feb 10, 2026'
      },
      {
        id: '14.2',
        name: 'WASH_4W_Mapping.xlsx',
        size: '1.3 MB',
        uploadedAt: 'Feb 10, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 10, 2026',
    addedBy: 'Mohamed Ali',
    lastModified: 'Feb 10, 2026'
  },
  {
    id: '15',
    title: 'Community Feedback Accountability Mechanisms',
    description: 'Beneficiary feedback analysis, complaints resolution tracking, and accountability to affected populations framework with community engagement recommendations',
    userGroup: 'All Staff',
    files: [
      {
        id: '15.1',
        name: 'Community_Feedback_Report.pdf',
        size: '1.7 MB',
        uploadedAt: 'Feb 8, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 8, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'Feb 8, 2026'
  },
  {
    id: '16',
    title: 'Al-Shabaab Control Areas Mapping 2026',
    description: 'Territorial control analysis, governance structures, taxation systems, and movement restrictions in Al-Shabaab controlled and contested areas',
    userGroup: 'Security Team',
    files: [
      {
        id: '16.1',
        name: 'Al_Shabaab_Control_Mapping.pdf',
        size: '4.3 MB',
        uploadedAt: 'Feb 5, 2026'
      },
      {
        id: '16.2',
        name: 'Territorial_Control_Map.pdf',
        size: '2.8 MB',
        uploadedAt: 'Feb 5, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 5, 2026',
    addedBy: 'David Kumar',
    lastModified: 'Feb 5, 2026'
  },
  {
    id: '17',
    title: 'Nutrition Cluster 4W Activity Mapping',
    description: 'Who does What Where When mapping for nutrition interventions including therapeutic feeding programs, IYCF counseling, and nutrition surveillance activities',
    userGroup: 'Program Staff',
    files: [
      {
        id: '17.1',
        name: 'Nutrition_4W_Mapping_Q1_2026.xlsx',
        size: '2.1 MB',
        uploadedAt: 'Feb 3, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Feb 3, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Feb 3, 2026'
  },
  {
    id: '18',
    title: 'Baidoa IDP Settlement Profile Assessment',
    description: 'Comprehensive settlement profiling covering demographics, shelter conditions, WASH access, livelihoods, and protection concerns in Baidoa IDP sites',
    userGroup: 'All Staff',
    files: [
      {
        id: '18.1',
        name: 'Baidoa_IDP_Profile_2026.pdf',
        size: '3.6 MB',
        uploadedAt: 'Jan 30, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 30, 2026',
    addedBy: 'Mohamed Ali',
    lastModified: 'Jan 30, 2026'
  },
  {
    id: '19',
    title: 'OCHA Flash Update Flood Response Bay Region',
    description: 'Emergency flash update on riverine flooding impact, affected populations, immediate needs, and response activities in Bay region',
    userGroup: 'All Staff',
    files: [
      {
        id: '19.1',
        name: 'Flash_Update_Bay_Floods.pdf',
        size: '1.4 MB',
        uploadedAt: 'Jan 28, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 28, 2026',
    addedBy: 'Emily Rodriguez',
    lastModified: 'Jan 28, 2026'
  },
  {
    id: '20',
    title: 'Checkpoint Negotiation Protocols South Central',
    description: 'Standard operating procedures for checkpoint negotiations, required documentation, payment protocols, and escalation procedures for South Central Somalia',
    userGroup: 'Logistics Team',
    files: [
      {
        id: '20.1',
        name: 'Checkpoint_Protocols_SC_Somalia.pdf',
        size: '1.9 MB',
        uploadedAt: 'Jan 25, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 25, 2026',
    addedBy: 'James Wilson',
    lastModified: 'Jan 25, 2026'
  },
  {
    id: '21',
    title: 'Mental Health Psychosocial Support Service Mapping',
    description: 'MHPSS service availability, provider capacity, referral pathways, and gaps analysis for conflict and drought-affected populations',
    userGroup: 'Program Staff',
    files: [
      {
        id: '21.1',
        name: 'MHPSS_Service_Mapping_2026.pdf',
        size: '2.5 MB',
        uploadedAt: 'Jan 22, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'processing',
    uploadProgress: 21,
    dateAdded: 'Jan 22, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Jan 22, 2026'
  },
  {
    id: '22',
    title: 'Cross-Border Trade Routes Risk Assessment',
    description: 'Analysis of trade routes between Somalia, Kenya, and Ethiopia including security risks, taxation points, and humanitarian supply implications',
    userGroup: 'Management Only',
    files: [
      {
        id: '22.1',
        name: 'Cross_Border_Trade_Risk_Analysis.pdf',
        size: '3.1 MB',
        uploadedAt: 'Jan 20, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 20, 2026',
    addedBy: 'Michael Brown',
    lastModified: 'Jan 20, 2026'
  },
  {
    id: '23',
    title: 'Child Recruitment Prevention Program Evaluation',
    description: 'Evaluation of child protection interventions targeting prevention of recruitment by armed groups, family reintegration, and livelihood support',
    userGroup: 'Program Staff',
    files: [
      {
        id: '23.1',
        name: 'Child_Protection_Program_Evaluation.pdf',
        size: '2.9 MB',
        uploadedAt: 'Jan 18, 2026'
      },
      {
        id: '23.2',
        name: 'Program_Data_Analysis.xlsx',
        size: '1.4 MB',
        uploadedAt: 'Jan 18, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 18, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'Jan 18, 2026'
  },
  {
    id: '24',
    title: 'Kismayo Port Operations Security Assessment',
    description: 'Port security analysis, access procedures, cargo inspection protocols, and security incident history for humanitarian logistics operations',
    userGroup: 'Logistics Team',
    files: [
      {
        id: '24.1',
        name: 'Kismayo_Port_Security_Assessment.pdf',
        size: '2.7 MB',
        uploadedAt: 'Jan 15, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 15, 2026',
    addedBy: 'David Kumar',
    lastModified: 'Jan 15, 2026'
  },
  {
    id: '25',
    title: 'Livelihood Recovery Program Design Document',
    description: 'Program design for agricultural recovery, livestock restocking, cash for work, and vocational training targeting drought and conflict-affected communities',
    userGroup: 'Program Staff',
    files: [
      {
        id: '25.1',
        name: 'Livelihood_Program_Design.pdf',
        size: '3.8 MB',
        uploadedAt: 'Jan 12, 2026'
      },
      {
        id: '25.2',
        name: 'Budget_Breakdown.xlsx',
        size: '892 KB',
        uploadedAt: 'Jan 12, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 12, 2026',
    addedBy: 'James Wilson',
    lastModified: 'Jan 12, 2026'
  },
  {
    id: '26',
    title: 'Measles Outbreak Vaccination Campaign Report',
    description: 'Campaign coverage analysis, vaccine uptake rates, cold chain management, community mobilization strategies, and lessons learned from measles response',
    userGroup: 'All Staff',
    files: [
      {
        id: '26.1',
        name: 'Measles_Campaign_Report_2026.pdf',
        size: '2.4 MB',
        uploadedAt: 'Jan 10, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 10, 2026',
    addedBy: 'Emily Rodriguez',
    lastModified: 'Jan 10, 2026'
  },
  {
    id: '27',
    title: 'Teacher Training Emergency Education Materials',
    description: 'Training curriculum, teaching materials, and methodologies for educators working in emergency education contexts with conflict-affected children',
    userGroup: 'Program Staff',
    files: [
      {
        id: '27.1',
        name: 'Teacher_Training_Curriculum.pdf',
        size: '4.2 MB',
        uploadedAt: 'Jan 8, 2026'
      },
      {
        id: '27.2',
        name: 'Training_Modules.pdf',
        size: '3.1 MB',
        uploadedAt: 'Jan 8, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'pending',
    uploadProgress: 100,
    dateAdded: 'Jan 8, 2026',
    addedBy: 'Sarah Chen',
    lastModified: 'Jan 8, 2026'
  },
  {
    id: '28',
    title: 'OCHA Humanitarian Response Plan Mid-Year Review',
    description: 'Mid-year progress review of HRP implementation, funding gaps, strategic adjustments, and revised response priorities for second half of 2026',
    userGroup: 'All Staff',
    files: [
      {
        id: '28.1',
        name: 'HRP_Mid_Year_Review_2026.pdf',
        size: '5.1 MB',
        uploadedAt: 'Jan 5, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 5, 2026',
    addedBy: 'Mohamed Ali',
    lastModified: 'Jan 5, 2026'
  },
  {
    id: '29',
    title: 'Forced Eviction Monitoring Legal Framework',
    description: 'Legal analysis of eviction protections, documentation protocols, advocacy strategies, and support services for communities at risk of forced eviction',
    userGroup: 'All Staff',
    files: [
      {
        id: '29.1',
        name: 'Eviction_Monitoring_Framework.pdf',
        size: '2.6 MB',
        uploadedAt: 'Jan 3, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'completed',
    uploadProgress: 100,
    dateAdded: 'Jan 3, 2026',
    addedBy: 'Amina Hassan',
    lastModified: 'Jan 3, 2026'
  },
  {
    id: '30',
    title: 'Remote Area Access Drone Feasibility Study',
    description: 'Technical and operational feasibility study for using drone technology for medical supply delivery, needs assessment, and remote area monitoring',
    userGroup: 'Management Only',
    files: [
      {
        id: '30.1',
        name: 'Drone_Feasibility_Study.pdf',
        size: '3.4 MB',
        uploadedAt: 'Jan 1, 2026'
      },
      {
        id: '30.2',
        name: 'Cost_Benefit_Analysis.xlsx',
        size: '1.1 MB',
        uploadedAt: 'Jan 1, 2026'
      }
    ],
    uploadStatus: 'uploaded',
    processingStatus: 'failed',
    uploadProgress: 100,
    dateAdded: 'Jan 1, 2026',
    addedBy: 'David Kumar',
    lastModified: 'Jan 1, 2026'
  }
];

export interface AdminKnowledgeResource {
  id: string;
  title: string;
  description: string;
  userGroup: string;
  lastModified: string;
  tags: string[];
  files: { id: string; name: string; size?: string; uploadedAt?: string }[];
  webLinks: string[];
}

/** Snapshot of an admin-library resource, for report source lists. */
export function getAdminKnowledgeResource(id: string): AdminKnowledgeResource | undefined {
  const doc = mockDocuments.find((item) => item.id === id);
  if (!doc) return undefined;
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    userGroup: doc.userGroup,
    lastModified: doc.lastModified,
    tags: doc.tags ?? [],
    files: doc.files.map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      uploadedAt: file.uploadedAt,
    })),
    webLinks: doc.webLinks ?? [],
  };
}

/**
 * The signed-in user is not a member of staff groups (Program Staff, Security Team, and so on).
 * Resources shared with All Staff are the ones they can open.
 */
export function viewerCanOpenAdminResource(userGroup: string): boolean {
  return userGroup === 'All Staff';
}

