import { useCallback, useEffect, type RefObject } from 'react';
import { useReportChatPanel } from './ReportChatLayout';

export function useReportChatAutoScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  deps: unknown[] = [],
) {
  const { variant, mobileChatOpen } = useReportChatPanel();

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior });
    },
    [scrollRef],
  );

  useEffect(() => {
    scrollToBottom('smooth');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls scroll triggers via deps
  }, [...deps, scrollToBottom]);

  useEffect(() => {
    if (variant !== 'sheet' || !mobileChatOpen) return;
    const timer = window.setTimeout(() => scrollToBottom('auto'), 320);
    return () => window.clearTimeout(timer);
  }, [mobileChatOpen, variant, scrollToBottom]);
}

export function ReportChatScrollSync({
  scrollRef,
  deps = [],
}: {
  scrollRef: RefObject<HTMLDivElement | null>;
  deps?: unknown[];
}) {
  useReportChatAutoScroll(scrollRef, deps);
  return null;
}
