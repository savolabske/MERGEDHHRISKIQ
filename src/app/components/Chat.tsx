import { useState, useRef, useEffect, useMemo } from 'react';
import { FileText, Link, Database, Globe, ChevronDown, ChevronUp, X, ExternalLink, UserPlus, Sparkles, CircleHelp, Check } from 'lucide-react';
import { RiskIQChatHeader } from './RiskIQChatHeader';
import { BackLink } from './ui/back-link';
import { RiskMatrix } from './RiskMatrix';
import { BriefingContent } from './BriefingContent';
import { SomaliaMap } from './SomaliaMap';
import { LowerShabelleIncidentMap, incidents } from './LowerShabelleIncidentMap';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ShareThreadModal } from './ShareThreadModal';
import { CURRENT_USER, RISK_IQ_USER, getUserById } from '../utils/mockUsers';
import { toast } from 'sonner';
import { cn } from './ui/utils';
import { isChatEligibleKnowledgeSource } from '../data/documentDetailData';
import {
  buildRefinedKnowledgeResponse,
  buildRefinedWebIntelligence,
  getChatAiResponse,
  getWebIntelligenceSummary,
  normalizePreloadedMessages,
} from '../data/chatAiResponses';
import {
  getDashboardStreamingResponse,
  type DashboardChatPayload,
} from '../utils/dashboardChatContext';
import { ChatSourceBadge } from './chats/chatSource';

// Utility function to clean markdown from content for better typing display
const cleanMarkdown = (text: string) => text.replace(/\*\*/g, '');

const RISK_EMOJI_CLASS: Record<string, string> = {
  '🔴': 'text-destructive font-semibold',
  '🟠': 'text-warning-text font-semibold',
  '🟡': 'text-warning-text',
  '🟢': 'text-success-text font-semibold',
  '⚪': 'text-muted-foreground',
  '📍': 'text-primary font-medium',
  '🚧': 'text-warning-text font-semibold',
  '⚠️': 'text-destructive',
  '🤝': 'text-primary font-semibold',
  '🛡️': 'text-primary font-semibold',
  '🧭': 'text-primary font-semibold',
  '📈': 'text-primary font-semibold',
  '🗺️': 'text-primary font-semibold',
  '💧': 'text-primary font-semibold',
  '🌊': 'text-primary font-semibold',
};

interface Source {
  id: string;
  type: 'knowledge-base' | 'web-source';
  title: string;
  excerpt: string;
  date?: string;
  url?: string;
  category?: string;
  documentId?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'loading' | 'searching';
  content: string;
  senderId?: string;
  senderName?: string;
  contentType: 'text' | 'table' | 'matrix' | 'loading' | 'searching' | 'briefing' | 'comparison' | 'geographic' | 'incidents';
  data?: any;
  isTyping?: boolean;
  displayedContent?: string;
  displayedWebIntelligence?: string;
  isWebIntelTyping?: boolean;
  sources?: Source[];
  webIntelligenceSummary?: string; // AI-synthesized answer from web sources
  originatingQuery?: string;
  isAiExtended?: boolean;
  usedForAiExtension?: boolean;
}

interface ChatProps {
  initialQuery: string;
  onBack: () => void;
  isDemoConversation?: boolean;
  onNewChat?: (currentQuery: string, messages: any[]) => void;
  onMessagesChange?: (messages: any[], query: string) => void;
  preloadedMessages?: any[] | null; // Pre-loaded conversation history
  dashboardChatPayload?: DashboardChatPayload | null;
  threadId?: string;
  threadTitle?: string;
  sharedWithUserIds?: string[];
  onShareUpdate?: (threadId: string, userIds: string[]) => void;
  showThreadHeader?: boolean;
  navigation?: 'none' | 'back';
  showRiskIqContext?: boolean;
  initialExtendedKnowledge?: boolean;
  createdByName?: string;
  isSharedThread?: boolean;
  joinActivities?: { id: string; userName: string; timestampLabel: string; afterMessageCount: number }[];
  onKnowledgeSourceClick?: (source: Source) => void;
  startEmpty?: boolean;
  chatContextLabel?: 'Risk iQ' | 'Humanity Hub';
}

const getAIResponse = getChatAiResponse;

const HUB_NEW_CHAT_SUGGESTIONS = [
  {
    title: 'Climate & Rains',
    prompt: 'How are late Gu rains affecting drought risk in Bay and Bakool?',
    icon: '🌧️',
    iconClass: 'bg-warning-subtle',
  },
  {
    title: 'Aid Delivery',
    prompt: 'Where are the largest aid delivery gaps in Galguduud and Lower Shabelle?',
    icon: '📦',
    iconClass: 'bg-primary-subtle',
  },
  {
    title: 'Displacement',
    prompt: 'What are arrival trends in Baidoa and Mogadishu IDP camps?',
    icon: '🏕️',
    iconClass: 'bg-sidebar-accent',
  },
  {
    title: "Today's Picture",
    prompt: 'Summarize the key humanitarian signals across climate, aid, and displacement',
    icon: '📊',
    iconClass: 'bg-destructive-subtle',
  },
] as const;

const RISK_IQ_NEW_CHAT_SUGGESTIONS = [
  {
    title: "Today's Risk Overview",
    prompt: 'What should I be worried about today?',
    icon: '⚡',
    iconClass: 'bg-sidebar-accent',
  },
  {
    title: 'Security Incidents',
    prompt: 'What security incidents happened in Lower Shabelle recently?',
    icon: '🛡',
    iconClass: 'bg-destructive-subtle',
  },
  {
    title: 'Vendor Red Flags',
    prompt: 'Are any of our active contractors flagged?',
    icon: '📋',
    iconClass: 'bg-warning-subtle',
  },
  {
    title: 'Access Constraints',
    prompt: 'Which areas are off-limits for field teams?',
    icon: '⚠️',
    iconClass: 'bg-primary-subtle',
  },
] as const;


export function Chat({
  initialQuery,
  onBack,
  isDemoConversation,
  onNewChat,
  onMessagesChange,
  preloadedMessages,
  dashboardChatPayload,
  threadId,
  threadTitle,
  sharedWithUserIds = [],
  onShareUpdate,
  showThreadHeader = false,
  navigation = 'none',
  showRiskIqContext = false,
  initialExtendedKnowledge = false,
  createdByName = CURRENT_USER.name,
  isSharedThread = false,
  joinActivities = [],
  onKnowledgeSourceClick,
  startEmpty = false,
  chatContextLabel,
}: ChatProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (startEmpty) {
      return [];
    }

    // If we have preloaded messages (from history), use those
    if (preloadedMessages && preloadedMessages.length > 0) {
      return normalizePreloadedMessages(preloadedMessages).map((message) => {
        if (message.type === 'assistant') {
          return {
            ...message,
            senderId: message.senderId || RISK_IQ_USER.id,
            senderName: message.senderName || RISK_IQ_USER.name,
          };
        }
        if (message.type === 'user') {
          return {
            ...message,
            senderId: message.senderId || CURRENT_USER.id,
            senderName: message.senderName || CURRENT_USER.name,
          };
        }
        return message;
      });
    }

    return [
      {
        id: '1',
        type: 'user',
        content: initialQuery,
        senderId: CURRENT_USER.id,
        senderName: CURRENT_USER.name,
        contentType: 'text',
      },
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtendedKnowledgeMode, setIsExtendedKnowledgeMode] = useState(initialExtendedKnowledge);
  const [isSharedExtendedPillVisible, setIsSharedExtendedPillVisible] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSharedPopoverOpen, setIsSharedPopoverOpen] = useState(false);
  const [isMentionMenuOpen, setIsMentionMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sharedPopoverRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const initialUserMessageCount = startEmpty
    ? 0
    : preloadedMessages && preloadedMessages.length > 0
      ? preloadedMessages.filter((message) => message.type === 'user').length
      : 1;
  const messageCountRef = useRef(initialUserMessageCount);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Notify parent of messages change
  useEffect(() => {
    onMessagesChange?.(messages, initialQuery);
  }, [messages, initialQuery, onMessagesChange]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (sharedPopoverRef.current && !sharedPopoverRef.current.contains(event.target as Node)) {
        setIsSharedPopoverOpen(false);
      }
    }

    if (isSharedPopoverOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSharedPopoverOpen]);

  useEffect(() => {
    if (!isSharedThread) {
      setIsMentionMenuOpen(false);
      return;
    }
    const lastToken = inputValue.split(/\s+/).pop() || '';
    setIsMentionMenuOpen(lastToken.startsWith('@'));
  }, [inputValue, isSharedThread]);

  useEffect(() => {
    if (isSharedThread) {
      // Group chat input should default to normal chat mode (no Extended pill).
      setIsExtendedKnowledgeMode(false);
      setIsSharedExtendedPillVisible(false);
    }
  }, [isSharedThread, threadId]);

  useEffect(() => {
    if (!isSharedThread) return;
    // Extended Knowledge only applies while Humanity Hub AI is invoked in the composer.
    if (!/@humanity\s*hub/i.test(inputValue)) {
      setIsSharedExtendedPillVisible(false);
    }
  }, [inputValue, isSharedThread]);

  const sharedUsers = useMemo(() => {
    return (sharedWithUserIds || []).map(getUserById).filter(Boolean);
  }, [sharedWithUserIds]);
  const showNavigation = navigation !== 'none';

  const streamTextOntoMessage = async (
    messageId: string,
    fullText: string,
    applyPartial: (partialText: string) => Partial<Message>
  ) => {
    const cleanedText = fullText.replace(/\\n/g, '\n');
    const CHUNK_SIZE = 3;
    const BASE_DELAY_MS = 14;

    for (let charIndex = CHUNK_SIZE; charIndex <= cleanedText.length + CHUNK_SIZE; charIndex += CHUNK_SIZE) {
      if (!isMountedRef.current) return cleanedText;

      const partialText = cleanedText.slice(0, Math.min(charIndex, cleanedText.length));
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, ...applyPartial(partialText) } : msg
      ));

      if (charIndex >= cleanedText.length) break;

      const lastChar = cleanedText[Math.min(charIndex, cleanedText.length) - 1];
      let delay = BASE_DELAY_MS;
      if (lastChar === '\n') delay = 35;
      else if (lastChar === '.' || lastChar === '!' || lastChar === '?') delay = 55;

      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return cleanedText;
  };

  // Initial AI response - only if not loading from history
  useEffect(() => {
    if (startEmpty) return;

    if (dashboardChatPayload) {
      const streamingResponse = getDashboardStreamingResponse(dashboardChatPayload);
      processAIResponse(dashboardChatPayload.prompt, true, 'default', false, streamingResponse);
      return;
    }

    if (!preloadedMessages || preloadedMessages.length === 0) {
      processAIResponse(initialQuery, initialExtendedKnowledge, 'default', initialExtendedKnowledge);
    }
  }, []);

  const processAIResponse = async (
    query: string,
    useExtendedKnowledge: boolean = true,
    trigger: 'default' | 'extend' = 'default',
    useExtendedPrimaryResponse: boolean = false,
    prebuiltResponse?: {
      content: string;
      contentType: Message['contentType'];
      data?: Message['data'];
      sources: Source[];
    }
  ) => {
    setIsProcessing(true);
    const responseConfig = prebuiltResponse ? null : getAIResponse(query, messageCountRef.current);
    
    // Special handling for briefing content type
    const isBriefing = prebuiltResponse
      ? prebuiltResponse.contentType === 'briefing'
      : responseConfig!.response.contentType === 'briefing';
    
    // Generate unique IDs upfront to avoid collision
    const timestamp = Date.now();
    const searchingId = `search-${timestamp}`;
    const responseId = `response-${timestamp}`;
    
    // Step 1: Add searching message - single line that transitions
    setMessages(prev => [...prev, {
      id: searchingId,
      type: 'searching',
      content: '',
      contentType: 'searching',
      data: { 
        currentPhase: trigger === 'extend' ? 'extending-ai' : (isBriefing ? 'analyzing-risks' : 'knowledge-base'),
        isBriefing,
        useExtendedKnowledge
      }
    }]);

    // First phase
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Switch to second phase
    const shouldRunSecondPhase = isBriefing || useExtendedKnowledge;
    if (shouldRunSecondPhase) {
      setMessages(prev => prev.map(msg => 
        msg.id === searchingId 
          ? { ...msg, data: { ...msg.data, currentPhase: trigger === 'extend' ? 'web-sources' : (isBriefing ? 'comparing-trends' : 'web-sources') } }
          : msg
      ));
      await new Promise(resolve => setTimeout(resolve, 1800));
    }
    
    // Switch to third phase
    setMessages(prev => prev.map(msg => 
      msg.id === searchingId 
        ? { ...msg, data: { ...msg.data, currentPhase: isBriefing ? 'mapping-clusters' : 'preparing' } }
        : msg
    ));

    await new Promise(resolve => setTimeout(resolve, 1200));

    // Remove searching message
    setMessages(prev => prev.filter(msg => msg.id !== searchingId));

    // Step 2: Generate sources
    const knowledgeBaseSources: Source[] = [
      {
        id: '1',
        type: 'knowledge-base',
        title: 'Security Incident Reporting SOP',
        excerpt:
          'Standard operating procedures for documenting, escalating, and reporting security incidents across UN mission locations in Somalia — from main menu Resources.',
        url: 'https://docs.riskiq.local/security-incident-reporting-sop',
        date: 'Feb 15, 2026',
        category: 'Resources',
        documentId: '3',
      },
      {
        id: '3',
        type: 'knowledge-base',
        title: 'Internal Risks - Critical Threats Database',
        excerpt: 'Internal database containing 156 active risks across all operational areas, including likelihood scores, impact assessments, and historical incident data.',
        url: 'https://docs.riskiq.local/internal-risks-critical-threats-database',
        date: 'Updated daily',
        category: 'Internal Database',
      }
    ];
    const webSources: Source[] = [
      {
        id: '2',
        type: 'web-source',
        title: 'UNDSS Somalia Threat Alert - February 2026',
        excerpt: 'Latest security advisory highlighting increased hostile activities in Banadir region with specific guidance for UN personnel operating in high-risk areas.',
        url: 'undss.org/somalia-alerts',
        date: 'Feb 18, 2026'
      },
      {
        id: '4',
        type: 'web-source',
        title: 'WHO Somalia Health Emergency Updates',
        excerpt: 'Health risk monitoring including cholera outbreak tracking, disease surveillance data, and public health emergency recommendations for IDP camps.',
        url: 'who.int/somalia',
        date: 'Feb 20, 2026'
      }
    ];
    const isExtendedRefinement = trigger === 'extend' || useExtendedPrimaryResponse;
    const sources: Source[] = prebuiltResponse
      ? prebuiltResponse.sources
      : useExtendedKnowledge
        ? [...knowledgeBaseSources, ...webSources]
        : knowledgeBaseSources;

    const webIntelligenceContent = getWebIntelligenceSummary(query);
    const formattedRefinedWebIntelligenceContent = buildRefinedWebIntelligence(query);
    const responseContent = prebuiltResponse
      ? prebuiltResponse.content
      : isExtendedRefinement
        ? buildRefinedKnowledgeResponse(responseConfig!.response.content, query)
        : responseConfig!.response.content;
    const responseContentType = prebuiltResponse
      ? prebuiltResponse.contentType
      : isExtendedRefinement
        ? 'text'
        : responseConfig!.response.contentType;
    const responseData = prebuiltResponse
      ? prebuiltResponse.data
      : isExtendedRefinement
        ? undefined
        : responseConfig!.response.data;

    // Step 3: Add AI response with typing effect
    const assistantMessage: Message = {
      id: responseId,
      type: 'assistant',
      content: responseContent,
      senderId: RISK_IQ_USER.id,
      senderName: RISK_IQ_USER.name,
      contentType: responseContentType,
      data: responseData,
      isTyping: true,
      displayedContent: '',
      sources: sources,
      webIntelligenceSummary:
        isExtendedRefinement
          ? formattedRefinedWebIntelligenceContent
          : useExtendedKnowledge && trigger !== 'extend'
            ? webIntelligenceContent
          : undefined,
      originatingQuery: query,
      isAiExtended: isExtendedRefinement
    };

    setMessages(prev => [...prev, assistantMessage]);

    const cleanedText = await streamTextOntoMessage(
      responseId,
      responseContent,
      (partialText) => ({ displayedContent: partialText })
    );

    if (!isMountedRef.current) return;

    setMessages(prev => prev.map(msg =>
      msg.id === responseId ? { ...msg, isTyping: false, displayedContent: cleanedText } : msg
    ));

    const webIntelText = prebuiltResponse
      ? undefined
      : isExtendedRefinement
        ? formattedRefinedWebIntelligenceContent
        : useExtendedKnowledge && trigger !== 'extend'
          ? webIntelligenceContent
          : undefined;

    if (webIntelText) {
      setMessages(prev => prev.map(msg =>
        msg.id === responseId
          ? { ...msg, isWebIntelTyping: true, displayedWebIntelligence: '' }
          : msg
      ));

      const cleanedWebIntel = await streamTextOntoMessage(
        responseId,
        webIntelText,
        (partialText) => ({ displayedWebIntelligence: partialText })
      );

      if (!isMountedRef.current) return;

      setMessages(prev => prev.map(msg =>
        msg.id === responseId
          ? { ...msg, isWebIntelTyping: false, displayedWebIntelligence: cleanedWebIntel }
          : msg
      ));
    }

    // Set follow-up suggestions if provided
    if (responseConfig?.followUps && responseConfig.followUps.length > 0) {
      setSuggestedFollowUps(responseConfig.followUps);
    }

    setIsProcessing(false);
  };

  const handleSend = () => {
    if (!inputValue.trim() || isProcessing) return;
    submitQuery(inputValue.trim());
    setInputValue('');
  };

  const submitQuery = (rawValue: string) => {
    if (!rawValue.trim() || isProcessing) return;
    const trimmedValue = rawValue.trim();
    const invokesAi = /@humanity\s*hub/i.test(trimmedValue);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: trimmedValue,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      contentType: 'text',
    };

    setMessages((prev) => [...prev, newUserMessage]);
    messageCountRef.current += 1;

    const currentQuery = trimmedValue.replace(/@humanity\s*hub/ig, '').trim() || trimmedValue;

    if (isSharedThread) {
      if (!invokesAi) {
        setIsSharedExtendedPillVisible(false);
        return;
      }

      const extendedForThisTurn = isSharedExtendedPillVisible;
      processAIResponse(currentQuery, true, 'default', extendedForThisTurn).finally(() => {
        setIsSharedExtendedPillVisible(false);
      });
      return;
    }

    processAIResponse(currentQuery, true, 'default', isExtendedKnowledgeMode);
  };

  const resolveExtensionQuery = (message: Message) => {
    if (message.originatingQuery) return message.originatingQuery;

    const messageIndex = messages.findIndex((entry) => entry.id === message.id);
    if (messageIndex <= 0) return null;

    for (let i = messageIndex - 1; i >= 0; i -= 1) {
      const candidate = messages[i];
      if (candidate.type === 'user') {
        const trimmedContent = (candidate.content || '').trim();
        return trimmedContent || null;
      }
    }

    return null;
  };

  const buildExtensionBlurb = (query: string) => {
    const cleanedQuery = query.replace(/\s+/g, ' ').trim();
    const maxLength = 90;
    const trimmedQuery =
      cleanedQuery.length > maxLength
        ? `${cleanedQuery.slice(0, maxLength - 3).trimEnd()}...`
        : cleanedQuery;

    return `Extending answer for "${trimmedQuery}"`;
  };

  const handleExtendWithAI = (message: Message) => {
    if (isProcessing) return;

    const extensionQuery = resolveExtensionQuery(message);
    if (!extensionQuery) return;

    setIsExtendedKnowledgeMode(true);

    setMessages(prev =>
      prev.map(msg =>
        msg.id === message.id
          ? { ...msg, usedForAiExtension: true }
          : msg
      )
    );

    const extensionPrompt: Message = {
      id: `${Date.now()}-extend`,
      type: 'user',
      content: buildExtensionBlurb(extensionQuery),
      contentType: 'text'
    };

    setMessages(prev => [...prev, extensionPrompt]);
    messageCountRef.current += 1;
    processAIResponse(extensionQuery, true, 'extend', true).finally(() => {
      if (isSharedThread) {
        // Group chat input should not keep Extended mode active by default.
        setIsExtendedKnowledgeMode(false);
      }
    });
  };

  const applyHumanityHubMention = () => {
    const parts = inputValue.split(/\s+/);
    const lastToken = parts[parts.length - 1] || '';
    if (!lastToken.startsWith('@')) return;
    parts[parts.length - 1] = '@humanity hub';
    const nextValue = `${parts.join(' ')} `.replace(/\s+/g, ' ');
    setInputValue(nextValue);
    setIsMentionMenuOpen(false);
    window.setTimeout(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      const caretPosition = nextValue.length;
      inputRef.current.setSelectionRange(caretPosition, caretPosition);
    }, 0);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'escalating':
      case 'rising':
        return 'bg-chart-4/10 text-destructive border border-destructive-subtle';
      case 'active':
      case 'stable':
        return 'bg-warning-subtle text-warning-text border border-warning-subtle';
      case 'declining':
        return 'bg-success-subtle text-success-text border border-success-subtle';
      default:
        return 'bg-muted text-secondary-foreground border border-border-muted';
    }
  };

  const getCitationSource = (citationId: string, sources?: Source[]) =>
    (sources || []).find((source) => source.id === citationId);

  const normalizeSourceUrl = (url?: string) => {
    if (!url) return undefined;
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  const renderTextWithCitations = (text: string, sources?: Source[]) => {
    const citationRegex = /(\[Source\s+(\d+)\])|(Source\s+(\d+))/gi;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let partKey = 0;

    while ((match = citationRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${partKey++}`}>{text.slice(lastIndex, match.index)}</span>);
      }

      const citationLabel = match[0];
      const citationId = match[2] || match[4];
      const citationPillLabel = `Source ${citationId}`;
      const source = getCitationSource(citationId, sources);
      const sourceUrl = normalizeSourceUrl(source?.url);
      const sourceTitle = source?.title || `Source ${citationId}`;
      const sourceExcerpt = source?.excerpt;

      const canOpenDocument =
        Boolean(source && onKnowledgeSourceClick && isChatEligibleKnowledgeSource(source));

      parts.push(
        <HoverCard key={`citation-${citationId}-${match.index}-${partKey++}`} openDelay={150} closeDelay={75}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              onClick={() => {
                if (canOpenDocument) onKnowledgeSourceClick(source);
              }}
              className={`inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
                canOpenDocument ? 'cursor-pointer hover:text-primary' : ''
              }`}
            >
              {citationPillLabel}
            </button>
          </HoverCardTrigger>
          <HoverCardContent
            align="start"
            side="top"
            sideOffset={8}
            className="w-[360px] rounded-xl border border-border bg-card p-4 shadow-xl"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-primary mb-1">
                    [Source {citationId}]
                  </div>
                  <div className="text-sm font-semibold text-foreground-emphasis leading-snug break-words">
                    {sourceTitle}
                  </div>
                </div>
                {source?.type === 'web-source' ? (
                  <div className="shrink-0 rounded-full border border-border bg-muted px-2 py-1 text-xs font-medium text-secondary-foreground">
                    Web
                  </div>
                ) : (
                  <div className="shrink-0 rounded-full border border-border bg-primary-subtle px-2 py-1 text-xs font-medium text-primary-text">
                    KB
                  </div>
                )}
              </div>

              {sourceExcerpt && (
                <p className="text-sm text-secondary-foreground leading-relaxed line-clamp-4">
                  {sourceExcerpt}
                </p>
              )}

              {canOpenDocument && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onKnowledgeSourceClick(source)}
                    className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground-emphasis hover:bg-muted transition-colors"
                  >
                    <FileText size={14} className="text-muted-foreground shrink-0" />
                    <span>Chat with this document</span>
                  </button>
                </div>
              )}
              {!canOpenDocument && source?.type === 'web-source' && sourceUrl && (
                <div className="pt-1">
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground-emphasis hover:bg-muted transition-colors"
                  >
                    <ExternalLink size={14} className="text-muted-foreground" />
                    <span className="truncate max-w-[280px]">{sourceUrl}</span>
                  </a>
                </div>
              )}

              {!source && (
                <div className="text-xs text-muted-foreground">
                  No source details available for this citation.
                </div>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      );

      lastIndex = match.index + citationLabel.length;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={`text-tail-${partKey++}`}>{text.slice(lastIndex)}</span>);
    }

    if (parts.length === 0) return text;
    return parts;
  };

  const LoadingIndicator = ({ steps, currentStep }: { steps: any[], currentStep: number }) => {
    const getIcon = (iconType: string) => {
      switch (iconType) {
        case 'database':
          return <Database size={18} className="text-text-subtle" />;
        case 'documents':
          return <FileText size={18} className="text-text-subtle" />;
        case 'links':
          return <Link size={18} className="text-text-subtle" />;
        default:
          return null;
      }
    };

    // Show only the current step
    const activeStep = steps[Math.min(currentStep, steps.length - 1)];

    return (
      <div className="flex items-center gap-3">
        <div>{getIcon(activeStep.icon)}</div>
        <span className="text-base text-text-subtle">{activeStep.text}</span>
        <div className="flex gap-1.5 ml-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  };

  const SearchingIndicator = ({ data }: { data: { currentPhase: 'knowledge-base' | 'web-sources' | 'preparing' | 'analyzing-risks' | 'comparing-trends' | 'mapping-clusters' | 'extending-ai'; isBriefing?: boolean } }) => {
    const phases = {
      'knowledge-base': 'Looking through knowledge base...',
      'web-sources': 'Searching web sources...',
      'preparing': 'Preparing answer...',
      'analyzing-risks': 'Analyzing 42 active risks…',
      'comparing-trends': 'Comparing trends (Jan → Feb)…',
      'mapping-clusters': 'Mapping regional clusters…',
      'extending-ai': 'Extending response with AI...'
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0"></div>
          <span className="text-base text-foreground font-medium shimmer-text">
            {phases[data.currentPhase]}
          </span>
        </div>
      </div>
    );
  };

  const SourcesDisplay = ({ message, canExtend }: { message: Message; canExtend: boolean }) => {
    const [isWebIntelExpanded, setIsWebIntelExpanded] = useState(true);
    const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
    const [sourcesTab, setSourcesTab] = useState<'all' | 'knowledge-base' | 'web'>('all');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const sources = message.sources || [];
    const knowledgeBaseSources = sources.filter(s => s.type === 'knowledge-base');
    const webSources = sources.filter(s => s.type === 'web-source');

    return (
      <div className={`space-y-3 ${message.id?.startsWith('dashboard-assistant') ? '' : 'mt-4'}`}>
        {/* Knowledge Base Card - Primary Answer */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Knowledge Base
              </span>
              {message.isAiExtended && (
                <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  AI refined
                </span>
              )}
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="text-sm text-foreground leading-relaxed">
              {message.contentType === 'text' && (
                <div className="space-y-3">
                  {parseMarkdownText(message.isTyping && message.displayedContent !== undefined ? (message.displayedContent || '') : message.content, sources)}
                </div>
              )}
              {message.contentType === 'matrix' && (
                <>
                  <div className="space-y-3">
                    {parseMarkdownText(message.isTyping && message.displayedContent !== undefined ? (message.displayedContent || '') : message.content, sources)}
                  </div>
                  {!message.isTyping && (
                    <div className="-mx-5 -mb-4 mt-4">
                      <RiskMatrix compact={true} />
                    </div>
                  )}
                </>
              )}
              {message.contentType === 'briefing' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {parseMarkdownText(message.isTyping && message.displayedContent !== undefined ? (message.displayedContent || '') : message.content, sources)}
                  </div>
                  <BriefingContent />
                </div>
              )}
              {message.contentType === 'comparison' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {parseMarkdownText(message.isTyping && message.displayedContent !== undefined ? (message.displayedContent || '') : message.content, sources)}
                  </div>
                  {!message.isTyping && <BriefingContent mode="comparison" />}
                </div>
              )}
              {message.contentType === 'geographic' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {parseMarkdownText(message.isTyping && message.displayedContent !== undefined ? (message.displayedContent || '') : message.content, sources)}
                  </div>
                  <SomaliaMap />
                </div>
              )}
              {message.contentType === 'incidents' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    {parseMarkdownText(message.isTyping && message.displayedContent !== undefined ? (message.displayedContent || '') : message.content, sources)}
                  </div>
                  <LowerShabelleIncidentMap />
                </div>
              )}
              {message.contentType === 'table' && message.data && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {parseMarkdownText(message.isTyping && message.displayedContent !== undefined ? (message.displayedContent || '') : message.content, sources)}
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-border bg-card">
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px]">
                      <thead>
                        <tr className="border-b border-border">
                          {message.data.headers.map((header: string, idx: number) => (
                            <th key={idx} className="text-left px-4 py-3 table-header-label">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {message.data.rows.map((row: string[], rowIdx: number) => (
                          <tr key={rowIdx} className="border-b border-border last:border-b-0 hover:bg-surface-row-hover transition-colors">
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-4 py-3">
                                {message.data.headers[cellIdx].toLowerCase().includes('level') ? (
                                  <span className={`inline-block px-2.5 py-1 rounded-full table-status-text ${getRiskLevelColor(cell)}`}>
                                    {cell}
                                  </span>
                                ) : message.data.headers[cellIdx].toLowerCase().includes('status') || message.data.headers[cellIdx].toLowerCase().includes('trend') ? (
                                  <span className={`inline-block px-2.5 py-1 rounded-full table-status-text ${getStatusColor(cell)}`}>
                                    {cell}
                                  </span>
                                ) : cellIdx === 0 ? (
                                  <span className="table-primary-text">{cell}</span>
                                ) : cellIdx === 1 ? (
                                  <span className="table-numeric-text">{cell}</span>
                                ) : (
                                  <span className="table-supporting-text">{cell}</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Web Intelligence Card - AI Synthesized Answer */}
        {message.webIntelligenceSummary && !message.isTyping && (
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <button
              onClick={() => setIsWebIntelExpanded(!isWebIntelExpanded)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted transition-colors border-b border-border"
            >
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-muted-foreground" />
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    Web Intelligence
                  </span>
                  <span className="text-xs text-text-subtle font-normal">
                    Supplementary, unverified
                  </span>
                  {message.isAiExtended && (
                    <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                      AI refined
                    </span>
                  )}
                </div>
              </div>
              {isWebIntelExpanded ? (
                <ChevronUp size={18} className="text-muted-foreground" />
              ) : (
                <ChevronDown size={18} className="text-muted-foreground" />
              )}
            </button>

            {isWebIntelExpanded && (
              <>
                {/* AI-Synthesized Web Intelligence Answer */}
                <div className="px-6 py-5">
                  <div className="text-base text-foreground leading-[1.7]">
                    <div className="space-y-4">
                      {parseMarkdownText(
                        message.isWebIntelTyping && message.displayedWebIntelligence !== undefined
                          ? (message.displayedWebIntelligence || '')
                          : (message.webIntelligenceSummary || ''),
                        sources
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Compact Sources Button */}
        {sources.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-border-muted hover:bg-muted text-foreground rounded-full text-sm font-medium transition-colors"
            >
              <Database size={14} />
              <Globe size={14} />
              <span>{sources.length} sources</span>
            </button>
            {!message.isAiExtended && (
              (() => {
                const canResolveExtensionQuery = Boolean(resolveExtensionQuery(message));
                return (
              <button
                type="button"
                onClick={() => handleExtendWithAI(message)}
                disabled={isProcessing || !canExtend || !canResolveExtensionQuery || Boolean(message.usedForAiExtension)}
                className={`inline-flex items-center gap-2 px-1 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                  message.usedForAiExtension
                    ? 'text-primary'
                    : 'text-primary-text hover:text-primary disabled:opacity-40'
                }`}
              >
                {message.usedForAiExtension ? <Check size={14} /> : <Sparkles size={14} />}
                <span>Extended Knowledge</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center justify-center text-primary75 hover:text-primary">
                      <CircleHelp size={14} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    variant="muted"
                    side="top"
                    sideOffset={8}
                    className="w-[320px] max-w-[320px] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-normal shadow-lg"
                  >
                    Enabling Extended Knowledge allows the model to enhance responses with its broader internal knowledge, providing additional context beyond your selected documents while still keeping answers grounded in your data.
                  </TooltipContent>
                </Tooltip>
              </button>
                );
              })()
            )}
            </div>

            {/* Sources Drawer */}
            {isDrawerOpen && (
              <div className="fixed inset-0 z-[1600]">
                <div
                  className="absolute inset-0 z-[1600] bg-black/40"
                  onClick={() => setIsDrawerOpen(false)}
                />
                <div className="absolute top-0 right-0 z-[1610] h-full w-full sm:w-[420px] border-l border-border bg-card overflow-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border px-4 sm:px-6 py-5 sm:py-6 z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground mb-1">
                        Sources
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {sources.length} sources consulted
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
                    >
                      <X size={18} className="text-muted-foreground" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
                    <button
                      onClick={() => setSourcesTab('all')}
                      className={`flex-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        sourcesTab === 'all' ? 'bg-card text-foreground' : 'text-text-subtle hover:text-muted-foreground'
                      }`}
                    >
                      All ({sources.length})
                    </button>
                    <button
                      onClick={() => setSourcesTab('knowledge-base')}
                      className={`flex-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        sourcesTab === 'knowledge-base' ? 'bg-card text-foreground' : 'text-text-subtle hover:text-muted-foreground'
                      }`}
                    >
                      Knowledge ({knowledgeBaseSources.length})
                    </button>
                    <button
                      onClick={() => setSourcesTab('web')}
                      className={`flex-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        sourcesTab === 'web' ? 'bg-card text-foreground' : 'text-text-subtle hover:text-muted-foreground'
                      }`}
                    >
                      Web ({webSources.length})
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-2.5 sm:space-y-3">
                  {(sourcesTab === 'all' ? sources : sourcesTab === 'knowledge-base' ? knowledgeBaseSources : webSources).map((source) => {
                    const sourceUrl = normalizeSourceUrl(source.url);
                    const isKb =
                      onKnowledgeSourceClick && isChatEligibleKnowledgeSource(source);

                    const rowClass =
                      'block w-full rounded-xl px-2 py-2 -mx-2 hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 text-left';

                    const rowInner = (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              source.type === 'knowledge-base' 
                                ? 'bg-primary-subtle' 
                                : 'bg-muted'
                            }`}>
                              {source.type === 'knowledge-base' ? (
                                <Database size={16} className="text-primary" />
                              ) : (
                                <Globe size={16} className="text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-primary leading-none mb-1">
                              Source {source.id}
                            </div>
                            <h4 className="text-base sm:text-base font-semibold text-foreground leading-tight mb-1">
                              {source.title}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                              {source.excerpt}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-text-subtle">
                              {source.date && <span>{source.date}</span>}
                              {source.category && <span>• {source.category}</span>}
                            </div>
                          </div>
                        </div>
                    );

                    if (isKb) {
                      return (
                        <button
                          key={source.id}
                          type="button"
                          onClick={() => onKnowledgeSourceClick(source)}
                          className={rowClass}
                        >
                          {rowInner}
                        </button>
                      );
                    }

                    if (source.type === 'knowledge-base') {
                      return (
                        <div key={source.id} className={`${rowClass} cursor-default`}>
                          {rowInner}
                        </div>
                      );
                    }

                    return (
                      <a
                        key={source.id}
                        href={sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={rowClass}
                      >
                        {rowInner}
                      </a>
                    );
                  })}
                </div>
              </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Helper to fix escaped newlines in response text
  const fixEscapedNewlines = (str: string) => str.replace(/\\n/g, '\n');

  const renderInlineFormattedParts = (content: string, sources: Source[] | undefined, partKeyPrefix: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`${partKeyPrefix}-bold-${idx}`} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={`${partKeyPrefix}-text-${idx}`}>{renderTextWithCitations(part, sources)}</span>;
    });
  };

  const getRiskEmojiClass = (line: string) => {
    const emoji = Object.keys(RISK_EMOJI_CLASS).find((key) => line.startsWith(key));
    return emoji ? RISK_EMOJI_CLASS[emoji] : null;
  };

  // Parse markdown-like text to JSX
  const parseMarkdownText = (text: string, sources?: Source[]) => {
    text = fixEscapedNewlines(text);
    // Convert escaped newlines to actual newlines for proper paragraph formatting
    text = text.replace(/\\n/g, '\n');
    
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    const baseKey = Date.now();
    let key = 0;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Skip empty lines - add spacing for paragraph breaks
      if (!line.trim()) {
        elements.push(<div key={`space-${baseKey}-${key++}`} className="h-2" />);
        i++;
        continue;
      }

      // Check for markdown table (line with |)
      if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|')) {
        const tableLines: string[] = [];
        let j = i;
        
        // Collect all table lines
        while (j < lines.length && lines[j].includes('|')) {
          tableLines.push(lines[j]);
          j++;
        }

        if (tableLines.length >= 3) { // Header + separator + at least one row
          const headerCells = tableLines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
          const dataRows = tableLines.slice(2).map(row => 
            row.split('|').map(cell => cell.trim()).filter(cell => cell)
          );

          elements.push(
            <div key={`table-${baseKey}-${key++}`} className="my-4 rounded-2xl overflow-hidden border border-border bg-card">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-border">
                    {headerCells.map((header, idx) => (
                      <th key={idx} className="text-left px-4 py-3 table-header-label">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-border last:border-b-0 hover:bg-surface-row-hover transition-colors">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-3">
                          {cellIdx === 0 ? (
                            <span className="table-primary-text">{cell}</span>
                          ) : (
                            <span className="table-supporting-text">{cell}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          );

          i = j;
          continue;
        }
      }

      const riskEmojiClass = getRiskEmojiClass(line);

      // Risk-coloured lines (emoji + optional bold)
      if (riskEmojiClass) {
        elements.push(
          <div key={`risk-line-${baseKey}-${key++}`} className={`text-sm leading-6 mb-1.5 ${riskEmojiClass}`}>
            {renderInlineFormattedParts(line, sources, `risk-${baseKey}-${key}`)}
          </div>
        );
        i++;
        continue;
      }

      // Emoji headings (line starts with emoji and **)
      if (line.match(/^[\u{1F300}-\u{1F9FF}]/u) && line.includes('**')) {
        elements.push(
          <div key={`emoji-heading-${baseKey}-${key++}`} className="font-semibold text-foreground-emphasis text-sm mt-2 mb-1">
            {renderInlineFormattedParts(line, sources, `emoji-h-${baseKey}-${key}`)}
          </div>
        );
        i++;
        continue;
      }

      // Bold headings (line starts with **)
      if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <div key={`heading-${baseKey}-${key++}`} className="font-semibold text-foreground-emphasis text-sm mt-2 mb-1">
            {line.slice(2, -2)}
          </div>
        );
        i++;
        continue;
      }

      // Section labels (line ends with :)
      if (line.trim().endsWith(':') && !line.includes('|')) {
        elements.push(
          <div key={`section-${baseKey}-${key++}`} className="font-semibold text-foreground-emphasis text-sm mt-2 mb-0.5">
            {renderInlineFormattedParts(line, sources, `section-${baseKey}-${key}`)}
          </div>
        );
        i++;
        continue;
      }

      // Bullet points (• or -)
      const bulletMatch = line.trim().match(/^(?:•|-)\s+(.*)$/);
      if (bulletMatch) {
        elements.push(
          <div key={`bullet-${baseKey}-${key++}`} className="flex gap-2 mb-1.5 text-sm leading-6">
            <span className="text-primary shrink-0">•</span>
            <span className="text-secondary-foreground">
              {renderInlineFormattedParts(bulletMatch[1], sources, `bullet-${baseKey}-${key}`)}
            </span>
          </div>
        );
        i++;
        continue;
      }

      // Regular paragraph with inline bold
      elements.push(
        <p key={`p-${baseKey}-${key++}`} className="text-sm text-secondary-foreground mb-1 leading-6">
          {renderInlineFormattedParts(line, sources, `p-${baseKey}-${key}`)}
        </p>
      );
      i++;
    }

    return elements;
  };

  const renderMessageContent = (message: Message) => {
    if (message.contentType === 'loading' && message.data) {
      return <LoadingIndicator steps={message.data.steps} currentStep={message.data.currentStep} />;
    }

    if (message.contentType === 'searching' && message.data) {
      return <SearchingIndicator data={message.data} />;
    }

    if (message.contentType === 'table' && message.data) {
      const displayContent = message.isTyping ? message.displayedContent : message.content;
      
      return (
        <div className="space-y-3">
          <div className="text-base text-foreground leading-relaxed">
            {displayContent}
          </div>
          {!message.isTyping && (
            <div className="rounded-2xl overflow-hidden border border-border bg-card">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-border">
                    {message.data.headers.map((header: string, idx: number) => (
                      <th key={idx} className="text-left px-4 py-3 table-header-label">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {message.data.rows.map((row: string[], rowIdx: number) => (
                    <tr key={rowIdx} className="border-b border-border last:border-b-0 hover:bg-surface-row-hover transition-colors">
                      {row.map((cell: string, cellIdx: number) => (
                        <td key={cellIdx} className="px-4 py-3">
                          {message.data.headers[cellIdx].toLowerCase().includes('level') ? (
                            <span className={`inline-block px-2.5 py-1 rounded-full table-status-text ${getRiskLevelColor(cell)}`}>
                              {cell}
                            </span>
                          ) : message.data.headers[cellIdx].toLowerCase().includes('status') || message.data.headers[cellIdx].toLowerCase().includes('trend') ? (
                            <span className={`inline-block px-2.5 py-1 rounded-full table-status-text ${getStatusColor(cell)}`}>
                              {cell}
                            </span>
                          ) : cellIdx === 0 ? (
                            <span className="table-primary-text">{cell}</span>
                          ) : cellIdx === 1 ? (
                            <span className="table-numeric-text">{cell}</span>
                          ) : (
                            <span className="table-supporting-text">{cell}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (message.contentType === 'matrix') {
      const displayContent = message.isTyping ? message.displayedContent : message.content;
      
      return (
        <div className="space-y-4">
          <div className="text-base text-foreground leading-relaxed">
            {displayContent}
          </div>
          {!message.isTyping && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <RiskMatrix compact={true} />
            </div>
          )}
        </div>
      );
    }

    if (message.contentType === 'briefing') {
      const displayContent = message.isTyping ? message.displayedContent : message.content;
      
      return (
        <div className="space-y-6">
          {/* Type the text content */}
          <div className="text-base text-foreground leading-relaxed">
            {parseMarkdownText(displayContent || '', message.sources)}
          </div>
          
          {/* After typing completes, show matrix and SET suggestions */}
          {!message.isTyping && (
            <BriefingContent 
              onFollowUp={(suggestions) => {
                // Set the suggestions to appear above input
                setSuggestedFollowUps(suggestions);
              }}
            />
          )}
        </div>
      );
    }

    if (message.contentType === 'comparison') {
      const displayContent = message.isTyping ? message.displayedContent : message.content;
      
      return (
        <div className="space-y-6">
          {/* Type the text content */}
          <div className="text-base text-foreground leading-relaxed">
            {parseMarkdownText(displayContent || '', message.sources)}
          </div>
          
          {/* After typing completes, SET suggestions */}
          {!message.isTyping && (
            <BriefingContent 
              mode="comparison"
              onFollowUp={(suggestions) => {
                // Set the suggestions to appear above input
                setSuggestedFollowUps(suggestions);
              }}
            />
          )}
        </div>
      );
    }

    if (message.contentType === 'geographic') {
      const displayContent = message.isTyping ? message.displayedContent : message.content;
      
      return (
        <div className="space-y-6">
          {/* Type the text content */}
          <div className="text-base text-foreground leading-relaxed">
            {parseMarkdownText(displayContent || '', message.sources)}
          </div>
          
          {/* After typing completes, show map */}
          {!message.isTyping && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <SomaliaMap />
            </div>
          )}
        </div>
      );
    }

    if (message.contentType === 'incidents') {
      const displayContent = message.isTyping ? message.displayedContent : message.content;
      
      return (
        <div className="space-y-6">
          {/* Type the text content */}
          <div className="text-base text-foreground leading-relaxed">
            {parseMarkdownText(displayContent || '', message.sources)}
          </div>
          
          {/* After typing completes, show map */}
          {!message.isTyping && (
            <LowerShabelleIncidentMap />
          )}
        </div>
      );
    }

    // Text content with typing effect and markdown parsing
    const displayContent = message.isTyping ? message.displayedContent : message.content;
    
    return (
      <div className="text-base text-foreground leading-relaxed">
        {parseMarkdownText(displayContent || '', message.sources)}
      </div>
    );
  };

  const latestExtendableAssistantMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      const hasSources = Boolean(message.sources && message.sources.length > 0);
      if (message.type === 'assistant' && hasSources && !message.isAiExtended) {
        return message.id;
      }
    }
    return null;
  }, [messages]);

  const invokesAiInComposer = /@humanity\s*hub/i.test(inputValue);
  const isExtendedInputActive = isSharedThread
    ? invokesAiInComposer && isSharedExtendedPillVisible
    : isExtendedKnowledgeMode;
  const isHubEmptyState = startEmpty && messages.length === 0;
  const composerMaxWidthClass = isHubEmptyState ? 'max-w-[680px]' : 'max-w-[750px]';

  /** Group chats hide the AI toolbar until @humanityhub is present — keep the composer short until then. */
  const sharedComposerCompact = isSharedThread && !invokesAiInComposer;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Risk IQ context + back navigation */}
      {showRiskIqContext && !showThreadHeader && (
        <RiskIQChatHeader onBack={onBack} onInvite={() => setIsShareOpen(true)} />
      )}
      {navigation === 'back' && !showRiskIqContext && !showThreadHeader && (
        <div className="sticky top-0 z-20">
          <div className="px-4 sm:px-8 lg:px-10 pt-6 pb-4">
            <div className="flex items-center justify-between gap-3">
              <BackLink onClick={onBack} />
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground-emphasis text-sm font-medium transition-colors"
              >
                <UserPlus size={16} className="text-muted-foreground" />
                <span>Invite</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      {showThreadHeader && (
        <div className="bg-background sticky top-0 z-20">
          <div className="px-4 sm:px-8 lg:px-10 py-4 pt-5 lg:pt-4">
            <div className={`w-full flex items-center justify-between gap-3 ${showNavigation ? '' : 'pl-14 sm:pl-0'}`}>
              <div className="flex items-center gap-3 min-w-0">
                {navigation === 'back' ? (
                  <BackLink onClick={onBack} />
                ) : (
                  <div className="w-10 sm:w-0 shrink-0" />
                )}
                {chatContextLabel && (
                  <ChatSourceBadge
                    source={chatContextLabel === 'Risk iQ' ? 'risk-iq' : 'humanity-hub'}
                    size="md"
                  />
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {sharedUsers.length > 0 && (
                  <div ref={sharedPopoverRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSharedPopoverOpen((prev) => !prev)}
                      className="flex items-center -space-x-2 hover:opacity-90 transition-opacity"
                      aria-label="View shared users"
                    >
                      {sharedUsers.slice(0, 3).map((u) => (
                        <div
                          key={u!.id}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-background flex items-center justify-center text-white text-xs sm:text-xs font-bold shadow-sm"
                          style={{ backgroundColor: u!.color }}
                          title={u!.name}
                        >
                          {u!.initials}
                        </div>
                      ))}
                      {sharedUsers.length > 3 && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-background bg-muted text-secondary-foreground flex items-center justify-center text-xs sm:text-xs font-bold shadow-sm">
                          +{sharedUsers.length - 3}
                        </div>
                      )}
                    </button>

                    {isSharedPopoverOpen && (
                      <div className="absolute right-0 top-full mt-2 w-[min(280px,88vw)] rounded-xl border border-border bg-card shadow-xl p-4 z-30">
                        <div className="table-header-label mb-3">
                          Shared with ({sharedUsers.length})
                        </div>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto">
                          {sharedUsers.map((u) => (
                            <div key={u!.id} className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{ backgroundColor: u!.color }}
                              >
                                {u!.initials}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-foreground-emphasis leading-tight truncate">{u!.name}</div>
                                <div className="text-sm text-muted-foreground truncate">{u!.email}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsShareOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground-emphasis text-sm font-medium transition-colors"
                >
                  <UserPlus size={16} className="text-muted-foreground" />
                  <span>Invite</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-32 py-8">
        <div className="max-w-[750px] mx-auto space-y-6">
          {startEmpty && messages.length === 0 && (
            <div className="flex flex-col items-center py-2 sm:py-6">
              <div className="w-full max-w-[680px]">
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-sm">
                    <Sparkles className="w-7 h-7 text-white" fill="white" />
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl text-center mb-2 text-foreground">
                  Ask{' '}
                  <span className="italic text-primary">
                    {showRiskIqContext ? 'Risk IQ' : 'Humanity Hub'}
                  </span>
                </h1>

                <p className="text-sm text-muted-foreground text-center mb-8 leading-relaxed max-w-[460px] mx-auto">
                  {showRiskIqContext
                    ? 'Your AI risk analyst for Somalia field operations — available around the clock.'
                    : 'A decision support tool built for humanitarian and development operations'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(showRiskIqContext ? RISK_IQ_NEW_CHAT_SUGGESTIONS : HUB_NEW_CHAT_SUGGESTIONS).map(
                    (suggestion) => (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => submitQuery(suggestion.prompt)}
                      disabled={isProcessing}
                      className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary hover:shadow-sm transition-all group flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <div
                        className={`w-9 h-9 ${suggestion.iconClass} rounded-lg flex items-center justify-center shrink-0`}
                      >
                        <span className="text-lg">{suggestion.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground mb-0.5 group-hover:text-primary">
                          {suggestion.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                          {suggestion.prompt}
                        </p>
                      </div>
                    </button>
                  ),
                  )}
                </div>
              </div>
            </div>
          )}
          {isSharedThread && (
            <div className="flex justify-center">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground-emphasis">{createdByName}</span> created the group chat.
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={message.id}>
              <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${message.type === 'user' ? 'w-fit max-w-[85%] sm:max-w-[75%] bg-primary text-white rounded-2xl px-4 sm:px-6 py-3.5 ml-auto' : 'w-full'}`}>
                  {message.type === 'user' ? (
                    <div className="space-y-1">
                      {isSharedThread && (
                        <div className="text-xs font-semibold tracking-wide text-white/80 uppercase">
                          {message.senderName || CURRENT_USER.name}
                        </div>
                      )}
                      <p className="text-base leading-relaxed">{message.content}</p>
                    </div>
                  ) : message.id === 'dashboard-ctx' ? (
                    <div className="rounded-xl border border-border bg-muted px-4 sm:px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        From your dashboard
                      </p>
                      <div className="text-sm text-foreground leading-relaxed">
                        {renderMessageContent(message)}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {message.isAiExtended ||
                      message.id?.startsWith('dashboard-assistant') ||
                      (message.sources && message.sources.length > 0) ? (
                        <SourcesDisplay
                          message={message}
                          canExtend={message.id === latestExtendableAssistantMessageId}
                        />
                      ) : (
                        renderMessageContent(message)
                      )}
                    </div>
                  )}
                </div>
              </div>
              {joinActivities
                .filter((activity) => activity.afterMessageCount === index + 1)
                .map((activity) => (
                  <div key={activity.id} className="mt-6 flex justify-center">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground-emphasis">{activity.userName}</span> joined the chat - {activity.timestampLabel}
                    </div>
                  </div>
                ))}
            </div>
          ))}
          {joinActivities
            .filter((activity) => activity.afterMessageCount === 0)
            .map((activity) => (
              <div key={activity.id} className="flex justify-center">
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground-emphasis">{activity.userName}</span> joined the chat - {activity.timestampLabel}
                </div>
              </div>
            ))}
          
          {/* Suggested Follow-Ups - REMOVED */}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-background px-4 sm:px-8 lg:px-32 pt-[4px] pb-[24px]">
        <div className={cn(composerMaxWidthClass, 'mx-auto')}>
          {/* Suggested Follow-Ups - appear above input */}
          {suggestedFollowUps.length > 0 && (
            null
          )}

          <div className="relative">
            {isMentionMenuOpen && (
              <div className="absolute left-3 right-3 bottom-full mb-2 z-20">
                <button
                  type="button"
                  onClick={applyHumanityHubMention}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-left hover:bg-muted transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sidebar-accent text-primary flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground-emphasis">Humanity Hub AI</div>
                      <div className="text-xs text-muted-foreground">@humanity hub</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
            <div
              role="presentation"
              data-composite-field
              onClick={() => inputRef.current?.focus()}
              className={cn(
                'relative w-full rounded-2xl border border-border bg-card transition-colors cursor-text',
                'hover:border-primary',
                'focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/10',
                sharedComposerCompact ? 'min-h-12' : 'min-h-[96px]',
              )}
            >
            {(!isSharedThread || invokesAiInComposer) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !isExtendedInputActive;

                      if (isSharedThread) {
                        setIsSharedExtendedPillVisible(nextState);
                      } else {
                        setIsExtendedKnowledgeMode(nextState);
                      }

                      toast.success(
                        nextState
                          ? 'Extended Knowledge is on'
                          : 'Extended Knowledge is off'
                      );
                    }}
                    className={`absolute bottom-3 left-4 z-10 inline-flex max-w-[230px] items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      isExtendedInputActive
                        ? 'border-primary bg-primary-subtle text-primary hover:bg-sidebar-accent'
                        : 'border-border-muted bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Sparkles size={12} />
                    <span className="truncate ml-1.5">
                      {isExtendedInputActive ? 'Extended Knowledge ON' : 'Extended Knowledge'}
                    </span>
                    {isExtendedInputActive && (
                      <span className="ml-1.5">
                        <X size={12} />
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  variant="muted"
                  side="top"
                  sideOffset={8}
                  className="w-[320px] max-w-[320px] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-normal shadow-lg"
                >
                  Enabling Extended Knowledge allows the model to enhance responses with its broader internal knowledge, providing additional context beyond your selected documents while still keeping answers grounded in your data.
                </TooltipContent>
              </Tooltip>
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (isMentionMenuOpen && e.key === 'Enter') {
                  e.preventDefault();
                  applyHumanityHubMention();
                  return;
                }
                if (isMentionMenuOpen && e.key === 'Escape') {
                  e.preventDefault();
                  setIsMentionMenuOpen(false);
                  return;
                }
                if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isSharedThread
                  ? invokesAiInComposer && isExtendedInputActive
                    ? "Ask in Extended Knowledge mode..."
                    : invokesAiInComposer
                      ? "Ask Humanity Hub AI..."
                      : "Send a message or mention @humanityhub for AI"
                  : isHubEmptyState
                    ? showRiskIqContext
                      ? 'Ask anything about operational risks, security threats, or field conditions...'
                      : 'Ask about humanitarian data or field conditions...'
                  : isExtendedInputActive
                    ? "Ask in Extended Knowledge mode..."
                    : "Ask a follow-up question..."
              }
              className={cn(
                'focus-ring-container-control w-full border-0 bg-transparent text-base text-foreground placeholder:text-text-subtle outline-none focus:outline-none focus:ring-0 transition-colors',
                sharedComposerCompact
                  ? 'h-12 min-h-12 pl-4 pr-14 py-2.5'
                  : 'h-[96px] pl-6 pr-16 pt-4 pb-12',
              )}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isProcessing}
              className={`absolute right-2 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                sharedComposerCompact ? 'top-1/2 -translate-y-1/2' : 'bottom-3'
              } ${
                inputValue.trim() && !isProcessing
                  ? 'bg-primary hover:bg-primary-hover cursor-pointer'
                  : 'bg-muted cursor-not-allowed'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M16.5 1.5L8.25 9.75M16.5 1.5L11.25 16.5L8.25 9.75M16.5 1.5L1.5 6.75L8.25 9.75" stroke={inputValue.trim() && !isProcessing ? "white" : "var(--text-subtle)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            </div>
          </div>
          {isExtendedInputActive && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              AI can make mistakes. Check important info.
            </p>
          )}
        </div>
      </div>

      <ShareThreadModal
        open={isShareOpen}
        threadTitle={threadTitle || initialQuery}
        threadId={threadId}
        initialSelectedUserIds={sharedWithUserIds}
        onClose={() => setIsShareOpen(false)}
        onShare={(userIds) => {
          if (!threadId) return;
          onShareUpdate?.(threadId, userIds);
        }}
      />
    </div>
  );
}
