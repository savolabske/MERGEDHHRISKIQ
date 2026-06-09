import { useCallback, useEffect, useRef, useState } from 'react';
import { REPORT_QUERY_DELAY_MS, REPORT_STICKY_HEADER_OFFSET } from './constants';

export interface UseReportPromptOptions {
  initialMessage?: string;
  assistantReply: string;
  defaultResultTitle?: string;
}

export function useReportPrompt({
  initialMessage,
  assistantReply,
  defaultResultTitle = 'Overview',
}: UseReportPromptOptions) {
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<string[]>(
    initialMessage ? [initialMessage] : [],
  );
  const [resultMode, setResultMode] = useState(false);
  const [resultTitle, setResultTitle] = useState(defaultResultTitle);
  const [isQuerying, setIsQuerying] = useState(false);

  const resultSectionRef = useRef<HTMLElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const queryTimeoutRef = useRef<number | null>(null);
  const isQueryingRef = useRef(false);

  const cancelQuery = useCallback(() => {
    if (queryTimeoutRef.current !== null) {
      window.clearTimeout(queryTimeoutRef.current);
      queryTimeoutRef.current = null;
    }
    isQueryingRef.current = false;
    setIsQuerying(false);
  }, []);

  const backToReport = useCallback(() => {
    cancelQuery();
    setResultMode(false);
  }, [cancelQuery]);

  const runPrompt = useCallback(
    (query?: string) => {
      const q = (query ?? promptInput).trim();
      if (!q || isQueryingRef.current) return;

      setMessages((prev) => [...prev, q]);
      setResultTitle(q);
      setPromptInput('');
      isQueryingRef.current = true;
      setIsQuerying(true);

      queryTimeoutRef.current = window.setTimeout(() => {
        setMessages((prev) => [...prev, assistantReply]);
        isQueryingRef.current = false;
        setIsQuerying(false);
        setResultMode(true);
        queryTimeoutRef.current = null;
      }, REPORT_QUERY_DELAY_MS);
    },
    [promptInput, assistantReply],
  );

  useEffect(() => {
    return () => {
      if (queryTimeoutRef.current !== null) {
        window.clearTimeout(queryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!resultMode) return;

    const scrollResultsToTop = () => {
      const target = resultSectionRef.current;
      const scrollRoot =
        target?.closest<HTMLElement>('[data-report-scroll]') ??
        document.querySelector<HTMLElement>('[data-report-scroll]');
      if (!scrollRoot) return;

      if (target) {
        const rootRect = scrollRoot.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const next =
          scrollRoot.scrollTop + (targetRect.top - rootRect.top) - REPORT_STICKY_HEADER_OFFSET;
        scrollRoot.scrollTo({ top: Math.max(0, next), behavior: 'auto' });
      } else {
        scrollRoot.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    // Wait for result layout (KPI/scrolly unmount + AI blocks mount) before measuring.
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollResultsToTop);
    });
  }, [resultMode]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isQuerying]);

  return {
    promptInput,
    setPromptInput,
    messages,
    resultMode,
    resultTitle,
    isQuerying,
    resultSectionRef,
    chatScrollRef,
    runPrompt,
    backToReport,
    cancelQuery,
  };
}
