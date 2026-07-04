import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  clearReportChatHistory,
  deleteReportChatHistoryItem,
  extractUserQueries,
  getReportChatHistory,
  loadAllReportChatHistory,
  type ReportChatHistoryItem,
  type ReportChatHistoryReportId,
  toggleReportChatHistoryPin,
  upsertReportChatHistoryItem,
} from './reportChatHistory';

interface UseReportChatHistoryOptions<T> {
  reportId: ReportChatHistoryReportId;
  messages: T[];
  extendedKnowledge?: boolean;
  resultMode?: boolean;
  resultTitle?: string;
  onRestore: (item: ReportChatHistoryItem<T>) => void;
}

export function useReportChatHistory<T extends { role: string; text?: string }>({
  reportId,
  messages,
  extendedKnowledge = false,
  resultMode = false,
  resultTitle,
  onRestore,
}: UseReportChatHistoryOptions<T>) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [allItems, setAllItems] = useState<ReportChatHistoryItem<T>[]>(() =>
    loadAllReportChatHistory() as ReportChatHistoryItem<T>[],
  );
  const activeSessionIdRef = useRef<string | null>(null);

  const historyItems = useMemo(
    () => getReportChatHistory(reportId, allItems as ReportChatHistoryItem[]) as ReportChatHistoryItem<T>[],
    [allItems, reportId],
  );

  const persistCurrentSession = useCallback(() => {
    const userQueries = extractUserQueries(messages);
    if (userQueries.length === 0) return;

    const firstQuery = userQueries[0];
    const sessionId = activeSessionIdRef.current ?? `session-${reportId}-${Date.now()}`;
    activeSessionIdRef.current = sessionId;

    const item: ReportChatHistoryItem<T> = {
      id: sessionId,
      reportId,
      title: firstQuery,
      timestamp: Date.now(),
      messageCount: messages.length,
      queries: userQueries,
      messages,
      extendedKnowledge,
      resultMode,
      resultTitle,
    };

    setAllItems((prev) => upsertReportChatHistoryItem(item, prev as ReportChatHistoryItem[]) as ReportChatHistoryItem<T>[]);
  }, [extendedKnowledge, messages, reportId, resultMode, resultTitle]);

  useEffect(() => {
    const userQueries = extractUserQueries(messages);
    if (userQueries.length === 0) {
      activeSessionIdRef.current = null;
      return;
    }

    if (!activeSessionIdRef.current) {
      activeSessionIdRef.current = `session-${reportId}-${Date.now()}`;
    }

    const sessionId = activeSessionIdRef.current;
    const item: ReportChatHistoryItem<T> = {
      id: sessionId,
      reportId,
      title: userQueries[0],
      timestamp: Date.now(),
      messageCount: messages.length,
      queries: userQueries,
      messages,
      extendedKnowledge,
      resultMode,
      resultTitle,
    };

    setAllItems((prev) => upsertReportChatHistoryItem(item, prev as ReportChatHistoryItem[]) as ReportChatHistoryItem<T>[]);
  }, [extendedKnowledge, messages, reportId, resultMode, resultTitle]);

  const openHistory = useCallback(() => setIsHistoryOpen(true), []);
  const closeHistory = useCallback(() => setIsHistoryOpen(false), []);

  const restoreHistoryItem = useCallback(
    (item: ReportChatHistoryItem<T>) => {
      persistCurrentSession();
      activeSessionIdRef.current = item.id;
      onRestore(item);
      setIsHistoryOpen(false);
    },
    [onRestore, persistCurrentSession],
  );

  const clearHistory = useCallback(() => {
    setAllItems((prev) => clearReportChatHistory(reportId) as ReportChatHistoryItem<T>[]);
    activeSessionIdRef.current = null;
  }, [reportId]);

  const deleteHistoryItem = useCallback(
    (id: string) => {
      setAllItems((prev) => deleteReportChatHistoryItem(id, prev as ReportChatHistoryItem[]) as ReportChatHistoryItem<T>[]);
      if (activeSessionIdRef.current === id) {
        activeSessionIdRef.current = null;
      }
    },
    [],
  );

  const togglePinHistoryItem = useCallback((id: string) => {
    setAllItems((prev) => toggleReportChatHistoryPin(id, prev as ReportChatHistoryItem[]) as ReportChatHistoryItem<T>[]);
  }, []);

  return {
    historyItems,
    isHistoryOpen,
    openHistory,
    closeHistory,
    restoreHistoryItem,
    clearHistory,
    deleteHistoryItem,
    togglePinHistoryItem,
  };
}
