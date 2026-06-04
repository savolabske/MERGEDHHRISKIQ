import { Sidebar } from "./components/Sidebar";
import { AppTopBar } from "./components/AppTopBar";
import { Auth } from "./components/Auth";
import { Chat } from "./components/Chat";
import { Reports, type ActiveReport } from "./components/Reports";
import type { HubReportHighlightId } from "./data/homeDashboardMock";
import { MapView } from "./components/MapView";
import { Insights } from "./components/Insights";
import { Profile } from "./components/Profile";
import { Approvals } from "./components/Approvals";
import { UsersAccess } from "./components/UsersAccess";
import { AuditTrail } from "./components/AuditTrail";
import { URLSources } from "./components/URLSources";
import { Definitions } from "./components/Definitions";
import { Documents } from "./components/Documents";
import { Locations } from "./components/Locations";
import { AdminDashboard } from "./components/AdminDashboard";
import { HomeDashboard } from "./components/HomeDashboard";
import { DocumentDetail } from "./components/DocumentDetail";
import { resolveChatEligibleResourceId } from "./data/documentDetailData";
import { PlatformChats } from "./components/PlatformChats";
import { PlatformResources } from "./components/PlatformResources";
import { RiskIQPage } from "./components/RiskIQPage";
import { RiskIQChatHeader } from "./components/RiskIQChatHeader";
import {
  type AppView,
  type RiskIqTab,
  loadRiskIqTab,
  saveRiskIqTab,
} from "./types/navigation";
import {
  buildDashboardThreadMessages,
  type DashboardChatPayload,
} from "./utils/dashboardChatContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { generateHistoryConversations } from "./utils/chatHistoryData";
import {
  createChatHistoryThread,
  normalizePreloadedMessages,
} from "./data/chatAiResponses";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { CURRENT_USER, getUserById } from "./utils/mockUsers";

interface ChatHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  date: string;
  messages?: any[]; // Store full conversation
  sharedWith?: string[]; // User IDs
  shareMode?: 'outgoing' | 'incoming';
  createdBy?: string;
  createdByName?: string;
  unread?: boolean;
}

interface JoinActivity {
  id: string;
  userName: string;
  timestampLabel: string;
  afterMessageCount: number;
}

// Risk iQ - Mobile Responsive Platform
export default function App() {
  const DEMO_PENDING_INVITE_KEY = 'riskiq.demo.pendingInvite';

  const getPendingLinkState = () => {
    const params = new URLSearchParams(window.location.search);
    const threadId = params.get('thread');
    if (threadId) {
      return {
        threadId,
        inviteMode: params.get('invite') === '1',
        threadTitle: params.get('title') || undefined
      };
    }

    try {
      const raw = sessionStorage.getItem(DEMO_PENDING_INVITE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { threadId?: string; inviteMode?: boolean; threadTitle?: string };
      if (!parsed.threadId) return null;
      return {
        threadId: parsed.threadId,
        inviteMode: Boolean(parsed.inviteMode),
        threadTitle: parsed.threadTitle
      };
    } catch {
      return null;
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false); // Show login screen
  const [currentView, setCurrentView] = useState<AppView | 'aiSearch'>('home');
  const [riskIqTab, setRiskIqTab] = useState<RiskIqTab>(loadRiskIqTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadDemoConversation, setLoadDemoConversation] = useState(false);
  const [selectedHistoryMessages, setSelectedHistoryMessages] = useState<any[] | null>(null);
  const [selectedHistoryTitle, setSelectedHistoryTitle] = useState<string>('');
  const [cameFromHistory, setCameFromHistory] = useState(false);
  const [cameFromPlatformChats, setCameFromPlatformChats] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [aiSearchInput, setAiSearchInput] = useState('');
  const [dashboardChatKey, setDashboardChatKey] = useState(0);
  const [cameFromRiskIq, setCameFromRiskIq] = useState(false);
  const [cameFromHome, setCameFromHome] = useState(false);
  const [riskIqReturnTab, setRiskIqReturnTab] = useState<RiskIqTab>('dashboard');
  const [currentDocumentId, setCurrentDocumentId] = useState('1');
  const [documentReturnView, setDocumentReturnView] = useState<AppView | 'aiSearch'>('home');

  const openRiskIqChat = useCallback((payload: DashboardChatPayload) => {
    setSelectedHistoryTitle(payload.title);
    setSearchQuery(payload.prompt);
    setSelectedHistoryMessages(buildDashboardThreadMessages(payload));
    setCurrentChatId(null);
    setCameFromHistory(false);
    setCameFromHome(false);
    setCameFromRiskIq(true);
    setRiskIqReturnTab('dashboard');
    setLoadDemoConversation(false);
    setInvitePreviewThreadId(null);
    setDashboardChatKey((k) => k + 1);
    setCurrentView('aiSearch');
  }, []);

  const openHomeChat = useCallback((payload: DashboardChatPayload) => {
    setSelectedHistoryTitle(payload.title);
    setSearchQuery(payload.prompt);
    setSelectedHistoryMessages(buildDashboardThreadMessages(payload));
    setCurrentChatId(null);
    setCameFromHistory(false);
    setCameFromRiskIq(false);
    setCameFromHome(true);
    setLoadDemoConversation(false);
    setInvitePreviewThreadId(null);
    setDashboardChatKey((k) => k + 1);
    setCurrentView('aiSearch');
  }, []);

  const returnToRiskIq = useCallback((tab: RiskIqTab) => {
    setRiskIqTab(tab);
    saveRiskIqTab(tab);
    setCurrentView('riskIQ');
  }, []);

  const handleRiskIqTabChange = useCallback((tab: RiskIqTab) => {
    setRiskIqTab(tab);
    saveRiskIqTab(tab);
  }, []);

  // Pre-generate conversation histories
  const conversationHistories = generateHistoryConversations();
  
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    {
      id: '1',
      query: 'Security incidents in Lower Shabelle in the last 30 days',
      timestamp: '9:24 AM',
      date: 'Today',
      messages: conversationHistories['1'],
      sharedWith: ['1', '2', '3', '4', '5', '6', '7', '8'],
      shareMode: 'outgoing',
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name,
      unread: false
    },
    {
      id: '2',
      query: 'What are the cholera outbreak trends in Baidoa IDP camps?',
      timestamp: '8:15 AM',
      date: 'Today',
      messages: conversationHistories['2'],
      sharedWith: ['5'],
      shareMode: 'incoming',
      createdBy: '5',
      createdByName: 'Amina Hassan',
      unread: true
    },
    {
      id: '3',
      query: 'Show me critical infrastructure damage from recent flooding',
      timestamp: '2:45 PM',
      date: 'Yesterday',
      messages: conversationHistories['3'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '4',
      query: 'Summarize top operational risks for February 2026',
      timestamp: '11:30 AM',
      date: 'Yesterday',
      messages: conversationHistories['4'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '5',
      query: 'Which contractors are flagged for compliance or delivery issues?',
      timestamp: '9:05 AM',
      date: 'Yesterday',
      messages: conversationHistories['5'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '6',
      query: 'Al-Shabaab activity patterns in Middle Shabelle this month',
      timestamp: '4:52 PM',
      date: 'Feb 23, 2026',
      messages: conversationHistories['6'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '7',
      query: 'What are the access constraints for operations in Jubaland?',
      timestamp: '3:18 PM',
      date: 'Feb 23, 2026',
      messages: conversationHistories['7'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '8',
      query: 'Staff safety incidents reported in the last 60 days',
      timestamp: '10:33 AM',
      date: 'Feb 22, 2026',
      messages: conversationHistories['8'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '9',
      query: 'Compare risk levels between Mogadishu and Baidoa',
      timestamp: '2:40 PM',
      date: 'Feb 21, 2026',
      messages: conversationHistories['9'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '10',
      query: 'What is the current threat level for kidnapping in Hiraan?',
      timestamp: '11:15 AM',
      date: 'Feb 21, 2026',
      messages: conversationHistories['10'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '11',
      query: 'Show me IED incidents along the Afgooye corridor',
      timestamp: '9:28 AM',
      date: 'Feb 20, 2026',
      messages: conversationHistories['11'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '12',
      query: 'Flood impact assessment for riverine districts',
      timestamp: '4:05 PM',
      date: 'Feb 19, 2026',
      messages: conversationHistories['12'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '13',
      query: 'Supply chain delays affecting health programs',
      timestamp: '1:50 PM',
      date: 'Feb 19, 2026',
      messages: conversationHistories['13'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '14',
      query: 'What are the mitigation strategies for RSK-SEC-070?',
      timestamp: '10:22 AM',
      date: 'Feb 18, 2026',
      messages: conversationHistories['14'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '15',
      query: 'Political instability risks in Galmudug state',
      timestamp: '3:38 PM',
      date: 'Feb 17, 2026',
      messages: conversationHistories['15'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '16',
      query: 'Community acceptance issues in Gedo region',
      timestamp: '11:47 AM',
      date: 'Feb 17, 2026',
      messages: conversationHistories['16'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '17',
      query: 'Malnutrition rates in Bay region IDP settlements',
      timestamp: '9:12 AM',
      date: 'Feb 16, 2026',
      messages: conversationHistories['17'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '18',
      query: 'Show escalating security threats in South-Central Somalia',
      timestamp: '4:29 PM',
      date: 'Feb 15, 2026',
      messages: conversationHistories['18'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '19',
      query: 'VBIED attacks targeting government buildings - trend analysis',
      timestamp: '2:03 PM',
      date: 'Feb 15, 2026',
      messages: conversationHistories['19'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '20',
      query: 'What are the road conditions between Kismayo and Afmadow?',
      timestamp: '10:55 AM',
      date: 'Feb 14, 2026',
      messages: conversationHistories['20'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '21',
      query: 'Clan violence incidents in Mogadishu districts',
      timestamp: '3:41 PM',
      date: 'Feb 13, 2026',
      messages: conversationHistories['21'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '22',
      query: 'Partner NGO capacity issues in Jubaland operations',
      timestamp: '1:17 PM',
      date: 'Feb 13, 2026',
      messages: conversationHistories['22'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '23',
      query: 'Checkpoint taxation by AS along major supply routes',
      timestamp: '9:50 AM',
      date: 'Feb 12, 2026',
      messages: conversationHistories['23'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '24',
      query: 'Water trucking vendor performance in Bay region',
      timestamp: '4:33 PM',
      date: 'Feb 11, 2026',
      messages: conversationHistories['24'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '25',
      query: 'What is the current fuel shortage impact on field operations?',
      timestamp: '2:25 PM',
      date: 'Feb 11, 2026',
      messages: conversationHistories['25'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '26',
      query: 'Seasonal flooding forecast for Gu season 2026',
      timestamp: '11:08 AM',
      date: 'Feb 10, 2026',
      messages: conversationHistories['26'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '27',
      query: 'AMISOM troop withdrawal risks in Sector 2',
      timestamp: '9:44 AM',
      date: 'Feb 10, 2026',
      messages: conversationHistories['27'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '28',
      query: 'Medical evacuation constraints from remote field sites',
      timestamp: '3:52 PM',
      date: 'Feb 9, 2026',
      messages: conversationHistories['28'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '29',
      query: 'Show me the risk matrix for Q1 2026',
      timestamp: '1:36 PM',
      date: 'Feb 9, 2026',
      messages: conversationHistories['29'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '30',
      query: 'Cross-border incursions from Kenya - security implications',
      timestamp: '10:19 AM',
      date: 'Feb 8, 2026',
      messages: conversationHistories['30'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '31',
      query: 'Drought impact on pastoralist communities in Sool region',
      timestamp: '4:11 PM',
      date: 'Feb 7, 2026',
      messages: conversationHistories['31'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '32',
      query: 'What are the COVID-19 variant transmission risks in camps?',
      timestamp: '2:58 PM',
      date: 'Feb 7, 2026',
      messages: conversationHistories['32'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '33',
      query: 'Currency devaluation impact on program budgets',
      timestamp: '11:23 AM',
      date: 'Feb 6, 2026',
      messages: conversationHistories['33'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '34',
      query: 'Telecommunications outages affecting remote monitoring',
      timestamp: '9:07 AM',
      date: 'Feb 6, 2026',
      messages: conversationHistories['34'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '35',
      query: 'Female staff safety concerns in conservative districts',
      timestamp: '3:45 PM',
      date: 'Feb 5, 2026',
      messages: conversationHistories['35'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '36',
      query: 'Explosive remnants of war (ERW) contamination in Afmadow',
      timestamp: '1:29 PM',
      date: 'Feb 5, 2026',
      messages: conversationHistories['36'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '37',
      query: 'Donor funding gaps for health sector programming',
      timestamp: '10:42 AM',
      date: 'Feb 4, 2026',
      messages: conversationHistories['37'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '38',
      query: 'What are the humanitarian access negotiation outcomes with AS?',
      timestamp: '4:16 PM',
      date: 'Feb 3, 2026',
      messages: conversationHistories['38'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '39',
      query: 'Compound security assessment vulnerabilities in Baidoa',
      timestamp: '2:51 PM',
      date: 'Feb 3, 2026',
      messages: conversationHistories['39'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    },
    {
      id: '40',
      query: 'Measles outbreak risk in under-vaccinated populations',
      timestamp: '11:34 AM',
      date: 'Feb 2, 2026',
      messages: conversationHistories['40'],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name
    }
  ]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChatMessages, setCurrentChatMessages] = useState<any[]>([]);
  const [currentChatQuery, setCurrentChatQuery] = useState<string>('');
  const [invitePreviewThreadId, setInvitePreviewThreadId] = useState<string | null>(null);
  const [pendingLinkState, setPendingLinkState] = useState<{ threadId: string; inviteMode: boolean; threadTitle?: string } | null>(() => getPendingLinkState());
  const [joinActivitiesByThreadId, setJoinActivitiesByThreadId] = useState<Record<string, JoinActivity[]>>({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const sidebarCollapsedBeforeReportRef = useRef<boolean | null>(null);
  const [pendingHubReport, setPendingHubReport] = useState<ActiveReport>(null);
  const hideMobileMenuButton =
    currentView === 'aiSearch' && !!currentChatId && (cameFromHistory || cameFromPlatformChats || cameFromHome);
  const notificationCount = chatHistory.filter((c) => c.unread).length;

  const openThreadInView = useCallback((thread: ChatHistoryItem) => {
    setSelectedHistoryMessages(thread.messages || null);
    setSelectedHistoryTitle(thread.query || '');
    setSearchQuery(thread.query || '');
    setCurrentChatId(thread.id);
    setCameFromHistory(false);
    setCameFromHome(false);
    setCameFromRiskIq(true);
    setRiskIqReturnTab('chats');
    setCurrentView('aiSearch');
    setInvitePreviewThreadId(null);
    if (thread.unread) {
      setChatHistory(prev =>
        prev.map(chat => (chat.id === thread.id ? { ...chat, unread: false } : chat))
      );
    }
  }, []);

  const getCurrentDateMeta = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    let dateLabel = 'Today';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (now.toDateString() === yesterday.toDateString()) {
      dateLabel = 'Yesterday';
    } else if (now.toDateString() !== today.toDateString()) {
      dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return { timeString, dateLabel };
  };

  const appendJoinActivity = useCallback((threadId: string, userName: string) => {
    const { timeString } = getCurrentDateMeta();
    const thread = chatHistory.find((chat) => chat.id === threadId);
    const afterMessageCount = thread?.messages?.length || 0;
    setJoinActivitiesByThreadId((prev) => {
      const current = prev[threadId] || [];
      const last = current[current.length - 1];
      if (last && last.userName === userName) {
        return prev;
      }
      const nextActivity: JoinActivity = {
        id: `${threadId}-${Date.now()}`,
        userName,
        timestampLabel: timeString,
        afterMessageCount
      };
      return {
        ...prev,
        [threadId]: [...current, nextActivity]
      };
    });
  }, [chatHistory]);

  const handleMessagesChange = useCallback((messages: any[], query: string) => {
    setCurrentChatMessages(messages);
    setCurrentChatQuery(query);

    if (!currentChatId) return;

    const { timeString, dateLabel } = getCurrentDateMeta();
    setChatHistory(prev => {
      const existing = prev.find(chat => chat.id === currentChatId);
      if (!existing) return prev;
      const isThreadInFocus = currentView === 'aiSearch' && currentChatId === existing.id;
      const updated: ChatHistoryItem = {
        ...existing,
        query: query || messages[0]?.content || existing.query || 'Untitled conversation',
        timestamp: timeString,
        date: dateLabel,
        messages,
        unread: isThreadInFocus ? false : true
      };
      const others = prev.filter(chat => chat.id !== currentChatId);
      return [updated, ...others];
    });
  }, [currentChatId, currentView]);

  const openDocumentDetail = useCallback(
    (documentIdOrTitle: string, returnView: AppView | 'aiSearch' = 'home') => {
      const resourceId = resolveChatEligibleResourceId(documentIdOrTitle);
      if (!resourceId) return;
      setCurrentDocumentId(resourceId);
      setDocumentReturnView(returnView);
      setCurrentView('documentDetail');
      setInvitePreviewThreadId(null);
    },
    [],
  );

  const handleDocumentDetailBack = useCallback(() => {
    setCurrentView((view) => {
      if (view !== 'documentDetail') return view;
      return documentReturnView === 'aiSearch' ? 'aiSearch' : documentReturnView;
    });
  }, [documentReturnView]);

  const handleOpenHubReport = useCallback(
    (reportId: HubReportHighlightId) => {
      const active: ActiveReport =
        reportId === 'migration-displacement' ? 'migration-data' : 'aid-flow';
      setPendingHubReport(active);
      sidebarCollapsedBeforeReportRef.current = isSidebarCollapsed;
      setIsSidebarCollapsed(true);
      setCurrentView('reports');
    },
    [isSidebarCollapsed]
  );

  useEffect(() => {
    if (!isAuthenticated || !pendingLinkState) return;
    const linkedThread = chatHistory.find(chat => chat.id === pendingLinkState.threadId);
    if (!linkedThread && pendingLinkState.inviteMode) {
      setInvitePreviewThreadId(pendingLinkState.threadId);
      setCurrentView('aiSearch');
      return;
    }
    if (!linkedThread) return;

    const isCreator = linkedThread.createdBy === CURRENT_USER.id;
    const isAlreadyParticipant = (linkedThread.sharedWith || []).includes(CURRENT_USER.id) || isCreator;

    if (pendingLinkState.inviteMode && !isAlreadyParticipant) {
      setInvitePreviewThreadId(linkedThread.id);
      setCurrentView('aiSearch');
      return;
    }

    openThreadInView(linkedThread);
    if (pendingLinkState.inviteMode) {
      appendJoinActivity(linkedThread.id, CURRENT_USER.name);
    }
  }, [isAuthenticated, chatHistory, openThreadInView, pendingLinkState, appendJoinActivity]);

  useEffect(() => {
    if (!isAuthenticated || !pendingLinkState) return;
    if (currentChatId || invitePreviewThreadId) {
      setPendingLinkState(null);
      sessionStorage.removeItem(DEMO_PENDING_INVITE_KEY);
    }
  }, [isAuthenticated, pendingLinkState, currentChatId, invitePreviewThreadId]);

  const handleLogin = () => {
    setPendingLinkState(getPendingLinkState());
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Show Auth screen if not authenticated
  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  const startSearchChat = (query: string, options?: { fromRiskIq?: boolean; fromHome?: boolean }) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    const { timeString, dateLabel } = getCurrentDateMeta();
    const newChatId = Date.now().toString();
    const newHistoryItem: ChatHistoryItem = {
      id: newChatId,
      query: normalizedQuery,
      timestamp: timeString,
      date: dateLabel,
      messages: [],
      sharedWith: [],
      createdBy: CURRENT_USER.id,
      createdByName: CURRENT_USER.name,
      unread: false
    };

    setChatHistory(prev => [newHistoryItem, ...prev]);
    setCurrentChatId(newChatId);
    setCurrentChatQuery(normalizedQuery);
    setCurrentChatMessages([]);
    setSelectedHistoryMessages(null);
    setSelectedHistoryTitle('');
    setCameFromHistory(false);
    setCameFromHome(options?.fromHome ?? false);
    setCameFromRiskIq(options?.fromRiskIq ?? false);
    if (options?.fromRiskIq) {
      setRiskIqReturnTab('chats');
    }
    setSearchQuery(query);
    setCurrentView('aiSearch');
  };

  const handleSearch = (query: string) => startSearchChat(query, { fromRiskIq: true });

  const handleHomeSearch = (query: string) => startSearchChat(query, { fromHome: true });

  const handleBackToHome = () => {
    setSearchQuery('');
    setCurrentView('home');
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    setInvitePreviewThreadId(null);
    if (view === 'riskIQ') {
      setRiskIqTab('dashboard');
      saveRiskIqTab('dashboard');
      setCameFromRiskIq(false);
      setCameFromHome(false);
    }
    if (view === 'home') {
      setCameFromRiskIq(false);
      setCameFromHome(false);
    }
  };

  const handleNewChat = (currentQuery: string, messages: any[]) => {
    if (messages.length > 0) {
      const { timeString, dateLabel } = getCurrentDateMeta();
      if (currentChatId) {
        setChatHistory(prev =>
          prev.map(chat =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  query: currentQuery || messages[0]?.content || chat.query || 'Untitled conversation',
                  timestamp: timeString,
                  date: dateLabel,
                  messages
                }
              : chat
          )
        );
      } else {
        const newHistoryItem: ChatHistoryItem = {
          id: Date.now().toString(),
          query: currentQuery || messages[0]?.content || 'Untitled conversation',
          timestamp: timeString,
          date: dateLabel,
          messages: messages,
          sharedWith: [],
          createdBy: CURRENT_USER.id,
          createdByName: CURRENT_USER.name,
          unread: false
        };
        setChatHistory(prev => [newHistoryItem, ...prev]);
      }
    }

    // Reset to new chat
    setSearchQuery('');
    setLoadDemoConversation(false);
    setCurrentChatId(null);
    setSelectedHistoryMessages(null);
    setSelectedHistoryTitle('');
    setCameFromHistory(false);
    setCameFromHome(false);
    setCameFromRiskIq(true);
    setRiskIqReturnTab('chats');
    setCurrentView('aiSearch');
  };

  const handleRiskIqNewChat = () => {
    setSearchQuery('');
    setLoadDemoConversation(false);
    setCurrentChatId(null);
    setSelectedHistoryMessages(null);
    setSelectedHistoryTitle('');
    setCameFromHistory(false);
    setCameFromHome(false);
    setCameFromRiskIq(true);
    setRiskIqReturnTab('dashboard');
    setInvitePreviewThreadId(null);
    setCurrentView('aiSearch');
  };

  const openChatFromHistory = (id: string, returnTo: 'riskIQ' | 'platformChats') => {
    const historyItem = chatHistory.find(chat => chat.id === id);
    if (historyItem) {
      const messages =
        historyItem.messages && historyItem.messages.length > 0
          ? normalizePreloadedMessages(historyItem.messages)
          : createChatHistoryThread(historyItem.query, historyItem.id);
      setSelectedHistoryMessages(messages);
    } else {
      setSelectedHistoryMessages(null);
    }
    setSelectedHistoryTitle(historyItem?.query || '');
    setSearchQuery(historyItem?.query || '');
    setCurrentChatId(historyItem?.id || null);
    setCameFromHistory(true);
    setCameFromHome(false);
    setCameFromPlatformChats(returnTo === 'platformChats');
    setCameFromRiskIq(returnTo === 'riskIQ');
    if (returnTo === 'riskIQ') {
      setRiskIqReturnTab('chats');
    }
    setCurrentView('aiSearch');
    setInvitePreviewThreadId(null);
    if (historyItem?.id) {
      setChatHistory(prev =>
        prev.map(chat => (chat.id === historyItem.id ? { ...chat, unread: false } : chat))
      );
    }
  };

  const handleChatSelect = (id: string) => {
    openChatFromHistory(id, 'riskIQ');
  };

  const handlePlatformChatSelect = (id: string) => {
    openChatFromHistory(id, 'platformChats');
  };

  const handleDeleteChat = (id: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
      setSelectedHistoryMessages(null);
      setSelectedHistoryTitle('');
      setCameFromHistory(false);
      setCameFromHome(false);
    }
  };

  const handleBulkDeleteChats = (ids: string[]) => {
    const idSet = new Set(ids);
    setChatHistory(prev => prev.filter(chat => !idSet.has(chat.id)));
    if (currentChatId && idSet.has(currentChatId)) {
      setCurrentChatId(null);
      setSelectedHistoryMessages(null);
      setSelectedHistoryTitle('');
      setCameFromHistory(false);
      setCameFromHome(false);
    }
  };

  const handleShareUpdate = (chatId: string, userIds: string[]) => {
    setChatHistory(prev =>
      prev.map(chat => (chat.id === chatId ? { ...chat, sharedWith: userIds } : chat))
    );
  };

  const handleOpenSharedThread = (threadId: string) => {
    handleChatSelect(threadId);
    appendJoinActivity(threadId, CURRENT_USER.name);
  };

  const handleOpenInvitePreview = (threadId: string) => {
    const url = new URL(window.location.href);
    const linkedThread = chatHistory.find(chat => chat.id === threadId);
    url.searchParams.set('thread', threadId);
    url.searchParams.set('invite', '1');
    if (linkedThread?.query) {
      url.searchParams.set('title', linkedThread.query);
    }
    window.history.replaceState({}, '', url.toString());
    sessionStorage.setItem(
      DEMO_PENDING_INVITE_KEY,
      JSON.stringify({ threadId, inviteMode: true, threadTitle: linkedThread?.query || undefined })
    );
    if (!linkedThread) {
      setCurrentView('aiSearch');
      setInvitePreviewThreadId(threadId);
      return;
    }
    setCurrentView('aiSearch');
    setInvitePreviewThreadId(linkedThread.id);
  };

  const handleJoinInviteThread = () => {
    if (!invitePreviewThreadId) return;
    const linkedThread = chatHistory.find(chat => chat.id === invitePreviewThreadId);
    if (!linkedThread) {
      const { timeString, dateLabel } = getCurrentDateMeta();
      const fallbackTitle = pendingLinkState?.threadTitle || 'Shared chat invite';
      const demoThread: ChatHistoryItem = {
        id: invitePreviewThreadId,
        query: fallbackTitle,
        timestamp: timeString,
        date: dateLabel,
        messages: [],
        sharedWith: [CURRENT_USER.id],
        shareMode: 'incoming',
        createdByName: 'Shared via invite link',
        unread: false
      };
      setChatHistory((prev) => [demoThread, ...prev.filter((chat) => chat.id !== invitePreviewThreadId)]);
      window.history.replaceState({}, '', window.location.pathname);
      sessionStorage.removeItem(DEMO_PENDING_INVITE_KEY);
      openThreadInView(demoThread);
      appendJoinActivity(demoThread.id, CURRENT_USER.name);
      return;
    }

    setChatHistory(prev =>
      prev.map(chat => {
        if (chat.id !== invitePreviewThreadId) return chat;
        const alreadyIncluded = (chat.sharedWith || []).includes(CURRENT_USER.id);
        return {
          ...chat,
          shareMode: 'incoming',
          sharedWith: alreadyIncluded ? (chat.sharedWith || []) : [...(chat.sharedWith || []), CURRENT_USER.id],
          unread: false
        };
      })
    );

    window.history.replaceState({}, '', window.location.pathname);
    sessionStorage.removeItem(DEMO_PENDING_INVITE_KEY);
    openThreadInView(linkedThread);
    appendJoinActivity(linkedThread.id, CURRENT_USER.name);
  };

  return (
    <div className="w-full h-screen bg-background flex flex-col lg:flex-row">
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onOpenSharedThread={handleOpenSharedThread}
        onOpenInvitePreview={handleOpenInvitePreview}
        hideMobileMenuButton={hideMobileMenuButton}
        showFixedMobileMenuButton={currentView === 'mapAI'}
        isRiskIqActive={currentView === 'riskIQ' || (currentView === 'aiSearch' && cameFromRiskIq)}
        mobileMenuOpen={isMobileSidebarOpen}
        onMobileMenuOpenChange={setIsMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-full min-h-0 flex flex-col overflow-hidden lg:ml-0">
        {currentView !== 'mapAI' && (
          <AppTopBar
            onNavigateHome={() => handleNavigate('home')}
            notificationCount={notificationCount}
            showMobileMenuButton={!hideMobileMenuButton}
            isMobileMenuOpen={isMobileSidebarOpen}
            onMobileMenuToggle={() => setIsMobileSidebarOpen((open) => !open)}
          />
        )}
        <div className="flex-1 min-h-0 overflow-hidden">
        {currentView === 'home' ? (
          <HomeDashboard
            onOpenChat={openHomeChat}
            onOpenBriefing={() => handleChatSelect('4')}
            onNavigate={handleNavigate}
            onSearch={handleHomeSearch}
            onOpenDocument={(id) => openDocumentDetail(id, 'home')}
            onOpenReport={handleOpenHubReport}
          />
        ) : currentView === 'documentDetail' ? (
          <DocumentDetail
            documentId={currentDocumentId}
            onBack={handleDocumentDetailBack}
            onOpenDocument={(id) => openDocumentDetail(id, documentReturnView)}
            backLabel={
              documentReturnView === 'home'
                ? 'Back to Home'
                : documentReturnView === 'aiSearch'
                  ? cameFromHome
                    ? 'Back to Home'
                    : cameFromRiskIq
                      ? 'Back to Risk IQ'
                      : 'Back to Chat'
                  : 'Back'
            }
          />
        ) : currentView === 'platformChats' ? (
          <PlatformChats
            chatHistory={chatHistory}
            onChatSelect={handlePlatformChatSelect}
            onDeleteChat={handleDeleteChat}
            onBulkDeleteChats={handleBulkDeleteChats}
          />
        ) : currentView === 'resourcesHub' ? (
          <PlatformResources />
        ) : currentView === 'riskIQ' ? (
          <RiskIQPage
            activeTab={riskIqTab}
            onTabChange={handleRiskIqTabChange}
            onOpenChat={openRiskIqChat}
            onOpenBriefing={() => handleChatSelect('4')}
            onChatSelect={handleChatSelect}
            onNewChat={handleRiskIqNewChat}
            onDeleteChat={handleDeleteChat}
            onBulkDeleteChats={handleBulkDeleteChats}
            chatHistory={chatHistory}
            chatsUnreadCount={chatHistory.filter((c) => c.unread).length}
          />
        ) : currentView === 'aiSearch' ? (
          invitePreviewThreadId ? (
            <div className="h-full flex items-center justify-center px-4 sm:px-8 py-8 bg-background">
              <div className="w-full max-w-[620px] rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Invite preview</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground-emphasis leading-tight">
                  {chatHistory.find(c => c.id === invitePreviewThreadId)?.query || 'Chat invite'}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  You were invited to this chat. Review participants and join when ready.
                </p>
                <div className="mt-5 rounded-xl border border-border bg-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Participants</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(() => {
                      const inviteThread = chatHistory.find(c => c.id === invitePreviewThreadId);
                      const participantNames = [
                        inviteThread?.createdByName || 'Unknown creator',
                        ...((inviteThread?.sharedWith || [])
                          .map((id) => getUserById(id)?.name)
                          .filter(Boolean) as string[])
                      ];
                      const uniqueNames = [...new Set(participantNames)];
                      return uniqueNames.slice(0, 8).map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center rounded-full border border-border-muted bg-card px-3 py-1 text-sm text-secondary-foreground"
                        >
                          {name}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setInvitePreviewThreadId(null);
                      window.history.replaceState({}, '', window.location.pathname);
                    }}
                  >
                    Maybe later
                  </Button>
                  <Button type="button" onClick={handleJoinInviteThread}>
                    Join chat
                  </Button>
                </div>
              </div>
            </div>
          ) : searchQuery || loadDemoConversation ? (
            <Chat 
              key={`${dashboardChatKey}-${searchQuery}`}
              initialQuery={loadDemoConversation ? "Summarize the top operational risks" : searchQuery} 
              preloadedMessages={selectedHistoryMessages}
              threadId={currentChatId || undefined}
              threadTitle={selectedHistoryTitle || (loadDemoConversation ? "Summarize the top operational risks" : searchQuery)}
              sharedWithUserIds={chatHistory.find(c => c.id === currentChatId)?.sharedWith || []}
              isSharedThread={(chatHistory.find(c => c.id === currentChatId)?.sharedWith?.length || 0) > 0}
              createdByName={chatHistory.find(c => c.id === currentChatId)?.createdByName || CURRENT_USER.name}
              joinActivities={joinActivitiesByThreadId[currentChatId || ''] || []}
              onShareUpdate={handleShareUpdate}
              showThreadHeader={!!currentChatId}
              showRiskIqContext={cameFromRiskIq && !cameFromHistory}
              showBackButton={cameFromHistory || cameFromRiskIq || cameFromHome}
              backButtonLabel={
                cameFromHistory
                  ? 'Back to Chats'
                  : cameFromHome
                    ? 'Back to Home'
                    : cameFromRiskIq && riskIqReturnTab === 'dashboard'
                      ? 'Back to Dashboard'
                      : cameFromRiskIq
                        ? 'Back to Risk IQ'
                        : 'Back to Home'
              }
              onBack={() => {
                if (cameFromPlatformChats) {
                  setCurrentView('platformChats');
                  setSearchQuery('');
                } else if (cameFromHistory || cameFromRiskIq) {
                  returnToRiskIq(cameFromHistory ? 'chats' : riskIqReturnTab);
                  setSearchQuery('');
                } else {
                  handleBackToHome();
                }
                setLoadDemoConversation(false);
                setSelectedHistoryMessages(null);
                setSelectedHistoryTitle('');
                setCurrentChatId(null);
                setCameFromHistory(false);
                setCameFromPlatformChats(false);
                setCameFromRiskIq(false);
                setCameFromHome(false);
              }} 
              onNewChat={handleNewChat}
              onMessagesChange={handleMessagesChange}
              onKnowledgeSourceClick={(source) => {
                const resourceId =
                  (source.documentId &&
                    resolveChatEligibleResourceId(source.documentId)) ||
                  resolveChatEligibleResourceId(source.title);
                if (!resourceId) return;
                openDocumentDetail(
                  resourceId,
                  cameFromHome ? 'home' : cameFromRiskIq ? 'riskIQ' : 'aiSearch',
                );
              }}
            />
          ) : (
            <div className="h-full flex flex-col bg-background">
              {cameFromRiskIq && (
                <RiskIQChatHeader
                  onBack={() => {
                    returnToRiskIq(riskIqReturnTab);
                    setCameFromRiskIq(false);
                    setCameFromHome(false);
                    setCameFromHistory(false);
                  }}
                  backLabel={
                    riskIqReturnTab === 'dashboard' ? 'Back to Dashboard' : 'Back to Risk IQ'
                  }
                />
              )}

              {/* Main Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col items-center justify-center px-4 sm:px-8 py-12">
                  <div className="max-w-[680px] w-full">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-sm">
                        <Sparkles className="w-7 h-7 text-white" fill="white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl text-center mb-2 text-foreground">
                      Ask <span className="italic text-primary">Risk IQ</span>
                    </h1>
                    
                    <p className="text-sm sm:text-sm text-muted-foreground text-center mb-8 leading-relaxed max-w-[460px] mx-auto">Your AI risk analyst for Somalia field operations — available around the clock.</p>

                    {/* Suggestion Cards - Horizontal layout with icons on the side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      <button 
                        onClick={() => handleSearch("What should I be worried about today?")}
                        className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary hover:shadow-sm transition-all group flex items-center gap-3"
                      >
                        <div className="w-9 h-9 bg-sidebar-accent rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-lg">⚡</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground mb-0.5 group-hover:text-primary">Today's Risk Overview</h4>
                          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">What should I be worried about today?</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => handleSearch("What security incidents happened in Lower Shabelle recently?")}
                        className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary hover:shadow-sm transition-all group flex items-center gap-3"
                      >
                        <div className="w-9 h-9 bg-destructive-subtle rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-lg">🛡</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground mb-0.5 group-hover:text-primary">Security Incidents</h4>
                          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">Any threats in Lower Shabelle recently?</p>
                        </div>
                      </button>

                      <button 
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                          setShowTooltip(true);
                          setTimeout(() => setShowTooltip(false), 2000);
                        }}
                        className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary hover:shadow-sm transition-all group flex items-center gap-3"
                      >
                        <div className="w-9 h-9 bg-warning-subtle rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-lg">📋</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground mb-0.5 group-hover:text-primary">Vendor Red Flags</h4>
                          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">Are any of our active contractors flagged?</p>
                        </div>
                      </button>

                      <button 
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
                          setShowTooltip(true);
                          setTimeout(() => setShowTooltip(false), 2000);
                        }}
                        className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary hover:shadow-sm transition-all group flex items-center gap-3"
                      >
                        <div className="w-9 h-9 bg-primary-subtle rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-lg">⚠️</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground mb-0.5 group-hover:text-primary">Access Constraints</h4>
                          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">Which areas are off-limits for field teams?</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tooltip */}
              {showTooltip && (
                <div 
                  className="fixed z-50 bg-foreground text-white px-3 py-2 rounded-lg text-sm shadow-lg"
                  style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'none'
                  }}
                >
                  We are working on that
                </div>
              )}

              {/* Bottom Input - Fixed */}
              <div className="bg-background px-[32px] pt-[0px] pb-[24px]">
                <div className="max-w-[680px] mx-auto">
                  {/* New Conversation Button */}
                  <button className="flex items-center gap-2 text-sm text-text-subtle hover:text-muted-foreground transition-colors mb-6">
                    
                  </button>

                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Ask anything about operational risks, security threats, or field conditions..."
                      className="h-[54px] rounded-2xl px-6 pr-14 text-base"
                      value={aiSearchInput}
                      onChange={(e) => setAiSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          handleSearch(e.currentTarget.value);
                          setAiSearchInput('');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      disabled={!aiSearchInput.trim()}
                      onClick={() => {
                        if (aiSearchInput.trim()) {
                          handleSearch(aiSearchInput);
                          setAiSearchInput('');
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-xl"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                        <path d="M16.5 1.5L8.25 9.75M16.5 1.5L11.25 16.5L8.25 9.75M16.5 1.5L1.5 6.75L8.25 9.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : currentView === 'mapAI' ? (
          <MapView />
        ) : currentView === 'insights' ? (
          <Insights />
        ) : currentView === 'reports' ? (
          <Reports
            initialReport={pendingHubReport}
            onInitialReportConsumed={() => setPendingHubReport(null)}
            onReportOpen={() => {
              sidebarCollapsedBeforeReportRef.current = isSidebarCollapsed;
              setIsSidebarCollapsed(true);
            }}
            onReportClose={() => {
              if (sidebarCollapsedBeforeReportRef.current !== null) {
                setIsSidebarCollapsed(sidebarCollapsedBeforeReportRef.current);
                sidebarCollapsedBeforeReportRef.current = null;
              }
            }}
          />
        ) : currentView === 'profile' ? (
          <Profile />
        ) : currentView === 'adminDashboard' ? (
          <AdminDashboard />
        ) : currentView === 'approvals' ? (
          <Approvals />
        ) : currentView === 'usersAccess' ? (
          <UsersAccess />
        ) : currentView === 'auditTrails' ? (
          <AuditTrail />
        ) : currentView === 'links' ? (
          <URLSources />
        ) : currentView === 'definitions' ? (
          <Definitions />
        ) : currentView === 'resources' ? (
          <Documents />
        ) : currentView === 'locations' ? (
          <Locations />
        ) : null}
        </div>
      </main>
      <Toaster 
        position="top-right"
        closeButton
        duration={4000}
        toastOptions={{ className: 'sonner-toast' }}
      />
    </div>
  );
}